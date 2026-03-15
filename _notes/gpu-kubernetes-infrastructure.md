---
title: "GPU Infrastructure & Scheduling"
excerpt: "Operator setup, resource allocation, and sharing strategies in Kubernetes"
category: gpu-ai
order: 1
permalink: /notes/gpu-kubernetes-infrastructure/
---

# GPU Infrastructure & Scheduling

## NVIDIA GPU Operator

The NVIDIA GPU Operator automates the management of all NVIDIA software components needed to provision GPUs in Kubernetes.

### Core Components (Operands)
- **NVIDIA Driver**: Low-level kernel drivers (can be containerized).
- **NVIDIA Container Toolkit**: Configures container runtimes (containerd/CRI-O) to mount GPU resources.
- **NVIDIA Device Plugin**: Traditional mechanism for exposing GPUs as extended resources (`nvidia.com/gpu`).
- **GPU Feature Discovery (GFD)**: Labels nodes with GPU attributes (model, memory, capabilities).
- **DCGM Exporter**: Exports GPU telemetry (utilization, power, temperature) for Prometheus.
- **MIG Manager**: Manages Multi-Instance GPU (MIG) partitioning.

### Common Configuration (Helm)
```bash
helm install gpu-operator nvidia/gpu-operator \
  --set driver.enabled=true \
  --set toolkit.enabled=true \
  --set psp.enabled=false
```

---

## Resource Allocation: CDI & DRA

### CDI (Container Device Interface)
Standardizes how third-party devices are made available to containers, replacing runtime-specific hooks with a declarative JSON descriptor.

### DRA (Dynamic Resource Allocation)
Next-generation resource management API (K8s v1.26+) moving beyond Device Plugins.
- **`ResourceClaim`**: A request for specific hardware (like PVC).
- **Rich Filtering**: Use CEL (Common Expression Language) to request specific attributes (e.g., `device.memory >= 80Gi`).

---

## GPU Sharing Strategies

Maximize utilization by sharing physical GPUs across multiple workloads.

| Technology | Use Case | Isolation | Memory Sharing |
|------------|----------|-----------|----------------|
| **MIG** | Multi-tenant, inference | Hardware (Full) | No (partitioned) |
| **vGPU** | VMs, legacy apps | Hardware | No (allocated) |
| **Time-slicing** | Dev/test, burstable | None (Software) | Yes (shared) |
| **MPS** | CUDA streams | Partial | Yes |

### NVIDIA MIG (Multi-Instance GPU)
Partitions A100/H100 GPUs into smaller instances with dedicated resources.
- `1g.10gb` - 1/7 GPU, 10GB memory
- `2g.20gb` - 2/7 GPU, 20GB memory
- `3g.40gb` - 3/7 GPU, 40GB memory

### Time-Slicing Config
```yaml
sharing:
  timeSlicing:
    replicas: 4
```

---

*Last updated: 2026-03-07*
