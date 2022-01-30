---
sidebar_position: 22
---

# Handling Payments

## Initial Setup

- Copy `.dockerignore`, `Dockerfile`, `package.json`, `tsconfig.json` from tickets service.
- copy `src/index.ts`,`src/app.ts`, `src/nats-wrapper.ts`, `__mocks__`, `test`
- package.json update name

```yml
# payments-depl.yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: payments-depl
  namespace: ingress-nginx
spec:
  replicas: 1
  selector:
    matchLabels:
      app: payments
  template:
    metadata:
      labels:
        app: payments
    spec:
      containers:
        - name: payments
          image: ducnguyen96/ticketing-payments
          env:
            - name: JWT_KEY
              valueFrom:
                secretKeyRef:
                  name: jwt-secret
                  key: JWT_KEY
            - name: MONGO_URI
              value: "mongodb://payments-mongo-srv:27017/payments"
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
  name: payments-srv
  namespace: ingress-nginx
spec:
  selector:
    app: payments
  ports:
    - name: payments
      protocol: TCP
      port: 3000
      targetPort: 3000
```

```yml
# payments-mongo-depl.yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: payments-mongo-depl
  namespace: ingress-nginx
spec:
  replicas: 1
  selector:
    matchLabels:
      app: payments-mongo
  template:
    metadata:
      labels:
        app: payments-mongo
    spec:
      containers:
        - name: payments-mongo
          image: mongo
---
apiVersion: v1
kind: Service
metadata:
  name: payments-mongo-srv
  namespace: ingress-nginx
spec:
  selector:
    app: payments-mongo
  ports:
    - name: db
      protocol: TCP
      port: 27017
      targetPort: 27017
```

## Replicated Fields

![microservice-dg-223](/img/docs/microservices/microservices-dg-223.png)

## Another Order Model

```ts
interface OrderAttrs {
  id: string;
  version: number;
  userId: string;
  price: number;
  status: OrderStatus;
}

interface OrderDoc extends mongoose.Document {
  version: number;
  userId: string;
  price: number;
  status: OrderStatus;
}

interface OrderModel extends mongoose.Model<OrderDoc> {
  build(attrs: OrderAttrs): OrderDoc;
}

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  },
);

orderSchema.statics.build = (attrs: OrderAttrs) => {
  return new Order({
    _id: attrs.id,
    version: attrs.version,
    price: attrs.price,
    userId: attrs.userId,
    status: attrs.status,
  });
};

orderSchema.set("versionKey", "version");

orderSchema.pre("save", function (done) {
  this.$where = {
    version: this.get("version") - 1,
  };
  done();
});

const Order = mongoose.model<OrderDoc, OrderModel>("Order", orderSchema);

export { Order };
```

## Replicating Orders

```ts
// order-created-listener.ts
export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCreatedEvent["data"], msg: Message) {
    const order = Order.build({
      id: data.id,
      price: data.ticket.price,
      status: data.status,
      userId: data.userId,
      version: data.ticket.version,
    });

    await order.save();

    // Ack the message
    msg.ack();
  }
}
```

```ts
// order-created-listener.test.ts
const setup = async () => {
  // Create an instance of the listener
  const listener = new OrderCreatedListener(natsWrapper.client);

  // Create the fake data event
  const data: OrderCreatedEvent["data"] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    userId: "frgrdg",
    expiresAt: "gdrgdyhf",
    ticket: {
      id: "fsefse",
      version: 0,
      price: 10,
    },
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg };
};

it("replicates the order info", async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const order = await Order.findById(data.id);

  expect(order!.price).toEqual(data.ticket.price);
});

it("acks the message", async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
```

## Order Cancelled

```ts
// order-cancelled-listener.ts
export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCancelledEvent["data"], msg: Message) {
    const order = await Order.findByEvent({
      id: data.id,
      version: data.ticket.version,
    });

    if (!order) {
      throw new Error("Order Not Found");
    }

    order.set({ status: OrderStatus.Cancelled });

    await order.save();

    msg.ack();
  }
}
```

