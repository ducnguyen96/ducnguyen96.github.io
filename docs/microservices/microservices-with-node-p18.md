---
sidebar_position: 20
---

# Listening For Events and Handling Concurrency Issues

## Blueprint for Listeners

```ts
// src/events/listeners/queue-group-name.ts
export const queueGroupName = "orders-service";
```

```ts
// ticket-created-listener.ts
export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated;
  queueGroupName = queueGroupName;

  onMessage(data: TicketCreatedEvent["data"], msg: Message) {}
}
```

## Simple onMessage Implementation

```ts
export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: TicketCreatedEvent["data"], msg: Message) {
    const { title, price } = data;
    const ticket = Ticket.build({
      title,
      price,
    });
    await ticket.save();

    msg.ack();
  }

```

Với cách tiếp cận này thì ticket được tạo mới trong order service sẽ có id khác với id của ticket được tạo trong ticket service, vậy ta sẽ phải update lại code của hàm build.

```ts
ticketSchema.statics.build = (attrs: TicketAttrs) => {
  return new Ticket({
    _id: attrs.id,
    title: attrs.title,
    price: attrs.price,
  });
};

const ticket = Ticket.build({
  id,
  title,
  price,
});
```

## Ticket Updated Listener

```ts
export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
  queueGroupName = queueGroupName;

  async onMessage(data: TicketUpdatedEvent["data"], msg: Message) {
    const ticket = await Ticket.findById(data.id);

    if (!ticket) {
      throw new Error("Ticket not found");
    }

    const { title, price } = data;
    ticket.set({ title, price });
    await ticket.save();

    msg.ack();
  }
}
```

## Initializing Updated Listener Implementation

```ts
// index.ts
new TicketCreatedListener(natsWrapper.client).listen();
new TicketUpdatedListener(natsWrapper.client).listen();
```

## Clear Concurrency Issues

![microservice-dg-208](/img/docs/microservices/microservices-dg-208.png)
Ở đây ta sẽ tạo 1 script để chạy hàng trăm request liên tục liên tiếp nhau. Như ảnh minh họa thì ta sẽ expect sau hàng trăm request như vậy thì tất cả các ticket trong ticket service cũng như order service đều sẽ có price là 15. Tuy nhiên thực tế thì sẽ không như vậy (sẽ có video minh họa sau). Tất cả các ticket trong ticket service xử lý trực tiếp trên ticket service nên sẽ không gặp vấn đề gì, tuy nhiên với order service thì nó update ticket khi nhận được event `TicketUpdatedEvent`. các event này khi được thực hiện hàng trăm lần liên tục như vậy sẽ có thể dẫn tới hiện tượng order của các event không đúng nữa ==> sẽ có event update price 15 đến trước event update ticket price 10. Và đây chính là vấn đề mà ta sẽ phải giải quyết.

## Reminder On Versioning Records

![microservice-dg-209](/img/docs/microservices/microservices-dg-209.png)

## Optimistic Concurrency Control

![microservice-dg-210](/img/docs/microservices/microservices-dg-210.png)
![microservice-dg-211](/img/docs/microservices/microservices-dg-211.png)

## Mongoose Update-If-Current

```sh
npm install mongoose-update-if-current
```

```ts
interface TicketDoc extends mongoose.Document {
  title: string;
  price: number;
  version: number;
}

ticketSchema.set("versionKey", "version");
ticketSchema.plugin(updateIfCurrentPlugin);
```

## Testing OCC (Optimistic Concurrency Control)

```ts
import { Ticket } from "../ticket";
import mongoose from "mongoose";

it("implements optimistic concurrency control", async () => {
  // Create an instancee of a ticket
  const ticket = Ticket.build({
    title: "concert",
    price: 10,
    id: new mongoose.Types.ObjectId().toHexString(),
  });

  // Save the ticket to the database
  await ticket.save();

  // Fetch the ticket twice
  const first = await Ticket.findById(ticket.id);
  const second = await Ticket.findById(ticket.id);

  // Make two separate changes to the tickets we fetched
  first!.set({ price: 10 });
  second!.set({ price: 20 });

  // Save the first fetched ticket;
  await first!.save();

  // Save the second fetched ticket and expect an error;
  try {
    await second!.save();
  } catch (error) {
    return;
  }

  throw new Error("Should not reach this point");
});

it("increments the version number on multiple saves", async () => {
  // Create an instancee of a ticket
  const ticket = Ticket.build({
    title: "concert",
    price: 10,
    id: new mongoose.Types.ObjectId().toHexString(),
  });

  // Save the ticket to the database
  await ticket.save();
  expect(ticket.version).toEqual(0);

  ticket.set({ version: ticket.version + 1 });
  await ticket.save();
  expect(ticket.version).toEqual(1);

  ticket.set({ version: ticket.version + 1 });
  await ticket.save();
  expect(ticket.version).toEqual(2);
});
```

## Including Versions In Events

