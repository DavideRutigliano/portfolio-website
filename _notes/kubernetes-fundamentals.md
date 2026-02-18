---
title: "Kubernetes Fundamentals"
excerpt: "Core concepts and patterns for working with Kubernetes"
category: cloud-native
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

### Common Commands

```bash
# Get pod details with wide output
kubectl get pods -o wide

# Watch pods in real-time
kubectl get pods -w

# Get pod logs (follow)
kubectl logs -f <pod-name>

# Execute into a pod
kubectl exec -it <pod-name> -- /bin/bash

# Port forward
kubectl port-forward <pod-name> 8080:80
```

## Resource Management

### Resource Requests vs Limits
- **Requests**: Guaranteed resources for scheduling
- **Limits**: Maximum resources a container can use

```yaml
resources:
  requests:
    memory: "64Mi"
    cpu: "250m"
  limits:
    memory: "128Mi"
    cpu: "500m"
```

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

### Common Issues
1. **ImagePullBackOff**: Check image name, registry access, secrets
2. **CrashLoopBackOff**: Check container logs, resource limits
3. **Pending**: Check node resources, affinity rules, PVC binding

---

*Last updated: 2026-02-09*
