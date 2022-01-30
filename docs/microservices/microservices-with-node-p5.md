---
sidebar_position: 7
---

# Architecture of Multi-Service Apps

## Big Tickets Items

Trước khi đi vào phân tích app tiếp theo của chúng ta, hãy cùng điểm qua một số bài học từ app trước.
![microservices-dg-89](/img/docs/microservices/microservices-dg-89.png)

- Một trong những khó khăn lớn nhất khi thực hiện kiến trúc microservice là data.
- Có nhiều cách giao tiếp giữa các services nhưng chúng ta sẽ tập trung vào async communication, vì các lợi ích nó mang lại cũng như sync communication thì dễ dàng để implement và không có gì nhiều để nói.
- Async communication giúp các service độc lập 100%. Dễ dàng xử lý downtime tạm thời.
- Docker giúp việc đóng gói service dễ dàng hơn.
- Setup Kubernetes là rất mất thời gian nhưng nó giúp quá trình deploy và scale dễ dàng hơn nhiều.

Qua mini app ở các bài trức thì ta cũng đánh giá được 1 số điểm như sau:
![microservices-dg-90](/img/docs/microservices/microservices-dg-90.png)

- Có rất nhiều code trùng lặp nhau !
- Khó hình dung ra được luồng của events giữa các services.
- Khó có thể nhớ chính xác những thuộc tính của 1 event nên có.
- Khó có thể test được luồng của event.
- Sẽ như thế nào nếu xảy ra trường hợp order của các event được emit đến eventbus không như mong muốn, chẳng hạn event create comment lại đến trước event create post,....?

![microservices-dg-91](/img/docs/microservices/microservices-dg-91.png)

## App Overview

Dưới đây là overview về app tiếp theo mà ta sẽ build
![microservices-dg-92](/img/docs/microservices/microservices-dg-92.png)
Nó có các tính năng:

- Bán ticket
- Mua ticket
- Khi có 1 user đang trong bước thanh toán ticket thì ticket sẽ bị locked 15 phút.
- Khi ticket bị locked thì user khác không thể mua đó.
- Giá của ticket có thể thay đổi nếu không bị locked.

Mockup
![microservices-dg-93](/img/docs/microservices/microservices-dg-93.png)

## Resource Types

![microservices-dg-94](/img/docs/microservices/microservices-dg-94.png)

## Service Types

![microservices-dg-95](/img/docs/microservices/microservices-dg-95.png)
Có thực sự cần tạo mỗi service riêng cho từng resource như vậy không ?

- Không. Tùy vào trường hợp sử dụng, số loại resource, business logic,... Có thể bạn sẽ gộp tickets service và orders service lại thành 1.

## Events and Architecture Design

![microservices-dg-96](/img/docs/microservices/microservices-dg-96.png)

## Auth Service Setup

![microservices-dg-97](/img/docs/microservices/microservices-dg-97.png)

```bash
mkdir auth
npm init -y
npm i typescript ts-node-dev express @types/express
sudo npm i -g typescript
tsc --init
```

```ts
// index.ts
import express from "express";
import { json } from "body-parser";

const app = express();
app.use(json());

app.listen(3000, () => {
  console.log("Listening on port 3000!");
});
```

```json
// package.json
"scripts": {
    "start": "ts-node-dev src/index.ts"
  },
```

## Auth K8s Setup

### Dockerfile

```Dockerfile
FROM node:alpine

WORKDIR /app
COPY package.json .
RUN npm install
COPY . .

CMD ["npm", "start"]
```

```bash
docker build -t ducnguyen96/ticketing-auth .
```

## K8s

```yml
# auth-depl.yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: auth-depl
  namespace: ingress-nginx
spec:
  replicas: 1
  selector:
    matchLabels:
      app: auth
  template:
    metadata:
      labels:
        app: auth
    spec:
      containers:
        - name: auth
          image: ducnguyen96/ticketing-auth
---
apiVersion: v1
kind: Service
metadata:
  name: auth-srv
  namespace: ingress-nginx
spec:
  selector:
    app: auth
  ports:
    - name: auth
      protocol: TCP
      port: 3000
      targetPort: 3000
```

## Skaffold

```yml
# skaffold.yml
apiVersion: skaffold/v2beta21
kind: Config
deploy:
  kubectl:
    manifests:
      - ./infra/k8s/*
build:
  local:
    push: false
  artifacts:
    - image: ducnguyen96/ticketing-auth
      context: auth
      docker:
        dockerfile: Dockerfile
      sync:
        manual:
          - src: "src/**/*.ts"
            dest: .
```

## Ingres-nginx setup

```yml
# ingress-srv.yml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ingress-srv
  namespace: ingress-nginx
  annotations:
    kubernetes.io/ingress.class: nginx
    nginx.ingress.kubernetes.io/use-regex: "true"
spec:
  rules:
    - host: ticketing.dev
      http:
        paths:
          - path: /api/users/?(.*)
            pathType: Prefix
            backend:
              service:
                name: auth-srv
                port:
                  number: 3000
```

## Hosts File

```bash
kubectl get ingress --all-namespaces
```

```bash
sudo nano /etc/hosts
192.168.49.2 ticketing.dev
```
