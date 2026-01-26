---
title: 'Autoscaling Made Easy with Rancher'
date: 2025-11-19
permalink: /posts/2025/11/autoscaling-made-easy-with-rancher/
tags:
  - Kubernetes
  - Rancher
  - Autoscaling
  - Platform Engineering
---

## The Challenge: Autoscaling Kubernetes Clusters

The problem with autoscaling isn’t just about replacing manual effort with a script. Traditional automation and autoscaling tools are external to Kubernetes, meaning they’re unaware of its internal state changes.

Cloud provider tools like AWS Auto Scaling Groups (ASG) or GKE cluster autoscaler work well, but they operate at the infrastructure level, not reacting to Kubernetes-specific events. This creates a core discrepancy: Kubernetes knowing when it needs more resources (or no longer needs them), while the underlying infrastructure provider remains unaware of that need. As a result, resources are constrained during high demand periods and sit idle during off-peak times.

This problem is even more evident in hybrid environments involving multiple providers. Autoscaling tools designed for a specific cloud platform may not be compatible with others. They also often lack support for on-premise hypervisors like Harvester (which, in our case, accounts for a large part of the infrastructure) or vSphere. This creates a patchwork of vendor-specific tools, destroying the promise of a unified platform.

## Kubernetes Cluster Autoscaler

Rancher solve this discrepancy by providing a powerful, declarative foundation for cluster lifecycle management.

Rancher uses Node Drivers to interface directly with infrastructure resources. This allows the definition of cluster nodes through Rancher’s provisioning framework. For example, it allows definition of cluster nodes through MachineDeployment Custom Resources. Just like standard Kubernetes deployments manage applications pods state, a `MachineDeployment` resource manages the Virtual Machines pool state in the underlying infrastructure provider.

Furthermore, we leverage the standard, open-source Kubernetes Cluster Autoscaler (CA) project to act as the engine. It is important to note that this is the upstream autoscaler (not a specific SUSE-maintained fork), which works seamlessly because Rancher adheres to standard Kubernetes APIs.

When CA detects unschedulable pods due to resource shortages, the Cluster Autoscaler directly tells Rancher to provision a new node by autoscaling `MachineDeployment` resources. Rancher Node Drivers then handles the complex, provider-specific work of provisioning new VMs and joining them to the cluster as worker nodes.

This separation of concerns creates a simple yet powerful scaling mechanism that works as-is on any infrastructure provider supported by Rancher, and the autoscaling sole job is to update the Rancher `MachineDeployment` resource with the new desired number of nodes.

## From Theory to Practice: Autoscaling an RKE2 Cluster

Now that we understand our autoscaling architecture, let’s put it into practice. This section will guide you through deploying and configuring the Kubernetes Cluster Autoscaler to control a downstream RKE2 cluster’s scaling.

