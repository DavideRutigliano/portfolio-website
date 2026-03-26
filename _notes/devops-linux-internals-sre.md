---
title: "Linux Internals: SRE Cheatsheet"
excerpt: "A practical guide to Linux internals for application performance, troubleshooting, and SRE interviews."
macro_category: devops
category: linux-fundamentals
order: 8
permalink: /notes/devops-linux-internals-sre/
---

# Linux Internals: The SRE Safety Net

When engineers ask about "Linux Internals," they are often testing whether you understand how the OS affects your application performance. You don't need to memorize the kernel source code; you just need to know where the "knobs" are and how to interpret common metrics.

## 1-Minute Troubleshooting Guide

![One Minute Troubleshooting](https://docs.sadservers.com/images/one-minute.png)

### The "Safety Net" Logic
If a process is slow or crashing, the problem is almost always one of these four: **CPU**, **Memory**, **Disk (I/O)**, or **Network**.

---

## 1. Memory Pressure
If a process is slow, the first question is: **Is it swapping?**

*   **Check Tools**: `free -m`, `vmstat 2 5`
*   **The Swap Trap**: Look at the `si` (swap in) and `so` (swap out) columns in `vmstat`. If these are high, the system is moving memory to disk. Since disks are orders of magnitude slower than RAM, this will kill your performance.
*   **OOM Killer**: If a process vanishes, check the logs for "Out of Memory" events:
    ```bash
    sudo dmesg | grep -i "out of memory"
    sudo journalctl | grep -i "oom-killer"
    ```

## 2. CPU / Load Average
If `uptime` shows a load average of 20 on a 4-core machine, it’s saturated.

*   **CPU-bound**: Check `top` or `htop`. Look for processes using >90% CPU.
*   **I/O-bound**: Check the `%wa` (iowait) column in `top`. If it's high, the CPU is idling because it's waiting for the disk or network to respond.
*   **Tools**: `uptime`, `top`, `htop`, `lscpu`.

## 3. The /proc Filesystem
The `/proc` directory is a virtual filesystem where the "truth" lives. It exposes kernel data structures in a readable format.

*   **Memory info**: `cat /proc/meminfo`
*   **CPU info**: `cat /proc/cpuinfo`
*   **Process info**: `cat /proc/[PID]/status` or `cat /proc/[PID]/limits` (very useful to check open file limits).

## 4. Networking: The "Golden Path"
When troubleshooting connectivity, follow the path of least complexity:

1.  **Is it alive?**: `ping [IP]` (ICMP)
2.  **Is DNS working?**: `dig [hostname]` or `nslookup`
3.  **Is the app responding?**: `curl -v http://[host]:[port]`
4.  **Deep Dive**: If it's slow, mention **TCP Handshake latency** or **TLS termination overhead**.
5.  **Tools**: `ss -tlpn` (to see what is listening), `netstat -rn` (routing table).

---

## Practical Server Review (SadServers Workflow)
When you first log into a mysterious server, follow this characterization flow:

1.  **What is it doing?**: `sudo ss -tlpn` (exposed ports) and `ps auxf` (process tree).
2.  **Is it healthy?**: `uptime` (load), `free -m` (ram), `df -h` (disk space).
3.  **What's breaking?**: `journalctl -p err` (system errors) or `tail -f /var/log/syslog`.

---

*Sources: [SadServers - Practical Linux Server Review](https://docs.sadservers.com/docs/scenario-guides/practical-linux-server-review/), [SRE Troubleshooting Snippets]*

*Last updated: 2026-03-26*
