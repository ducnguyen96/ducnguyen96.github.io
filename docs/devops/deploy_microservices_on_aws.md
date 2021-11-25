---
sidebar_position: 3
---

# Deploy microservices app trên AWS EKS

Lưu ý: bài này phục vụ mục đích test là chủ yếu, images cho app của mình public trên dockerhub nên không cần config thêm về registry, credential các thứ.

## 1. Install the AWS CLI version 2 on Linux

Xem thêm tại [đây](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2-linux.html#cliv2-linux-install)

```bash
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
```

## 2. Config AWS CLI

Truy cập vào [IAM](https://console.aws.amazon.com/iamv2/home?#/users) thêm permissions và tạo credentials ở tab `Security Credentials`.

`nano ~/.aws/credentials`

```bash
[default]
region=ap-southeast-1
aws_access_key_id=your-access-key-id
aws_secret_access_key=your-secret
```

## 3. Install eksctl

Tải bản build sẵn ở [đây](https://github.com/weaveworks/eksctl/releases)

Unpack và move file bin tới `/usr/local/bin`

## 4. Tạo cluster với eksctl

Ở đây mình dùng `t3.small` vì `t2.micro` quá yếu, không đủ RAM để chạy.

```yaml
# eksctl-cluster.yaml
apiVersion: eksctl.io/v1alpha5
kind: ClusterConfig

metadata:
  name: ducnguyen96
  region: ap-southeast-1
  version: "1.21"

nodeGroups:
  - name: linux-nodes
    labels:
      role: workers
    instanceType: t3.small
    desiredCapacity: 2
```

Tạo cluster với `eksctl`

```bash
eks create cluster -f eksctl-cluster.yaml
```

Lưu ý: quá trình tạo cluster diễn ra khá là lâu (rất lâu 😢) khoảng 20-30 phút gì đấy, nếu không báo lỗi thì chịu khó đợi nhé.

Tiếp theo ta sẽ dùng 1 công cụ (helm) để cài `ingress-controller`

## 5. Cài đặt helm

Lưu ý: nên tải helm v3++ để cài ingress nginx

- Tải bản built ở [đây](https://github.com/helm/helm/releases)
- Unpack và move file bin tới `/usr/local/bin`

Chi tiết xem thêm ở [đây](https://helm.sh/docs/intro/install/)

## 6. Cài đặt ingress controller với helm

```bash
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update
```

Config ingress qua file `values.yaml` ở [đây](https://github.com/kubernetes/ingress-nginx/blob/main/charts/ingress-nginx/values.yaml)

Sau khi config xong thì cài đặt controller thôi 😄

```bash
helm install sample-ingress ingress-nginx/ingress-nginx -f values.yaml
```

## 7. Deploy microservices app

```bash
k8s/
├─ api-gateway-depl.yaml
├─ api-gateway-postgres-depl.yaml
├─ user-depl.yaml
├─ user-postgres-depl.yaml
```

Demo của mình tạm thời có 4 deployments chứa 1 `api-gateway` và 1 service `user`, cả 2 đều có sử dụng database riêng là postgres database.

```bash
kubectl apply -f k8s
```

## 8. Sau khi có controller thi thêm ingress cho app của mình thôi 😃

```yaml
# ingress-srv.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ingress-srv
  annotations:
    kubernetes.io/ingress.class: nginx
    nginx.ingress.kubernetes.io/use-regex: "true"
    # cert-manager.io/issuer: "letsencrypt-cluster-issuer"
spec:
  # tls:
  #   - hosts:
  #       - ducnguyen96.xyz
  #     secretName: tls-secret
  rules:
    - host: ducnguyen96.xyz
      http:
        paths:
          - path: /graphql
            pathType: Prefix
            backend:
              service:
                name: api-gateway-srv
                port:
                  number: 3000
```

```bash
kubectl apply -f ingress-srv.yaml
```

## 9. Config DNS

Để lấy được ip của cluster thì sử dụng 1 trong 2 command dưới đây

```bash
kubectl cluster-info
```

hoặc xem ip của ingress controller

```bash
kubectl get services --all-namespaces
```

## 10. Cài đặt cert-manager

Xem thêm ở [đây](https://cert-manager.io/docs/installation/)

```bash
kubectl apply -f https://github.com/jetstack/cert-manager/releases/download/v1.5.3/cert-manager.yaml
```

## 11. Configure Let’s Encrypt Issuer

Xem thêm ở [đây](https://cert-manager.io/docs/tutorials/acme/ingress/#step-6-configure-let-s-encrypt-issuer)

```yaml
# issuer.yaml
apiVersion: cert-manager.io/v1
kind: Issuer
metadata:
  name: letsencrypt-cluster-issuer
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: your-email@email.com
    privateKeySecretRef:
      name: letsencrypt-cluster-issuer-key
    solvers:
      - http01:
          ingress:
            class: nginx
```

Tạo Issuer với kubectl

```bash
kubectl create -f issuer.yaml
```

## 12. Thêm TLS cho ingress

```yaml
# ingress-srv.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ingress-srv
  annotations:
    kubernetes.io/ingress.class: nginx
    nginx.ingress.kubernetes.io/use-regex: "true"
    cert-manager.io/issuer: "letsencrypt-cluster-issuer"
spec:
  tls:
    - hosts:
        - ducnguyen96.xyz
      secretName: tls-secret
  rules:
    - host: ducnguyen96.xyz
      http:
        paths:
          - path: /graphql
            pathType: Prefix
            backend:
              service:
                name: api-gateway-srv
                port:
                  number: 3000
```

Apply thôi

```bash
kubectl apply -f ingress-srv.yaml
```

Vậy là ta đã deploy xong 1 microservices app trêm EKS rồi 😍
