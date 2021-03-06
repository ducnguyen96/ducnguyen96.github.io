---
sidebar_position: 11
---

# Testing Isolated Microservices

## Scope of Testing

![microservice-dg-131](/img/docs/microservices/microservices-dg-131.png)

## Testing Goal

![microservice-dg-132](/img/docs/microservices/microservices-dg-132.png)
![microservice-dg-133](/img/docs/microservices/microservices-dg-133.png)
![microservice-dg-134](/img/docs/microservices/microservices-dg-134.png)

## Testing Architecture

![microservice-dg-135](/img/docs/microservices/microservices-dg-135.png)
![microservice-dg-136](/img/docs/microservices/microservices-dg-136.png)

```ts
// app.ts
import express from "express";
import { json } from "body-parser";
import { currentUserRouter } from "./routes/current-user";
import { signinRouter } from "./routes/signin";
import { signupRouter } from "./routes/signup";
import { signoutRouter } from "./routes/signout";
import { errorHandler } from "./middlewares/error-handler";
import { NotFoundEror } from "./errors/not-found-error";
import "express-async-errors";
import cookieSession from "cookie-session";

const app = express();
app.use(json());
app.set("trust proxy", true); // trust nginx
app.use(cookieSession({ signed: false, secure: true }));

app.use(currentUserRouter);
app.use(signupRouter);
app.use(signinRouter);
app.use(signoutRouter);

app.get("*", async () => {
  throw new NotFoundEror();
});

app.use(errorHandler);

export { app };
```

```ts
// index.ts
import mongoose from "mongoose";
import { app } from "./app";

const start = async () => {
  if (!process.env.JWT_KEY) {
    throw new Error("JWT_KEY must be defined");
  }

  try {
    await mongoose.connect("mongodb://auth-mongo-srv:27017/auth");

    console.log("connected to mongoose");
  } catch (error) {
    console.error(error);
  }

  app.listen(3000, () => {
    console.log("Listening on port 3000 !");
  });
};

start();
```

## A Few Dependencies

```sh
npm i --save-dev @types/jest @types/supertest jest ts-jest supertest mongodb-memory-server
```

Update Dockerfile

```Dockerfile
RUN npm install --only=prod
```

## Test Environment Setup

```json
{
  "scripts": {
    "test": "jest --watchAll --no-cache"
  },
  "jest": {
    "preset": "ts-jest",
    "testEnvironment": "node",
    "setupFilesAfterEnv": ["./src/test/setup.ts"]
  }
}
```

```ts
// src/test/setup.ts
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { app } from "../app";

let mongo: any;

beforeAll(async () => {
  process.env.JWT_KEY = "sfvgedged";
  mongo = await MongoMemoryServer.create();
  const mongoUri = await mongo.getUri();

  await mongoose.connect(mongoUri);
});

beforeEach(async () => {
  const collections = await mongoose.connection.db.collections();

  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongo.stop();
  await mongoose.connection.close();
});
```

## Fix bug mongodb-memory-server tr??n debian 11

