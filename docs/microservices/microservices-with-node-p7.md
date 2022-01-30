---
sidebar_position: 9
---

# Database Management and Modeling

## Createing Databases in Kubernetes

![microservice-dg-103](/img/docs/microservices/microservices-dg-103.png)

```sh
npm i mongoose
```

```yml
# auth-mongo-depl.yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: auth-mongo-depl
  namespace: ingress-nginx
spec:
  replicas: 1
  selector:
    matchLabels:
      app: auth-mongo
  template:
    metadata:
      labels:
        app: auth-mongo
    spec:
      containers:
        - name: auth-mongo
          image: mongo
---
apiVersion: v1
kind: Service
metadata:
  name: auth-mongo-srv
  namespace: ingress-nginx
spec:
  selector:
    app: auth-mongo
  ports:
    - name: db
      protocol: TCP
      port: 27017
      targetPort: 27017
```

## Creating Databases in Kubernetes

```sh
npm i @types/mongoose
```

```ts
// index.ts
import mongoose from "mongoose";

const start = async () => {
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

## Understanding the Signup Flow

![microservice-dg-104](/img/docs/microservices/microservices-dg-104.png)

## Creating the User Model

```ts
// src/models/users.ts
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
});

const User = mongoose.model("User", userSchema);

export { User };
```

## Type Checking User Properties

```ts
// src/models/users.ts

// An interface that describe the proterties
// that are required to create a new User
interface UserAttrs {
  email: string;
  password: string;
}

const buildUser = (attrs: UserAttrs) => {
  return new User(attrs);
};
```

## Adding Static Properties to a Model

```ts
// user.ts
// An interface that describe the properties
// that a User Model has
interface UserModel extends mongoose.Model<any> {
  build(attr: UserAttrs): any;
}

userSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs);
};

const User = mongoose.model<any, UserModel>("User", userSchema);
```

## Defining Extra Document Properties

```ts
// An interface that describe the properties
// that a User Document has
interface UserDoc extends mongoose.Document {
  email: string;
  password: string;
}

interface UserModel extends mongoose.Model<UserDoc> {
  build(attr: UserAttrs): any;
}

const User = mongoose.model<UserDoc, UserModel>("User", userSchema);
```

## User Creation

```ts
// signup.ts
import "express-async-errors";

const { email, password } = req.body;
const existingUser = await User.findOne({ email });
if (existingUser) {
  console.log("Email in use");
  return res.send({});
}

const user = User.build({ email, password });
await user.save();

res.status(201).send(user);
```

## Proper Error Handling

```ts
// src/errors/bad-request-error.ts
import { CustomError } from "./custom-error";

export class BadRequestError extends CustomError {
  statusCode = 400;

  constructor(public message: string) {
    super(message);

    Object.setprototypeOf(this, BadRequestEror.prototype);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}
```

## Adding Password Hashing

```ts
// src/serices/password.ts
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

export class Password {
  static async toHash(password: string) {
    const salt = randomBytes(8).toString("hex");
    const buf = (await scryptAsync(password, salt, 64)) as Buffer;

    return `${buf.toString("hex")}.${salt}`;
  }

  static async compare(storedPassword: string, suppliedPassword: string) {
    const [hashedPassword, salt] = storedPassword.split(".");
    const buf = (await scryptAsync(suppliedPassword, salt, 64)) as Buffer;

    return buf.toString("hex") === hashedPassword;
  }
}
```

## Mongoose Pre-Save Hooks

```ts
// user.ts
userSchema.pre("save", async function (done) {
  if (this.isModified("password")) {
    const hashed = await Password.toHash(this.get("password"));
    this.set("password", hashed);
  }
  done();
});
```
