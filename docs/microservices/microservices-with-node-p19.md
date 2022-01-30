---
sidebar_position: 21
---

# Worker Services

![microservice-dg-217](/img/docs/microservices/microservices-dg-217.png)
![microservice-dg-218](/img/docs/microservices/microservices-dg-218.png)

## Expiration Options

![microservice-dg-219](/img/docs/microservices/microservices-dg-219.png)
![microservice-dg-220](/img/docs/microservices/microservices-dg-220.png)
![microservice-dg-221](/img/docs/microservices/microservices-dg-221.png)

## Initial Setup

expiration setup:

- Copy `.dockerignore`, `Dockerfile`, `package.json`, `tsconfig.json` from tickets service.
- copy `src/index`, `src/nats-wrapepr.ts`, `__mocks__`
- package.json update name, remove all depends (left: common, node-nats-streaming, ts-node-dev, typescript, @types/jest, jest, ts-jest)
- npm install `bull`, `@types/bull`

## Kubernetes Setup

```yml
# expiration-redis-depl.yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: expiration-redis-depl
  namespace: ingress-nginx
spec:
  replicas: 1
  selector:
    matchLabels:
      app: expiration-redis
  template:
    metadata:
      labels:
        app: expiration-redis
    spec:
      containers:
        - name: expiration-redis
          image: redis
---
apiVersion: v1
kind: Service
metadata:
  name: expiration-redis-srv
  namespace: ingress-nginx
spec:
  selector:
    app: expiration-redis
  ports:
    - name: expiration-redis
      protocol: TCP
      port: 6379
      targetPort: 6379
```

```yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: expiration-depl
  namespace: ingress-nginx
spec:
  replicas: 1
  selector:
    matchLabels:
      app: expiration
  template:
    metadata:
      labels:
        app: expiration
    spec:
      containers:
        - name: expiration
          image: ducnguyen96/ticketing-expiration
          env:
            - name: NATS_CLIENT_ID
              valueFrom:
                fieldRef:
                  fieldPath: metadata.name
            - name: NATS_URL
              value: "http://nats-srv:4222"
            - name: NATS_CLUSTER_ID
              value: ticketing
            - name: REDIS_HOST
              value: expiration-redis-srv
```

```yml
- image: ducnguyen96/ticketing-expiration
  context: expiration
  docker:
    dockerfile: Dockerfile
  sync:
    manual:
      - src: "src/**/*.ts"
        dest: .
```

## Listener Creation

```ts
// order-created-listener.ts
export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCreatedEvent["data"], msg: Message) {}
}
```

## Creating a Queue

![microservice-dg-222](/img/docs/microservices/microservices-dg-222.png)

```ts
// src/queues/expiration-queue.ts
interface Payload {
  orderId: string;
}

const expirationQueue = new Queue<Payload>("order:expiration", {
  redis: {
    host: process.env.REDIS_HOST,
  },
});

expirationQueue.process(async (job) => {
  new ExpirationCompletePublisher(natsWrapper.client).publish({
    orderId: job.data.orderId,
  });
});

export { expirationQueue };
```

## Queueing a Job on Event Arrival

```ts
// order-created-listener.ts
export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCreatedEvent["data"], msg: Message) {
    const deplay = new Date(data.expiresAt).getTime() - new Date().getTime();
    await expirationQueue.add(
      {
        orderId: data.id,
      },
      { delay },
    );

    msg.ack();
  }
}
```

## Defining The Expiration Complete Event

```ts
export interface ExpirationCompleteEvent {
  subject: Subjects.ExpirationComplete;
  data: {
    orderId: string;
  };
}
```

## Publishing an Event on Job Processing

```ts
// src/events/publishers/expiration-complete.publisher.ts
export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
}
```

## Handling An Expiration Event

```ts
export class ExpirationCompleteListener extends Listener<ExpirationCompleteEvent> {
  subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
  queueGroupName = queueGroupName;

  async onMessage(data: ExpirationCompleteEvent["data"], msg: Message) {
    const order = await Order.findById(data.orderId).populate("ticket");

    if (!order) {
      throw new Error("Order Not Found");
    }

    order.set({
      status: OrderStatus.Cancelled,
    });

    await order.save();

    await new OrderCancelledPublisher(this.client).publish({
      id: order.id,
      ticket: {
        id: order.ticket.id,
        order: order.ticket.version,
      },
    });

    msg.ack();
  }
}
```

## Expiration Complete Listener

```ts
const setup = async () => {
  const listener = new ExpirationCompleteListener(natsWrapper.client);

  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "concert",
    price: 20,
  });

  await ticket.save();

  const order = Order.build({
    status: OrderStatus.Created,
    userId: "rgdrgdzxgh",
    expiresAt: new Date(),
    ticket,
  });
  await order.save();

  const data: ExpirationCompleteEvent["data"] = {
    orderId: order.id,
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, order, ticket, data, msg };
};

it("updates the order status to cancelled", async () => {
  const { listener, order, ticket, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const updatedOrder = await Order.findById(order.id);
  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it("emit an OrderCancelled event", async () => {
  const { listener, order, ticket, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();

  const eventData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1],
  );

  expect(eventData.id).toEqual(order.id);
});

it("ack the message", async () => {
  const { listener, order, ticket, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
```