??? ????y n???u b???n n??o g???p tr?????ng h???p g???p l???i khi kh???i t???o mongodb instance `mongo = await MongoMemoryServer.create()` th?? kh??? n??ng cao l?? b???n auto download binary mongodb v??? m??y b???n c?? v???n ?????. Hi???n t???i b???n m???c ?????nh ??ang l?? `4.0.25` xem th??m [??? ????y](https://github.com/nodkz/mongodb-memory-server#configuring-which-mongod-binary-to-use).

Th?? m???c default c???a file binary k??a l?? `~/.cache/mongodb-binaries/mongod*`, b???n c?? th??? v??o ????y v?? x??a b???n binary ??i v?? ch???y l???i `npm start` hay `skaffold dev`.

N???u kh??ng ???????c n???a th?? b???n c?? th??? download [??? ????y](https://www.mongodb.com/download-center/community/releases/archive) v?? thay th??? phi??n b???n default kia. Ho???c b???n c?? th??? ch???y phi??n b???n default v?? xem g???p l???i g?? fix ????? ch???y ???????c file binary ?????y r???i h???ng `start` l???i project nh??.

## Our Fiest Test

```ts
// src/routes/__test__/signup.test.ts
import request from "supertest";
import { app } from "../../app";

it("returns a 201 on successful signup", async () => {
  return request(app)
    .post("/api/users/signup")
    .send({
      email: "test@test.com",
      password: "password",
    })
    .expect(201);
});
```

```sh
npm run test
```

## An Important Note

Jest kh??ng m???c ?????nh hi???u TS n??n ta ph???i s??? d???ng th??m ts-jest. Th???nh tho???ng th?? c?? th??? jest ho???c ts-jest s??? kh??ng update nh???ng thay ?????i trong code, trong tr?????ng h???p n??y th?? ch??? c??n c??ch l?? Ctrl-C v?? ch???y l???i `npm run test`

## Testing Invalid Input

```ts
// signup.test.ts
it("returns a 400 with an invalid email", async () => {
  return request(app)
    .post("/api/users/signup")
    .send({
      email: "testtest.com",
      password: "password",
    })
    .expect(400);
});

it("returns a 400 with an invalid password", async () => {
  return request(app)
    .post("/api/users/signup")
    .send({
      email: "test@test.com",
      password: "p",
    })
    .expect(400);
});

it("returns a 400 with missing email and password", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({
      email: "test@test.com",
    })
    .expect(400);
  await request(app)
    .post("/api/users/signup")
    .send({
      password: "fdgretghdtg",
    })
    .expect(400);
});
```

## Requiring Unique Emails

```ts
it("disallows duplicate email", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({
      email: "test@test.com",
      password: "password",
    })
    .expect(201);

  await request(app)
    .post("/api/users/signup")
    .send({
      email: "test@test.com",
      password: "password",
    })
    .expect(400);
});
```

## Changing Node Env During Tests

```ts
it("sets a cookie after successful signup", async () => {
  const response = await request(app)
    .post("/api/users/signup")
    .send({
      email: "test@test.com",
      password: "password",
    })
    .expect(201);

  expect(response.get("Set-Cookie")).toBeDefined();
});
```

```ts
// app.ts
app.use(
  cookieSession({ signed: false, secure: process.env.NODE_ENV !== "test" }),
);
```

## Tests Around Signin Functionality

```ts
// src/routes/__test__/signin.test.ts
import request from "supertest";
import { app } from "../../app";

it("fails when a email that does not exist is supplied", async () => {
  return request(app)
    .post("/api/users/signin")
    .send({
      email: "test@test.com",
      password: "password",
    })
    .expect(400);
});

it("fails when an incorrect password is supplied", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({
      email: "test@test.com",
      password: "password",
    })
    .expect(201);

  await request(app)
    .post("/api/users/signin")
    .send({
      email: "test@test.com",
      password: "worngsges",
    })
    .expect(400);
});

it("response with a cookie when given valid credentials", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({
      email: "test@test.com",
      password: "password",
    })
    .expect(201);

  const res = await request(app)
    .post("/api/users/signin")
    .send({
      email: "test@test.com",
      password: "password",
    })
    .expect(200);
  expect(res.get("Set-Cookie")).toBeDefined();
});
```

## Testing Signout

```ts
// src/routes/__test__/signout.test.ts
import request from "supertest";
import { app } from "../../app";

it("clears the cookie after signing out", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({
      email: "test@test.com",
      password: "password",
    })
    .expect(201);
  const res = await request(app).post("/api/users/signout").send().expect(200);

  expect(res.get("Set-Cookie")[0]).toEqual(
    "express:sess=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httponly",
  );
});
```

## Test with cookie

```ts
// src/routes/__test__/current-user.test.ts
import request from "supertest";
import { app } from "../../app";

it("responds with details about the current user", async () => {
  const authRes = await request(app)
    .post("/api/users/signup")
    .send({
      email: "test@test.com",
      password: "password",
    })
    .expect(201);

  const cookie = authRes.get("Set-Cookie");

  const res = await request(app)
    .get("/api/users/currentuser")
    .set("Cookie", cookie)
    .send()
    .expect(200);

  expect(res.body.currentUser.email).toEqual("test@test.com");
});
```

## Auth Helper Function

```ts
// src/test/setup.ts
declare global {
  function signin(): Promise<string[]>;
}

global.signin = async () => {
  const email = "test@test.com";
  const password = "password";

  const res = await request(app)
    .post("/api/users/signup")
    .send({
      email,
      password,
    })
    .expect(201);

  const cookie = res.get("Set-Cookie");

  return cookie;
};
```

## Testing Non-Authed Requests

```ts
// src/routes/__test__/current-user.test.ts
it("responds with null if not authenticaterd", async () => {
  const res = await request(app)
    .get("/api/users/currentuser")
    .send()
    .expect(200);

  expect(res.body.currentUser).toEqual(null);
});
```
