---
title: "DNS (Domain Name System)"
excerpt: "Complete DNS Lookup and Webpage Query process"
macro_category: networking
category: dns
order: 2
permalink: /notes/networking-dns/
---

# DNS (Domain Name System)

The Domain Name System (DNS) translates human-readable domain names (like `example.com`) to machine-readable IP addresses. 

## Complete DNS Lookup and Webpage Query

The full resolution and connection process involves both recursive and iterative queries across multiple tiers of DNS infrastructure.

```mermaid
sequenceDiagram
    participant C as example.com (Laptop)
    participant R as DNS Resolver
    participant Root as Root Server
    participant TLD as TLD Server
    participant Auth as example.com<br/>(Authoritative Server)
    participant W as Server

    C->>R: 1. Recursive Query
    R->>Root: 2. Iterative Query
    Root-->>R: 3. Iterative Response (Refers to TLD)
    R->>TLD: 4. Iterative Query
    TLD-->>R: 5. Iterative Response (Refers to Auth)
    R->>Auth: 6. Iterative Query
    Auth-->>R: 7. Iterative Response (Returns IP)
    R-->>C: 8. Recursive Response
    C->>W: 9. Request to Web Server
    W-->>C: 10. Response from Web Server
```

### DNS Query Types Explained

* **Recursive Query**: The client asks the DNS Resolver for an answer. The resolver takes full responsibility for tracking down the IP address and returning the final result (or an error) to the client. The client waits until the resolver does all the heavy lifting.
* **Iterative Query**: The resolver queries higher-level DNS servers (Root, TLD, Authoritative). These backend servers don't fetch the final answer; instead, they provide the address of the *next* server in the chain that might know. This places the burden back on the resolver to continue the search iteratively until it reaches the Authoritative server that holds the final record.
