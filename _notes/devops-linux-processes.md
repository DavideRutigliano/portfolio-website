---
title: "Linux Process Management"
excerpt: "Understanding process states, lifecycle, signals, and system load."
macro_category: devops
category: linux-fundamentals
order: 10
permalink: /notes/devops-linux-processes/
---

# Linux Process Management

Processes are executing instances of a program, each with its own memory space and resources.

## Process Lifecycle
Every process in Linux is created by another process (except PID 1, which is started by the kernel).
1.  **`fork()`**: A parent process creates a near-identical copy of itself.
2.  **`exec()`**: The child process replaces its memory space with a new program.
3.  **`exit()` / `wait()`**: The process finishes and its parent collects its exit status.

### Zombies vs. Orphans
*   **Zombie Process (`Z`)**: A process that has finished execution but still occupies an entry in the process table because its parent hasn't yet "reaped" it via `wait()`.
*   **Orphan Process**: A process whose parent has died. These are automatically adopted by **PID 1** (`systemd` or `init`).

---

## Process States
You can see these in `top` or `ps`:
*   **`R` (Running / Runnable)**: Actively using the CPU or waiting in the run queue.
*   **`S` (Interruptible Sleep)**: Waiting for an event (e.g., user input).
*   **`D` (Uninterruptible Sleep)**: Waiting for I/O (e.g., disk access). Cannot be killed until I/O finishes.
*   **`T` (Stopped)**: Suspended by a signal (e.g., `Ctrl+Z`).
*   **`Z` (Zombie)**: Terminated but still in the process table.

---

## Signals
Signals are a way to send messages to processes.
*   **`SIGTERM` (15)**: The default "clean" shutdown. Asks the process to exit.
*   **`SIGKILL` (9)**: Forcibly kills the process. **Cannot be ignored or caught.**
*   **`SIGHUP` (1)**: Hangup. Often used to tell a daemon to **reload its configuration** without restarting.
*   **`SIGINT` (2)**: Interrupt (usually `Ctrl+C`).
*   **`SIGSTOP` (19)**: Stops a process (usually `Ctrl+Z`).

---

## Monitoring & Troubleshooting

### System Load (`uptime`)
The **Load Average** represents the number of processes that are either in the `R` (Running) or `D` (Uninterruptible) state.
*   A load of 1.0 on a 1-core machine means the CPU is at 100% capacity.
*   A load of 5.0 on a 4-core machine means the system is over-saturated (1 process is always waiting).

### Debugging with `strace`
**`strace`** intercepts and records the **system calls** (syscalls) made by a process. Use it to find "why" a process is failing (e.g., "File not found" or "Permission denied" at the kernel level).
```bash
strace -p [PID] # Attach to a running process
strace ls /root # See what syscalls 'ls' makes
```

---

*Last updated: 2026-03-26*
