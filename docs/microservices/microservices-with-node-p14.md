---
sidebar_position: 16
---

# Connecting to NATS in Node JS

![microservice-dg-175](/img/docs/microservices/microservices-dg-175.png)

## Reusable NATS listeners

![microservice-dg-176](/img/docs/microservices/microservices-dg-176.png)

```ts
// src/events/base-listener.ts
abstract class Listener {
  abstract subject: string;
  abstract queueGroupName: string;
  private client: Stan;
  protected ackWait = 5 * 1000;

  abstract onMessage(data: any, msg: Message): void;

  constructor(client: Stan) {
    this.client = client;
  }

  subscriptionOptions() {
    return this.client
      .subscriptionOptions()
      .setDeliverAllAvailable()
      .setManualAckMode(true)
      .setAckWait(this.ackWait)
      .setDurableName(this.queueGroupName);
  }

  listen() {
    const subscription = this.client.subscribe(
      this.subject,
      this.queueGroupName,
      this.subscriptionOptions(),
    );

    subscription.on("message", (msg: Message) => {
      console.log(`Message received: ${this.subject} / ${this.queueGroupName}`);

      const parsedData = this.parseMessage(msg);
      this.onMessage(parsedData, msg);
    });
  }

  parseMessage(msg: Message) {
    const data = msg.getData();
    return typeof data === "string"
      ? JSON.parse(data)
      : JSON.parse(data.toString("utf8"));
  }
}
```

## Extending the Listener

```ts
// src/events/ticket-created-listener.ts
class TicketCreatedListener extends Listener {
  subject = "ticket:created";
  queueGroupName = "payments-service";

  onMessage(data: any, msg: Message) {
    console.log("Event data !", data);

    msg.ack();
  }
}
```

```ts
// src/listener.ts
new TicketCreatedListener(stan).listen();
```

## Leveraging Typescript for Listener Validation

![microservice-dg-178](/img/docs/microservices/microservices-dg-178.png)
![microservice-dg-179](/img/docs/microservices/microservices-dg-179.png)
![microservice-dg-180](/img/docs/microservices/microservices-dg-180.png)

```ts
// src/events/subjects.ts
export enum Subjects {
  TicketCreated = "ticket:created",
  OrderUpdated = "order:updated",
}
```

```ts
// src/events/ticket-created-event.ts
export interface TicketCreatedEvent {
  subject: Subjects.TicketCreated;
  data: {
    id: string;
    title: string;
    price: number;
  };
}
```

```ts
// src/events/base-listener.ts
interface Event {
  subject: Subjects;
  data: any;
}

export abstract class Listener<T extends Event> {
  abstract subject: T["subject"];
  abstract onMessage(data: T["data"], msg: Message): void;
}
```

```ts
// src/events/ticktet-created-listener.ts
export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  readonly subject: Subjects.TicketCreated = Subjects.TicketCreated;

  onMessage(data: TicketCreatedEvent["data"], msg: Message) {}
}
```

## Where Does this Get Used ?

![microservice-dg-181](/img/docs/microservices/microservices-dg-181.png)

## Custom Publisher

```ts
// src/events/base-publisher.ts
interface Event {
  subject: Subjects;
  data: any;
}

export abstract class Publisher<T extends Event> {
  abstract subject: T["subject"];
  private client: Stan;

  constructor(client: Stan) {
    this.client = client;
  }

  publish(data: T["data"]): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client.publish(this.subject, JSON.stringify(data), (err) => {
        if (err) {
          return reject(err);
        }
        console.log("Event published ", this.subject);
        resolve();
      });
    });
  }
}
```

```ts
// ticket-created-publisher.ts
export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated;
}
```

## Using the Custom Publisher

```ts
// src/publisher.ts
stan.on("connect", async () => {
  const publisher = new TicketCreatedPublisher(stan);
  try {
    await publisher.publish({
      id: "123",
      title: "concert",
      price: 20,
    });
  } catch (error) {
    console.error(error);
  }
});
```

## Common Event Definitions Summary

![microservice-dg-182](/img/docs/microservices/microservices-dg-182.png)
![microservice-dg-184](/img/docs/microservices/microservices-dg-184.png)

## Updating Common Module

Common Module cần `base-listener`, `base-publisher`, `subjects.ts`, `ticket-created-events.ts`, `ticket-updated-events.ts`

```ts
// index.ts
export * from "./events/base-listener";
// ....
```

Install Dependencies

```sh
npm i node-nats-streaming
```

## Restarting NATS

Để xóa đi các events cũ thì ta restart lại NATS

```sh
kubectl delete pods nats-depl-****
```
