package install

import (
	"context"
	"encoding/json"
	"fmt"
	"os/exec"
	"strings"
)

// ComponentStatus represents the status of an OpenYurt component
type ComponentStatus struct {
	Name        string            `json:"name"`
	Installed   bool              `json:"installed"`
	Status      string            `json:"status"` // "healthy", "unhealthy", "unknown"
	Version     string            `json:"version,omitempty"`
	Pods        []PodInfo         `json:"pods,omitempty"`
	Details     map[string]string `json:"details,omitempty"`
}

// PodInfo represents pod information
type PodInfo struct {
	Name   string `json:"name"`
	Status string `json:"status"`
}

// InstallationCheckResult represents the overall installation check result
type InstallationCheckResult struct {
	Installed     bool              `json:"installed"`
	Components    []ComponentStatus `json:"components"`
	OverallStatus string            `json:"overallStatus"` // "installed", "partial", "not_installed"
}

// CheckInstallationStatus checks if OpenYurt is installed and what the status is
func CheckInstallationStatus(ctx context.Context, kubeconfig string) (*InstallationCheckResult, error) {
	result := &InstallationCheckResult{
		Components: []ComponentStatus{},
	}

	// Check each component
	yurtManager := checkYurtManager(ctx, kubeconfig)
	result.Components = append(result.Components, yurtManager)

	yurthub := checkYurthub(ctx, kubeconfig)
	result.Components = append(result.Components, yurthub)

	ravenAgent := checkRavenAgent(ctx, kubeconfig)
	result.Components = append(result.Components, ravenAgent)

	// Determine overall status
	installedCount := 0
	healthyCount := 0
	for _, comp := range result.Components {
		if comp.Installed {
			installedCount++
			if comp.Status == "healthy" {
				healthyCount++
			}
		}
	}

	result.Installed = installedCount > 0
	if installedCount == len(result.Components) && healthyCount == len(result.Components) {
		result.OverallStatus = "installed"
	} else if installedCount > 0 {
		result.OverallStatus = "partial"
	} else {
		result.OverallStatus = "not_installed"
	}

	return result, nil
}

func checkYurtManager(ctx context.Context, kubeconfig string) ComponentStatus {
	comp := ComponentStatus{
		Name:    "yurt-manager",
		Details: make(map[string]string),
	}

	// Check helm release
	cmd := exec.CommandContext(ctx, "helm", "list", "-n", "kube-system", "--filter", "yurt-manager", "-o", "json")
	if kubeconfig != "" {
		cmd.Env = append(cmd.Env, fmt.Sprintf("KUBECONFIG=%s", kubeconfig))
	}

	output, err := cmd.CombinedOutput()
	if err != nil || strings.TrimSpace(string(output)) == "[]" {
		return comp
	}

	comp.Installed = true

	// Check pod status
	cmd = exec.CommandContext(ctx, "kubectl", "get", "pods", "-n", "kube-system", "-l", "app=yurt-manager", "-o", "json")
	if kubeconfig != "" {
		cmd.Env = append(cmd.Env, fmt.Sprintf("KUBECONFIG=%s", kubeconfig))
	}

	podOutput, err := cmd.CombinedOutput()
	if err == nil {
		var podList struct {
			Items []struct {
				Metadata struct {
					Name string `json:"name"`
				} `json:"metadata"`
				Status struct {
					Phase string `json:"phase"`
				} `json:"status"`
			} `json:"items"`
		}

		if err := json.Unmarshal(podOutput, &podList); err == nil {
			comp.Pods = []PodInfo{}
			allRunning := true
			for _, pod := range podList.Items {
				podInfo := PodInfo{
					Name:   pod.Metadata.Name,
					Status: pod.Status.Phase,
				}
				comp.Pods = append(comp.Pods, podInfo)
				if pod.Status.Phase != "Running" {
					allRunning = false
				}
			}

			if len(comp.Pods) > 0 && allRunning {
				comp.Status = "healthy"
			} else if len(comp.Pods) > 0 {
				comp.Status = "unhealthy"
			} else {
				comp.Status = "unknown"
			}
		}
	}

	return comp
}

func checkYurthub(ctx context.Context, kubeconfig string) ComponentStatus {
	comp := ComponentStatus{
		Name:    "yurthub",
		Details: make(map[string]string),
	}

	// Check helm release
	cmd := exec.CommandContext(ctx, "helm", "list", "-n", "kube-system", "--filter", "yurt-hub", "-o", "json")
	if kubeconfig != "" {
		cmd.Env = append(cmd.Env, fmt.Sprintf("KUBECONFIG=%s", kubeconfig))
	}

	output, err := cmd.CombinedOutput()
	if err != nil || strings.TrimSpace(string(output)) == "[]" {
		return comp
	}

	comp.Installed = true

	// Check YurtStaticSet
	cmd = exec.CommandContext(ctx, "kubectl", "get", "yss", "-n", "kube-system", "-o", "json")
	if kubeconfig != "" {
		cmd.Env = append(cmd.Env, fmt.Sprintf("KUBECONFIG=%s", kubeconfig))
	}

	yssOutput, err := cmd.CombinedOutput()
	if err == nil {
		var yssList struct {
			Items []struct {
				Metadata struct {
					Name string `json:"name"`
				} `json:"metadata"`
			} `json:"items"`
		}

		if err := json.Unmarshal(yssOutput, &yssList); err == nil {
			if len(yssList.Items) > 0 {
				comp.Status = "healthy"
				comp.Details["yss_count"] = fmt.Sprintf("%d", len(yssList.Items))
			}
		}
	}

	return comp
}

func checkRavenAgent(ctx context.Context, kubeconfig string) ComponentStatus {
	comp := ComponentStatus{
		Name:    "raven-agent",
		Details: make(map[string]string),
	}

	// Check helm release
	cmd := exec.CommandContext(ctx, "helm", "list", "-n", "kube-system", "--filter", "raven-agent", "-o", "json")
	if kubeconfig != "" {
		cmd.Env = append(cmd.Env, fmt.Sprintf("KUBECONFIG=%s", kubeconfig))
	}

	output, err := cmd.CombinedOutput()
	if err != nil || strings.TrimSpace(string(output)) == "[]" {
		return comp
	}

	comp.Installed = true

	// Check pod status
	cmd = exec.CommandContext(ctx, "kubectl", "get", "pods", "-n", "kube-system", "-l", "app=raven-agent", "-o", "json")
	if kubeconfig != "" {
		cmd.Env = append(cmd.Env, fmt.Sprintf("KUBECONFIG=%s", kubeconfig))
	}

	podOutput, err := cmd.CombinedOutput()
	if err == nil {
		var podList struct {
			Items []struct {
				Metadata struct {
					Name string `json:"name"`
				} `json:"metadata"`
				Status struct {
					Phase string `json:"phase"`
				} `json:"status"`
			} `json:"items"`
		}

		if err := json.Unmarshal(podOutput, &podList); err == nil {
			comp.Pods = []PodInfo{}
			allRunning := true
			for _, pod := range podList.Items {
				podInfo := PodInfo{
					Name:   pod.Metadata.Name,
					Status: pod.Status.Phase,
				}
				comp.Pods = append(comp.Pods, podInfo)
				if pod.Status.Phase != "Running" {
					allRunning = false
				}
			}

			if len(comp.Pods) > 0 && allRunning {
				comp.Status = "healthy"
			} else if len(comp.Pods) > 0 {
				comp.Status = "unhealthy"
			} else {
				comp.Status = "unknown"
			}
		}
	}

	return comp
}

