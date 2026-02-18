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

## The Life of a Packet (Pod-to-Service)

Understanding how a packet travels from one Pod to another through a Service is key to mastering Kubernetes networking. Here is the step-by-step journey:

1.  **Request Initiation**: Pod A (on Node 1) sends a request to a Service IP (ClusterIP).
2.  **Kernel Interception**: The packet leaves the Pod via the `veth` pair and hits the Node 1 Kernel. `kube-proxy` (via `iptables` or `IPVS` rules) intercepts the packet in the `nat/OUTPUT` chain.
3.  **Destination NAT (DNAT)**: The Kernel performs DNAT, rewriting the destination IP from the Service's Virtual IP (VIP) to the real IP of a healthy backend Pod (e.g., Pod B on Node 2).
4.  **Routing Decision**: The Kernel makes a routing decision. It determines that Pod B's IP is reachable via the CNI's interface (e.g., an overlay network like `vxlan` or direct routing).
5.  **CNI Transmit**: The CNI plugin encapsulates (if overlay) or routes the packet across the physical network to Node 2.
6.  **Node 2 Arrival**: The packet arrives at Node 2, is decapsulated by its CNI, and the Kernel identifies it's destined for a local Pod.
7.  **Success**: The packet is forwarded into Pod B's network namespace via its `veth` pair. Pod B receives the request!

## How Services match Pods

Services use a discovery mechanism to track which Pods should receive traffic. This process is driven by **Label Selectors**:

- **Label Selectors**: Defined in the Service's specification, these core identifiers tell the cluster exactly which Pods to target. A Service (the **stable front door**) selects any Pod whose labels match its selector to be its backend.
- **EndpointSlices**: These are the **dynamic list of targets** (IPs and ports). The system automatically populates `EndpointSlice` resources with matching Pods. By splitting the list into smaller "slices," Kubernetes can scale efficiently to thousands of Pods, avoiding the bottlenecks of the legacy `Endpoints` resource.

## Kubernetes Service Types

Kubernetes Services are built like building blocks, where each type typically adds a layer on top of the previous one:

1.  **ClusterIP (Default)**: Exposes the Service on a cluster-internal IP. This is the foundation for almost all other Service types.
2.  **NodePort**: Exposes the Service on each Node's IP at a static port (between 30000-32767). **Critically**: A `NodePort` Service automatically creates its own `ClusterIP` to route traffic to backend Pods.
3.  **LoadBalancer**: Exposes the Service externally using a cloud provider's load balancer. This builds upon both `NodePort` and `ClusterIP`, configuring the cloud to route external traffic to NodePorts.
4.  **ExternalName**: Maps the Service to a DNS name (produces a `CNAME` record). It bypasses selectors and proxying entirely, allowing you to treat external services as internal ones.

### Headless Services

When you don't need a single Virtual IP (VIP) to load balance traffic, you can create a **Headless Service** by setting `.spec.clusterIP: None`. 
- Instead of the DNS returning a single ClusterIP, a query for a headless service returns the direct `A` records (individual IPs) of all matching Pods.
- This is essential for **StatefulSets**, where you need to reach specific Pod instances, or when implementing custom service discovery.

## DNS in Kubernetes (CoreDNS)

DNS serves as the cluster's phonebook, translating service names into IP addresses. In modern clusters, this is handled by **CoreDNS**.

- **Architecture**: CoreDNS runs as a Deployment (usually in the `kube-system` namespace) and is exposed via a Service named `kube-dns`.
- **Discovery**: CoreDNS watches the Kubernetes API for new Services and EndpointSlices, dynamically generating DNS records.
- **Client Config**: The Kubelet configures every Pod's `/etc/resolv.conf` to point at the `kube-dns` Service IP.

### The Resolution Process

When a Pod queries a name like `my-svc`, the OS resolver iterates through the **search domains** defined in `/etc/resolv.conf` (e.g., `default.svc.cluster.local`, `svc.cluster.local`) until it finds a match.

