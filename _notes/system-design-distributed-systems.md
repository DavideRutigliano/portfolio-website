---
title: "Distributed Systems: Consensus, Hashing & Discovery"
macro_category: "system-design"
category: "distributed-systems"
order: 1
---

## Consistent Hashing (The Scalability Backbone)

In a distributed system, we often need to map keys to servers (e.g., in a DHT or for Load Balancing).

### The Rehashing Problem
Traditional hashing uses $index = hash(key) \pmod n$. If $n$ (number of servers) changes, almost all keys are remapped, leading to a **cache miss storm**.

### How Consistent Hashing Works
Consistent Hashing maps both **servers** and **keys** onto a circular hash space (a **Hash Ring**).

<img src="https://assets.topofmind.dev/images/consistent_hashing/consistent_hash_ring_02.png" alt="Consistent Hash Ring" style="max-width: 100%; height: auto; display: block; margin: 1em 0;">

1.  **Placement**: Both keys and servers are hashed to positions on the ring.
2.  **Assignment**: A key is assigned to the first server it encounters moving **clockwise**.
3.  **Minimal Disruption**: When a node is added/removed, only $K/N$ keys need remapping on average (where $K$ is the number of keys and $N$ is the number of slots). This is the "minimal disruption" property.

### Virtual Nodes (Smoothing & Hotspots)
Physical nodes can be unevenly distributed, leading to the **Hotspot Key Problem**. **Virtual Nodes** map multiple points on the ring to a single physical server.
*   **Uniformity**: Increasing virtual nodes reduces the standard deviation of load distribution.
*   **Balance**: If one server is more powerful, it can be assigned more virtual nodes.

---

## CAP Theorem: The Distributed Trade-off

The CAP theorem states that a distributed data store can only provide two of the following three guarantees:

<img src="https://hazelcast.com/wp-content/uploads/2025/02/CP-Blog1224.png" alt="CAP Theorem Architecture" style="max-width: 100%; height: auto; display: block; margin: 1em 0;">

1.  **Consistency (C)**: Every read receives the most recent write or an error.
2.  **Availability (A)**: Every request receives a (non-error) response, without the guarantee that it contains the most recent write.
3.  **Partition Tolerance (P)**: The system continues to operate despite an arbitrary number of messages being dropped (or delayed) by the network between nodes.

### The C vs A Choice
Since network partitions (**P**) are inevitable in distributed systems, the real choice is between **Consistency** and **Availability**:
*   **CP (Consistency/Partition Tolerance)**: If a partition occurs, the system stops accepting writes to ensure consistency. (e.g., etcd, ZooKeeper).
*   **AP (Availability/Partition Tolerance)**: The system continues to accept writes/reads, potentially returning stale data. (e.g., Cassandra, DynamoDB).

---

## Bloom Filters (Memory-Efficient Check)

A Bloom Filter is a probabilistic data structure used to check if an element is a member of a set.

<img src="https://upload.wikimedia.org/wikipedia/commons/a/ac/Bloom_filter.svg" alt="Bloom Filter Diagram" style="max-width: 100%; height: auto; display: block; margin: 1em 0;">

*   **Result 1**: "Definitely not in the set" (100% certain).
*   **Result 2**: "Possibly in the set" (False positives are possible).

### How it works
1.  Initialize a bit-array of $m$ bits to all 0s.
2.  To add an element: Run it through $k$ different hash functions and set the corresponding bits in the array to 1.
3.  To check: Run the query through the same $k$ hash functions. If any bit is 0, the element is **definitely not** there.

> [!TIP]
> **Real-world Use**: Cassandra and Bigtable use Bloom Filters to avoid expensive disk lookups for keys that don't exist in an SSTable.

---

## Service Discovery: etcd vs Consul vs ZooKeeper

| Tool | Consensus | Discovery Mechanism | Primary Use Case |
| :--- | :--- | :--- | :--- |
| **etcd** | Raft | HTTP/gRPC (Watch) | Kubernetes state, Configuration. |
| **Consul** | Raft / Gossip | DNS / HTTP / gRPC | Service Mesh, Health checking. |
| **ZooKeeper** | ZAB (Paxos-like) | Client Library (Watches) | Hadoop, Kafka, complex coordination. |

---

## Gossip Protocols (Discovery & Membership)

Gossip protocols are peer-to-peer protocols inspired by the way rumors spread in a social network. They are highly scalable and resilient, used for failure detection and metadata dissemination.

<img src="https://media.licdn.com/dms/image/v2/D5612AQF4FX8eiUi6-A/article-cover_image-shrink_720_1280/article-cover_image-shrink_720_1280/0/1693154866579?e=2147483647&v=beta&t=bWHFaDSx2pomg37VHYe7xZn9HhfR_Ehm3lxmXBvzefs" alt="Gossip Protocol Diagram" style="max-width: 100%; height: auto; display: block; margin: 1em 0;">

