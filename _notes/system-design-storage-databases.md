---
title: "System Design: Storage Engines & Distributed Databases"
macro_category: "system-design"
category: "storage-databases"
order: 3
---

## Storage Engines: LSM-Tees vs B-Trees

A storage engine is the low-level component of a database that handles how data is stored on disk and retrieved.

### B-Trees (Read-Optimized)
Data is organized into fixed-size pages (usually 4KB). Pages are arranged in a tree structure.
*   **Mechanism**: In-place updates. Modifying a record involves overwriting the page on disk.
*   **Pros**: Fast reads ($O(\log N)$), predictable performance.
*   **Cons**: Slower writes due to "random write" overhead and page fragmentation.
*   **Example**: PostgreSQL, MySQL (InnoDB), Oracle.

### LSM-Trees (Write-Optimized)
Data is first written to an in-memory `MemTable` (sorted) and a `Write-Ahead Log` (WAL). When the `MemTable` is full, it's flushed to disk as an immutable `SSTable`.
*   **Mechanism**: Append-only. Updates are new versions; deletes are "tombstones". A background process (**Compaction**) merges SSTables.
*   **Pros**: Extremely fast sequential writes, high throughput.
*   **Cons**: High "Read Amplification" (must check multiple SSTables) and "Write Amplification" (during compaction).
*   **Example**: Cassandra, RocksDB, LevelDB, Bigtable.

| Feature | B-Trees | LSM-Trees |
| :--- | :--- | :--- |
| **Write Speed** | Slower (Random I/O) | Faster (Sequential I/O) |
| **Read Speed** | Faster (Predictable) | Slower (Read Amplification) |
| **Storage Layout** | Mutable Pages | Immutable Segments |
| **Space Overhead** | Lower | Higher (due to Compaction) |

---

## Write-Ahead Log (WAL)

The WAL is an append-only log on disk that records every modification before it is applied to the main data structures.

### Why is it used?
1.  **Atomicity**: Ensures that either all parts of a transaction are applied or none.
2.  **Durability (Recovery)**: If the database crashes, the system can replay the WAL to reconstruct the state of the in-memory data that hadn't been flushed to disk yet.

---

## Scaling: Sharding vs Partitioning

### Sharding (Horizontal Partitioning)
Splitting a large dataset into multiple smaller databases (Shards) across different servers.

*   **Key-based Sharding**: User ID % Number of Shards.
*   **Range-based Sharding**: Users A-M on Shard 1, N-Z on Shard 2.
*   **Directory-based Sharding**: A discovery service maps keys to shard locations.

### Challenges
*   **Hotspots**: One shard getting too much traffic (e.g., celebrity user).
*   **Joins**: Performing joins across shards is extremely expensive.
*   **Rebalancing**: Moving data when adding a new shard.

---

## Replication Strategies

### 1. Single-Leader
One leader handles all writes. Multiple followers replicate from the leader.
*   **Sync Replication**: Leader waits for follower ACK. (Risk: High latency).
*   **Async Replication**: Leader returns success immediately. (Risk: Data loss if leader fails).

### 2. Multi-Leader
Multiple nodes handle writes (often across different regions).
*   **Pros**: High availability, low latency for global users.
*   **Cons**: Conflict resolution (Last Write Wins, Causal Ordering).

### 3. Leaderless (Quorum-based)
Clients send writes to all nodes. A write is successful if it reaches a **Quorum**.
*   **$W + R > N$**: Ensures that the set of nodes that acknowledged a write and the set of nodes that replied to a read must overlap, ensuring a consistent read.
*   **Example**: Amazon Dynamo, Cassandra.

> [!IMPORTANT]
> **Interview Scenario**: *How do you handle a "Hot Partition" in a sharded database?*
> 1.  **Re-sharding**: Use a better shard key (e.g., compound key).
> 2.  **Hashing**: Use a consistent hashing algorithm to distribute load evenly.
> 3.  **Secondary Indexes**: Shard the index differently than the data.
