---
title: "GPU Monitoring with NVIDIA DCGM"
excerpt: "Metrics, MIG monitoring, and Kubernetes integration with dcgm-exporter"
category: gpu-ai
permalink: /notes/gpu-monitoring-dcgm/
---

# GPU Monitoring with NVIDIA DCGM

Data Center GPU Manager (DCGM) is the industry standard for monitoring and managing NVIDIA GPUs in cluster environments.

## DCGM Key Metrics

DCGM provides a wide range of metrics, classified into health, usage, and profiling categories.

| Metric | DCGM Field Name | Description |
|--------|-----------------|-------------|
| GPU Utilization | `DCGM_FI_DEV_GPU_UTIL` | Traditional activity percentage (see MIG section below) |
| Memory Used | `DCGM_FI_DEV_FB_USED` | Amount of frame buffer memory used |
| Temperature | `DCGM_FI_DEV_GPU_TEMP` | Core temperature in degrees Celsius |
| Power Usage | `DCGM_FI_DEV_POWER_USAGE` | Instantaneous power draw in Watts |
| PCIE Throughput| `DCGM_FI_PROF_PCIE_TX_BYTES` | Data transferred over PCIe bus |

## Monitoring MIG (Multi-Instance GPU)

When using MIG (A100/H100), traditional utilization metrics like `GPU_UTIL` often fail or report incorrectly at the partition level.

### `GPU_UTIL` vs `GR_ENGINE_ACTIVE`

> [!IMPORTANT]
> For MIG partitions, **always** use `DCGM_FI_PROF_GR_ENGINE_ACTIVE` instead of `DCGM_FI_DEV_GPU_UTIL`.

*   **`GPU_UTIL` (`DCGM_FI_DEV_GPU_UTIL`)**: Reports if any kernel is executing. It doesn't accurately reflect resource consumption within a MIG slice.
*   **`GR_ENGINE_ACTIVE` (`DCGM_FI_PROF_GR_ENGINE_ACTIVE`)**: Measures the Graphics Engine activity. This provides a more precise utilization value for both graphics and compute workloads and is fully supported on individual MIG instances.

### Other Profiling Metrics for MIG
*   **`DCGM_FI_PROF_SM_ACTIVE`**: SM (Streaming Multiprocessor) activity.
*   **`DCGM_FI_PROF_SM_OCCUPANCY`**: Ratio of active warps to maximum warps.
*   **`DCGM_FI_PROF_PIPE_TENSOR_ACTIVE`**: Utilization of Tensor Cores (critical for LLM/AI).

## Kubernetes Integration

In Kubernetes, monitoring is typically handled by `dcgm-exporter`.

### Deployment with Helm

```bash
helm repo add nvidia https://helm.ngc.nvidia.com/nvidia
helm repo update
helm install dcgm-exporter nvidia/dcgm-exporter \
  --namespace gpu-operator \
  --set arguments={-f,/etc/dcgm-exporter/default-counters.csv}
```

### Scraping with Prometheus

`dcgm-exporter` exposes a `/metrics` endpoint. In Kubernetes, use a `ServiceMonitor`:

```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: dcgm-exporter
spec:
  selector:
    matchLabels:
      app.kubernetes.io/name: dcgm-exporter
  endpoints:
  - port: metrics
    interval: 15s
```

### MIG Pod Metrics

When `dcgm-exporter` runs, it automatically appends Kubernetes metadata (pod name, namespace, container name) to the GPU metrics. For MIG, it uses the `GPU-L0` (or similar) device identifier to map specific partitions to the pods consuming them.

---

*Last updated: 2026-02-18*
