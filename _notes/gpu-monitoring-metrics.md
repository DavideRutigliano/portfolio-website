---
title: "GPU Monitoring & Metrics"
excerpt: "DCGM, DCGM Exporter, and interpreting GPU profiling metrics"
macro_category: cloud-native
category: kubernetes-gpu
order: 4
permalink: /notes/gpu-monitoring-metrics/
---

# GPU Monitoring & Metrics

## NVIDIA DCGM (Data Center GPU Manager)

The industry standard for managing and monitoring NVIDIA GPUs in clusters.

### Key Metrics Reference

| Metric | Field Name | Description |
|--------|------------|-------------|
| **Compute Util** | `DCGM_FI_DEV_GPU_UTIL` | Traditional activity % |
| **GR Engine** | `DCGM_FI_PROF_GR_ENGINE_ACTIVE` | **Use for MIG partitions** |
| **Memory Used** | `DCGM_FI_DEV_FB_USED` | FB memory usage |
| **PCIe Bandwidth** | `DCGM_FI_PROF_PCIE_RX_BYTES` | Bytes received over PCIe |
| **Power Usage** | `DCGM_FI_DEV_POWER_USAGE` | Instantaneous draw in Watts |

---

## Monitoring MIG Instances

> [!IMPORTANT]
> For MIG partitions, **always** use `GR_ENGINE_ACTIVE` instead of `GPU_UTIL`. Traditional utilization metrics often report incorrectly at the partition level.

### Advanced Profiling Metrics
- `DCGM_FI_PROF_SM_ACTIVE`: SM (Streaming Multiprocessor) activity.
- `DCGM_FI_PROF_PIPE_TENSOR_ACTIVE`: Tensor Core utilization (Critical for LLMs).

---

## Kubernetes Integration

### Deployment (dcgm-exporter)
Runs as a DaemonSet to expose metrics to Prometheus. It automatically appends Pod/Container metadata to the metrics.

```yaml
# Prometheus ServiceMonitor
endpoints:
- port: metrics
  interval: 15s
```

---

*Last updated: 2026-03-07*
