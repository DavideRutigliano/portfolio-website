---
title: "Linux Boot Process"
excerpt: "A detailed breakdown of the Linux boot sequence, from BIOS/UEFI firmware to user login, including cloud-init integration."
macro_category: devops
category: linux-fundamentals
order: 7
permalink: /notes/devops-linux-boot-process/
---

# The Linux Boot Process Explained

Understanding how a Linux system starts up is fundamental for system administration and troubleshooting. The process involves a sequence of handovers from hardware firmware to the operating system kernel and finally to user-space services.

## The 8 Stages of Linux Boot

![Linux Boot Process](https://substackcdn.com/image/fetch/$s_!-vdO!,w_1456,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fcdb6d61c-91d7-4de9-9774-9a36d607eb34_1101x1594.gif)

### 1. BIOS / UEFI
When the power is turned on, the **BIOS** (Basic Input/Output System) or **UEFI** (Unified Extensible Firmware Interface) is loaded from non-volatile memory. It performs a **POST** (Power-On Self-Test) to ensure the hardware is functioning correctly.

### 2. Hardware Detection
The firmware detects connected devices, including the CPU, RAM, and storage controllers, preparing the system for the next stage.

### 3. Boot Device Selection
The system looks for a bootable device based on a predefined priority (e.g., Hard Drive, NVMe, Network/PXE, or USB).

### 4. Bootloader (GRUB)
The firmware loads and executes the bootloader (commonly **GRUB** - GRand Unified Bootloader). GRUB provides a menu to select the OS/Kernel and loads the chosen **Kernel** and **initramfs** (initial RAM filesystem) into memory.

### 5. Kernel Initialization
The Linux kernel takes control. It initializes hardware drivers, mounts the root filesystem (often using `initramfs` as a temporary bridge), and starts the first user-space process: `systemd` (PID 1).

### 6. Systemd (The Init System)
`systemd` manages system services and processes. It probes remaining hardware, mounts the final filesystems, and works toward reaching the `default.target` (usually a multi-user or graphical environment).

### 7. Target Configuration
The system executes startup scripts and configures the environment according to the active target unit (comparable to traditional "runlevels").

### 8. User Login
Once all services are active, the system presents a login prompt or a desktop environment. The boot process is complete.

---

## Linux Boot vs. Cloud-Init Boot

In cloud environments (AWS, GCP, Azure), the standard boot process is extended by **cloud-init** to handle dynamic configuration (metadata, SSH keys, networking).

| Stage | Standard Linux Boot | Cloud-Init Extension |
| :--- | :--- | :--- |
| **Early Boot** | Kernel starts `systemd`. | `systemd-generator` detects the cloud environment and enables cloud-init. |
| **Local** | System waits for storage/network local configs. | **cloud-init-local**: Searches for datasources (metadata) and applies network configuration before networking is even up. |
| **Network** | Networking services start. | **cloud-init-network**: Processes user-data (e.g., mounting disks) now that the network is available. |
| **Config** | Standard services start. | **cloud-init-config**: Runs configuration modules like SSH keys, user creation, and package mirrors. |
| **Final** | User login prompt appears. | **cloud-init-final**: Runs late-stage tasks like package installations and user-provided scripts (`bootcmd`). |

### Key Differences
*   **Purpose**: Standard boot focuses on getting the OS running; `cloud-init` focuses on **provisioning** and **customizing** the instance.
*   **Dynamic Data**: Standard boot is relatively static. `cloud-init` consumes external **metadata** and **user-data** at runtime to configure the machine.
*   **Idempotency**: Standard boot runs every time. `cloud-init` typically runs its heavy configuration logic only on the **first boot** of an instance.

---

*Sources: [ByteByteGo - Linux Boot Process](https://bytebytego.com/guides/linux-boot-process-explained/), [CoderCo - The Linux Boot Process](https://blog.coderco.io/p/the-linux-boot-process-an-interview)*

*Last updated: 2026-03-26*
