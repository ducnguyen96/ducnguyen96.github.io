---
sidebar_position: 15
---

# NATS Streaming Server - An Event Bus Implementation

![microservice-dg-148](/img/docs/microservices/microservices-dg-148.png)

## Creating a NATS Streaming Deployment

```yml
# nats-depl.yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nats-depl
  namespace: ingress-nginx
spec:
  replicas: 1
  selector:
    matchLabels:
      app: nats
  template:
    metadata:
      labels:
        app: nats
    spec:
      containers:
        - name: nats
          image: nats-streaming:0.22.1
          args:
            [
              "-p",
              "4222",
              "-m",
              "8222",
              "-hbi",
              "5s",
              "-hbt",
              "5s",
              "-hbf",
              "2",
              "-SD",
              "-cid",
              "ticketing",
            ]
---
apiVersion: v1
kind: Service
metadata:
  name: nats-srv
  namespace: ingress-nginx
spec:
  selector:
    app: nats
  ports:
    - name: client
      protocol: TCP
      port: 4222
      targetPort: 4222
    - name: minitoring
      protocol: TCP
      port: 8222
      targetPort: 8222
```

## Big Notes on NATS Streaming

EventBus service hiện tại của chúng ta sử dụng express + axios
![microservice-dg-149](/img/docs/microservices/microservices-dg-149.png)

Để giao tiếp với NATS thì ta sẽ sử dụng node-nats-steaming
![microservice-dg-150](/img/docs/microservices/microservices-dg-150.png)

Để nhận được event từ eventbus thì service cần phải subscribe tới NATS
![microservice-dg-151](/img/docs/microservices/microservices-dg-151.png)

EventBus service hiện tại của chúng ta lưu vào bộ nhớ và sẽ mất khi reset service
![microservice-dg-152](/img/docs/microservices/microservices-dg-152.png)

NATS Streaming lưu tất cả events vào memory (mặc định) hoặc vào files, MySQL/PostGres DB
![microservice-dg-153](/img/docs/microservices/microservices-dg-153.png)

## Building a NATS Test Project

![microservice-dg-154](/img/docs/microservices/microservices-dg-154.png)

```sh
npm init -y
npm i node-nats-streaming ts-node-dev typescript @types/node
```

```ts
// src/publisher.ts

// src/listener.ts
```

Update package scripts

```json
// package.json
{
  "scripts": {
    "publish": "ts-node-dev --rs --notify false src/publisher.ts",
    "listen": "ts-node-dev --rs --notify false src/listen.ts"
  }
}
```

Create tsconfig

```sh
tsc --init
```

Update publisher code

```ts
// publisher.ts
import nats from "node-nats-streaming";

const stan = nats.connect("ticketing", "abc", {
  url: "http://localhost:4222",
});

stan.on("connect", () => {
  console.log("Publisher connected to NATS");
});
```

## Port-Forwarding with Kubectl

Có một số cách như sau:
![microservice-dg-155](/img/docs/microservices/microservices-dg-155.png)
Cách này chắc chắn hoạt động được nhưng hiện tại ta đang muốn thử cho publisher mất connect và connect tới nats liên tục nên cách này yêu cầu config files khá mất thời gian
![microservice-dg-156](/img/docs/microservices/microservices-dg-156.png)
Cách này tương tự cách trên
![microservice-dg-157](/img/docs/microservices/microservices-dg-157.png)

```sh
kubectl port-forward nats-depl-*** 4222:4222
```

## Publishing Events

```ts
// publisher.ts
stan.on("connect", () => {
  console.log("Publisher connected to NATS");

  // NATS chỉ có thể transport string
  const data = JSON.stringify({
    id: "123",
    title: "concert",
    price: 20,
  });

  stan.publish("ticket:created", data, () => {
    console.log("Event published");
  });
});
```

```sh
npm run publish
```

## Listening For Data

