# ShohorOS --- Kubernetes Deployment Notes

This README contains the manual commands used for the current Kubernetes
setup. Kubernetes resources are maintained in YAML files, so this
document focuses only on cluster operations and commands that are not
already defined in those manifests.

The setup is being developed incrementally. Add new deployment and
operational steps here as the Kubernetes configuration evolves.

## Cluster

-   **Kind cluster:** `forid-cluster`
-   **Namespace:** `shohoros`
-   **Backend image:** `shohoros-server:1.0`

## 1. Create the Kind cluster

``` bash
kind create cluster --name forid-cluster --config cluster/kind-cluster.yaml
```

Verify:

``` bash
kubectl get nodes
kubectl cluster-info --context kind-forid-cluster
```

## 2. Build and load the backend image

Run from the project root:

``` bash
docker build -t shohoros-server:1.0 ./server
kind load docker-image shohoros-server:1.0 --name forid-cluster
```

After rebuilding the image, load it again and restart the backend:

``` bash
kind load docker-image shohoros-server:1.0 --name forid-cluster
kubectl rollout restart deployment/backend-deployment -n shohoros
kubectl rollout status deployment/backend-deployment -n shohoros
```

## 3. Apply Kubernetes manifests

Apply the project's Kubernetes manifests (adjust the directory if
needed):

``` bash
kubectl apply -f k8s/
```

## 4. Check deployment status

``` bash
kubectl get pods,services,deployments,statefulsets -n shohoros
```

Backend logs:

``` bash
kubectl logs deployment/backend-deployment -n shohoros -f
```

## 5. Service access and port-forwarding

Backend services communicate with MongoDB and Redis through Kubernetes
Service DNS. Port-forwarding is only needed to access a service from the
local machine.

  -------------------------------------------------------------------------------------------------------------------------------
  Purpose                 Local access              Port-forward command
  ----------------------- ------------------------- -----------------------------------------------------------------------------
  Backend API             `http://localhost:5000`   `kubectl port-forward service/backend-service -n shohoros 5000:5000`

  RedisInsight UI         `http://localhost:5540`   `kubectl port-forward service/redis-explorer-service -n shohoros 5540:5540`
  -------------------------------------------------------------------------------------------------------------------------------

Optional: forward MongoDB only when connecting from a local database
GUI:

``` bash
kubectl port-forward service/mongo-service -n shohoros 27017:27017
```

Optional: forward Redis only when connecting from a local Redis client:

``` bash
kubectl port-forward service/redis-service -n shohoros 6379:6379
```

## 6. Inspect and stop port-forwards

List port-forward processes:

``` bash
pgrep -af 'kubectl port-forward'
```

Check listening local ports:

``` bash
ss -ltnp | grep -E ':5000|:5540|:27017|:6379'
```

Stop all port-forward processes:

``` bash
pkill -f '[k]ubectl port-forward'
```

## 7. Recreate the cluster

> This deletes the Kind cluster and its Kubernetes resources.

``` bash
kind delete cluster --name forid-cluster
kind create cluster --name forid-cluster --config cluster/kind-cluster.yaml
```

After recreating the cluster, load the backend image and apply the
Kubernetes manifests again.

------------------------------------------------------------------------

**Maintenance note:** This README documents the current setup only.
Update it as production deployment, ingress, TLS, storage, monitoring,
backups, and other operational configurations are added.