### SWIM (Scalable Weakly-consistent Infection-style Process Group Membership Protocol)
SWIM separates the **failure detection** from the **membership dissemination**.

#### Mechanisms:
1.  **Failure Detection**: A node `A` randomly selects node `B` and pings it. If no response, `A` asks `k` other nodes to ping `B` (Indirect Ping).
2.  **Dissemination**: Membership changes (joins, leaves, failures) are piggybacked on the ping/ack messages.

| Feature | Description |
| :--- | :--- |
| **Scalability** | $O(1)$ load per node, regardless of cluster size. |
| **Resilience** | No single point of failure; works even with high packet loss. |
| **Latency** | $O(\log N)$ to propagate information to all nodes. |

> [!TIP]
> **Use Case**: HashiCorp Consul uses SWIM (via the `memberlist` library) for cluster membership and failure detection.

---

## Consensus: The Raft Algorithm

Consensus is the process of getting a group of nodes to agree on a single value or a sequence of operations (the log). Raft is a leader-based consensus algorithm designed for clarity.

<img src="https://miro.medium.com/1*aXgYynVq_JcEEjsyzd9Q2g.png" alt="Raft Architecture Overview" style="max-width: 100%; height: auto; display: block; margin: 1em 0;">

> [!TIP]
> **Learning Resource**: A fantastic visual guide to Raft can be found at [The Secret Lives of Data](https://thesecretlivesofdata.com/raft/), which explains the algorithm through interactive animations.

### How Raft Works: High-Level Concepts

#### 1. Node States
In Raft, a node can be in one of three states: **Follower**, **Candidate**, or **Leader**.

#### 2. Leader Election
If a **Follower** does not hear from a **Leader** for an **Election Timeout**, it becomes a **Candidate** and asks others for votes. If it receives a majority, it becomes the Leader.

#### 3. Log Replication
The Leader handles all client writes. It appends the change to its log and broadcasts it to followers. Once a **majority** acknowledge, the change is **committed**.

### Safety & Commit Rules
*   **Leader Completeness**: A leader must have all committed entries from previous terms. If a candidate's log is less up-to-date than a follower's, the follower will reject the vote.
*   **Election Safety**: At most one leader can be elected in a given term.

---

### Comparison: Raft vs Paxos
| Feature | Paxos | Raft |
| :--- | :--- | :--- |
| **Philosophy** | Based on "Proposers/Acceptors" (Peer-to-peer). | Based on "Leader/Follower" (Centralized). |
| **Complexity** | Extremely difficult to understand and implement. | Designed to be "understandable". |
| **Frameworks** | Google's Chubby, Zookeeper (ZAB). | etcd, Consul, CockroachDB. |

---

## Consistency Models

Consistency defines the order in which operations appear to happen to the users of a system.

### The Spectrum of Consistency
1.  **Strict/Strong Consistency**: Every read returns the most recent write. (Linearizability).
2.  **Sequential Consistency**: All processes see the same order of operations, but not necessarily "real-time" latest.
3.  **Causal Consistency**: Operations that are causally related are seen in the same order.
4.  **Eventual Consistency**: If no new updates are made, all reads will eventually return the same value.

### Beyond CAP: The PACELC Theorem
**CAP** is too simplistic for modern systems. **PACELC** expands it by considering what happens when there is *no* partition:

<img src="https://substackcdn.com/image/fetch/$s_!H1G6!,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F80ce435d-ddc1-4d6f-8d97-ce8db8b408c9_1600x973.png" alt="PACELC Theorem" style="max-width: 100%; height: auto; display: block; margin: 1em 0;">

*   **P**artition: If there is a partition (**P**), how do you choose between Availability (**A**) and Consistency (**C**)?
*   **Else**: **E**lse (operating normally), how do you choose between Latency (**L**) and Consistency (**C**)?

| System | Partition Behavior | Normal Behavior | Example |
| :--- | :--- | :--- | :--- |
| **DynamoDB** | **A**vailable | **L**atency | PA/EL |
| **Cassandra** | **A**vailable | **L**atency | PA/EL |
| **MongoDB** | **A**vailable | **C**onsistency| PA/EC |
| **Fully ACID**| **C**onsistent | **C**onsistency| PC/EC |

---

## Real-World Interview Scenario: Designing etcd
*How does etcd handle a network partition between the leader and the majority of followers?*
1.  The Leader (isolated) cannot reach a quorum, so it cannot commit new entries.
2.  The majority side elects a new leader (higher term).
3.  When the partition heals, the old leader sees the higher term and steps down to Follower.
4.  The old leader's uncommitted entries are overwritten by the new leader's log.
