---
title: "Linux File System & Permissions"
excerpt: "Deep dive into Inodes, octal permissions, special bits, and disk usage tools."
macro_category: devops
category: linux-fundamentals
order: 9
permalink: /notes/devops-linux-file-system/
---

# Linux File System & Permissions

In Linux, "everything is a file." This philosophy is managed through a sophisticated system of metadata and abstraction.

## The Inode (Index Node)
An **Inode** is the data structure that stores all information about a file **except** its name and the actual data content.

### Inode Metadata
You can view this with `stat [filename]` or `ls -i`:
*   **File Type**: Regular (-), Directory (d), Symlink (l), etc.
*   **Permissions**: Read, write, execute bits.
*   **Owner/Group**: UID and GID.
*   **Size**: Total bytes.
*   **Timestamps**: Access (atime), Modify (mtime), Change (ctime).
*   **Blocks**: The location of data on the physical disk.

---

## File Permissions
Linux uses a 3-tier permission model: **User (u)**, **Group (g)**, and **Others (o)**.

### Octal Representation
*   **Read (r)**: 4
*   **Write (w)**: 2
*   **Execute (x)**: 1
*   **No Permission**: 0

*Example: `chmod 755` (rwxr-xr-x) means User has 7 (4+2+1), Group/Others have 5 (4+1).*

### Special Permissions
*   **SUID (Set User ID)**: The process runs with the privileges of the file's **owner** (e.g., `/usr/bin/passwd`).
*   **SGID (Set Group ID)**: The process runs with the privileges of the file's **group**. In directories, new files inherit the parent's group.
*   **Sticky Bit**: Applied to directories (like `/tmp`) to ensure only the file owner can delete or rename their own files.
*   **SELinux Dot (`.`)**: A dot at the end of permissions (e.g., `-rw-r--r--.`) indicates an SELinux security context is active.

---

## Storage & Capacity

### Disk Usage Tools
*   **`df -h`**: (Disk Free) Shows the filesystem's total capacity and remaining space. Best for high-level health checks.
*   **`du -sh [dir]`**: (Disk Usage) Traverses a specific directory to calculate size. Best for finding large files.
*   **Difference**: `df` reports space used at the filesystem level, while `du` reports the sum of file sizes. If you delete a large file that a process still has open, `du` will show the space as free, but `df` will show it as still used!

### File System Types
You can check active filesystems with `df -T`, `lsblk -f`, or `mount`.
*   **ext4**: 4th Extended Filesystem (Standard).
*   **xfs**: High-performance journaling filesystem (Default in RHEL/CentOS).
*   **tmpfs**: RAM-backed filesystem (Volatile).

---

*Last updated: 2026-03-26*