```ts
// common
export interface OrderCreatedEvent {
  data: {
    ticket: {
      version: number;
    };
  };
}

export interface OrderCancelledEvent {
  data: {
    ticket: {
      version: number;
    };
  };
}

export interface TicketCreatedEvent {
  data: {
    version: number;
  };
}

export interface TicketUpdatedEvent {
  data: {
    version: number;
  };
}
```

## Updateing Tickets Event Definitions

Add version to all publisher

## Applying a Version Query

```ts
const ticket = await Ticket.findOne({ id: data.id, version: data.version - 1 });
```

Vậy là sau khi update dòng code trên, khi update tickets, sẽ có các event bị sai order nhưng version không khớp nên ticket sẽ không được tìm thấy do đó service sẽ throw NotFoundError, sau 1 khoảng thời gian thì NATS sẽ emit lại event này, lúc đấy version đã được cập nhật mới nhất và update mọi thứ thành công.

## Abstracted Query Method

```ts
interface TicketModel extends mongoose.Model<TicketDoc> {
  build(attrs: TicketAttrs): TicketDoc;
  findByEvent(event: {
    id: string;
    version: number;
  }): Promise<TicketDoc | null>;
}

ticketSchema.statics.findByEvent = (event: { id: string; version: number }) => {
  return Ticket.findOne({
    _id: event.id,
    version: event.version - 1,
  });
};
```

## Versioning Without Update-If-Current

![microservice-dg-212](/img/docs/microservices/microservices-dg-212.png)

Ở trên ta đã thực hiện OCC với `mongoose-update-if-current` tuy nhiên thì với lib này ta không thể chỉnh sửa được cơ chế quản lý version của 1 Model, lib này mặc định sử dụng keyword là `__v` và tăng mỗi lần là 1.

```ts
ticketSchema.pre("save", function (done) {
  this.$where = {
    version: this.get("version") - 1,
  };
  done();
});
```

## Testing Listeners

```ts
// ticket-created-listener.test.ts
const setup = async () => {
  // create an instance of listener
  const listener = new TicketCreatedListener(natsWrapper.client);

  // create a fake data event
  const data: TicketCreatedEvent["data"] = {
    version: 0,
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "concert",
    price: 10,
    userId: new mongoose.Types.ObjectId().toHexString(),
  };

  // create a fake message object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg };
};

it("creates and saves a ticket", async () => {
  const { listener, data, msg } = await setup();

  // call the onMessage function with the data object + message object
  await listener.onMessage(data, msg);

  // write assertions to make sure a ticket was created
  const ticket = await Ticket.findById(data.id);

  expect(ticket).toBeDefined();
  expect(ticket!.title).toEqual(data.title);
  expect(ticket!.price).toEqual(data.price);
});

it("acks the message", async () => {
  const { listener, data, msg } = await setup();

  // call the onMessage function with the data object + message object
  await listener.onMessage(data, msg);

  // write assertions to make sure ack function was called
  expect(msg.ack).toHaveBeenCalled();
});
```

## Testing the Ticket Updated Listener

```ts
// ticket-updated-listener.test.ts
const setup = async () => {
  // create an instance of listener
  const listener = new TicketUpdatedListener(natsWrapper.client);

  // create and save a tikcet
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "conert",
    price: 20,
  });
  await ticket.save();

  // create a fake data object
  const data: TicketCreatedEvent["data"] = {
    version: ticket.version + 1,
    id: ticket.id,
    title: "concert updated",
    price: 999,
    userId: new mongoose.Types.ObjectId().toHexString(),
  };

  // create a fake msg object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  // return all of this stuff
  return { msg, data, ticket, listener };
};

it("finds, updates, and saves a ticket", async () => {
  const { msg, data, ticket, listener } = await setup();

  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);
  expect(updatedTicket!.title).toEqual(data.title);
  expect(updatedTicket!.price).toEqual(data.price);
  expect(updatedTicket!.version).toEqual(data.version);
});

it("acks the message", async () => {
  const { msg, data, ticket, listener } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});

it("does not call ack if the event has a skipped version number", async () => {
  const { msg, data, ticket, listener } = await setup();

  data.version = 10;
  try {
    await listener.onMessage(data, msg);
  } catch (error) {}

  expect(msg.ack).not.toHaveBeenCalled();
});
```

## Locking a Ticket

![microservice-dg-213](/img/docs/microservices/microservices-dg-213.png)
![microservice-dg-214](/img/docs/microservices/microservices-dg-214.png)

```ts
interface TicketDoc extends mongoose.Document {
  title: string;
  price: number;
  id: string;
  version: number;
  orderId?: string;
}

const ticketSchema = new mongoose.Schema {
  orderId: {
    type: String
  }
}
```

## Listeners In The Tickets Service

