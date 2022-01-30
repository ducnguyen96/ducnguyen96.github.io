---
sidebar_position: 19
---

# Understanding Event Flow

## Creating the Events

```ts
// common/src/events/subjects.ts
export enum Subjects {
  TicketCreated = "ticket:created",
  TicketUpdated = "ticket:updated",

  OrderCreated = "order:created",
  OrderCancelled = "order:cancelled",
}
```

![microservice-dg-206](/img/docs/microservices/microservices-dg-206.png)

```ts
// order-created-event.ts
export interface OrderCreatedEvent {
  subject: Subjects.OrderCreated;
  data: {
    id: string;
    status: OrderStatus;
    userId: string;
    expiresAt: string;
    ticket: {
      id: string;
      price: number;
    };
  };
}
```

![microservice-dg-207](/img/docs/microservices/microservices-dg-207.png)

```ts
// order-cancelled-event.ts
export interface OrderCancelledEvent {
  subject: Subjects.OrderCancelled;
  data: {
    id: string;
    ticket: {
      id: string;
    };
  };
}
```

```ts
// index.ts
export * from "./events/order-created-event";
export * from "./events/order-cancelled-event";
```

```sh
npm run pub
```

## Implementing The Publishers

```ts
// orders/src/events/publishers/order-created-publisher.ts
export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
}

// orders/src/events/publishers/order-cancelled-publisher.ts
export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
}
```

## Publishing The Order Creation

```ts
// create.ts
// Publish an event saying that an order was created
new OrderCreatedPublisher(natsWrapper.client).publish({
  id: order.id,
  status: order.status,
  userId: order.userId,
  expiresAt: order.expiresAt.toISOString(),
  ticket: {
    id: ticket.id,
    price: ticket.price,
  },
});
```

## Publishing Order Cancellation

```ts
// delete.ts
// Publish an event saying that an order was cancelled
new OrderCancelledPublisher(natsWrapper.client).publish({
  id: order.id,
  ticket: {
    id: order.ticket.id,
  },
});
```

## Testing Event Publishing

```ts
// create.test.ts
it("emits an order created event", async () => {
  const ticket = Ticket.build({ title: "concert", price: 20 });
  await ticket.save();

  await request(app)
    .post("/api/orders")
    .set("Cookie", global.signin())
    .send({ ticketId: ticket.id })
    .expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
```

```ts
// delete.test.ts
it("emits an order cancelled event", async () => {
  const ticket = Ticket.build({ title: "concert", price: 20 });
  await ticket.save();

  const user = global.signin();

  // make a request to create an order

  const { body: order } = await request(app)
    .post("/api/orders")
    .set("Cookie", global.signin())
    .send({ ticketId: ticket.id })
    .expect(201);

  // make a request to cancel the order
  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set("Cookie", user)
    .send()
    .expect(204);

  expect(natsWrapper.client.publish).toHaveBeenCalled();

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
```
