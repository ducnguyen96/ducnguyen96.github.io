---
sidebar_position: 14
---

# CRUD Server Setup

## Ticketing Service Project Setup

![microservice-dg-144](/img/docs/microservices/microservices-dg-144.png)
![microservice-dg-145](/img/docs/microservices/microservices-dg-145.png)
Với tickets service thì ta sẽ copy từ auth service để tiết kiệm thời gian

### 1. make service folder

```sh
mkdir tickets
```

### 2. copy same config

Copy `.dockerignore`, `Dockerfile`, `package-lock.json`, `package.json`, `tsconfig.json` vào `tickets`

### 3. copy same code

Copy `src/test/*`, `src/app.ts`, `src/index.ts`

### 4. update package name

Updae package name in `package.json`

### 5. update code

Update lại code vừa copy.

### 6. install dependencies

```sh
npm install
```

### 7. Build image

```sh
eval $(minikube docker-env)
docker build -t ducnguyen96/ticketing-tickets .
```

### 8. Write k8s config file

```yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: tickets-depl
  namespace: ingress-nginx
spec:
  replicas: 1
  selector:
    matchLabels:
      app: tickets
  template:
    metadata:
      labels:
        app: tickets
    spec:
      containers:
        - name: tickets
          image: ducnguyen96/ticketing-tickets
          env:
            - name: JWT_KEY
              valueFrom:
                secretKeyRef:
                  name: jwt-secret
                  key: JWT_KEY
---
apiVersion: v1
kind: Service
metadata:
  name: tickets-srv
  namespace: ingress-nginx
spec:
  selector:
    app: tickets
  ports:
    - name: tickets
      protocol: TCP
      port: 3000
      targetPort: 3000
```

### 9. Update skaffold.yml

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
    - image: ducnguyen96/ticketing-tickets
      context: tickets
      docker:
        dockerfile: Dockerfile
      sync:
        manual:
          - src: "src/**/*.ts"
            dest: .
```

### 10. Write tickets-mongo-depl.yml

```yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: tickets-mongo-depl
  namespace: ingress-nginx
spec:
  replicas: 1
  selector:
    matchLabels:
      app: tickets-mongo
  template:
    metadata:
      labels:
        app: tickets-mongo
    spec:
      containers:
        - name: tickets-mongo
          image: mongo
---
apiVersion: v1
kind: Service
metadata:
  name: tickets-mongo-srv
  namespace: ingress-nginx
spec:
  selector:
    app: tickets-mongo
  ports:
    - name: db
      protocol: TCP
      port: 27017
      targetPort: 27017
```

## Mongo Connection URI

Ta sẽ sử dụng `env` trong kubernetes config file để lưu mongo uri.

```yml
- name: tickets
  image: ducnguyen96/ticketing-tickets
  env:
    - name: JWT_KEY
      valueFrom:
        secretKeyRef:
          name: jwt-secret
          key: JWT_KEY
    - name: MONGO_URI
      value: "mongodb://auth-mongo-srv:27017/auth"
```

Tương tự thì ta update lại cho auth service.

## Test-First Approach

```ts
// src/routes/__test__/create.test.ts
import request from "supertest";
import { app } from "../../app";

it("has a route handler listening to /api/tickets for post requests", async () => {
  const res = await request(app).post("/api/tickets").send({});

  expect(res.status).not.toEqual(404);
});

it("can only be accessed if the user is signed in", async () => {
  const res = await request(app).post("/api/tickets").send({}).expect(401);
});

it("returns a status other than 401 if the user is signed in", async () => {
  const res = await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({});

  expect(res.status).not.toEqual(401);
});

it("returns an error if an invalid title is provided", async () => {
  await request(app).post("/api/tickets").set("Cookie", global.signin()).send({
    title: "",
    price: 10,
  });

  expect(400);

  await request(app).post("/api/tickets").set("Cookie", global.signin()).send({
    price: 10,
  });

  expect(400);
});

it("returns an error if an invalid price is provided", async () => {
  await request(app).post("/api/tickets").set("Cookie", global.signin()).send({
    title: "Bohemium",
    price: -10,
  });

  expect(400);

  await request(app).post("/api/tickets").set("Cookie", global.signin()).send({
    title: "Bohemium",
  });

  expect(400);
});

