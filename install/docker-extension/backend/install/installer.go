package install

import (
	"context"
	"encoding/json"
	"fmt"
	"os/exec"
	"strings"
	"sync"
	"time"

	"github.com/google/uuid"
	"github.com/sirupsen/logrus"
)

var logger = logrus.New()

// InstallationStep represents a step in the installation process
type InstallationStep struct {
	Name        string `json:"name"`
	Status      string `json:"status"` // "pending", "in_progress", "completed", "failed"
	Description string `json:"description,omitempty"`
	Error       string `json:"error,omitempty"`
}

// InstallationStatus represents the overall installation status
type InstallationStatus struct {
	ID          string             `json:"id"`
	Status      string             `json:"status"` // "not_started", "in_progress", "completed", "failed"
	CurrentStep string             `json:"currentStep"`
	Progress    int                `json:"progress"` // 0-100
	Steps       []InstallationStep `json:"steps"`
	StartedAt   time.Time          `json:"startedAt,omitempty"`
	CompletedAt time.Time          `json:"completedAt,omitempty"`
	Error       string             `json:"error,omitempty"`
	mu          sync.RWMutex
}

// Installer manages OpenYurt installation
type Installer struct {
	installations map[string]*InstallationStatus
	mu            sync.RWMutex
	kubeconfig    string
}

// NewInstaller creates a new installer instance
func NewInstaller(kubeconfig string) *Installer {
	return &Installer{
		installations: make(map[string]*InstallationStatus),
		kubeconfig:    kubeconfig,
	}
}

// GetStatus returns the installation status for a given ID
func (i *Installer) GetStatus(id string) (*InstallationStatus, error) {
	i.mu.RLock()
	defer i.mu.RUnlock()

	status, exists := i.installations[id]
	if !exists {
		return nil, fmt.Errorf("installation %s not found", id)
	}

	status.mu.RLock()
	defer status.mu.RUnlock()

	// Create a copy to avoid race conditions
	statusCopy := *status
	stepsCopy := make([]InstallationStep, len(status.Steps))
	copy(stepsCopy, status.Steps)
	statusCopy.Steps = stepsCopy

	return &statusCopy, nil
}

// StartInstallation starts a new OpenYurt installation
func (i *Installer) StartInstallation(kubernetesServerAddr string) (string, error) {
	id := uuid.New().String()

	status := &InstallationStatus{
		ID:          id,
		Status:      "in_progress",
		CurrentStep: "initializing",
		Progress:    0,
		StartedAt:   time.Now(),
		Steps: []InstallationStep{
			{Name: "prerequisites", Status: "pending", Description: "Checking prerequisites"},
			{Name: "helm_repo", Status: "pending", Description: "Adding OpenYurt Helm repository"},
			{Name: "helm_repo_update", Status: "pending", Description: "Updating Helm repositories"},
			{Name: "yurt_manager", Status: "pending", Description: "Installing yurt-manager"},
			{Name: "yurthub", Status: "pending", Description: "Installing yurthub"},
			{Name: "raven_agent", Status: "pending", Description: "Installing raven-agent"},
			{Name: "verification", Status: "pending", Description: "Verifying installation"},
		},
	}

	i.mu.Lock()
	i.installations[id] = status
	i.mu.Unlock()

	// Run installation in a goroutine
	go i.runInstallation(id, kubernetesServerAddr)

	return id, nil
}

