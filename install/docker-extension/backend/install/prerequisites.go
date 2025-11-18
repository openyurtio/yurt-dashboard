package install

import (
	"context"
	"encoding/json"
	"fmt"
	"os/exec"
	"strings"
)

// PrerequisitesCheckResult represents the result of prerequisites checking
type PrerequisitesCheckResult struct {
	Ready   bool                    `json:"ready"`
	Checks  map[string]CheckResult  `json:"checks"`
	Warnings []string                `json:"warnings"`
}

// CheckResult represents the result of a single check
type CheckResult struct {
	Available bool   `json:"available"`
	Version   string `json:"version,omitempty"`
	Message   string `json:"message,omitempty"`
	Details   map[string]interface{} `json:"details,omitempty"`
}

// CheckPrerequisites checks if all prerequisites are met
func CheckPrerequisites(ctx context.Context, kubeconfig string) (*PrerequisitesCheckResult, error) {
	result := &PrerequisitesCheckResult{
		Ready:   true,
		Checks:  make(map[string]CheckResult),
		Warnings: []string{},
	}

	// Check kubectl
	kubectlCheck := checkKubectl(ctx, kubeconfig)
	result.Checks["kubectl"] = kubectlCheck
	if !kubectlCheck.Available {
		result.Ready = false
	}

	// Check helm
	helmCheck := checkHelm(ctx)
	result.Checks["helm"] = helmCheck
	if !helmCheck.Available {
		result.Ready = false
	}

	// Check Kubernetes cluster
	clusterCheck := checkKubernetesCluster(ctx, kubeconfig)
	result.Checks["kubernetes"] = clusterCheck
	if !clusterCheck.Available {
		result.Ready = false
	}

	// Check kubeconfig
	kubeconfigCheck := checkKubeconfig(ctx, kubeconfig)
	result.Checks["kubeconfig"] = kubeconfigCheck

	// Check container runtime (Docker/containerd)
	runtimeCheck := checkContainerRuntime(ctx)
	result.Checks["runtime"] = runtimeCheck
	if runtimeCheck.Available {
		// If Docker is detected, check iptables forward policy
		if runtimeCheck.Details != nil {
			if runtime, ok := runtimeCheck.Details["runtime"].(string); ok && runtime == "docker" {
				iptablesCheck := checkIptablesForwardPolicy(ctx)
				result.Checks["iptables"] = iptablesCheck
				if !iptablesCheck.Available {
					result.Warnings = append(result.Warnings, "Docker runtime detected but iptables FORWARD policy is not ACCEPT. You may need to run: iptables -w -P FORWARD ACCEPT")
				}
			}
		}
	}

	return result, nil
}

func checkKubectl(ctx context.Context, kubeconfig string) CheckResult {
	cmd := exec.CommandContext(ctx, "kubectl", "version", "--client", "--output=json")
	if kubeconfig != "" {
		cmd.Env = append(cmd.Env, fmt.Sprintf("KUBECONFIG=%s", kubeconfig))
	}

	output, err := cmd.CombinedOutput()
	if err != nil {
		return CheckResult{
			Available: false,
			Message:   fmt.Sprintf("kubectl not found or not working: %v", err),
		}
	}

	var versionInfo struct {
		ClientVersion struct {
			GitVersion string `json:"gitVersion"`
		} `json:"clientVersion"`
	}

	if err := json.Unmarshal(output, &versionInfo); err != nil {
		return CheckResult{
			Available: true,
			Version:   "unknown",
			Message:   "kubectl found but version could not be determined",
		}
	}

	return CheckResult{
		Available: true,
		Version:   versionInfo.ClientVersion.GitVersion,
		Message:   "kubectl is available",
	}
}

func checkHelm(ctx context.Context) CheckResult {
	cmd := exec.CommandContext(ctx, "helm", "version", "--short")
	output, err := cmd.CombinedOutput()
	if err != nil {
		return CheckResult{
			Available: false,
			Message:   fmt.Sprintf("helm not found or not working: %v", err),
		}
	}

	version := strings.TrimSpace(string(output))
	return CheckResult{
		Available: true,
		Version:   version,
		Message:   "helm is available",
	}
}

func checkKubernetesCluster(ctx context.Context, kubeconfig string) CheckResult {
	cmd := exec.CommandContext(ctx, "kubectl", "cluster-info")
	if kubeconfig != "" {
		cmd.Env = append(cmd.Env, fmt.Sprintf("KUBECONFIG=%s", kubeconfig))
	}

	err := cmd.Run()
	if err != nil {
		return CheckResult{
			Available: false,
			Message:   fmt.Sprintf("cannot access Kubernetes cluster: %v", err),
		}
	}

	// Get cluster version
	cmd = exec.CommandContext(ctx, "kubectl", "version", "--output=json")
	if kubeconfig != "" {
		cmd.Env = append(cmd.Env, fmt.Sprintf("KUBECONFIG=%s", kubeconfig))
	}

	output, err := cmd.CombinedOutput()
	var version string
	var nodeCount int

	if err == nil {
		var versionInfo struct {
			ServerVersion struct {
				GitVersion string `json:"gitVersion"`
			} `json:"serverVersion"`
		}
		if err := json.Unmarshal(output, &versionInfo); err == nil {
			version = versionInfo.ServerVersion.GitVersion
		}
	}

	// Get node count
	cmd = exec.CommandContext(ctx, "kubectl", "get", "nodes", "--no-headers")
	if kubeconfig != "" {
		cmd.Env = append(cmd.Env, fmt.Sprintf("KUBECONFIG=%s", kubeconfig))
	}
	if output, err := cmd.Output(); err == nil {
		lines := strings.Split(strings.TrimSpace(string(output)), "\n")
		nodeCount = len(lines)
		if lines[0] == "" {
			nodeCount = 0
		}
	}

	return CheckResult{
		Available: true,
		Version:   version,
		Message:   "Kubernetes cluster is accessible",
		Details: map[string]interface{}{
			"nodes": nodeCount,
		},
	}
}