For this tutorial, we will use an RKE2 cluster provisioned by Harvester. However, instructions reported in this guide apply as-is to any other cloud provider supported by [Rancher Node Drivers](https://ranchermanager.docs.rancher.com/how-to-guides/new-user-guides/authentication-permissions-and-global-configuration/about-provisioning-drivers/manage-node-drivers).

## Prerequisites

Before we begin, ensure you have the following setup ready:
- A SUSE Rancher (upstream) cluster (v2.6+).
- An RKE2 (downstream) cluster provisioned using Rancher.
- Kubeconfig for both the Rancher (upstream) cluster and the RKE2 (downstream) cluster.
- `helm` and `kubectl` installed on your local machine.

## Configure Rancher RBAC

The Cluster Autoscaler interacts with Rancher and can patch/update Rancher resources. Specifically, the Cluster Autoscaler uses a dedicated Rancher role with the following permissions:
- Get/Update of the `clusters.provisioning.cattle.io` resource to autoscale
- List of `machines.cluster.x-k8s.io` in the namespace of the cluster resource

## Annotate RKE2 Worker Node Pool

The Cluster Autoscaler needs to know which machine pools it can scale and their boundaries. You provide this information by adding annotations to the `MachineDeployment` resource corresponding to the RKE2 (downstream) cluster worker node pool.

In this tutorial, we set up two separate node pools: one for control-plane/ETCD nodes and another for worker nodes. The first pool features a high-availability configuration with three control-plane/ETCD nodes, while the second pool for worker nodes will serve as our autoscaling target.

Edit the Cluster:

```bash
kubectl edit cluster.provisioning.cattle.io -n fleet-default cluster-autoscaler-blogpost
```

And add the following `machineDeploymentAnnotations` to the worker nodes pool:

```yaml
spec:
  rkeConfig:
    machinePools:
    - workerRole: true
      machineDeploymentAnnotations:
        cluster.k8s.io/cluster-api-autoscaler-node-group-min-size: "1"
        cluster.k8s.io/cluster-api-autoscaler-node-group-max-size: "3"
```

## Configure the Cluster Autoscaler for Rancher

Now that your RKE2 cluster is ready for autoscaling, you can [configure](https://github.com/kubernetes/autoscaler/tree/master/cluster-autoscaler/cloudprovider/rancher) the Cluster Autoscaler to interact with the Rancher API and dynamically adjust `MachineDeployment` resources. The configuration file should specify the Rancher API URL and token, along with the target the RKE2 cluster's name and namespace:

```yaml
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: cluster-autoscaler-config
  namespace: kube-system
data:
  cluster-autoscaler-config.yaml: |
    url: <RANCHER_API_URL>
    token: <RANCHER_API_TOKEN>
    clusterName: cluster-autoscaler-blogpost
    clusterNamespace: fleet-default
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: custom-ca-certs
  namespace: kube-system
data:
  ca-certificates.crt: |
    -----BEGIN CERTIFICATE-----
    ...
    -----END CERTIFICATE-----
```

Then, apply it in the downstream RKE2 cluster where you’ll deploy the Cluster Autoscaler:

```bash
kubectl apply -n kube-system -f cluster-autoscaler-config.yaml
```

## Deploy the Cluster Autoscaler

The autoscaler itself will run in the `kube-system` namespace and interacts with both the upstream Rancher and downstream cluster resources. It will monitor the downstream cluster’s resources allocation and automatically adjust the `MachineDeployment` to scale nodes up or down accordingly.

Before deploying Cluster Autoscaler, create a `values.yaml` file with the following content:

```yaml
cloudProvider: rancher
cloudConfigPath: /etc/cluster-autoscaler/cluster-autoscaler-config.yaml
autoDiscovery:
  clusterName: cluster-autoscaler-blogpost
  clusterNamespace: fleet-default
tags:
  - k8s.io/cluster-autoscaler/enabled
  - k8s.io/cluster-autoscaler/cluster-autoscaler-blogpost
nodeSelector:
  node-role.kubernetes.io/control-plane: "true"
tolerations:
  - effect: NoSchedule
    operator: "Equal"
    key: "node-role.kubernetes.io/control-plane"
  - effect: NoExecute
    operator: "Equal"
    key: "node-role.kubernetes.io/etcd"
extraVolumeMounts:
  - name: cluster-autoscaler-config
    mountPath: /etc/cluster-autoscaler
    readOnly: true
  - name: custom-ca-certs
    mountPath: /etc/ssl/certs
    readOnly: true
extraVolumes:
  - name: cluster-autoscaler-config
    configMap:
      name: cluster-autoscaler-config
  - name: custom-ca-certs
    configMap:
      name: custom-ca-certs
```

Then, deploy the Cluster Autoscaler in the downstream RKE2 cluster by providing the above values file:

```bash
helm repo add autoscaler https://kubernetes.github.io/autoscaler
helm install cluster-autoscaler autoscaler/cluster-autoscaler -n kube-system -f values.yaml
```

After successful installation, Cluster Autoscaler will be deployed in the `kube-system` namespace. Before proceeding, make sure Cluster Autoscaler is fetching the worker pool we annotated with autoscaler labels:

```bash
kubectl logs -n kube-system deploy/cluster-autoscaler-rancher-cluster-autoscaler
```

```text
[... static_autoscaler.go:274] Starting main loop
[... rancher_provider.go:234] ignoring machine pool cluster-autoscaler-blogpost-pool1 as it does not have min/max annotations
[... rancher_provider.go:241] scalable node group found: cluster-autoscaler-blogpost-pool2 (1:3)
[... rancher_provider.go:170] found pool "cluster-autoscaler-blogpost-pool2" via machine "cluster-autoscaler-blogpost-pool2-fvbfp-xpmgb"
```

## Autoscaling in Action

With Cluster Autoscaler now running in our cluster, let’s create a dummy deployment and increase the number of replicas until it saturates cluster resources and trigger autoscaling.

```yaml
---
apiVersion: apps/v1
kind: Deployment
metadata:
  labels:
    app: hello-world
  name: hello-world
spec:
  replicas: 3 # you may need to adjust replica number to trigger autoscaling
  selector:
    matchLabels:
      app: hello-world
  template:
    metadata:
      labels:
        app: hello-world
    spec:
      containers:
      - image: rancher/hello-world
        name: hello-world
        imagePullPolicy: Always
        ports:
        - containerPort: 80
          protocol: TCP
        resources: # you may need to adjust resources to trigger autoscaling
          limits:
            cpu: 1
            memory: 8Gi
          requests:
            cpu: 1
            memory: 8Gi
```

Then apply the above workload in any namespace of the downstream RKE2 Cluster:

```bash
kubectl apply -f test-cluster-autoscaler.yaml
```

This will spawn a set of dummy pods until the cluster reaches the point where pods cannot be scheduled on any node due to resource constraints. As a result, Cluster Autoscaler will then trigger scale-up events and instruct Rancher to create new nodes in the underlying infrastructure provider.

New worker nodes should start joining your RKE2 cluster creating room for all the pending pods.

## Don’t Forget to Scale-Down!

To make sure autoscaling works in both directions, make sure you also scale down (or delete) the test deployment and wait for the cluster to scale down accordingly.

```bash
kubectl scale deploy/test-cluster-autoscaler -n kube-system --replicas=0
```

And you should start seeing Autoscaler preparing to scale down unneded nodes.

```bash
kubectl logs -n kube-system deploy/cluster-autoscaler-rancher-cluster-autoscaler
```

```text
[... nodes.go:85] cluster-autoscaler-blogpost-pool2-fvbfp-rprsw is unneeded since 2025-07-21 16:25:17.916797713 +0000 UTC m=+1131641.728403920 duration 3m41.254893434s
[... nodes.go:85] cluster-autoscaler-blogpost-pool2-fvbfp-xpmgb is unneeded since 2025-07-21 16:25:17.916797713 +0000 UTC m=+1131641.728403920 duration 3m41.254893434s
```

## Conclusion

We’ve explored how Rancher can deliver a truly efficient and automated Kubernetes platform. This powerful combination solves the challenge of vendor-specific autoscaling by enabling Kubernetes-native infrastructure management through Rancher extension of the Kubernetes API.

As demonstrated in our hands-on tutorial with an RKE2 cluster, the Kubernetes Cluster Autoscaler seamlessly works to dynamically scale your infrastructure up or down, responding directly to your application’s needs. This unified, declarative approach provides a vendor-agnostic solution that significantly reduces operational overhead, eliminates costly over-provisioning, and gives your platform team peace of mind.
---