// runInstallation executes the installation steps
func (i *Installer) runInstallation(id string, kubernetesServerAddr string) {
	defer func() {
		if r := recover(); r != nil {
			i.updateStatus(id, func(s *InstallationStatus) {
				s.Status = "failed"
				s.Error = fmt.Sprintf("Installation panicked: %v", r)
				s.CompletedAt = time.Now()
			})
		}
	}()

	ctx := context.Background()

	// Step 1: Check prerequisites
	i.updateStep(id, "prerequisites", "in_progress", "")
	if err := i.checkPrerequisites(ctx); err != nil {
		i.failStep(id, "prerequisites", err.Error())
		i.failInstallation(id, fmt.Sprintf("Prerequisites check failed: %v", err))
		return
	}
	i.completeStep(id, "prerequisites")

	// Step 2: Add Helm repository
	i.updateStep(id, "helm_repo", "in_progress", "")
	if err := i.addHelmRepo(ctx); err != nil {
		i.failStep(id, "helm_repo", err.Error())
		i.failInstallation(id, fmt.Sprintf("Failed to add Helm repository: %v", err))
		return
	}
	i.completeStep(id, "helm_repo")

	// Step 3: Update Helm repositories
	i.updateStep(id, "helm_repo_update", "in_progress", "")
	if err := i.updateHelmRepo(ctx); err != nil {
		i.failStep(id, "helm_repo_update", err.Error())
		i.failInstallation(id, fmt.Sprintf("Failed to update Helm repositories: %v", err))
		return
	}
	i.completeStep(id, "helm_repo_update")

	// Step 4: Get Kubernetes server address if not provided
	if kubernetesServerAddr == "" {
		kubernetesServerAddr = i.getKubernetesServerAddr(ctx)
	}

	// Step 5: Install yurt-manager
	i.updateStep(id, "yurt_manager", "in_progress", "")
	if err := i.installYurtManager(ctx); err != nil {
		i.failStep(id, "yurt_manager", err.Error())
		i.failInstallation(id, fmt.Sprintf("Failed to install yurt-manager: %v", err))
		return
	}
	i.completeStep(id, "yurt_manager")

	// Step 6: Install yurthub
	i.updateStep(id, "yurthub", "in_progress", "")
	if err := i.installYurthub(ctx, kubernetesServerAddr); err != nil {
		i.failStep(id, "yurthub", err.Error())
		i.failInstallation(id, fmt.Sprintf("Failed to install yurthub: %v", err))
		return
	}
	i.completeStep(id, "yurthub")

	// Step 7: Install raven-agent
	i.updateStep(id, "raven_agent", "in_progress", "")
	if err := i.installRavenAgent(ctx); err != nil {
		i.failStep(id, "raven_agent", err.Error())
		i.failInstallation(id, fmt.Sprintf("Failed to install raven-agent: %v", err))
		return
	}
	i.completeStep(id, "raven_agent")

	// Step 8: Verify installation
	i.updateStep(id, "verification", "in_progress", "")
	if err := i.verifyInstallation(ctx); err != nil {
		i.failStep(id, "verification", err.Error())
		i.failInstallation(id, fmt.Sprintf("Verification failed: %v", err))
		return
	}
	i.completeStep(id, "verification")

	// Mark installation as completed
	i.updateStatus(id, func(s *InstallationStatus) {
		s.Status = "completed"
		s.CurrentStep = "completed"
		s.Progress = 100
		s.CompletedAt = time.Now()
	})
}

// Helper methods to update status
func (i *Installer) updateStatus(id string, updater func(*InstallationStatus)) {
	i.mu.RLock()
	status, exists := i.installations[id]
	i.mu.RUnlock()

	if !exists {
		return
	}

	status.mu.Lock()
	updater(status)
	status.mu.Unlock()
}

func (i *Installer) updateStep(id string, stepName string, status string, errorMsg string) {
	i.updateStatus(id, func(s *InstallationStatus) {
		for i := range s.Steps {
			if s.Steps[i].Name == stepName {
				s.Steps[i].Status = status
				if errorMsg != "" {
					s.Steps[i].Error = errorMsg
				}
				s.CurrentStep = stepName
				// Update progress based on completed steps
				completed := 0
				for _, step := range s.Steps {
					if step.Status == "completed" {
						completed++
					}
				}
				s.Progress = (completed * 100) / len(s.Steps)
				break
			}
		}
	})
}

func (i *Installer) completeStep(id string, stepName string) {
	i.updateStep(id, stepName, "completed", "")
}

func (i *Installer) failStep(id string, stepName string, errorMsg string) {
	i.updateStep(id, stepName, "failed", errorMsg)
}

func (i *Installer) failInstallation(id string, errorMsg string) {
	i.updateStatus(id, func(s *InstallationStatus) {
		s.Status = "failed"
		s.Error = errorMsg
		s.CompletedAt = time.Now()
	})
}

// Installation methods
func (i *Installer) checkPrerequisites(ctx context.Context) error {
	// Check kubectl
	if err := exec.CommandContext(ctx, "kubectl", "version", "--client").Run(); err != nil {
		return fmt.Errorf("kubectl not found or not working: %v", err)
	}

	// Check helm
	if err := exec.CommandContext(ctx, "helm", "version").Run(); err != nil {
		return fmt.Errorf("helm not found or not working: %v", err)
	}

	// Check if cluster is accessible
	cmd := exec.CommandContext(ctx, "kubectl", "cluster-info")
	if i.kubeconfig != "" {
		cmd.Env = append(cmd.Env, fmt.Sprintf("KUBECONFIG=%s", i.kubeconfig))
	}
	if err := cmd.Run(); err != nil {
		return fmt.Errorf("cannot access Kubernetes cluster: %v", err)
	}

	return nil
}

func (i *Installer) addHelmRepo(ctx context.Context) error {
	cmd := exec.CommandContext(ctx, "helm", "repo", "add", "openyurt", "https://openyurtio.github.io/openyurt-helm")
	if i.kubeconfig != "" {
		cmd.Env = append(cmd.Env, fmt.Sprintf("KUBECONFIG=%s", i.kubeconfig))
	}

	output, err := cmd.CombinedOutput()
	if err != nil {
		// If repo already exists, that's okay
		if strings.Contains(string(output), "already exists") {
			return nil
		}
		return fmt.Errorf("failed to add helm repo: %v, output: %s", err, string(output))
	}

	return nil
}