- **Record Types**:
    - **A Records**: Resolve to a Service's `ClusterIP` (Standard) or multiple Pod IPs (Headless).
    - **SRV Records**: Created for named ports (e.g., `_http._tcp.my-svc.ns.svc.cluster.local`), allowing for dynamic port discovery.
    - **CNAME Records**: Used for `ExternalName` services to point to external hostnames.

## Performance & Scalability

As clusters grow, DNS can become a bottleneck or a source of latency.

- **The "ndots:5" Trap**: By default, if a name has fewer than 5 dots, Kubernetes tries internal search domains first. For external names like `api.github.com`, this causes several failing internal queries (NXDOMAIN) before hititng the external resolver.
    - **Pro Tip**: Use a trailing dot (`google.com.`) for external names to bypass the search path.
- **NodeLocal DNSCache**: Runs a DNS caching agent on every node as a DaemonSet. It drastically reduces latency and prevents **conntrack exhaustion** (UDP session tracking limits) in the Linux kernel during high DNS volume.

## Debugging Kubernetes Networking

When network issues arise, follow a **Bottom-Up** troubleshooting flow, starting from the source Pod and moving up the abstraction layers.

### The Tool: Ephemeral Containers
Avoid installing debug tools in production images. Instead, use ephemeral containers to attach a "debug sidecar" (like `netshoot`) to a running Pod:
```bash
kubectl debug -it <pod-name> --image=nicolaka/netshoot
```

### 1. Pod Connectivity (The Foundation)
Verify the Pod can talk to the host and itself.
- **Check IPs**: `ip addr show` (does `eth0` match `kubectl get pod -o wide`?)
- **Check Routes**: `ip route show` (is there a default gateway?)
- **Issue**: If `eth0` or routes are missing, the CNI plugin failed. Check CNI node logs (e.g., `calico-node`, `cilium-agent`).

### 2. DNS (The Phonebook)
If the Pod has an IP, check if it can resolve names.
- **Test Resolution**: `nslookup my-service`
    - **NXDOMAIN**: Name doesn't exist (check namespace/spelling).
    - **Timeout**: CoreDNS is unreachable (check CoreDNS pods and NetworkPolicies).
- **Check Config**: `cat /etc/resolv.conf` (verify the `nameserver` is the `kube-dns` Service IP).

### 3. Services (The Virtual IP)
If DNS works, verify the Service and its endpoints.
- **Test Connectivity**: `nc -zv <service-ip> <port>`
- **Check Endpoints**: `kubectl get endpointslices -l kubernetes.io/service-name=<service-name>`
- **Common Issue: Hairpin Traffic**: A Pod failing to reach itself via its own Service IP. Ensure the Kubelet is running with `--hairpin-mode=hairpin-veth`.

### 4. Packet Level (The Truth)
When logs aren't enough, use `tcpdump` to see what's on the wire.
- **Capture**: `tcpdump -i eth0 -w /tmp/capture.pcap`
- **Analyze**: Copy the file to your machine and open in Wireshark:
```bash
kubectl cp <pod-name>:/tmp/capture.pcap ./capture.pcap -c <debug-container-name>
```
Look for **TCP Retransmissions** (network drops), **RST** (closed ports), or sent **SYNs** with no **SYN-ACK** (firewall/NetworkPolicy drops).

## References
- [Kubernetes Networking Series Part 1: The Model](https://www.srodi.com/posts/kubernetes-networking-series-part-1/#the-3-fundamental-rules-the-golden-rules)
- [Kubernetes Networking Series Part 2: CNI & Pod Networking](https://www.srodi.com/posts/kubernetes-networking-series-part-2/#3-what-happens-when-a-pod-is-created-cni-lifecycle)
- [Kubernetes Networking Series Part 3: Services](https://www.srodi.com/posts/kubernetes-networking-series-part-3/)
- [Kubernetes Networking Series Part 4: DNS](https://www.srodi.com/posts/kubernetes-networking-series-part-4/)
- [Kubernetes Networking Series Part 5: Debugging](https://www.srodi.com/posts/kubernetes-networking-series-part-5/)
- [The Kubernetes Network Model - Official Docs](https://kubernetes.io/docs/concepts/cluster-administration/networking/#the-kubernetes-network-model)

---

*Last updated: 2026-02-18*