```ts
// listener.ts
import nats from "node-nats-streaming";

const stan = nats.connect("ticketing", "123", {
  url: "http://localhost:4222",
});

stan.on("connect", () => {
  console.log("Listener connected to NATS");

  const subscription = stan.subscribe("ticket:created");

  subscription.on("message", (msg: Message) => {
    const data = msg.getData();

    if (typeof data === "string") {
      console.log(`Received event #${msg.getSequence()}, with data: ${data}`);
    }
  });
});
```

```sh
npm run listen
```

## Client ID Generation

![microservice-dg-158](/img/docs/microservices/microservices-dg-158.png)

```ts
const stan = nats.connect("ticketing", randomBytes(4).toString("hex"), {
  url: "http://localhost:4222",
});
```

## Queue Groups

Ta nhận thấy là nếu 2 client đều cùng subscribe tới 1 channel thì chúng đều nhận được chung 1 message, vậy sẽ như sao nếu service của chúng ta muốn tăng số instance vì có nhiều traffic đổ về ? ta sẽ giải quyết trường hợp này với queue group
![microservice-dg-159](/img/docs/microservices/microservices-dg-159.png)

```ts
const subscription = stan.subscribe(
  "ticket:created",
  "order-service-queue-group",
);
```

## Manual Ack Mode

![microservice-dg-160](/img/docs/microservices/microservices-dg-160.png)
Trường hợp có 1 event rất quan trọng được truyền tới (chẳng hạn như tạo thanh toán), nếu service này cứ mặc định là event đã nhận được rồi và đang xử lý, hãy tiếp tục làm việc khác đi; trường hợp tác vụ liên quan đến event này lỗi thì chưa thanh toán thành công app đã ship hàng rồi.

Để giải quyết vấn đề này thì ta phải xác minh cái event này một cách thủ công ==> manual acknowlegment.

Nếu ta không ack cái event này thì 1 nó sẽ được chuyển tới 1 listener khác trong queue group, trường hợp chỉ có 1 listener trong queueGroup thì nó sẽ chờ mặc định 25s và gửi lại đến listener này.

```ts
stan.on("connect", () => {
  console.log("Listener connected to NATS");
  const options = stan.subscriptionOptions().setManualAckMode(true);

  const subscription = stan.subscribe(
    "ticket:created",
    "order-service-queue-group",
    options,
  );
});
```

Để ack một message

```ts
msg.ack();
```

## Client Health Checks

```sh
kubectl port-forward nats-depl-**** 8222:8222
localhost:8222/streaming/channelsz/?subs=1
```

Mặc định nếu 1 client shutdown thì nats sẽ nghĩ là client ấy chỉ shutdown tạm thời và sẽ chờ 1 khoảng thời gian, sau 1 khoảng thời gian ấy không thấy connect lại thì nats sẽ loại client ấy ra khỏi danh sách subscriptions

## Graceful Client Shutdown

```ts
stan.on("connect", () => {
  stan.on("close", () => {
    console.log("NATS connection closed !");
    process.exit();
  });

  process.on("SIGINT", () => stan.close());
  process.on("SIGTERM", () => stan.close());
});
```

## Core Concurrency Issues

![microservice-dg-161](/img/docs/microservices/microservices-dg-161.png)

1.  Trường hợp lý tưởng: mỗi lần 1 event. Mọi thứ đều diễn ra như ý muốn.
    ![microservice-dg-162](/img/docs/microservices/microservices-dg-162.png)
2.  Trường hợp listener có thể fail khi xử lý 1 event:

- Nạp 40 thành công
- Nạp 70 đô thất bại ==> NATS chờ 30s để nạp lại.
- Rút 100 ==> lỗi

3. Trường hợp 1 listener có thể xử lý nhanh hơn listener khác.
   ![microservice-dg-163](/img/docs/microservices/microservices-dg-163.png)

- Nạp 40 thành công
- Nạp 70 đang chờ xử lý
- Rút 100 ==> lỗi

4. Trường hợp NATS nghĩ rằng 1 client có thể còn đang alive trong khi đã dead.
5. Trường hợp nhận 1 event 2 lần

- Nạp 40 thành công
- Nạp 70 thành công
- Rút 100 ==> chờ xử lý
- 30 giây sau không được ack ==> gửi lại event tới 1 listener khác
- event trước xử lý thành công ==> 10
- lỗi

## Common Questions

![microservice-dg-164](/img/docs/microservices/microservices-dg-164.png)
Concurrency Issues xảy ra với cả Sync Communication và Monolithic.

### Solution #1 - Tìm tất cả lỗi concurrency có thể xảy ra và viết code để xử lý.

- Có vô số lỗi có thể xảy ra
- Tốn thời gian ==> tiền
- Có một số trường hợp có thể bỏ qua.

### Solution #2 - Chia sẻ state giữa các services của event cuối được xử lý.

![microservice-dg-165](/img/docs/microservices/microservices-dg-165.png)
Chỉ xử lý mỗi lần 1 event ==> performance quá tồi.

### Solution #3 - Chia sẻ state giữa các services của event cuối được xử lý cùng userid

![microservice-dg-166](/img/docs/microservices/microservices-dg-166.png)

Xử lý được vấn đề của solution nhưng để nats có thể route được đúng listener thì phải thêm channels ==> không work với nats

### Solution #4 - Lưu sequence ở publisher và database.

![microservice-dg-167](/img/docs/microservices/microservices-dg-167.png)
Xử lý được toàn bộ các vấn đề của các solutions trên. Tuy nhiên chưa có cơ chế nào để lưu lại sequence khi giao tiếp giữa publisher và NATS

## Solving Concurrency Issues

![microservice-dg-168](/img/docs/microservices/microservices-dg-168.png)
Chúng ta đang work với 1 hệ thống được designed rát kém và đang mong là dựa vào NATS để xử lý vấn concurrency. ==> ta nên xem lại design.

![microservice-dg-169](/img/docs/microservices/microservices-dg-169.png)

![microservice-dg-170](/img/docs/microservices/microservices-dg-170.png)
Để xử lý được vấn đề concurrency thì serivce phải kiểm soát và chịu trách nhiệm hoàn tòan cho database mà nó xử lý, các service cần thông tin thì có thể dựa vào event để cập nhật.

![microservice-dg-171](/img/docs/microservices/microservices-dg-171.png)

![microservice-dg-172](/img/docs/microservices/microservices-dg-172.png)
Áp dụng đối với trường hợp rút và nạp tiền. Ở đây ta sẽ có transaction service chịu hòan toàn trách nhiệm cho transaction database, mỗi khi có 1 transaction mới được tạo ra ta sẽ lưu lại cùng user id, id của transaction cùng số thứ tự. Sau khi lưu xong transation sẽ update 1 event để báo cho các service khác cùng biết.

Account Service cần thông tin về transaction sẽ subsribe đến nats và nhận được các events, database của account sẽ lưu số thứ tự của transaction cuối mà nó xử lý thông tin để xử lý vấn đề concurrency.

## Concurrency Control with the Tickets App

Tương tự như đối với trường hợp rút và nạp tiền thì ta áp dụng được với tickets app như dưới đây.
![microservice-dg-173](/img/docs/microservices/microservices-dg-173.png)
Ta sẽ lưu version của ticket sau khi ticket được update.

## Event Redelivery

![microservice-dg-174](/img/docs/microservices/microservices-dg-174.png)

```ts
// listener.ts
/**
 *  get all history events
 */
options = stan.setDeliverAllAvailabel();
/**
 *  trường hợp sau khi xử lý xong 1, và account serv down, 2 và 3 gửi đến được lưu ở đây,
 *  khi service on lại thì nó sẽ chỉ query những event chưa được xử lý.
 */
.setDurableName('accounting-service'

/**
 * queue group ở đây sẽ giúp nats không xóa durable events khi service go down.
 */
stan.subscribe('ticket:created', 'queue-group-name', options)
```
