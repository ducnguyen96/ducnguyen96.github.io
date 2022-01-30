---
sidebar_position: 12
---

# Integrating a Server-Side-Rendered React App

## Reminder on Server Side Rendering

![microservice-dg-120](/img/docs/microservices/microservices-dg-120.png)
![microservice-dg-121](/img/docs/microservices/microservices-dg-121.png)

## Basics of Next JS

```sh
npm install react react-dom next
```

## Building a Next Image

```Dockerfile
FROM node:alpine

WORKDIR /app
COPY package.json .
RUN npm install
COPY . .

CMD ["npm", "run", "dev"]
```

```Dockerfile
# .dockerignore
node_modules
.next
```

```sh
docker build -t ducnguyen96/ticketing-client .
```

## Running Next in Kubernetes

client-depl.yml

```yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: client-depl
  namespace: ingress-nginx
spec:
  replicas: 1
  selector:
    matchLabels:
      app: client
  template:
    metadata:
      labels:
        app: client
    spec:
      containers:
        - name: client
          image: ducnguyen96/ticketing-client
---
apiVersion: v1
kind: Service
metadata:
  name: client-srv
  namespace: ingress-nginx
spec:
  selector:
    app: client
  ports:
    - name: client
      protocol: TCP
      port: 3000
      targetPort: 3000
```

skaffold.yml

```yml
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
    - image: ducnguyen96/ticketing-client
      context: client
      docker:
        dockerfile: Dockerfile
      sync:
        manual:
          - src: "**/*.js"
            dest: .
```

ingress-srv.yml

```yml
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
          - path: /?(.*)
            pathType: Prefix
            backend:
              service:
                name: client-srv
                port:
                  number: 3000
```

## React App CatchUp

Xem toàn bộ client code [ở đây](https://github.com/ducnguyen96/ticketing-microservice-with-nodejs-example/tree/master/client)
