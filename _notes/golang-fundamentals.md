---
title: "Golang Fundamentals"
excerpt: "Quick reference for Go's typing system, memory management, and concurrency model."
macro_category: programming
category: golang
order: 1
permalink: /notes/golang-fundamentals/
---

# Golang Fundamentals

A brief overview of the core concepts that define Go's behavior and performance.

## Typing & Data Structures

### Arrays vs. Slices
- **Arrays**: Fixed size, value types. Passing an array to a function copies the entire array.
  - `var a [5]int`
- **Slices**: Dynamic size, reference types (descriptors). They point to an underlying array.
  - **Internal Structure**: Under the hood, a slice is a struct consisting of a pointer (to the first element of the backing array), a `len` (current number of elements), and a `cap` (capacity, the maximum elements the slice can hold without reallocating).
  - **Creation**: Pre-allocating with `make([]Type, length, capacity)` avoids the overhead of implicit reallocations when you know the rough target size.
  - **Growth**: Using `append` pushes items to the end. If elements exceed capacity, Go runtime automatically allocates a new larger backing array (often doubling in size), copies existing elements, and updates the slice reference.
  - **Slicing Syntax (`s[low:high]`)**: Creates a new slice that shares the exact same underlying backing array. Adding elements to it can inadvertently overwrite the original slice contents if they overlap. **Full-slice expression** `s[low:high:max]` elegantly solves this by constraining the maximum capacity the new slice inherits, safely preventing accidental overwrites.

### Maps (Hash Tables)
- Hash tables for key-value pairs. Reference types, initialized using `make(map[keyType]valueType)`.
- **Concurrency**: Not thread-safe for concurrent writes. Rely on `sync.RWMutex` to prevent crashes when simultaneously reading and writing map data.
- **Nil values**: Retrieving an un-set key returns the value type's global zero-value (e.g. `0`, `""`). Rely on the two-value variant (`val, ok := m[key]`) to gracefully distinguish missing keys from genuine zero-value assignments.
- **Internal Structure**: Built over an array of buckets (`bmap`). Each bucket holds a maximum of 8 key-value records. To expedite iteration, buckets contain a `tophash` array caching the topmost 8 bits of keys, skipping extensive deep-equal checks.
- **Collisions & Chaining**: If more than 8 elements hash to a single bucket, an overflow bucket pointer is linked.
- **Map Growth**: Triggered under two circumstances:
  - **High Load Factor**: if average pair count per bucket exceeds 6.5. Runtime doubles bucket count. 
  - **Clustered Overflows**: Too many overflow buckets from successive deletions vs insertions. Triggers a same-size growth to de-fragment storage. 
  - **Incremental Evacuation**: Expanding maps don't move records concurrently (to prevent "Stop The World" application freezing). Go performs "Incremental Evacuation", gently moving records gradually over subsequent regular map operations until all buckets are transferred over seamlessly.

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

### Channels
- Typed conduits for exchanging values between goroutines without explicit locks (`ch <- v` and `v := <-ch`).
- Adheres to the Go proverb: *"Don't communicate by sharing memory; share memory by communicating."*
- **Unbuffered Channels**: `make(chan Type)`. Sends and receives block until the opposite side is ready, effectively synchronizing goroutines.
- **Buffered Channels**: `make(chan Type, capacity)`. Sends only block when the buffer gets full. Receives only block when buffer is empty.
- **Closing**: Sender can `close(ch)` to signal no more values will be sent. Receivers test using the two-value receive: `val, ok := <-ch` (`ok` is false if closed and empty).
- **Select**: The `select` statement lets a goroutine wait on multiple communication operations simultaneously.

### Mutexes (`sync.Mutex`)
- A mutual exclusion lock used to isolate access to a critical section of code across multiple goroutines, typically to prevent race conditions on shared memory.
- Surround critical sections with `mu.Lock()` and `mu.Unlock()`.
- Standard pattern: use `defer mu.Unlock()` immediately after acquiring the lock to guarantee unlocking even if panics occur.
- Best practice: group the `sync.Mutex` field together with the data it protects inside a struct.

### WaitGroups (`sync.WaitGroup`)
- A synchronization mechanism to block a goroutine until a collection of other goroutines finishes executing.
- `wg.Add(n)`: Sets the number of goroutines to wait for. Call this in the spawning goroutine *before* launching the new goroutines.
- `wg.Done()`: Decrements the counter. Should be called by each spawned goroutine upon completion (often via `defer wg.Done()`).
- `wg.Wait()`: Blocks the calling goroutine until the WaitGroup counter reaches zero.

---

*Last updated: 2026-02-18*