it("creates a ticket with valid inputs", async () => {
  let tickets = await Ticket.find({});
  expect(tickets.length).toEqual(0);

  const title = "Bohemium";
  const price = 20;

  await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({
      title,
      price,
    })
    .expect(201);

  tickets = await Ticket.find({});
  expect(tickets.length).toEqual(1);
  expect(tickets[0].price).toEqual(price);
  expect(tickets[0].title).toEqual(title);
});
```

## Creating the Router

```ts
// create.ts
import express, { Request, Response } from "express";

const router = express.Router();

router.post("/api/tickets", async (req: Request, res: Response) => {
  res.sendStatus(200);
});

export { router as createTicketRouter };
```

## Adding Auth Protection

```ts
// app.ts
app.use(currentUser);
```

```ts
// create.ts
router.post(
  "/api/tickets",
  requireAuth,
  async (req: Request, res: Response) => {
    res.sendStatus(200);
  },
);
```

## Faking Authentication During Tests

Ở auth service ta đã có 1 hàm login để lấy cookie, tickets service không có cơ chế login nên ta chỉ việc tạo hoặc copy cookie.

```ts
// setup.ts
global.signin = () => {
  // Build a JWT payload, { id, email }
  const payload = {
    id: "dkfg34fjv0f3",
    email: "test@test.com",
  };

  // Create the JWT
  const token = jwt.sign(payload, process.env.JWT_KEY!);

  // Build session Object { jwt: MY_JWT }
  const session = { jwt: token };

  // Turn that session into JSON
  const sessionJSON = JSON.stringify(session);

  // Take JSON and encode it as base64
  const base64 = Buffer.from(sessionJSON).toString("base64");

  // return a string thats the cookie with the encoded data
  return `express:sess=${base64}`;
};
```

## Validate Title and Price

```ts
// create.ts
router.post(
  "/api/tickets",
  requireAuth,
  [
    body("title").not().isEmpty().withMessage("Title is required"),
    body("price")
      .isFloat({ gt: 0 })
      .withMessage("Price must be greater than 0"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    res.sendStatus(200);
  },
);
```

## Defining the Ticket Model

![microservice-dg-147](/img/docs/microservices/microservices-dg-147.png)

```ts
// src/models/ticket.ts
import mongoose from "mongoose";

interface TicketAttrs {
  title: string;
  price: number;
  userId: string;
}

interface TicketDoc extends mongoose.Document {
  title: string;
  price: number;
  userId: string;
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
    userId: {
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

ticketSchema.statics.build = (attr: TicketAttrs) => {
  return new Ticket(attrs);
};

const Ticket = mongoose.model<TicketDoc, TicketModel>("Ticket", ticketSchema);

export { Ticket };
```

## Creation via Route Handler

```ts
// create.ts
const { title, price } = req.body;

const ticket = Ticket.build({
  title,
  price,
  userId: req.currentUser!.id,
});

await ticket.save();

res.status(201).send(ticket);
```

## Testing Show Routes

```ts
// src/routes/__test__/read.test.s
import request from "supertest";
import { app } from "../../app";

it("returns a 404 if the ticket is not found", async () => {
  const res = await request(app)
    .get("/api/tickets/vefgw4fwfh")
    .send({})
    .expect(404);
});

it("returns the ticket if the ticket is found", async () => {
  const title = "Bohemium";
  const price = 20;

  const res = await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({
      title,
      price,
    })
    .expect(201);

  const ticketRes = await request(app)
    .get(`/api/tickets/${res.body.id}`)
    .send()
    .expect(200);

  expect(ticketRes.body.title).toEqual(title);
  expect(ticketRes.body.price).toEqual(price);
});
```

## Unexpected Failure

```ts
// read.ts
import express, { Request, Response } from "express";

const router = express.Router();

router.get("/api/tickets/:id", async (req: Request, res: Response) => {
  const ticket = await Ticket.findById(req.param.id);

  if (!ticket) {
    throw new NotFoundError();
  }

  res.send(ticket);
});

export { router as readTicketRouter };
```

Can not parse ticket id from `/api/tickets/drggirdgggdr`

## Better Error Logging

```ts
// common/middlewares/error-handler.ts
console.error(err);
```

publish package

```sh
npm run pub
```

update package

```sh
npm update @ducnguyen96/ticketing-common
```

update test

```ts
// read.test.ts
it("returns a 404 if the ticket is not found", async () => {
  const mongoose = new Mongoose();
  const mongoose = new Mongoose();
  const id = new mongoose.Types.ObjectId().toHexString();

  await request(app).get(`/api/tickets/${id}`).send().expect(404);
});
```

## Complete Read Route Implementation

```ts
// read.test.ts
import request from "supertest";
import { app } from "../../app";

const createTicket = () => {
  return request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({ title: "Bohemium", price: 20 });
};

it("can fetch a list of tickets", async () => {
  await createTicket();
  await createTicket();
  await createTicket();

  const res = await request(app).get("/api/tickets").send().expect(200);

  expect(res.body.length).toEqual(3);
});
```

```ts
// src/routes/read.ts
import express, { Request, Response } from "express";

const router = express.Router();

router.get("/api/tickets", async (req: Request, res: Response) => {
  const tickets = await Ticket.find();
  res.send(tickets);
});

export { router as indexTicketRouter };
```

## Ticket Updating

```ts
// update.test.ts
import request from "supertest";
import { app } from "../../app";

it("returns a 404 if the provided id does not exist", async () => {
  const mongoose = new Mongoose();
  const id = new mongoose.Types.ObjectId().toHexString();

  await request(app)
    .put(`/api/tickets/${id}`)
    .set("Cookie", global.signin())
    .send({ title: "Bohemium", price: 20 })
    .expect(404);
});

it("returns a 401 if the user is not authenticated", async () => {
  const mongoose = new Mongoose();
  const id = new mongoose.Types.ObjectId().toHexString();

  await request(app)
    .put(`/api/tickets/${id}`)
    .send({ title: "Bohemium", price: 20 })
    .expect(404);
});

it("returns a 401 if the user does not own the ticket", async () => {
  const res = await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({ title: "Bohemium", price: 20 });

  await request(app)
    .put(`/api/tickets/${res.body.id}`)
    .send({ title: "Bohemium", price: 203 })
    .expect(401);
});

it("returns a 400 if the user provides an invalid title or price", async () => {
  const cookie = global.signin();

  const res = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({ title: "Bohemium", price: 20 });

  await request(app)
    .put(`/api/tickets/${res.body.id}`)
    .set("Cookie", cookie)
    .send({ title: "", price: 203 })
    .expect(400);

  await request(app)
    .put(`/api/tickets/${res.body.id}`)
    .set("Cookie", cookie)
    .send({ title: "Bohemium", price: -203 })
    .expect(400);
});

it("updates the ticket provided valida inputs", async () => {
  const cookie = global.signin();

  const res = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({ title: "Bohemium", price: 20 });

  await request(app)
    .put(`/api/tickets/${res.body.id}`)
    .set("Cookie", cookie)
    .send({ title: "Bohemium updated", price: 203 })
    .expect(200);

  const updatedTicket = await request(app)
    .get(`/api/tickets/${res.body.id}`)
    .send();
  expect(updatedTicket.body.title).toEqual("Bohemium updated");
  expect(updatedTicket.body.price).toEqual(203);
});
```

## Handling Updates

```ts
// src/routes/update.ts
import express, { Request, Response } from "express";

const router = express.Router();

router.put(
  "/api/tickets/:id",
  requireAuth,
  [
    body("title").not().isEmpty().withMessage("Title is required"),
    body("price")
      .isFloat({ gt: 0 })
      .withMessage("Price must be greater than 0"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const tickets = await Ticket.findById(req.params.id);
    if (!ticket) {
      throw new NotFoundError();
    }
    res.send(ticket);
  },
);

export { router as updateTicketRouter };
```

## Permission Checking

```ts
// update.test.ts
return request(app)
  .post("/api/tickets")
  .set("Cookie", global.signin())
  .send({ title: "Bohemium", price: 20 });
```

```ts
// src/routes/update.ts
if (ticket.userId !== req.currentUser!.id) {
  throw new NotAuthorizedError();
}

ticket.set({
  title: req.body.title,
  price: req.body.price,
});

await ticket.save();
```

## Update Ingress

```yml
# ingress-srv.yml
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
          - path: /api/tickets/?(.*)
            pathType: Prefix
            backend:
              service:
                name: tickets-srv
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