func (i *Installer) updateHelmRepo(ctx context.Context) error {
	cmd := exec.CommandContext(ctx, "helm", "repo", "update")
	if i.kubeconfig != "" {
		cmd.Env = append(cmd.Env, fmt.Sprintf("KUBECONFIG=%s", i.kubeconfig))
	}

	output, err := cmd.CombinedOutput()
	if err != nil {
		return fmt.Errorf("failed to update helm repos: %v, output: %s", err, string(output))
	}

	return nil
}

func (i *Installer) getKubernetesServerAddr(ctx context.Context) string {
	cmd := exec.CommandContext(ctx, "kubectl", "config", "view", "--minify", "-o", "json")
	if i.kubeconfig != "" {
		cmd.Env = append(cmd.Env, fmt.Sprintf("KUBECONFIG=%s", i.kubeconfig))
	}

	output, err := cmd.CombinedOutput()
	if err != nil {
		logger.Warnf("Failed to get Kubernetes server address: %v", err)
		return ""
	}

	var config struct {
		Clusters []struct {
			Cluster struct {
				Server string `json:"server"`
			} `json:"cluster"`
		} `json:"clusters"`
	}

	if err := json.Unmarshal(output, &config); err != nil {
		logger.Warnf("Failed to parse kubectl config: %v", err)
		return ""
	}

	if len(config.Clusters) > 0 && config.Clusters[0].Cluster.Server != "" {
		return config.Clusters[0].Cluster.Server
	}

	return ""
}

func (i *Installer) installYurtManager(ctx context.Context) error {
	cmd := exec.CommandContext(ctx, "helm", "upgrade", "--install", "yurt-manager",
		"openyurt/yurt-manager", "-n", "kube-system", "--create-namespace", "--wait", "--timeout", "5m")
	if i.kubeconfig != "" {
		cmd.Env = append(cmd.Env, fmt.Sprintf("KUBECONFIG=%s", i.kubeconfig))
	}

	output, err := cmd.CombinedOutput()
	if err != nil {
		logger.Warnf("Helm install output: %s", string(output))
		// Continue even if wait fails, as the release might be installed
		if !strings.Contains(string(output), "Release") {
			return fmt.Errorf("helm install failed: %v, output: %s", err, string(output))
		}
	}

	logger.Infof("yurt-manager installed successfully")
	
	// Wait for pod to be ready with timeout
	return i.waitForPod(ctx, "kube-system", "app=yurt-manager", 2*time.Minute)
}

func (i *Installer) installYurthub(ctx context.Context, kubernetesServerAddr string) error {
	if kubernetesServerAddr == "" {
		return fmt.Errorf("kubernetes server address is required for yurthub installation")
	}

	cmd := exec.CommandContext(ctx, "helm", "upgrade", "--install", "yurt-hub",
		"openyurt/yurthub", "-n", "kube-system",
		"--set", fmt.Sprintf("kubernetesServerAddr=%s", kubernetesServerAddr),
		"--wait", "--timeout", "5m")
	if i.kubeconfig != "" {
		cmd.Env = append(cmd.Env, fmt.Sprintf("KUBECONFIG=%s", i.kubeconfig))
	}

	output, err := cmd.CombinedOutput()
	if err != nil {
		logger.Warnf("Helm install output: %s", string(output))
		// Continue even if wait fails, as the release might be installed
		if !strings.Contains(string(output), "Release") {
			return fmt.Errorf("helm install failed: %v, output: %s", err, string(output))
		}
	}

	logger.Infof("yurthub installed successfully")
	
	// Wait for YurtStaticSet to be created
	return i.waitForResource(ctx, "yss", "kube-system", 1*time.Minute)
}

func (i *Installer) installRavenAgent(ctx context.Context) error {
	cmd := exec.CommandContext(ctx, "helm", "upgrade", "--install", "raven-agent",
		"openyurt/raven-agent", "-n", "kube-system", "--wait", "--timeout", "5m")
	if i.kubeconfig != "" {
		cmd.Env = append(cmd.Env, fmt.Sprintf("KUBECONFIG=%s", i.kubeconfig))
	}

	output, err := cmd.CombinedOutput()
	if err != nil {
		logger.Warnf("Helm install output: %s", string(output))
		// Continue even if wait fails, as the release might be installed
		if !strings.Contains(string(output), "Release") {
			return fmt.Errorf("helm install failed: %v, output: %s", err, string(output))
		}
	}

	logger.Infof("raven-agent installed successfully")
	
	// Wait for raven-agent pods to be ready
	return i.waitForPod(ctx, "kube-system", "app=raven-agent", 2*time.Minute)
}

