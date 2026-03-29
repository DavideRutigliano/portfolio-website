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

## Linux Server Review (The 'SadServers' Way)

![One Minute Troubleshooting](https://docs.sadservers.com/images/one-minute.png)

### The "Safety Net" Logic
If a process is slow or crashing, the problem is almost always one of these four: **CPU**, **Memory**, **Disk (I/O)**, or **Network**.

---

## 1. Quick Triage (Load & Basics)
*   `uptime`: Check load averages (1, 5, 15 min). Load > # of cores = saturation.
*   `top` / `htop`: Real-time view of processes and resource consumers.
*   `ps auxf`: Process tree; `f` shows parent/child relationships (useful for identifying worker leaks).
*   `uname -a` & `cat /etc/debian_version`: Quick check of kernel and distro version.

---

## 2. CPU & Performance
*   `mpstat -P ALL 1`: Check CPU balance. Are all cores busy, or just one (single-threaded bottleneck)?
*   `pidstat 1`: Per-process CPU usage. Identify which PID is specifically spiking.
*   `lscpu`: Verify CPU architecture and core count.

---

## 3. Memory & Virtual Memory
*   `free -m`: Quick overview of used/cached/free memory.
*   `vmstat 1`: Check `r` (runnable) and `b` (uninterruptible sleep/disk wait). High `si`/`so` means swapping!
*   `grep -i oom /var/log/syslog`: Check if the OOMKiller has been active recently.

#### Virtual vs. Physical Memory (VIRT vs. RSS)
*   **VIRT (Virtual Memory)**: The absolute total memory a process can "see". It includes shared libraries, swapped out pages, and memory requested via `malloc()` but not yet used.
*   **RSS (Resident Set Size)**: The actual amount of physical RAM the process is using right now.
*   **Lazy Allocation (Demand Paging)**:
    1.  When a process calls `malloc()`, the kernel gives it **Virtual Memory** (VIRT increases). It's just a "promise" of space.
    2.  The kernel only allocates **Physical Memory** (RSS increases) when the process actually **touches** the address (reads or writes).
    3.  This first touch triggers a **Page Fault**, and the kernel then maps a real physical page to that virtual address.

---

## 4. Disk & I/O
*   `df -h`: Check for full filesystems. 100% disk = certain failure for most apps.
*   `df -i`: Check for **Inode exhaustion**. You can have GBs free but 0 inodes.
*   `iostat -xz 1`: Check `%util`. If a disk is at 100% util, it's the bottleneck.
*   `lsblk -f`: List block devices and their filesystems.
*   `du -mxS / | sort -n | tail -10`: Find the top 10 largest files in a directory.

---

## 5. Networking & Connectivity
*   `ss -tlpn`: (Socket Stat) What processes are listening on which ports?
*   `ss -s`: Summary of socket statistics (TCP/UDP/ESTAB).
*   `ip -s link`: Check for interface errors or dropped packets.
*   `netstat -i`: Network interface statistics.
*   `iptables -L -n -t nat`: Check firewall and NAT rules (don't forget `-t nat` for K8s/Docker!).

---

## 6. Logs & systemd
*   `journalctl -xe`: View the most recent system logs with explanations.
*   `journalctl -u nginx`: View logs for a specific service.
*   `journalctl -k`: View kernel messages (equivalent to `dmesg`).
*   `systemctl --failed`: List all units that failed to start.
*   `systemd-analyze blame`: See which services are making boot-up slow.

---

## 7. Isolation & Namespaces (Boundaries)
Namespaces define what a process can **see**. They create isolated views of system resources.

![Linux Namespaces](https://digitalpress.fra1.cdn.digitaloceanspaces.com/bzg4z45/2025/07/linux-namespaces-types.webp)

*   **PID Namespace**: The process thinks it is PID 1.
*   **Network Namespace**: Private network stack (interfaces, routing, IP).
*   **Mount Namespace**: Independent filesystem mount points.
*   **UTS Namespace**: Custom hostname.
*   **IPC Namespace**: Isolated inter-process communication.
*   **User Namespace**: Map internal IDs to different external IDs (e.g., internal root = external nobody).

### Control Groups (cgroups)
Cgroups define how much a process can **use**. They enforce resource limits (CPU, Memory, I/O) and prevent "noisy neighbors" from starving other processes.

---

## 4. Virtual File System (VFS) & Storage
Linux treats "everything as a file" via the **VFS** abstraction layer.

### Inodes (The File's Identity)
An **Inode** is a data structure containing metadata about a file (permissions, owner, size, data block addresses).
*   **Crucial Fact**: The **Filename** is NOT stored in the Inode. It's stored in the directory entry that points to the Inode.
*   **Links**: A **Hard Link** is just another directory entry pointing to the same Inode. A **Symlink** is a special file containing the path to another Inode.

### File Behavior & Inodes
*   **`cp` (Copy)**: Creates a NEW Inode.
*   **`mv` (Move)**: Keeps the SAME Inode (just renames the directory entry pointer).
*   **`sed -i` (Edit in place)**: Often creates a temporary file (new Inode) and renames it over the original. This can break tools (like `tail -f`) that are watching the original Inode!

### File Descriptors (FD)
A **File Descriptor** is a process-level integer that index into the kernel's open file table. By default, 0 is stdin, 1 is stdout, and 2 is stderr.


---

*Sources: [SadServers](https://docs.sadservers.com/docs/troubleshooting/linux-server-review/), [Dev.to - Linux FS](https://dev.to/kanywst/linux-file-system-architecture-a-deep-dive-into-vfs-inodes-and-storage-1n9), [ByteByteGo]*

*Last updated: 2026-03-26*
