---
title: "Linux Interview Preparation"
excerpt: "Quick answers to common Linux technical questions and core concepts."
macro_category: devops
category: linux-fundamentals
order: 11
permalink: /notes/devops-linux-questions/
---

# Linux Interview Preparation

A collection of common technical questions and "under the hood" explanations for Linux system administration.

## "What happens when you run `ls *.txt`?"
This tests your understanding of **Shell Expansion** vs. the command itself.
1.  **Wildcard Expansion**: The shell (e.g., Bash) scans the current directory and replaces `*.txt` with a list of matching filenames (e.g., `a.txt`, `b.txt`).
2.  **Execution**: The shell then executes the `ls` command, passing the expanded list as arguments: `ls a.txt b.txt`.
3.  **Result**: `ls` receives the filenames, not the `*` symbol.

---

## Kernel & Modules
*   **How do you find the kernel version?**: `uname -r` or `uname -a`.
*   **How do you load a kernel module?**: `modprobe [module_name]`. (Use `lsmod` to see loaded modules).
*   **What is `sysctl`?**: A tool used to modify kernel parameters at runtime.
    *   Example: `sysctl -w net.ipv4.ip_forward=1` (Enables IP forwarding).
    *   Persist configuration in: `/etc/sysctl.conf`.

---

## User Limits (`ulimit`)
The `ulimit` command defines the resources a user shell can consume.
*   **Soft Limit**: A warning threshold (can be increased by the user up to the hard limit).
*   **Hard Limit**: An absolute ceiling (can only be increased by root).
*   **Common metric**: `ulimit -n` (Maximum number of open file descriptors).

---

## The "Everything is a File" Philosophy
In Linux, devices, sockets, and processes are represented as files in the tree:
*   **`/dev/sda`**: The physical hard drive.
*   **`/proc/meminfo`**: A virtual "window" into the kernel's memory management.
*   **`/dev/null`**: The "black hole" used for discarding output (`> /dev/null 2>&1`).

---

## System Health Checklist
*   **Characterize**: `ss -tlpn` (ports), `ps auxf` (processes).
*   **Saturation**: `uptime` (load), `free -m` (memory), `df -h` (disk).
*   **Errors**: `journalctl -p err`, `dmesg | tail`.

---

*Last updated: 2026-03-26*
