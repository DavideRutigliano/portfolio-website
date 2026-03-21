---
title: "Kubernetes Fundamentals"
excerpt: "Core concepts and patterns for working with Kubernetes"
macro_category: cloud-native
category: kubernetes
order: 3
permalink: /notes/kubernetes-fundamentals/
---

# Kubernetes Fundamentals

Quick reference for core Kubernetes concepts and common operations.

## Core Concepts

### Pod Lifecycle
- **Pending**: Pod accepted but containers not created
- **Running**: At least one container running
- **Succeeded**: All containers terminated successfully
- **Failed**: All containers terminated, at least one with failure
- **Unknown**: State cannot be determined



## Resource Management

In Kubernetes, you specify resource requirements for a container using `requests` and `limits`. Under the hood, the `kubelet` translates these into Linux cgroups settings to enforce constraints at the kernel level.

### Resource Requests vs Limits

- **Requests**: The amount of CPU/Memory guaranteed for the container. The Kubernetes Scheduler uses these values to decide which node to place the Pod on.
  - **Memory Requests**: Used logically by the scheduler to ensure the node has enough capacity.
  - **CPU Requests**: Mapped to `cpu.shares`. This assigns a relative weight to the container's cgroup, guaranteeing it gets a proportional share of CPU time during contention.
- **Limits**: The maximum amount of CPU/Memory the container is allowed to use.
  - **Memory Limits**: Mapped to `memory.limit_in_bytes` (in cgroups v1) or `memory.max` (in cgroups v2). If a container exceeds this, it is OOM-Killed.
  - **CPU Limits**: Mapped to `cpu.cfs_quota_us` and `cpu.cfs_period_us`. This sets a hard cap on CPU time. If exceeded, the container is throttled by the kernel.

```yaml
resources:
  requests:
    memory: "64Mi"
    cpu: "250m"
  limits:
    memory: "128Mi"
    cpu: "500m"
```

### Quality of Service (QoS) Classes

Based on how you configure requests and limits, Kubernetes assigns one of three QoS classes to your Pods. This QoS class determines how the Pod is treated under resource pressure, primarily by configuring the Linux `oom_score_adj` (Out-Of-Memory score adjust) for the containers. The higher the score, the more likely the kernel will kill the container to free up memory.

1. **Guaranteed**
   - **Criteria**: Every container in the Pod must have both memory and CPU `requests` equal to their `limits`.
   - **Behavior**: Top priority. These pods are guaranteed their resources and will only be killed if they exceed their limits.
   - **Linux Mapping**: `oom_score_adj` is set to `-997`.

2. **Burstable**
   - **Criteria**: At least one container in the Pod has a memory or CPU `request` that is less than its `limit`, or only `requests` are specified.
   - **Behavior**: Medium priority. These pods have some guaranteed resources but can burst to use more if available. They will be killed if the node runs out of memory and no BestEffort pods remain.
   - **Linux Mapping**: `oom_score_adj` is calculated dynamically based on the requested memory percentage, usually ranging from `2` to `999`.

3. **BestEffort**
   - **Criteria**: The Pod has no memory or CPU `requests` or `limits` configured.
   - **Behavior**: Lowest priority. These pods can use as much free node resources as they want, but are the first to be terminated if the node experiences memory pressure.
   - **Linux Mapping**: `oom_score_adj` is set to `1000` (the highest likelihood of being OOM-Killed).

## Debugging

## Execution Flow: `kubectl apply`

What happens when you execute `kubectl apply -f deploy.yaml`? (Reference: [what-happens-when-k8s](https://github.com/jamiehannaford/what-happens-when-k8s))

### 1. Client Side (kubectl)
- **Validation**: Client-side linting and validation of the manifest.
- **Generators**: Assembling the HTTP request (converting YAML to JSON).
- **API Discovery**: Version negotiation to find the correct API group and version.
- **Authentication**: Loading credentials from `kubeconfig`.

### 2. Kube-apiServer
- **Authentication**: Verifies "Who are you?" (Certs, Tokens, etc.).
- **Authorization**: Verifies "Are you allowed to do this?" (RBAC).
- **Admission Control**: Mutating/Validating admission controllers (e.g., setting defaults, checking quotas).
- **Persistence**: The validated resource is stored in **etcd**.

### 3. Control Plane (Controllers & Scheduler)
- **Deployment Controller**: Notices the new Deployment and creates a **ReplicaSet**.
- **ReplicaSet Controller**: Notices the new ReplicaSet and creates **Pods**.
- **Scheduler**: Watches for unscheduled Pods and assigns them to a healthy **Node** based on predicates and priorities.

### 4. Node Side (kubelet)
- **Pod Sync**: The `kubelet` on the assigned Node notices the Pod.
- **CRI**: Container Runtime Interface pulls images and starts containers.
- **CNI**: Container Network Interface sets up Pod networking and IP allocation.
- **CSI**: Container Storage Interface mounts requested volumes.

### Advanced & Debugging Commands

When basic `get` and `logs` aren't enough, use these more powerful commands:

```bash
# Get logs from all pods with a specific label
kubectl logs -l app=my-service

# Create an ephemeral debug container in a running pod with shared process namespace
# Useful for inspecting a container without a shell (e.g. distroless) or checking memory/threads
kubectl debug -it <pod-name> --image=busybox --target=<container-name> --share-processes

# Force delete a pod (skips graceful shutdown)
kubectl delete pod <pod-name> --grace-period=0 --force

# List all pods and their specific nodes using custom columns
kubectl get pods -o custom-columns=NAME:.metadata.name,NODE:.spec.nodeName,STATUS:.status.phase

# Extract pod and container images using JSONPath
# This is great for scripting or finding version mismatches
kubectl get pods -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.spec.containers[*].image}{"\n"}{end}'

# Sort pods by restart count
kubectl get pods --sort-by='.status.containerStatuses[0].restartCount'

# Port-forward to a service instead of a pod
kubectl port-forward svc/my-service 8080:80

# Check RBAC permissions (Can I create deployments in this namespace?)
kubectl auth can-i create deployments
```

### Common Issues
1. **ImagePullBackOff**: Check image name, registry access, secrets
2. **CrashLoopBackOff**: Check container logs, resource limits
3. **Pending**: Check node resources, affinity rules, PVC binding

---

*Last updated: 2026-02-09*
