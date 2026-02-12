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

### Common Issues
1. **ImagePullBackOff**: Check image name, registry access, secrets
2. **CrashLoopBackOff**: Check container logs, resource limits
3. **Pending**: Check node resources, affinity rules, PVC binding

---

*Last updated: 2026-02-09*