```ts
// order-cancelled-listener.test.ts
const setup = async () => {
  // Create an instance of the listener
  const listener = new OrderCancelledListener(natsWrapper.client);

  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    price: 10,
    userId: "rsgdrg",
    version: 0,
  });

  await order.save();

  // Create the fake data event
  const data: OrderCancelledEvent["data"] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 1,
    ticket: {
      id: "fsefse",
    },
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg, order };
};

it("updates the status of the order", async () => {
  const { listener, data, msg, order } = await setup();

  await listener.onMessage(data, msg);

  const updatedOrder = await Order.findById(order.id);

  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it("acks the message", async () => {
  const { listener, data, msg, order } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
```

## Payments Flow With Stripe

![microservice-dg-224](/img/docs/microservices/microservices-dg-224.png)
![microservice-dg-225](/img/docs/microservices/microservices-dg-225.png)

## Implatementing the Create Charge Handler

![microservice-dg-226](/img/docs/microservices/microservices-dg-226.png)

```ts
// routes/create.ts
const router = express.router();

router.post(
  "/api/payments",
  requireAuth,
  [body("token").not().empty(), body("orderId").not().isEmpty()],
  validateRequest,
  async (req: Request, res: Response) => {
    const { token, orderId } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      throw new NotFoundError();
    }

    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    if (order.status === OrderStatus.Cancelled) {
      throw new BadRequestError("Cannot pay for an cancelled order");
    }

    res.status(201).send({ success: true });
  },
);

export { router as createChargeRouter };
```

```yml
# ingress-sr.yml
- path: /api/payments/?(.*)
  pathType: Prefix
  backend:
    service:
      name: payments-srv
      port:
        number: 3000
```

## Testing Order Validation Before Payment

```ts
// create.test.ts
import { OrderStatus } from "@ducnguyen96/ticketing-common";
import request from "supertest";
import { app } from "../../app";
import { Order } from "../../models/order";
import mongoose from "mongoose";

// create.test.ts
it("returns a 404 when purchasing an order that does not exist", async () => {
  await request(app)
    .post("/api/payments")
    .set("Cookie", global.signin(new mongoose.Types.ObjectId().toHexString()))
    .send({
      token: "sdfsgrs",
      orderId: new mongoose.Types.ObjectId().toHexString(),
    })
    .expect(404);
});
it("returns a 401 when purchasing an order that does not belong to the user", async () => {
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    price: 20,
    status: OrderStatus.Created,
  });

  await order.save();

  await request(app)
    .post("/api/payments")
    .set("Cookie", global.signin(new mongoose.Types.ObjectId().toHexString()))
    .send({
      token: "sdfsgrs",
      orderId: order.id,
    })
    .expect(401);
});

it("returns a 400 when purchasing a cancelled order", async () => {
  const userId = new mongoose.Types.ObjectId().toHexString();
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId,
    version: 0,
    price: 20,
    status: OrderStatus.Cancelled,
  });

  await order.save();

  await request(app)
    .post("/api/payments")
    .set("Cookie", global.signin(userId))
    .send({
      token: "sdfsgrs",
      orderId: order.id,
    })
    .expect(400);
});
```

## Stripe Setup

![microservice-dg-227](/img/docs/microservices/microservices-dg-227.png)

```sh
npm install stripe
```

## Creating a Stripe Secret

```sh
kubectl create secret generic stripe-secret --from-literal STRIPE_KEY=*********
```

```yml
# payments-depl.yml
- name: STRIPE_KEY
  valueFrom:
    secretKeyRef:
      name: stripe-secret
      value: STRIPE_KEY
```

## Creating a Charge with Stripe

```ts
// src/stripe.ts
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_KEY!, {
  apiVersion: "2020-08-27",
});
```

