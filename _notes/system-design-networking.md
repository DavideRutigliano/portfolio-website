---
title: "System Design: Networking & Traffic Management"
macro_category: "system-design"
category: "networking"
order: 2
---

## Load Balancing Architecture: L4 vs L7

Load balancing is the process of distributing network traffic across multiple servers. To design a scalable system, we must choose the right layer for traffic management.

### Layer 4 Load Balancing (Transport Layer)
Layer 4 load balancing operates at the **Transport Layer (TCP/UDP)**. It makes routing decisions based on IP addresses and port numbers without inspecting the actual application data.

<img src="https://substackcdn.com/image/fetch/$s_!nKnG!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ff0441b18-a2eb-4c04-8479-8dc254dc1468_1952x1296.heic" alt="L4 Load Balancing Diagram" style="max-width: 100%; height: auto; display: block; margin: 1em 0;">

*   **Mechanism**: Uses Network Address Translation (NAT) or Direct Server Return (DSR).
*   **Pros**: Extremely fast, low CPU overhead, handles high-throughput traffic easily.
*   **Cons**: No visibility into HTTP headers, cookies, or URLs; cannot perform content-based routing.

### Layer 7 Load Balancing (Application Layer)
Layer 7 load balancing operates at the **Application Layer (HTTP/HTTPS/gRPC)**. It terminates the client's network connection and inspects the payload to make intelligent routing decisions.

<img src="https://substackcdn.com/image/fetch/$s_!Wz-4!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F458a55c2-88c6-4990-8cca-ab6d9df49e19_1600x1034.png" alt="L7 Load Balancing Diagram" style="max-width: 100%; height: auto; display: block; margin: 1em 0;">

*   **Mechanism**: Acts as a **full proxy**. Terminates SSL/TLS, inspects URLs, headers, and cookies.
*   **Pros**: Intelligent routing (path-based, cookie-based), SSL Offloading, Caching, WAF integration.
*   **Cons**: More CPU intensive, higher latency due to connection termination and packet inspection.

### Technical Comparison: L4 vs L7

| Feature | L4 (Transport) | L7 (Application) |
| :--- | :--- | :--- |
| **Criteria** | IP, TCP/UDP Port | URL, Cookies, Headers |
| **Logic** | Simple, Fast | Complex, Intelligent |
| **Performance**| Low Latency | Higher Latency |
| **Security** | Minimal | SSL Termination, WAF |
| **Examples** | AWS NLB, F5 | AWS ALB, NGINX, Envoy |

---

## Communication Protocols: gRPC vs WebSockets

### gRPC (Google Remote Procedure Call)
Modern, high-performance RPC framework that uses **HTTP/2** as the transport.

*   **Mechanism**: Uses **Protocol Buffers** (binary format) for serialization.
*   **Streaming**: Supports client-side, server-side, and bidirectional streaming.
*   **Pros**: Low latency, lightweight payloads, strongly typed (IDL), multiplexing.
*   **Cons**: Requires HTTP/2 support, less "browser-friendly" without a proxy (grpc-web).

### WebSockets
Bidirectional, persistent connection between client and server over a single TCP socket.

*   **Mechanism**: Starts as an HTTP request with an `Upgrade` header. Once established, it's a raw TCP stream.
*   **Pros**: Real-time communication, low overhead once connected.
*   **Cons**: Persistent connections consume server resources, requires keeping state (Sticky sessions).

| Feature | gRPC | WebSockets |
| :--- | :--- | :--- |
| **Transport** | HTTP/2 | TCP (via HTTP Upgrade) |
| **Payload** | Binary (Protobuf) | Text / Binary (Raw) |
| **Lifecycle** | Request/Response or Streaming | Persistent Connection |
| **Best used for** | Microservices, High-perf APIs | Chat, Real-time dashboards |

---

## Polling Mechanisms: Real-time Data Retrieval

How does a client stay updated with server-side changes?

1.  **Short Polling**: Client sends requests at regular intervals (e.g., every 5s).
    *   *Cons*: High overhead, wasted resources if no data changed.
2.  **Long Polling**: Client sends a request, server holds it open until data is available or a timeout occurs.
    *   *Pros*: Better than short polling, more "real-time".
    *   *Cons*: Still uses one connection per client.
3.  **Server-Sent Events (SSE)**: One-way persistent stream from server to client over HTTP.
    *   *Pros*: Unidirectional, handles reconnection automatically.
4.  **WebSockets**: The "gold standard" for bidirectional real-time communication.

---

## Reverse Proxies & API Gateways

### Reverse Proxy vs Forward Proxy
*   **Forward Proxy**: Acts on behalf of the **client** to hide its identity (e.g., corporate proxy).
*   **Reverse Proxy**: Acts on behalf of the **server** to provide security, load balancing, and performance (e.g., NGINX).

### API Gateway Patterns
An API Gateway is a specialized reverse proxy that handles cross-cutting concerns:
1.  **Authentication/Authorization**: Validating JWTs at the edge.
2.  **Rate Limiting**: Protecting downstream services.
3.  **Request Transformation**: Converting XML to JSON or gRPC to HTTP.
4.  **Observation**: Centralized logging and tracing.

---

## Service Discovery

How do services find each other in a dynamic environment?

### Client-Side Discovery
1.  Client queries a **Service Registry** (e.g., Netflix Eureka).
2.  Registry returns a list of healthy instances.
3.  Client chooses an instance using its own load balancing algorithm.

### Server-Side Discovery
1.  Client makes a request to a **Load Balancer** (e.g., AWS ALB).
2.  Load Balancer queries the Service Registry (or has a pre-defined target group).
3.  Load Balancer routes-forward to a healthy instance.

---

## The Sidecar Pattern (Service Mesh)

In modern microservices (Kubernetes), networking logic is often offloaded to a **Sidecar Proxy** (e.g., Envoy).

```mermaid
graph LR
    subgraph "Pod A"
        AppA[App Container] <--> SidecarA[Envoy Sidecar]
    end
    subgraph "Pod B"
        AppB[App Container] <--> SidecarB[Envoy Sidecar]
    end
    SidecarA -- "mTLS / Tracing / Retries" --> SidecarB
```

> [!IMPORTANT]
> **Interview Question**: *Why use a Service Mesh like Istio over a central API Gateway?*
> - Service Mesh handles **East-West** traffic (service-to-service).
> - API Gateway handles **North-South** traffic (external-to-service).
> - Service Mesh provides better granularity for circuit breaking and individual service observability.
