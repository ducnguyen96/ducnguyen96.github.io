---
sidebar_position: 18
---

# Cross-Service Data Replication In Action

## The Orders Service

![microservice-dg-198](/img/docs/microservices/microservices-dg-198.png)

## Skaffolding the Orders Service

- Create Order Service
- Copy `.dockerignore`, `Dockerfile`, `tsconfig.json`, `package.json`, `package-lock.json` from tickets service
- Update package name
- Copy `app.ts`, `index.ts`, `nats-wrapper.ts`

```sh
npm install
```

Create orders-depl.yml

```yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: orders-depl
  namespace: ingress-nginx
spec:
  replicas: 1
  selector:
    matchLabels:
      app: orders
  template:
    metadata:
      labels:
        app: orders
    spec:
      containers:
        - name: orders
          image: ducnguyen96/ticketing-orders
          env:
            - name: JWT_KEY
              valueFrom:
                secretKeyRef:
                  name: jwt-secret
                  key: JWT_KEY
            - name: MONGO_URI
              value: "mongodb://orders-mongo-srv:27017/orders"
            - name: NATS_CLIENT_ID
              valueFrom:
                fieldRef:
                  fieldPath: metadata.name
            - name: NATS_URL
              value: "http://nats-srv:4222"
            - name: NATS_CLUSTER_ID
              value: ticketing
---
apiVersion: v1
kind: Service
metadata:
  name: orders-srv
  namespace: ingress-nginx
spec:
  selector:
    app: orders
  ports:
    - name: orders
      protocol: TCP
      port: 3000
      targetPort: 3000
```

Create orders-mongo-depl.yml

```yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: orders-mongo-depl
  namespace: ingress-nginx
spec:
  replicas: 1
  selector:
    matchLabels:
      app: orders-mongo
  template:
    metadata:
      labels:
        app: orders-mongo
    spec:
      containers:
        - name: orders-mongo
          image: mongo
---
apiVersion: v1
kind: Service
metadata:
  name: orders-mongo-srv
  namespace: ingress-nginx
spec:
  selector:
    app: orders-mongo
  ports:
    - name: db
      protocol: TCP
      port: 27017
      targetPort: 27017
```

Update skaffold.yml

```yml
- image: ducnguyen96/ticketing-orders
  context: orders
  docker:
    dockerfile: Dockerfile
  sync:
    manual:
      - src: "src/**/*.ts"
        dest: .
```

## Ingress Routing Rules

```yml
- path: /api/orders/?(.*)
  pathType: Prefix
  backend:
    service:
      name: orders-srv
      port:
        number: 3000
```

## Skaffolding a Few Route Handlers

![microservice-dg-199](/img/docs/microservices/microservices-dg-199.png)

Tương tự như tickets service thì ta cũng viết code cho 4 routes trên.

## Associating Orders and Tickets

Option 1:
![microservice-dg-200](/img/docs/microservices/microservices-dg-200.png)
Nhược điểm khổng lồ
![microservice-dg-201](/img/docs/microservices/microservices-dg-201.png)
![microservice-dg-202](/img/docs/microservices/microservices-dg-202.png)
Option 2:
![microservice-dg-203](/img/docs/microservices/microservices-dg-203.png)

## Order Model Setup

Ta cần 1 enum để đại diện cho status của Order, và status này sẽ được dùng ở nhiều service nên ta sẽ define nó ở common module

```ts
// common/src/events/types/order-status.ts
export enum OrderStatus {
  // When the order has been created
  // but the ticket it is trying to order has not been reserved
  Created = "created",

  // The ticket the order is trying to reserve has already
  // been reserved, or when the user has cancelled the order
  // The order expires before payment
  Cancelled = "cancelled",

  // The order has successfully reserved the ticket
  AwaitingPayment = "awaiting:payment",

  // The order has reserved the ticket and the user has
  // provided payment successfully
  Complete = "complete",
}
```

Định nghĩa cho order model.

