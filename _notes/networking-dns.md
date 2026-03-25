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

The full resolution and connection process involves multiple layers of caching and a hierarchical search across global DNS infrastructure.

<img src="https://substackcdn.com/image/fetch/$s_!yb_V!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F16cec58a-02f8-4daf-8669-d1208ac5fc18_2360x2960.jpeg" alt="What Happens When You Enter a URL - ByteByteGo" style="max-width: 100%; height: auto; display: block; margin: 1em 0;">

### The 4 Layers of DNS Caching
Before reaching out to the network, the system checks several cache layers for a quick hit:
1.  **Browser Cache**: The browser maintains its own temporary database of DNS records for recently visited sites.
2.  **OS Cache**: If not in the browser, the OS (via a "stub resolver") checks its own local cache (`hosts` file or internal DNS cache).
3.  **Router Cache**: Many home/office routers maintain their own DNS cache to speed up requests for all devices on the network.
4.  **ISP DNS Cache**: If all else fails locally, the recursive resolver at your ISP (Internet Service Provider) is queried, which often has a large cache of popular domains.

### Recursive vs. Iterative Queries
If the IP is not cached, the **Recursive DNS Resolution** begins:

1.  **Recursive Query**: The client asks the **DNS Resolver** (usually provided by the ISP or a public provider like 8.8.8.8) for the final answer. The resolver takes full responsibility for the search.
2.  **Iterative Queries**: The Resolver performs the "heavy lifting" by querying the hierarchy:
    *   **Root Servers**: Directed to the correct **TLD Server** (e.g., `.com`).
    *   **TLD Name Servers**: Directed to the **Authoritative Name Server** for the specific domain (e.g., `google.com`).
    *   **Authoritative Name Servers**: Provides the final **A Record (IP Address)** back to the resolver.

### Connection & Rendering
Once the IP is returned to the browser:
*   **TCP 3-Way Handshake**: SYN → SYN/ACK → ACK.
*   **TLS Handshake**: Secure encryption is established.
*   **HTTP Request**: The browser sends the GET request; the server responds with resources (HTML, CSS, JS).
*   **Rendering**: The browser parses the DOM/CSSOM, constructs the Render Tree, and paints the page.
