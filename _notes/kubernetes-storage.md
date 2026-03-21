---
title: "Kubernetes Storage: PV, PVC & CSI"
excerpt: "A deep dive into Kubernetes storage abstractions, the Container Storage Interface (CSI), and stateful workload management."
macro_category: cloud-native
category: kubernetes
order: 4
permalink: /notes/kubernetes-storage/
---

# Kubernetes Storage: A Deep Dive

Storage in Kubernetes is designed to decouple the physical storage implementation from the application's request for it. This allows for portable, infrastructure-agnostic deployments.

## Stateless vs. Stateful Workloads

Understanding the nature of your workload is the first step in deciding how to handle storage:

- **Stateless**: Ephemeral, idempotent, and immutable. Containers can be replaced or rescheduled easily because they don't store persistent state. Examples: Web servers, API gateways.
- **Stateful**: Requires durability and persistence. Data must survive Pod restarts, node failures, and upgrades. Examples: Databases (PostgreSQL, MongoDB), Message Brokers.

## The Abstraction Stack

Kubernetes uses several layers to manage storage, moving from high-level requests to low-level implementation.

```mermaid
graph TD
    PVC["PersistentVolumeClaim (PVC)"] -- requests --> SC["StorageClass"]
    SC -- provisions --> PV["PersistentVolume (PV)"]
    PV -- backed by --> Infra["Infrastructure Storage (EBS, Azure Disk, NFS)"]
    Pod["Pod"] -- volumes --> PVC
```

### Storage Lifecycle Flow
The complete path from developer intent to a running application with storage.

```mermaid
sequenceDiagram
    participant User as Developer
    participant K8s as K8s Control Plane
    participant CSI_C as CSI Controller (Provisioner/Attacher)
    participant Sched as K8s Scheduler
    participant Kubelet as Node Kubelet (CSI Node Plugin)

    User->>K8s: Create PVC
    K8s->>CSI_C: Detect PVC (Provisioner)
    CSI_C->>CSI_C: CreateVolume (CSI)
    CSI_C-->>K8s: Create PV & Bind
    User->>K8s: Create Pod
    Sched->>K8s: Assign Pod to Node
    K8s->>CSI_C: Trigger Attachment (Attacher)
    CSI_C->>CSI_C: ControllerPublishVolume (CSI)
    K8s->>Kubelet: Start Pod
    Kubelet->>Kubelet: NodeStage & NodePublish (CSI)
    Kubelet-->>User: Container Started with Volume
```

### 1. Persistent Volumes (PV)
A cluster-scoped resource representing actual storage. It has a lifecycle independent of any individual Pod that uses it.
- **Phases**: `Available` → `Bound` → `Released` → `Failed`.
- **Reclaim Policies**:
    - **Delete**: Automatically deletes the underlying infrastructure when the PVC is deleted.
    - **Retain**: Keeps the storage for manual cleanup (safer for production).

### 2. Persistent Volume Claims (PVC)
A namespace-scoped request for storage. It’s like a "voucher" that a Pod uses to get a PV.
- **Binds**: A PVC binds to a matching PV based on size and access modes.
- **Access Modes**:
    - `ReadWriteOnce` (RWO): One node can mount as read-write.
    - `ReadOnlyMany` (ROX): Many nodes can mount as read-only.
    - `ReadWriteMany` (RWX): Many nodes can mount as read-write.

### 3. StorageClasses
Policies for **Dynamic Provisioning**. Instead of manually creating PVs, an administrator defines a `StorageClass`. When a PVC request comes in, the cluster creates a PV on the fly.
- **Binding Modes**:
    - `Immediate`: Create volume as soon as PVC is created.
    - `WaitForFirstConsumer`: Delay creation until the Pod is scheduled (best for multi-zone clusters).

## Container Storage Interface (CSI)

The CSI moved storage drivers "out-of-tree," allowing storage vendors to develop plugins independently of the Kubernetes core.

```mermaid
sequenceDiagram
    participant K8s as K8s API Server
    participant ExtP as External Provisioner
    participant ExtA as External Attacher
    participant CSID as CSI Driver (Controller/Node)
    participant Kube as Kubelet

    K8s->>ExtP: Watch: New PVC
    ExtP->>CSID: CreateVolume (gRPC)
    Note over CSID: Provision Backend Disk
    ExtP-->>K8s: Create PersistentVolume (PV)
    
    K8s->>ExtA: Watch: Pod scheduled to Node
    ExtA->>CSID: ControllerPublishVolume (gRPC)
    Note over CSID: Attach Disk to VM/Host
    
    K8s->>Kube: Pod assigned to local node
    Kube->>CSID: NodeStageVolume (gRPC)
    Note over CSID: Format & Prep Global Mount
    Kube->>CSID: NodePublishVolume (gRPC)
    Note over CSID: Bind Mount into Pod Directory
```

