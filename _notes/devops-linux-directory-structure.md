---
title: "Linux Directory Structure"
excerpt: "Understanding the standard Linux filesystem hierarchy and the role of key directories."
macro_category: devops
category: linux-fundamentals
order: 6
permalink: /notes/devops-linux-directory-structure/
---

# Understanding the Linux Directory Structure

The Linux filesystem follows a hierarchical structure, starting from the root directory `/`. Everything in Linux—including hardware devices, processes, and system configurations—is represented as a file within this tree.

## The Linux Filesystem Hierarchy

![Linux Directory Structure](https://substackcdn.com/image/fetch/$s_!LIIv!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F631f49cf-2eff-4941-ba22-b2c482eb24ec_2360x2960.png)

### Core System Directories

*   **`/` (Root)**: The starting point of the entire filesystem. Every other directory is a child of root.
*   **`/boot`**: Stores the bootloader (e.g., GRUB) and kernel files. The system cannot start without this directory.
*   **`/bin` & `/sbin`**: Contain essential binaries and system commands. `/bin` holds commands for all users, while `/sbin` holds system administration binaries.
*   **`/lib` & `/lib64`**: System libraries that support the binaries in `/bin` and `/sbin`.

### Configuration & Data

*   **`/etc`**: The central location for all system-wide configuration files.
*   **`/home`**: Contains personal directories for regular users (e.g., `/home/alice`).
*   **`/root`**: The home directory for the root (superuser) account.
*   **`/var`**: Stores "variable" data that changes frequently, such as logs (`/var/log`), caches, and spool files.
*   **`/tmp`**: A place for temporary files, which are often cleared on reboot.

### Resources & Applications

*   **`/usr`**: Contains user-level applications, libraries, and source code. It is often the largest directory on the system.
*   **`/opt`**: Reserved for "optional" or third-party software packages (e.g., Chrome, Zoom).
*   **`/run`**: Records runtime information for programs since the last boot (e.g., PID files).

### Hardware & Virtual Filesystems

*   **`/dev`**: Holds device files that act as interfaces to hardware (e.g., `/dev/sda` for a disk).
*   **`/proc`**: A virtual filesystem that provides information about running processes and kernel parameters.
*   **`/sys`**: Another virtual filesystem that exposes kernel information about hardware devices and drivers.
*   **`/media` & `/mnt`**: Used for mounting external storage. `/media` is typically for auto-mounted removable devices (USB, CD-ROM), while `/mnt` is for manual temporary mounts.

---

*Source: [ByteByteGo - Understanding the Linux Directory Structure](https://blog.bytebytego.com/p/ep199-behind-the-scenes-what-happens-when-you-enter-googlecom)*

*Last updated: 2026-03-25*
