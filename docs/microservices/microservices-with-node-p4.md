---
sidebar_position: 6
---

# Điều phối services với Kubernetes

## Installing Kubernetes

Cài đặt theo [ở đây](https://kubernetes.io/docs/tasks/tools/install-kubectl-linux/#install-using-native-package-management) nhé.

Lưu ý: Sau khi cài đặt kubectl, để chạy 1 cluster trên máy local của bạn thì ta sẽ sử dụng thêm 1 tool gọi là minikube. Bạn đọc tìm hiểu thêm ở [đây](https://minikube.sigs.k8s.io/docs/start/)

## A Quick Kubernetes Tour

![microservices-dg-66](/img/docs/microservices/microservices-dg-66.png)

## Những thuật ngữ quan trọng trong Kubernetes

![microservices-dg-67](/img/docs/microservices/microservices-dg-67.png)

- Kubernetes Cluster bao gồm một hoặc nhiều nodes (mỗi node là một máy ảo) và 1 Master để quản lý các nodes. Kubernetes ở local mặc định sẽ có 1 node.
- Mỗi node là một máy ảo chạy các containers.
- Pod tương tự như 1 container, về mặt kỹ thuật thì 1 pod có thể chạy nhiều containers nhưng ta sẽ tìm hiểu sau nhé.
- Deployment: quản lý các pods, restart chúng nếu chúng bị crash.
- Service: cung cấp một URL dễ nhớ để truy cập vào container.(chẳng hạn thay vì localhost:4001 thì URL sẽ là postservice)

## Một vài lưu ý với config files.

![microservices-dg-68](/img/docs/microservices/microservices-dg-68.png)

- Config files nói với Kubernetes về các deployments, pods và services khác nhau (chúng được xem như là các Objects) mà ta muốn tạo.

- Được viết bằng YAML syntax.
- Luôn lưu những config files này vào source code. Đây là document rất quan trọng, nó giúp cho enginner hiểu được cấu trúc dự án.
- Ta có thể tạo được Kubernetes Objects mà không cần config files - tuy nhiên thì khuyến khích là không làm như vậy. Config files cung cấp định nghĩa chính xác cho Kubernetes việc cần làm, hơn nữa thì config files như đã nói thì nó cũng là document giúp người khác hiểu hơn về project.
- Tài liệu của Kubernetes hướng dẫn bạn tạo objects bằng command - tuy nhiên thì chỉ nên làm vậy để test thôi nhé.

## Creating a Pod

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: posts
spec:
  containers:
    - name: posts
      image: ducnguyen96/mini-microservice-postservice:0.0.1
```

Trước khi apply config file hãy chắc chắn là đang chạy 1 cluster trên máy của mình nhé. Nếu chưa thì sử dụng `minikube start` để tạo 1 cluster nhé.\

Lưu ý: Khi `minikube start` bạn sẽ tạo ra 1 máy ảo trên máy local của bạn, docker images trên local sẽ không tồn tại trên con VM này. Chính vì thế bạn có 2 cách: 1 là đẩy image bạn build từ local lên 1 registry nào đấy và VM sẽ pull từ đấy về, 2 là bạn sẽ build image ngay trong VM bằng cách sử dụng command `eval $(minikube docker-env)`, sau khi chạy command này ở 1 terminal cụ thể nào đấy, bạn có thể kiểm tra bằng `docker images`. Nếu thấy kết quả trả ra khác với local thì bạn có thể build image rồi đấy. Tham khảo thêm [ở đây](https://github.com/kubernetes/minikube/blob/0c616a6b42b28a1aab8397f5a9061f8ebbd9f3d9/README.md#reusing-the-docker-daemon) nhé.

```sh
docker build -t ducnguyen96/mini-microservice-postservice:0.0.1 .
```

Kiểm tra lại với `docker images`

```sh
kubectl apply -f posts.yaml
```

![microservices-dg-70](/img/docs/microservices/microservices-dg-70.png)

## Understanding a Pod Spec

![microservices-dg-69](/img/docs/microservices/microservices-dg-69.png)
K8s có tính mở rộng cực kỳ cao, ta có thể tạo các Custom Objects.

- apiVersion: Phiên bản Kubernetes API mà chúng ta sẽ sử dụng để tạo object
- kind: loại object
- metadata: một số config options cho object, chẳng hạn name của Pod là posts.
- spec: các thuộc tính của object mà ta sẽ tạo.
- containers: 1 array các containers, mỗi container bắt đầu bằng -.

Ở đây ta thấy tên pod và tên container trùng nhau, liệu có ảnh hưởng gì không, có phải bad practice không ?. Như bạn thấy thì Pod này chỉ có 1 container duy nhất là posts nên về mặt ngữ nghĩa thì cũng khá chính xác khi đặt tên pod trùng với tên container, tuy nhiên lúc pod có nhiều containers thì bạn có thể thay đổi tên pod cho hợp lý hơn, việc này cũng không ảnh hưởng gì nhiều (không gây lỗi.)

Một lưu ý với container image: nếu kubernetes không thấy image ở local thì nó sẽ mặc định tìm image ở Docker Hub, và nếu bạn không cung cấp version (0.0.1) thì mặc định nó sẽ pull image với tag lastest.

## Common Kubectl Commands

![microservices-dg-71](/img/docs/microservices/microservices-dg-71.png)

## Introducing Deployments

![microservices-dg-72](/img/docs/microservices/microservices-dg-72.png)
Deployment là một object được tạo ra để quản lý các Pod. Deployment có 2 nhiệm vụ chính:

- Nếu có 1 pod bỗng nhiên bị crash thì deployment sẽ tự động tạo lại pod đó.
- Chịu trách nhiệm update các phiên bản image mới hơn cho từng pod.

## Createing A Deployments

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: posts-depl
spec:
  replicas: 1
  selector:
    matchLabels:
      app: posts
  template:
    metadata:
      labels:
        app: posts
    spec:
      containers:
        - name: posts
          image: ducnguyen96/mini-microservice-postservice:0.0.1
```

- selector: Nhìn vào tất cả pods, tìm pods nào có label của app là posts và quản lý chúng.
- template: config pod
- spec: pod spec

## Common Commands Around Deployments

```sh
# List all the running deployments
kubectl get deployments
```

```sh
# Print out details about a specific deployment
kubectl describe deployment [depl name]
```

```sh
# Create a deployment out of a config file
kubectl apply f- [config file name]
```

```sh
# Delete a deployment
kubectl delete deployment [depl name]
```

## Networking With Services

![microservices-dg-74](/img/docs/microservices/microservices-dg-74.png)
Để các pod có thể giao tiếp với nhau và bên ngoài có thể giao tiếp với pod thì kubernetes cung cấp cho ta 1 loại object để thực hiện việc này - service.

Có một số loại services sau đây:
![microservices-dg-75](/img/docs/microservices/microservices-dg-75.png)

- Cluster IP: truy cập vào pods trong cùng 1 cluster.
- Node Port: truy cập vào pod từ bên ngoài, thường sử dụng cho dev env.
- Load Balancer: truy cập vào pod từ bên ngoài.
- External Name: thường rất được sử dụng cho 1 vài trường hợp đặc biệt.

## Creating A NodePort Service

```yml
# posts-srv.yml
apiVersion: v1
kind: Service
metadata:
  name: posts-srv
spec:
  type: NodePort
  selector:
    app: posts
  ports:
    - name: posts
      protocol: TCP
      port: 4000
      targetPort: 4000
```

Ở phần trên ta đã tạo 1 Deployment với metadata chứa labels: `app: posts`. Giờ ta muốn expose những pod của delpoyment đó ra ngoài để có thể access từ browser, thì service mới tạo này có selector là `app: posts` nó sẽ tìm tất cả các pod có label này để áp dụng config.

![microservices-dg-76](/img/docs/microservices/microservices-dg-76.png)
Theo hình trên ta có thể thấy, Node là một máy ảo đang chạy các kubernetes objects là NodePort Service và Pod. Pod của chúng ta đang chạy image của post service, nó dang listen ở cổng 4000. NodePort Service là 1 object riêng giúp ta giao tiếp với Pod, và nó cũng có 1 port riêng

Để giao tiếp được với pod thì trước tiên ta phải qua Node sau đó đến NodePort service. Để xem địa chỉ ip của Node minikube ta sẽ inspect container minikube.

![microservices-dg-77](/img/docs/microservices/microservices-dg-77.png)

```sh
docker inspect 0d8db750f273
```

![microservices-dg-78](/img/docs/microservices/microservices-dg-78.png)

Kéo xuống phần network ta có thể thấy được địa chỉ ip của minikube.

![microservices-dg-79](/img/docs/microservices/microservices-dg-79.png)
Vậy giờ ta có thể giao tiếp được với pod posts qua `192.168.49.2:31331`
![microservices-dg-80](/img/docs/microservices/microservices-dg-80.png)

## Setting Up Cluster IP Services

Mục đích của Cluster IP là expose 1 pod đến những pods khác trong cùng 1 cluster. Trước hết ta hãy xem lại cách app của chúng ta hoạt động đã nhá.

Khi người dùng muốn tạo post, ta sẽ emit 1 event đến event bus, sau đấy thì event sẽ emit event đó đến toàn bộ pods kể cả post để tạo post.

Về mặt kỹ thuật thì các pod có thể giao tiếp trực tiếp với nhau nhưng chúng sẽ có ip ngẫu nhiên và khó nhớ, có thể thay đổi sau những lần update. Vì thế các pod sẽ giao tiếp với nhau qua cluster ip.

### Building A Deployment and ClusterIP For The Event Bus

```yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: event-bus-depl
spec:
  replicas: 1
  selector:
    matchLabels:
      app: event-bus
  template:
    metadata:
      labels:
        app: event-bus
    spec:
      containers:
        - name: event-bus
          image: ducnguyen96/mini-microservice-eventbus:0.0.1
---
apiVersion: v1
kind: Service
metadata:
  name: event-bus-srv
spec:
  type: ClusterIP
  selector:
    app: event-bus
  ports:
    - name: event-bus
      protocol: TCP
      port: 4005
      targetPort: 4005
```

```sh
kubectl apply -f event-bus-depl.yml
```

Ta có thể tách từng file riêng cho từng kebernetes objects, tuy nhiên ở đây mình prefer gộp lại là 1 hơn.

Tương tự thì ta cũng thêm ClusterIP cho postservice

```yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: posts-depl
spec:
  replicas: 1
  selector:
    matchLabels:
      app: posts
  template:
    metadata:
      labels:
        app: posts
    spec:
      containers:
        - name: posts
          image: ducnguyen96/mini-microservice-postservice:0.0.1
---
apiVersion: v1
kind: Service
metadata:
  name: posts-clusterip-srv
spec:
  type: ClusterIP
  selector:
    app: posts
  ports:
    - name: posts
      protocol: TCP
      port: 4000
      targetPort: 4000
```

## Communicate Between Services

Mặc dù minikube đang chạy trên máy local nhưng các pod trong minikube thì không thể giao tiếp với nhau qua localhost, hiện tại ta đã tạo ClusterIP cho postservice và eventbus, 2 pod này có thể giao tiếp với nhau qua ClusterIP, vậy ta phải thay đổi địa chỉ IP của chúng như sau:
![microservices-dg-81](/img/docs/microservices/microservices-dg-81.png)
Post muốn gửi request đến eventbus (port 4005) thay vì `localhost:4005` thì ta thay bằng `http://event-bus-srv:4005`

## Load Balancer Services

![microservices-dg-82](/img/docs/microservices/microservices-dg-82.png)
Ở Initial load page, với client-side-rendering app như create-react-app thì server chỉ trả về HTML + JS + CSS chưa kèm data, nên chúng ta chưa cần quan tâm đến việc giao tiếp giữa client và các services khác.

Tuy nhiên, khi đã load được html + js rồi, user requests posts thì lúc này ta cần giao tiếp giữa react-app và các services khác như posts, comments. Ta có 2 cách giải quyết như sau:

![microservices-dg-83](/img/docs/microservices/microservices-dg-83.png)
Cách đầu tiên như ở phía trên đã có ví dụ về posts, mỗi pod sẽ được gắn với 1 node port riêng và với từng request thì react-app sẽ gửi đến từng port khác nhau. Tuy nhiên như bạn đang nghĩ đấy, với mỗi nodeport thì kubernetes sẽ random gán với 1 port, sẽ thế nào nếu 1 lúc nào đó port này bị đổi ? bạn sẽ phải đến react-app code và thay đổi từng request một.

![microservices-dg-84](/img/docs/microservices/microservices-dg-84.png)
Cách thứ 2 là sử dụng load balancer - chủ đề của phần này. Ta sẽ có 1 endpoint duy nhất để react-app kết nối đến và balancer này sẽ map từng request đến từng pod cần thiết.

### Load Balancers and Ingress

![microservices-dg-85](/img/docs/microservices/microservices-dg-85.png)

- Hiểu một cách đơn giản thì Load Balancer giúp route request từ bên ngoài đến cluster.
- Ingress là pod trong kubernetes nhận request từ loadbalancer và route đến từng pod cụ thể.

### ingress-nginx

```bash
minikube addons enable ingress
```

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
    - host: posts.com
      http:
        paths:
          - path: /posts/create
            pathType: Prefix
            backend:
              service:
                name: posts-clusterip-srv
                port:
                  number: 4000
          - path: /posts
            pathType: Prefix
            backend:
              service:
                name: query-clusterip-srv
                port:
                  number: 4002
          - path: posts/?(.*)/comments
            pathType: Prefix
            backend:
              service:
                name: comment-clusterip-srv
                port:
                  number: 4001
          - path: /?(.*)
            pathType: Prefix
            backend:
              service:
                name: client-clusterip-srv
                port:
                  number: 3000
```

Finish Route Config. Lưu ý thì ingress-nginx không có rules để phân biệt request methods: POST, GET, vì vậy ta phải có unique path.
![microservices-dg-86](/img/docs/microservices/microservices-dg-86.png)

Sau khi đã config xong toàn bộ, ta apply config:

```bash
kubectl apply -f ../k8s -n=ingress-nginx
```

Lấy ip của ingress

```bash
kubectl get ingress -n=ingress-nginx
```

![microservices-dg-87](/img/docs/microservices/microservices-dg-87.png)

Update ip vào hosts file `/etc/hosts`

```bash
sudo nano /etc/hosts
```

![microservices-dg-88](/img/docs/microservices/microservices-dg-88.png)

Vậy là app của ta được deploy và chạy ngon lành rồi 💓. Tuy nhiên quá trình development thì trải nghiệm không được tốt, vì mỗi lần update code ta lại phải build image rồi sửa config file xong mới deploy để test kết quả.

Để giải quyết vấn đề này thì sinh ra 1 tool là `Skaffold`.

## Skaffold

### Installation

```sh
curl -Lo skaffold https://storage.googleapis.com/skaffold/releases/latest/skaffold-linux-amd64 && \
sudo install skaffold /usr/local/bin/
```

Config Skaffold

```yml
apiVersion: skaffold/v2beta21
kind: Config
deploy:
  kubectl:
    manifests:
      - ./infa/k8s/*
build:
  local:
    push: false
  artifacts:
    - image: ducnguyen96/mini-microservice-client
      context: client
      docker:
        dockerfile: Dockerfile
      sync:
        manual:
          - src: "src/**/*.js"
            dest: .
    - image: ducnguyen96/mini-microservice-commentservice
      context: comments
      docker:
        dockerfile: Dockerfile
      sync:
        manual:
          - src: "src/**/*.js"
            dest: .
    - image: ducnguyen96/mini-microservice-eventbus
      context: events
      docker:
        dockerfile: Dockerfile
      sync:
        manual:
          - src: "src/**/*.js"
            dest: .
    - image: ducnguyen96/mini-microservice-moderationservice
      context: moderation
      docker:
        dockerfile: Dockerfile
      sync:
        manual:
          - src: "src/**/*.js"
            dest: .
    - image: ducnguyen96/mini-microservice-postservice
      context: posts
      docker:
        dockerfile: Dockerfile
      sync:
        manual:
          - src: "src/**/*.js"
            dest: .
    - image: ducnguyen96/mini-microservice-queryservice
      context: query
      docker:
        dockerfile: Dockerfile
      sync:
        manual:
          - src: "src/**/*.js"
            dest: .
```