```ts
// src/models/order.ts
import mongoose from "mongoose";

interface OrderAttrs {
  userId: string;
  status: OrderStatus;
  expiresAt: Date;
  ticket: TicketDoc;
}

interface OrderDoc extends mongoose.Document {
  userId: string;
  status: OrderStatus;
  expiresAt: Date;
  ticket: TicketDoc;
}

interface OrderModel extends mongoose.Model<OrderDoc> {
  build(attrs: OrderAttrs): OrderDoc;
}

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      require: true,
    },
    status: {
      type: String,
      require: true,
      enum: Object.values(OrderStatus),
      default: OrderStatus.Created,
    },
    expiresAt: {
      type: mongoose.Schema.Types.Date,
    },

    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ticket",
      required: true,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  },
);

orderSchema.statics.build = (attrs: OrderAttrs) => {
  return new Order(attrs);
};

const Order = mongoose.model<OrderDoc, OrderModel>("Order", orderSchema);

export { Order };
```

Định nghĩa cho ticket model

```ts
// src/models/ticket
import mongoose from "mongoose";

interface TicketAttrs {
  title: string;
  price: number;
}

interface TicketDoc extends mongoose.Document {
  title: string;
  price: number;
}

interface TicketModel extends mongoose.Model<TicketDoc> {
  build(attrs: TicketAttrs): TicketDoc;
}

const ticketSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  },
);

ticketSchema.statics.build = (attrs: TicketAttrs) => {
  return new Ticket(attrs);
};

const Ticket = mongoose.model<TicketDoc, TicketModel>("Ticket", ticketSchema);

export { Ticket };
```

## Order Creation Logic

```ts
// src/routes/create.ts
const router = express.Router();
router.post(
  "/api/orders",
  requireAuth,
  [
    body("ticketID")
      .not()
      .isEmpty()
      .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
      .withMessage("TicketID must be provided"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { ticketID } = req.body;

    // Find the ticket the user is trying to order in the database
    const ticket = await Ticket.findById(ticketID);
    if (!ticket) {
      throw new NotFoundError();
    }

    // Make sure that this ticket is not already reserved
    // Run the query to look at all orders. Find an order where the ticket
    // is the ticket we just found and the orders status is not cancelled
    // If we find and order from that means the ticket is reserved
    const isReserved = await ticket.isReserved();
    if (isReserved) {
      throw new BadRequestError("Ticket is already reserved.");
    }

    // Calculate an expiration date for this order
    const expiration = new Date();
    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECOND);

    // Build the order and save it to the database
    const order = Order.build({
      userId: req.currentUser!.id,
      status: OrderStatus.Created,
      expiresAt: expiration,
      ticket,
    });

    await order.save();

    // Publish and event saying that an order was created
    res.status(201).send(order);
  },
);

export { router as createOrderRouter };
```

## Convenience Document Methods

Add new methods to ticket model

```ts
// src/models/ticket.ts
export interface TicketDoc extends mongoose.Document {
  title: string;
  price: number;
  isReserved(): Promise<boolean>;
}

ticketSchema.methods.isReserved = async function () {
  // this === the ticket document
  const existingOrder = await Order.findOne({
    ticket: this.id,
    status: {
      $in: [
        OrderStatus.Created,
        OrderStatus.AwaitingPayment,
        OrderStatus.Complete,
      ],
    },
  });
  return !!existingOrder;
};
```

## Test Setup

Copy `test` folder và `__mocks__` folder

```ts
// create.test.ts
it("returns an error if the ticket does not exist", async () => {
  const ticketID = new mongoose.Types.ObjectId().toHexString();

  await request(app)
    .post("/api/orders")
    .set("Cookie", global.signin())
    .send({ ticketID })
    .expect(404);
});

it("returns an error if the ticket is already reserved", async () => {
  const ticket = Ticket.build({ title: "concert", price: 20 });
  await ticket.save();

  const order = Order.build({
    ticket,
    userId: "dvbgrtf",
    status: OrderStatus.Created,
    expiresAt: new Date(),
  });
  await order.save();

  await request(app)
    .post("/api/orders")
    .set("Cookie", global.signin())
    .send({ ticketID: ticket.id })
    .expect(400);
});

it("reserved a ticket", async () => {
  const ticket = Ticket.build({ title: "concert", price: 20 });
  await ticket.save();

  await request(app)
    .post("/api/orders")
    .set("Cookie", global.signin())
    .send({ ticketID: ticket.id })
    .expect(201);
});

it.todo("emits an order created event");
```

## Fetching a User's Orders

