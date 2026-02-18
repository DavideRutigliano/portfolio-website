---
title: "Kubernetes Networking & CNI"
excerpt: "Deep dive into the Kubernetes network model, CNI lifecycle, and the 'Golden Rules' of cluster networking."
category: cloud-native
permalink: /notes/kubernetes-networking/
---

# Kubernetes Networking & CNI

Kubernetes networking is based on a set of fundamental principles that ensure every container can communicate with every other container in a flat, NAT-less network space.

## The 4 Networking Problems
Kubernetes addresses four distinct networking challenges:
1. **Container-to-Container**: Solved by Pods and `localhost` communications.
2. **Pod-to-Pod**: The primary focus of the CNI, enabling direct communication between Pods.
3. **Pod-to-Service**: Handled by Services (kube-proxy, iptables/IPVS).
4. **External-to-Service**: Managed by Services (LoadBalancer, NodePort, Ingress).

## The 3 "Golden Rules"
To be Kubernetes-compliant, any networking implementation (CNI plugin) must satisfy these three requirements:
1. **Pod-to-Pod**: All Pods can communicate with all other Pods without NAT.
2. **Node-to-Pod**: All Nodes can communicate with all Pods (and vice-versa) without NAT.
3. **Self-IP**: The IP that a Pod sees itself as is the same IP that others see it as.

## The CNI (Container Network Interface)
Kubernetes doesn't implement networking itself; it offloads this to **CNI plugins** (like Calico, Flannel, Cilium).

### CNI Lifecycle & The Flow of a Pod
When a Pod is scheduled, several components coordinate to ensure it gets networking. Here is the step-by-step flow:

![CNI Lifecycle](file:///Users/davide/git/personal/portfolio-website/images/notes/cni-lifecycle.png)

1. **Scheduling**: The **Scheduler** assigns a Pod to a Node. This is updated in the API Server.
2. **Kubelet Action**: The **Kubelet** on the assigned Node watches the API Server. When it sees a new Pod assigned to it, it starts the creation process.
3. **CRI Invocation**: Kubelet calls the **Container Runtime Interface (CRI)** to create the Pod sandbox.
4. **Network Namespace Creation**: The Container Runtime creates a linux **Network Namespace** for the Pod. This isolates the Pod's network stack from the host and other Pods.
5. **CNI Trigger**: The CRI identifies the configured CNI plugin and invokes it with the `ADD` command.
6. **CNI Plugin Execution**: The CNI Plugin performs the "Golden Rule" setup:
   - **veth pair**: It creates a virtual ethernet pair.
   - **Plumbing**: One end is kept in the host namespace, and the other is moved into the Pod's namespace and renamed to `eth0`.
   - **IPAM**: It calls an IPAM (IP Address Management) plugin to assign a unique IP from the Node's allocated CIDR range.
   - **Routing**: It configures the default gateway and routes inside the Pod so it can talk to the rest of the cluster.
7. **Success**: The CNI returns success to the CRI, which then returns to the Kubelet.
8. **App Start**: Finally, the Kubelet starts the actual application containers inside the now-networked sandbox.

Traffic leaves the Pod via `eth0`, enters the host via the other end of the veth pair, and is then handled by the CNI's data plane (Bridge, Routing, or eBPF).

## References
- [Kubernetes Networking Series Part 1: The Model](https://www.srodi.com/posts/kubernetes-networking-series-part-1/#the-3-fundamental-rules-the-golden-rules)
- [Kubernetes Networking Series Part 2: CNI & Pod Networking](https://www.srodi.com/posts/kubernetes-networking-series-part-2/#3-what-happens-when-a-pod-is-created-cni-lifecycle)
- [Kubernetes Networking Series Part 3: Services](https://www.srodi.com/posts/kubernetes-networking-series-part-3/)
- [Kubernetes Networking Series Part 4: DNS](https://www.srodi.com/posts/kubernetes-networking-series-part-4/)
- [Kubernetes Networking Series Part 5: Debugging](https://www.srodi.com/posts/kubernetes-networking-series-part-5/)
- [The Kubernetes Network Model - Official Docs](https://kubernetes.io/docs/concepts/cluster-administration/networking/#the-kubernetes-network-model)

---

*Last updated: 2026-02-18*