func (i *Installer) verifyInstallation(ctx context.Context) error {
	logger.Infof("Starting installation verification...")
	
	// Check yurt-manager pod
	cmd := exec.CommandContext(ctx, "kubectl", "get", "pod", "-n", "kube-system", "-l", "app=yurt-manager", "-o", "jsonpath={.items[*].status.phase}")
	if i.kubeconfig != "" {
		cmd.Env = append(cmd.Env, fmt.Sprintf("KUBECONFIG=%s", i.kubeconfig))
	}
	output, err := cmd.CombinedOutput()
	if err != nil || !strings.Contains(string(output), "Running") {
		logger.Warnf("yurt-manager pod status check: output=%s, err=%v", string(output), err)
		// Wait a bit more and retry
		time.Sleep(10 * time.Second)
		output, err = cmd.CombinedOutput()
		if err != nil || !strings.Contains(string(output), "Running") {
			return fmt.Errorf("yurt-manager pod not running: %v, output: %s", err, string(output))
		}
	}
	logger.Infof("yurt-manager pod verified")

	// Check yurthub YurtStaticSet
	cmd = exec.CommandContext(ctx, "kubectl", "get", "yss", "-n", "kube-system", "--no-headers")
	if i.kubeconfig != "" {
		cmd.Env = append(cmd.Env, fmt.Sprintf("KUBECONFIG=%s", i.kubeconfig))
	}
	if err := cmd.Run(); err != nil {
		logger.Warnf("yurthub YurtStaticSet check failed: %v", err)
		// Wait a bit more and retry
		time.Sleep(10 * time.Second)
		if err := cmd.Run(); err != nil {
			return fmt.Errorf("yurthub YurtStaticSet not found: %v", err)
		}
	}
	logger.Infof("yurthub YurtStaticSet verified")

	// Check raven-agent pod
	cmd = exec.CommandContext(ctx, "kubectl", "get", "pod", "-n", "kube-system", "-l", "app=raven-agent", "-o", "jsonpath={.items[*].status.phase}")
	if i.kubeconfig != "" {
		cmd.Env = append(cmd.Env, fmt.Sprintf("KUBECONFIG=%s", i.kubeconfig))
	}
	output, err = cmd.CombinedOutput()
	if err != nil || !strings.Contains(string(output), "Running") {
		logger.Warnf("raven-agent pod status check: output=%s, err=%v", string(output), err)
		// This is not critical, so we warn but don't fail
		logger.Warnf("raven-agent pod may not be running yet")
	} else {
		logger.Infof("raven-agent pod verified")
	}

	logger.Infof("Installation verification completed successfully")
	return nil
}

// waitForPod waits for pods matching the label selector to be in Running state
func (i *Installer) waitForPod(ctx context.Context, namespace, labelSelector string, timeout time.Duration) error {
	logger.Infof("Waiting for pod with label %s in namespace %s...", labelSelector, namespace)
	
	deadline := time.Now().Add(timeout)
	for time.Now().Before(deadline) {
		cmd := exec.CommandContext(ctx, "kubectl", "get", "pod", "-n", namespace, "-l", labelSelector, "-o", "jsonpath={.items[*].status.phase}")
		if i.kubeconfig != "" {
			cmd.Env = append(cmd.Env, fmt.Sprintf("KUBECONFIG=%s", i.kubeconfig))
		}
		
		output, err := cmd.CombinedOutput()
		if err == nil {
			phases := strings.Fields(string(output))
			allRunning := true
			for _, phase := range phases {
				if phase != "Running" {
					allRunning = false
					break
				}
			}
			if allRunning && len(phases) > 0 {
				logger.Infof("All pods with label %s are Running", labelSelector)
				return nil
			}
		}
		
		time.Sleep(5 * time.Second)
	}
	
	return fmt.Errorf("timeout waiting for pod with label %s in namespace %s", labelSelector, namespace)
}

// waitForResource waits for a resource type to exist
func (i *Installer) waitForResource(ctx context.Context, resourceType, namespace string, timeout time.Duration) error {
	logger.Infof("Waiting for resource %s in namespace %s...", resourceType, namespace)
	
	deadline := time.Now().Add(timeout)
	for time.Now().Before(deadline) {
		cmd := exec.CommandContext(ctx, "kubectl", "get", resourceType, "-n", namespace, "--no-headers")
		if i.kubeconfig != "" {
			cmd.Env = append(cmd.Env, fmt.Sprintf("KUBECONFIG=%s", i.kubeconfig))
		}
		
		if err := cmd.Run(); err == nil {
			logger.Infof("Resource %s found in namespace %s", resourceType, namespace)
			return nil
		}
		
		time.Sleep(5 * time.Second)
	}
	
	return fmt.Errorf("timeout waiting for resource %s in namespace %s", resourceType, namespace)
}

