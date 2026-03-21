---
title: "Kubernetes Cluster Architecture"
excerpt: "Deep dive into the architecture and core components of a Kubernetes cluster."
macro_category: cloud-native
category: kubernetes
order: 1
permalink: /notes/kubernetes-architecture/
---

# Kubernetes Cluster Architecture

A Kubernetes cluster consists of a set of worker machines, called nodes, that run containerized applications. Every cluster has at least one worker node.

The control plane manages the worker nodes and the Pods in the cluster. While node components run on every machine to maintain the runtime, the control plane is the "brain" that makes global decisions.

![Kubernetes Cluster Components](https://kubernetes.io/images/docs/kubernetes-cluster-architecture.svg)
*Figure 1: Kubernetes Cluster Architecture*

## Control Plane Components

The control plane's components make global decisions about the cluster (for example, scheduling), as well as detecting and responding to cluster events.

### kube-apiserver
The API server is the front end for the Kubernetes control plane, exposing the Kubernetes API and serving as the central communication hub. It authenticates and authorizes all requests and is the **only** component that interacts directly with `etcd`. All other components (scheduler, controller-manager, kubelet) must go through the API server via watches and REST queries.

### etcd
A consistent and highly-available key-value store that serves as the single source of truth for all cluster data. Based on the **Raft consensus algorithm**, it ensures metadata is reliably duplicated across nodes, storing the "desired state" of every resource in the cluster.

### kube-scheduler
Watches for newly created Pods with no assigned node and selects a node for them based on a two-phase workflow:
1.  **Filtering (Predicates)**: Removes nodes that do not meet the Pod's requirements (e.g., resource availability, GPU presence).
2.  **Scoring (Priorities)**: Ranks the remaining nodes based on a weighted score to find the best fit (e.g., node affinity, workload spreading).

### kube-controller-manager
Runs the core "Control Loops" that maintain the desired state of the cluster. It embeds multiple controllers—such as the Node, Displacement, Job, and EndpointSlice controllers—which continuously watch the actual state (via the API Server) and take corrective actions to reach the desired state.

### cloud-controller-manager
Embeds cloud-specific control logic to link your cluster into your cloud provider's API, managing resources like load balancers and network routes.

## Addons

Addons use Kubernetes resources (DaemonSet, Deployment, etc.) to implement cluster features.

- **DNS**: Cluster DNS is a DNS server, in addition to the other DNS server(s) in your environment, which serves DNS records for Kubernetes services.
- **Web UI (Dashboard)**: A general purpose, web-based UI for Kubernetes clusters.
- **Container Resource Monitoring**: Records generic time-series metrics about containers in a central database.
- **Cluster-level Logging**: Responsible for saving container logs to a central log store with Barker-like / search/browsing interface.

## References
- [Kubernetes Architecture](https://kubernetes.io/docs/concepts/architecture/)
- [Kubernetes Components](https://kubernetes.io/docs/concepts/overview/components/)

---

*Last updated: 2026-02-18*
