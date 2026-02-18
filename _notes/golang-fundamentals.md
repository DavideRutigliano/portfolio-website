---
title: "Golang Fundamentals"
excerpt: "Quick reference for Go's typing system, memory management, and concurrency model."
category: programming
permalink: /notes/golang-fundamentals/
---

# Golang Fundamentals

A brief overview of the core concepts that define Go's behavior and performance.

## Typing & Data Structures

### Arrays vs. Slices
- **Arrays**: Fixed size, value types. Passing an array to a function copies the entire array.
  - `var a [5]int`
- **Slices**: Dynamic size, reference types (descriptors). They point to an underlying array.
  - `s := []int{1, 2, 3}`
  - Modifying a slice element affects the underlying array and other slices sharing it.

### Maps
- Hash tables for key-value pairs.
- Reference types, initialized using `make(map[keyType]valueType)`.
- Not thread-safe for concurrent writes.

### Interfaces
- Implicit implementation (no `implements` keyword).
- Defined by a set of methods. Any type that provides those methods satisfies the interface.
- "Accept interfaces, return structs."

### Methods
- Functions with a **receiver**.
- **Value Receiver** (`func (v Type) Method()`): Works on a copy.
- **Pointer Receiver** (`func (p *Type) Method()`): Can modify the original value and avoids copying large structs.

## Memory Management & GC

Go handles memory allocation and deallocation automatically.

### Stack vs. Heap
- **Stack**: Used for local variables with predictable lifetimes. Very fast allocation/deallocation.
- **Heap**: Used for data that outlives the function call (escape analysis determines this). Slower, requires GC.

### Garbage Collector (GC)
- **Non-generational, concurrent, tri-color mark-and-sweep**.
- Focuses on **low latency** (minimizing Stop-The-World aka STW pauses).
- Controlled by `GOGC` (target heap growth percentage).

## Concurrency & Scheduling

### Goroutines
- Lightweight "threads" managed by the Go runtime, not the OS.
- Start with ~2KB stack, grow/shrink as needed.
- `go myFunction()`

### Parallelism vs. Concurrency
- **Concurrency**: Dealing with many things at once (structure).
- **Parallelism**: Doing many things at once (execution on multi-core).

### Golang Scheduler (GOM-P Model)
- **G (Goroutine)**: State of a goroutine.
- **M (Machine)**: OS Thread.
- **P (Processor)**: Resource required to execute Go code (defines concurrency limit, default `GOMAXPROCS`).
- **Work Stealing**: Idle Ps can steal Gs from other Ps' local queues.

### Race Conditions
- Occur when multiple goroutines access the same memory concurrently and at least one access is a write.
- Use the **Race Detector**: `go test -race` or `go run -race`.
- Prevention: Use **Channels** (don't communicate by sharing memory, share memory by communicating) or **Mutexes** (`sync.Mutex`).

---

*Last updated: 2026-02-18*
