---
title: "Networking Fundamentals"
excerpt: "Core networking concepts: TCP/UDP, DNS records, IPv6, and troubleshooting tools."
macro_category: networking
category: fundamentals
order: 1
permalink: /notes/networking-fundamentals/
---

# Networking Fundamentals

Understanding how data moves across the network is essential for debugging connectivity and performance issues in distributed systems.

## TCP vs. UDP

| Feature | TCP (Transmission Control Protocol) | UDP (User Datagram Protocol) |
| :--- | :--- | :--- |
| **Connection** | Connection-oriented (Handshake) | Connectionless (Fire & Forget) |
| **Reliability** | Guarantees delivery (Retransmission) | No guarantee (Best effort) |
| **Ordering** | Guarantees packet order | No guarantee |
| **Speed** | Slower (Overhead of ACKs) | Faster (Minimal overhead) |
| **Examples** | HTTP, SSH, SMTP, PostgreSQL | DNS (often), VoIP, Streaming |

### The TCP 3-Way Handshake
Before any data is sent, a TCP connection must be established:
1.  **SYN**: Client sends a Synchronize packet with a random Sequence Number ($X$).
2.  **SYN-ACK**: Server acknowledges with its own Sequence Number ($Y$) and sets ACK to $X+1$.
3.  **ACK**: Client acknowledges by setting ACK to $Y+1$.

---

## DNS Record Types
The Domain Name System (DNS) translates hostnames to IP addresses using various record types:

*   **A**: Maps a hostname to an **IPv4** address.
*   **AAAA**: Maps a hostname to an **IPv6** address (16 bytes).
*   **CNAME**: An alias from one domain name to another (Canonical Name).
*   **MX**: Mail Exchange record (where to send emails).
*   **PTR**: Pointer record for **Reverse DNS** lookups (IP to hostname).
*   **TXT**: Arbitrary text data (used for SPF, DKIM, DMARC validation).

---

## Common Port Numbers
Ports allow multiple services to share a single IP address. There are **65,535** TCP/UDP ports. Ports **< 1024** are privileged.

| Protocol | Port | Description |
| :--- | :--- | :--- |
| **DNS** | 53 | Name resolution |
| **SSH** | 22 | Secure shell access |
| **HTTP** | 80 | Unencrypted web traffic |
| **HTTPS** | 443 | Encrypted web traffic |

---

## Troubleshooting Tools & Logic

### The "Golden Path"
When an app can't connect, follow this flow:
1.  **`ping [IP]`**: Is the host alive? (ICMP)
2.  **`dig [hostname]`**: Is DNS resolving correctly?
3.  **`curl -v [URL]`**: Is the application level responding?

### Traceroute
Uses the **TTL (Time To Live)** field in IP packets. Each router decreases TTL by 1. When it hits 0, the router sends an ICMP "Time Exceeded" message back, allowing `traceroute` to map the path.

### Checking Open Ports
*   **`ss -tlpn`**: (Socket Statistics) Modern replacement for `netstat`.
*   **`lsof -i :port`**: Shows the process using a specific port.

---

## HTTP Response Codes
*   **2xx**: Success (e.g., 200 OK)
*   **3xx**: Redirection
*   **4xx**: Client Error (e.g., 404 Not Found, 403 Forbidden)
*   **5xx**: Server Error (e.g., 500 Internal Error, 502 Bad Gateway)

---

*Last updated: 2026-03-26*