- **Controller Plugin**: Handles cluster-wide tasks like provisioning and attaching.
- **Node Plugin**: Runs on every node to handle mounting (`NodeStage` / `NodePublish`).

## StatefulSets & Storage

StatefulSets are uniquely designed for applications requiring stable identities and storage.

- **volumeClaimTemplates**: Creates a unique PVC for each Pod ordinal (e.g., `db-0`, `db-1`).
- **Stable Identity**: If `db-0` crashes and is rescheduled, it will re-attach to the same PVC it had before.
- **PVC Retention Policy**: (K8s 1.27+) Control if PVCs are deleted when a StatefulSet is scaled down.

## Troubleshooting Guide (At a Glance)

When storage issues arise, use these specific flows to pinpoint the failure.

### Case 1: PVC is stuck in `Pending`
This usually happens during the **Provisioning** phase.

```mermaid
flowchart TD
    Start[PVC stuck in Pending] --> SC{Default StorageClass?}
    SC -- No --> SetSC[Specify SC or set default]
    SC -- Yes --> Match{Matching PV?}
    Match -- Yes --> Bind[Wait for Binding]
    Match -- No --> Dynamic{SC allow dynamic?}
    Dynamic -- No --> CreatePV[Static Provisioning Required]
    Dynamic -- Yes --> FirstConsumer{"WaitForFirstConsumer?"}
    FirstConsumer -- Yes --> SchedulePod["Schedule Pod to Node first"]
    FirstConsumer -- No --> Events["Check describe PVC Events: Quota, Permissions"]
```

---

### Case 2: Pod is stuck in `ContainerCreating`
This occurs during the **Attachment** or **Mounting** phases.

```mermaid
flowchart TD
    Start[Pod in ContainerCreating] --> Attached{Volume Attached?}
    Attached -- No --> MultiAttach{Multi-Attach Error?}
    MultiAttach -- Yes --> Detach[Force Detach or wait for Old Node]
    MultiAttach -- No --> CSIController[Check CSI Controller Logs]
    Attached -- Yes --> Mounted{Node Mounted?}
    Mounted -- No --> CSINode[Check CSI Node Plugin Logs]
    Mounted -- Yes --> SecretConfig{ConfigMap/Secret present?}
    SecretConfig -- No --> CreateResources[Create missing resources]
    SecretConfig -- Yes --> Permissions[Check SecurityContext & fsGroup]
```

---

### Case 3: PVC is stuck in `Terminating`
This happens when you try to delete a volume that is still in use.

```mermaid
flowchart TD
    Start[PVC stuck in Terminating] --> Clean[Check for Pod consumers]
    Clean --> Finalizer{Finalizer: pvc-protection?}
    Finalizer -- Yes --> RunningPod{"Healthy Pod using it?"}
    RunningPod -- Yes --> DeletePod["Delete Pod first"]
    RunningPod -- No --> Zombie["Check Node for zombie mount"]
    Zombie -- Yes --> Unmount["Force Unmount from Node"]
    Zombie -- No --> Force["Remove Finalizer - AS LAST RESORT"]
```

---

### Summary of Debug Commands
| Failure Layer | Primary Command | Search For |
| :--- | :--- | :--- |
| **PVC** | `kubectl describe pvc <name>` | `Events` section for provisioner errors. |
| **CSI Control** | `kubectl logs csi-provisioner-...` | gRPC `CreateVolume` failures. |
| **Attachment** | `kubectl get volumeattachment` | `isAttached: true` and `attached: false`. |
| **Node/Mount** | `kubectl describe pod <name>` | `FailedMount` or `FailedAttach` events. |
| **Permissions** | `kubectl exec -it <pod> -- ls -l` | Owner UID/GID of the mount point. |

---

## References
- [Kubernetes Storage: A Deep Dive (Medium)](https://medium.com/@h.stoychev87/kubernetes-storage-a-deep-dive-97c6600cb3e3)
- [Official Kubernetes Documentation: Storage](https://kubernetes.io/docs/concepts/storage/)

---

*Last updated: 2026-02-28*