```ts
// order-created-listener.ts
import {
  Listener,
  OrderCreatedEvent,
  Subjects,
} from "@ducnguyen96/ticketing-common";
import { Ticket } from "../../models/ticket";
import { queueGroupName } from "./queue-group-name";
import { Message } from "node-nats-streaming";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCreatedEvent["data"], msg: Message) {
    // Find the ticket that the order is reserving
    const ticket = await Ticket.findById(data.ticket.id);

    // If no ticket, throw error
    if (!ticket) {
      throw new Error("Ticket not found");
    }

    // Mark the ticket as beingg reserved by setting its orderId property
    ticket.set({ orderId: data.id });

    // Save the ticket
    await ticket.save();

    // Ack the message
    msg.ack();
  }
}
```

## Testing Reservation

```ts
// tickets/src/events/listeners/__test__/order-created-listener.test.ts
const setup = async () => {
  // Create an instance of the listener
  const listener = new OrderCreatedListener(natsWrapper.client);

  // Create and save a ticket
  const ticket = Ticket.build({
    title: 'concert',
    price: 20,
    userId: 'frgrdg'
  })
  await ticket.save()

  // Create the fake data event
  const data: OrderCreatedEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString();
    version: 0,
    status: OrderStatus.OrderCreated,
    userId: 'frgrdg',
    expiresAt: 'gdrgdyhf',
    ticket: {
      id: ticket.id,
      price: ticket.price
    }
  }

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn()
  }
  return { listener, ticket, data, msg };
}
it('sets the userId of the ticket', async () => {
  const { listener, ticket, data, msg } = await setup()

  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket!.orderId).toEqual(data.id);
})

it('acks the message', async () => {
  const { listener, ticket, data, msg } = await setup()
  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled()
})
```

## Missing Update Event

![microservice-dg-215](/img/docs/microservices/microservices-dg-215.png)

## Private vs Protected Properties

![microservice-dg-216](/img/docs/microservices/microservices-dg-216.png)

Hiện tại đây là cách xử lý của chúng ta để có thể truyền client đến publisher.

Ta thấy Listener vốn dĩ là thừa kế client từ Base Class, tuy nhiên do mark thuộc tính client là private nên ta không thể truy cập được thuộc tính này dẫn tới việc phải tạo ra 1 NatsWrapper và truyền cho Listener.

Để giải quyết việc này thì ta chỉ cần thay đổi private thành protected để custom Listener có thể truy cập được thuộc tính này của Base Class.

```ts
// order-created-listener.ts
await new TicketUpdatedPublisher(this.client).publish({
  id: ticket.id,
  title: ticket.title,
  price: ticket.price,
  userId: ticket.userId,
  version: ticket.version,
  orderId: ticket.orderId,
});
```

## Mock Function Arguments

```ts
it('publishes a ticket updated event', async ( => {
  const { listener, ticket, data, msg } = await setup();

  await listener.onMessage(data, msg)

  expect(natsWrapper.client.publish).toHaveBeenCalled()

  console.log(natsWrapper.client.publish.mock.calls[0][1])
})
```

## Order Cancelled Listener

```ts
// tickets/src/events/listeners/order-cancelled-listener.ts
export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCancelledEvent["data"], msg: Message) {
    const ticket = await Ticket.findById(data.ticket.id);

    if (!ticket) {
      throw new Error("Ticket Not Found");
    }

    ticket.set({ orderId: undefined });
    await ticket.save();

    await new TicketUpdatedPublisher(this.client).publish({
      id: ticket.id,
      orderId: ticket.orderId,
      userId: ticket.userId,
      price: ticket.price,
      title: ticket.title,
      version: ticket.version,
    });

    msg.ack();
  }
}
```

```ts
// tickets/src/events/listeners/__test__/order-cancelled-listener.test.ts
import { Ticket } from "../../../models/ticket";
import { natsWrapper } from "../../../nats-wrapper";
import { OrderCancelledListener } from "../order-cancelled-listener";
import mongoose from "mongoose";
import { OrderCancelledEvent } from "@ducnguyen96/ticketing-common";

const setup = async () => {
  const listener = new OrderCancelledListener(natsWrapper.client);

  const orderId = new mongoose.Types.ObjectId().toHexString();
  const ticket = Ticket.build({
    title: "concert",
    price: 20,
    userId: "fgdjrg",
  });

  ticket.set({ orderId });

  await ticket.save();

  const data: OrderCancelledEvent["data"] = {
    id: orderId,
    ticket: {
      id: ticket.id,
      version: ticket.version,
    },
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { msg, data, ticket, orderId, listener };
};

it("updates the ticket, publishes an event, and acks the message", async () => {
  const { msg, data, ticket, orderId, listener } = await setup();

  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);
  expect(updatedTicket!.orderId).not.toBeDefined();
  expect(msg.ack).toHaveBeenCalled();
  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
```

## Rejecting Edits of Reserved Tickets

```ts
if (ticket.orderId) {
  throw new BadRequestError("Cannot edit a reserved ticket");
}
```