Tham khảo [ở đây](https://stripe.com/docs/api/charges/create)

```ts
// create.ts
await stripe.charges.create({
  currency: "usd",
  amount: order.price * 100,
  source: token,
});
```

## Manual Testing of Payments

`token: tok_visa`

## Automated Payment Testing

```ts
// __mocks__/stripe.ts
export const stripe = {
  charges: {
    create: jest.fn().mockResolvedValue({}),
  },
};
```

```ts
jest.mock("../../stripe");
it("returns a 201 with valid inputs", async () => {
  const userId = new mongoose.Types.ObjectId().toHexString();
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId,
    version: 0,
    price: 20,
    status: OrderStatus.Created,
  });

  await order.save();

  await request(app)
    .post("/api/payments")
    .set("Cookie", global.signin(userId))
    .send({
      token: "tok_visa",
      orderId: order.id,
    })
    .expect(201);

  const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0];
  expect(chargeOptions.source).toEqual("tok_visa");
  expect(chargeOptions.amount).toEqual(20 * 100);
  expect(chargeOptions.currency).toEqual("usd");
});
```

## A More Realistic Test Setup

```ts
jest.mock("../../stripe");
it("returns a 201 with valid inputs", async () => {
  const userId = new mongoose.Types.ObjectId().toHexString();
  const price = Math.floor(Math.random() * 100000);
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId,
    version: 0,
    price,
    status: OrderStatus.Created,
  });

  await order.save();

  await request(app)
    .post("/api/payments")
    .set("Cookie", global.signin(userId))
    .send({
      token: "tok_visa",
      orderId: order.id,
    })
    .expect(201);

  const stripeCharges = await stripe.charges.list({ limit: 50 });
  const stripeCharge = stripeCharges.data.find((charge) => {
    return charge.amount === price * 100;
  });

  expect(stripeCharge).toBeDefined();
  expect(stripeCharge!.currency).toEqual("usd");
});
```

## Tying an Order and Charge Together

```ts
import mongoose from "mongoose";

interface PaymentAttrs {
  orderId: string;
  stripeId: string;
}

interface PaymentDoc extends mongoose.Document {
  orderId: string;
  stripeId: string;
}

interface PaymentModel extends mongoose.Model<PaymentDoc> {
  build(attrs: PaymentAttrs): PaymentDoc;
}

const paymentSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
    },
    stripeId: {
      type: String,
      required: true,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  },
);

paymentSchema.statics.build = (attrs: PaymentAttrs) => {
  return new Payment(attrs);
};

const Payment = mongoose.model<PaymentDoc, PaymentModel>(
  "Payment",
  paymentSchema,
);

export { Payment };
```

## Testing Payment Creation

```ts
const payment = Payment.build({
  orderId,
  stripeId: charge.id,
});

await payment.save();
```

```ts
const payment = await Payment.findOne({
  orderId: order.id,
  stripeId: stripeCharge!.id,
});

expect(payment).not.toBeNull();
```

## Publishing a Payment Created

```ts
// payment-created-event
export interface PaymentCreatedEvent {
  subject: Subjects.PaymentCreated;

  data: {
    id: string;
    orderId: string;
    stripeId: string;
  };
}
```

```ts
// payment-created-publisher.ts
export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
}

// create.ts
await new PaymentCreatedPublisher(natsWrapper.client).publish({
  id: payment.id,
  orderId: payment.orderId,
  stripeId: payment.stripeId,
});

res.status(201).send({ id: payment.id });
```

## Marking an Order as Complete

```ts
// payment-created-listener.ts
export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
  subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: PaymentCreatedEvent["data"], msg: Message) {
    const order = await Order.findById(data.orderId);

    if (!order) {
      throw new Error("Order not found");
    }

    order.set({
      status: OrderStatus.Complete,
    });

    await order.save();

    msg.ack();
  }
}
```

## Dont Cancelled Complete Order

```ts
if (order.status === OrderStatus.Complete) {
  return msg.ack();
}
```