```ts
// src/routes/read.ts
router.get("/api/orders", requireAuth, async (req: Request, res: Response) => {
  const orders = await Order.find({ userId: req.currentUser!.id }).populate(
    "ticket",
  );

  res.send(orders);
});
```

## A slightly Complicated Test

```ts
// read.test.ts

const buildTicket = async () => {
  const ticket = Ticket.build({ title: "concert", price: 20 });

  await ticket.save();

  return ticket;
};

it("fetches orders for an particular user", async () => {
  // Create three tickets
  const ticketOne = await buildTicket();
  const ticketTwo = await buildTicket();
  const ticketThree = await buildTicket();

  const userOne = global.signin();
  const userTwo = global.signin();
  // Ở đây hàm signin sẽ được update 1 tí để random userId. Bạn có thể sử dụng lại logic của ticketID

  // Create one order as User #1
  await request(app)
    .post("/api/orders")
    .set("Cookie", userOne)
    .send({ ticketID: ticketOne.id })
    .expect(201);

  // Create two orders as User #2
  const { body: orderOne } = await request(app)
    .post("/api/orders")
    .set("Cookie", userTwo)
    .send({ ticketID: ticketTwo.id })
    .expect(201);
  const { body: orderTwo } = await request(app)
    .post("/api/orders")
    .set("Cookie", userOne)
    .send({ ticketID: ticketThree.id })
    .expect(201);

  // Make request to get orders for User #2
  const res = await request(app)
    .get("/api/orders")
    .set("Cookie", userTwo)
    .expect(200);

  // Make sure we only got the orders for User #2
  expect(res.body.length).toEqual(2);
  expect(res.body[0].id).toEqual(orderOne.id);
  expect(res.body[1].id).toEqual(orderTwo.id);
});
```

## Fetching Individual Order

```ts
router.get(
  "/api/orders/:id",
  requireAuth,
  async (req: Request, res: Response) => {
    const order = await Order.findById(req.params.id).populate("ticket");

    if (!order) {
      throw new NotFoundError();
    }

    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    res.send(order);
  },
);
```

Test

```ts
it("fetches the order", async () => {
  // Create a ticket
  const ticket = await buildTicket();

  const user = global.signin();
  // make a request to build an order with this ticket
  const { body: order } = await request(app)
    .post("/api/orders")
    .set("Cookie", user)
    .send({ ticketID: ticket.id })
    .expect(201);

  // make request to fetch the order
  const { body: fetchedOrder } = await request(app)
    .get(`/api/orders/${order.id}`)
    .set("Cookie", user)
    .send()
    .expect(200);

  expect(fetchedOrder.id).toEqual(order.id);
});

it("returns an error if one user tries to fetch anothers order", async () => {
  // Create a ticket
  const ticket = await buildTicket();

  const user = global.signin();
  // make a request to build an order with this ticket
  const { body: order } = await request(app)
    .post("/api/orders")
    .set("Cookie", user)
    .send({ ticketId: ticket.id })
    .expect(201);

  // make request to fetch the order
  const { body: fetchedOrder } = await request(app)
    .get(`/api/orders/${order.id}`)
    .set("Cookie", global.signin())
    .send()
    .expect(401);
});
```

## Cancelling An Order

```ts
// src/routes/delete.ts
router.delete(
  "/api/orders/:orderID",
  requireAuth,
  async (req: Request, res: Response) => {
    const { orderID } = req.params;
    const order = await Order.findById(orderID);

    if (!order) {
      throw new NotFoundError();
    }
    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }
    order.status = OrderStatus.Cancelled;
    await order.save();

    // publishing an event saying this was cancelled

    res.status(204).send(order);
  },
);
```

## Test Cancel

```ts
// delete.test.ts
it("makrs an order as cancelled", async () => {
  // create a ticket with Ticket Model
  const ticket = await buildTicket();

  const user = global.signin();
  // make a request to create an order
  const { body: order } = await request(app)
    .post("/api/orders")
    .set("Cookie", user)
    .send({ ticketID: ticket.id })
    .expect(201);

  // make a request to cancel the order
  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set("Cookie", user)
    .send()
    .expect(204);

  // expectation to make sure the thing is cancelled
  const updatedOrder = await Order.findById(order.id);

  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it.todo("emits an event saying this order was cancelled");
```