func checkKubeconfig(ctx context.Context, kubeconfig string) CheckResult {
	if kubeconfig == "" {
		// Try default locations
		cmd := exec.CommandContext(ctx, "kubectl", "config", "view", "--minify", "-o", "json")
		output, err := cmd.CombinedOutput()
		if err != nil {
			return CheckResult{
				Available: false,
				Message:   "kubeconfig not found in default locations",
			}
		}

		var config struct {
			Clusters []struct {
				Cluster struct {
					Server string `json:"server"`
				} `json:"cluster"`
			} `json:"clusters"`
		}

		if err := json.Unmarshal(output, &config); err != nil {
			return CheckResult{
				Available: false,
				Message:   "kubeconfig found but invalid",
			}
		}

		server := ""
		if len(config.Clusters) > 0 {
			server = config.Clusters[0].Cluster.Server
		}

		return CheckResult{
			Available: true,
			Message:   "kubeconfig found in default location",
			Details: map[string]interface{}{
				"server": server,
			},
		}
	}

	// Check if provided kubeconfig exists and is valid
	cmd := exec.CommandContext(ctx, "kubectl", "config", "view", "--kubeconfig", kubeconfig, "--minify", "-o", "json")
	output, err := cmd.CombinedOutput()
	if err != nil {
		return CheckResult{
			Available: false,
			Message:   fmt.Sprintf("kubeconfig file not accessible: %v", err),
		}
	}

	var config struct {
		Clusters []struct {
			Cluster struct {
				Server string `json:"server"`
			} `json:"cluster"`
		} `json:"clusters"`
	}

	if err := json.Unmarshal(output, &config); err != nil {
		return CheckResult{
			Available: false,
			Message:   "kubeconfig file is invalid",
		}
	}

	server := ""
	if len(config.Clusters) > 0 {
		server = config.Clusters[0].Cluster.Server
	}

	return CheckResult{
		Available: true,
		Message:   "kubeconfig is valid",
		Details: map[string]interface{}{
			"server": server,
			"path":   kubeconfig,
		},
	}
}

func checkContainerRuntime(ctx context.Context) CheckResult {
	// Check for Docker
	dockerCmd := exec.CommandContext(ctx, "docker", "version", "--format", "{{.Server.Version}}")
	dockerOutput, dockerErr := dockerCmd.CombinedOutput()
	
	if dockerErr == nil && len(strings.TrimSpace(string(dockerOutput))) > 0 {
		version := strings.TrimSpace(string(dockerOutput))
		return CheckResult{
			Available: true,
			Version:   version,
			Message:   "Docker runtime detected",
			Details: map[string]interface{}{
				"runtime": "docker",
			},
		}
	}

	// Check for containerd
	containerdCmd := exec.CommandContext(ctx, "containerd", "--version")
	containerdOutput, containerdErr := containerdCmd.CombinedOutput()
	
	if containerdErr == nil && len(strings.TrimSpace(string(containerdOutput))) > 0 {
		version := strings.TrimSpace(string(containerdOutput))
		return CheckResult{
			Available: true,
			Version:   version,
			Message:   "containerd runtime detected",
			Details: map[string]interface{}{
				"runtime": "containerd",
			},
		}
	}

	// Try to detect via kubectl
	kubectlCmd := exec.CommandContext(ctx, "kubectl", "get", "nodes", "-o", "jsonpath={.items[0].status.nodeInfo.containerRuntimeVersion}")
	kubectlOutput, kubectlErr := kubectlCmd.CombinedOutput()
	
	if kubectlErr == nil && len(strings.TrimSpace(string(kubectlOutput))) > 0 {
		runtimeInfo := strings.TrimSpace(string(kubectlOutput))
		runtime := "unknown"
		if strings.Contains(runtimeInfo, "docker") {
			runtime = "docker"
		} else if strings.Contains(runtimeInfo, "containerd") {
			runtime = "containerd"
		}
		
		return CheckResult{
			Available: true,
			Version:   runtimeInfo,
			Message:   fmt.Sprintf("Container runtime detected via kubectl: %s", runtime),
			Details: map[string]interface{}{
				"runtime": runtime,
			},
		}
	}

	return CheckResult{
		Available: false,
		Message:   "Could not detect container runtime. Docker or containerd expected.",
	}
}

func checkIptablesForwardPolicy(ctx context.Context) CheckResult {
	cmd := exec.CommandContext(ctx, "iptables", "-w", "-L", "FORWARD", "-n")
	output, err := cmd.CombinedOutput()
	
	if err != nil {
		return CheckResult{
			Available: false,
			Message:   fmt.Sprintf("Cannot check iptables FORWARD policy: %v", err),
		}
	}

	outputStr := string(output)
	// Check if policy is ACCEPT
	// iptables output should contain something like "Chain FORWARD (policy ACCEPT)"
	if strings.Contains(outputStr, "policy ACCEPT") {
		return CheckResult{
			Available: true,
			Message:   "iptables FORWARD policy is ACCEPT",
			Details: map[string]interface{}{
				"policy": "ACCEPT",
			},
		}
	}

	return CheckResult{
		Available: false,
		Message:   "iptables FORWARD policy is not ACCEPT. Run: iptables -w -P FORWARD ACCEPT",
		Details: map[string]interface{}{
			"policy": "not ACCEPT",
		},
	}
}

