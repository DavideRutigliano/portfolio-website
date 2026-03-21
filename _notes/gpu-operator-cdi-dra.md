---
title: "GPU Operator, CDI, and DRA"
excerpt: "NVIDIA GPU Operator components, Container Device Interface (CDI), and Dynamic Resource Allocation (DRA) in Kubernetes"
macro_category: cloud-native
category: kubernetes-gpu
order: 5
permalink: /notes/gpu-operator-cdi-dra/
---

# GPU Operator, CDI, and DRA

Modern Kubernetes infrastructure for managing accelerator lifecycle, standardizing device access, and dynamic resource management.

## NVIDIA GPU Operator

The NVIDIA GPU Operator automates the management of all NVIDIA software components needed to provision GPUs in Kubernetes.

```mermaid
flowchart TD
    Operator["NVIDIA GPU OPERATOR"]
    NFD["NFD"]
    
    subgraph GPUNode ["GPU Node"]
        Drivers["NVIDIA Drivers"]
        DevicePlugin["Device Plugin"]
        Toolkit["Container Toolkit"]
        DCGM["DCGM"]
    end
    
    Operator -.-> NFD
    Operator -.-> Drivers
    Operator -.-> DevicePlugin
    Operator -.-> Toolkit
    Operator -.-> DCGM
    
    classDef operator fill:#3b82f6,color:#fff,stroke:#2563eb,stroke-width:2px
    classDef nfd fill:#fff,stroke:#ef4444,color:#ef4444,stroke-width:2px,rx:10,ry:10
    classDef drivers fill:#eff6ff,stroke:#3b82f6,color:#3b82f6,stroke-width:2px,rx:10,ry:10
    classDef plugin fill:#fefce8,stroke:#ca8a04,color:#ca8a04,stroke-width:2px,rx:10,ry:10
    classDef toolkit fill:#f0fdf4,stroke:#16a34a,color:#16a34a,stroke-width:2px,rx:10,ry:10
    classDef dcgm fill:#faf5ff,stroke:#9333ea,color:#9333ea,stroke-width:2px,rx:10,ry:10
    classDef node fill:#fdfbf7,stroke:#333,stroke-width:1px
    
    class Operator operator
    class NFD nfd
    class Drivers drivers
    class DevicePlugin plugin
    class Toolkit toolkit
    class DCGM dcgm
    class GPUNode node
```
<p align="center"><em>Every available GPU nodes will be configured with required components and configurations</em></p>

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

## CDI (Container Device Interface)

CDI is an open specification for container runtimes (containerd, CRI-O) to standardize how third-party devices are made available to containers.

- **Standardization**: Replaces runtime-specific hooks with a declarative JSON descriptor.
- **Mechanism**: The device plugin returns a fully qualified device name (e.g., `nvidia.com/gpu=0`), and the runtime uses the CDI spec to inject device nodes, environment variables, and mounts.
- **Benefits**: Simplifies the path from device plugin to low-level runtime (runc), moving complex logic out of the runtime itself.

---

## DRA (Dynamic Resource Allocation)

DRA is the next-generation resource management API in Kubernetes (introduced in v1.26, evolving in v1.31+), moving beyond the limitations of the Device Plugin API.

### Key Concepts
- **`ResourceClaim`**: A request for specific hardware resources (similar to PVC for storage).
- **`DeviceClass`**: Defines categories of devices (e.g., "high-memory-gpus") with specific filters.
- **`ResourceSlice`**: Represents the actual hardware availability on nodes.

### Benefits over Device Plugins
1. **Rich Filtering**: Use CEL (Common Expression Language) to request specific attributes (e.g., `device.memory >= 24Gi`).
2. **Device Sharing**: Better native support for sharing devices across multiple containers/pods.
3. **Hardware Topology**: Improved awareness of PCIe/NVLink topologies for multi-GPU workloads.
4. **Decoupled Lifecycle**: Allocation happens during scheduling, allowing for more complex "all-or-nothing" scheduling for multi-node jobs.

### Example Claim
```yaml
apiVersion: resource.k8s.io/v1alpha3
kind: ResourceClaim
metadata:
  name: gpu-claim
spec:
  devices:
    requests:
    - name: my-gpu
      deviceClassName: nvidia-h100
      selectors:
      - cel: "device.memory >= 80Gi"
```

---

*Last updated: 2026-03-02*
