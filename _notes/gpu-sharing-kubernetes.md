---
title: "GPU Sharing in Kubernetes"
excerpt: "NVIDIA MIG, vGPU, and time-slicing strategies for GPU workloads"
category: gpu-ai
permalink: /notes/gpu-sharing-kubernetes/
---

# GPU Sharing in Kubernetes

Overview of GPU sharing technologies for maximizing GPU utilization in Kubernetes clusters.

## Technologies Comparison

| Technology | Use Case | Isolation | Memory Sharing |
|------------|----------|-----------|----------------|
| MIG | Multi-tenant, inference | Hardware | No (partitioned) |
| vGPU | VMs, legacy apps | Full | No (allocated) |
| Time-slicing | Dev/test, burstable | None | Yes (shared) |
| MPS | CUDA streams | Partial | Yes |

## NVIDIA MIG (Multi-Instance GPU)

MIG partitions A100/H100 GPUs into smaller instances with dedicated resources.

### Supported Profiles (A100 80GB)
- `1g.10gb` - 1/7 GPU, 10GB memory
- `2g.20gb` - 2/7 GPU, 20GB memory
- `3g.40gb` - 3/7 GPU, 40GB memory
- `7g.80gb` - Full GPU

### Configuration
```bash
# Enable MIG mode
nvidia-smi -i 0 -mig 1

# Create MIG instances
nvidia-smi mig -cgi 9,9,9,9,9,9,9 -i 0

# List instances
nvidia-smi mig -lgi
```

## Time-Slicing

Share a single GPU across multiple pods with time-based multiplexing.

### ConfigMap Example
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: time-slicing-config
data:
  any: |-
    version: v1
    sharing:
      timeSlicing:
        replicas: 4
```

---

*Last updated: 2026-02-09*
