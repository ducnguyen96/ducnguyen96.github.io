---
sidebar_position: 8
---

# Response Normalization Strategies

## Creating Route Handlers

![microservice-dg-97](/img/docs/microservices/microservices-dg-97.png)

```markdown
src/
├─ routes/
│ ├─ signup.ts
│ ├─ signin.ts
│ ├─ signout.ts
│ ├─ current-user.ts
```

```ts
// current-user.ts
import express from "express";

const router = express.Router();

router.get("/api/users/currentuser", (req, res) => {
  res.send("Hi there !");
});

export { router as currentUserRouter };
```

Tương tự với 3 routes kia

```ts
// signup.ts
import express from "express";

const router = express.Router();

router.post("/api/users/signup", (req, res) => {
  res.send("Hi there !");
});

export { router as signupRouter };
```

```ts
// index.ts
app.use(currentUserRouter);
```

## Adding Validation

```ts
router.post(
  "/api/users/signup",
  [
    body("email").isEmail().withMessage("Email must be valid"),
    body("password")
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage("Password must be between 4 and 20 characters"),
  ],
  (req: Request, res: Response) => {
    const { email, password } = req.body;
  },
);
```

## Handling Validation Errors

```ts
const errors = validationResult(req);

if (!error.isEmpty()) {
  return res.status(400).send(errors.array());
}
```

## Surprising Complexity Around Errors

![microservice-dg-98](/img/docs/microservices/microservices-dg-98.png)
Các framework có thể trả về result khác nhau cho client, và ta không muốn phía client phải xử lý error message cho từn service khác nhau mà họ gọi. Vì thế nên tạo ra 1 structure chung cho error message.
![microservice-dg-99](/img/docs/microservices/microservices-dg-99.png)

## Other Sources of Errors

Scenario mà có thể xảy ra errors
![microservice-dg-100](/img/docs/microservices/microservices-dg-100.png)

## Building an Error Handling Middleware

```markdown
src/
├─ routes/
│ ├─ signup.ts
│ ├─ signin.ts
│ ├─ signout.ts
│ ├─ current-user.ts
├─ middlewares/
│ ├─ error-handler.ts
```

```ts
// error-handler.ts
import { Request, Response, NextFunction } from "express";
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log("Something went wrong", err);

  res.status(400).send({
    message: "Something went wrong",
  });
};
```

```ts
// index.ts
app.use(errorHandler);
```

## Subclassing for Custim Errors

![microservice-dg-101](/img/docs/microservices/microservices-dg-101.png)

```markdown
src/
├─ errors/
│ ├─ request-validation-error.ts
│ ├─ database-connection-error.ts
├─ routes/
│ ├─ signup.ts
│ ├─ signin.ts
│ ├─ signout.ts
│ ├─ current-user.ts
├─ middlewares/
│ ├─ error-handler.ts
```

```ts
// request-validation-error.ts
import { ValidationError } from "express-validator";

export class RequestValidationError extends Error {
  constructor(public errors: ValidationError[]) {
    super();

    // Only because we are extending a built in class
    Object.setPrototypeOf(this, RequestValidationError.prototype);
  }
}
```

```ts
// database-connection-error.ts
export class DatabaseConnectionError extends Error {
  reason = "Error connecting to database";
  constructor() {
    super();

    // Only because we are extending a built in class
    Object.setPrototypeOf(this, DatabaseConnectionError.prototype);
  }
}
```

```ts
// signup.ts
if (!errors.isEmpty()) {
  throw new RequestValidationError(errors.array());
}

console.log("Creating a new user ...");
throw new DatabaseConnectionError();
```

## Determining Error Type

```ts
// error-handler.ts
if (err instanceof RequestValidationError) {
  console.log("this is a request validation error");
}

if (err instanceof DatabaseConnectionError) {
  console.log("this is a database connection error");
}
```

## Connverting Errors to Responses

![microservice-dg-102](/img/docs/microservices/microservices-dg-102.png)

```ts
// error-handler.ts
if (err instanceof RequestValidationError) {
  const formattedErrors = err.errors.map((error) => {
    return { message: error.msg, field: error.param };
  });
  return res.status(400).send({ errors: formattedErrors });
}

if (err instanceof DatabaseConnectionError) {
  return res.status(500).send({ errors: [{ message: err.reason }] });
}

res.status(400).send({
  errors: [{ message: "Something went wrong !" }],
});
```

## Moving Logic Into Errors

```ts
// database-connection-error.ts
statusCode = 500
serializeErrors(){
  return [{
    message: this.reason
  }]
}
```

```ts
// request-validation-error.ts
statusCode = 400;
constructor(public errors: ValidationError[]) {
  super();

  // Only because we are extending a built in class
  Object.setPrototypeOf(this, RequestValidationError.prototype);
}
serializeErrors() {
  return this.errors.map((err) => ({ message: err.msg, field: err.param }));
}
```

```ts
// error-handler.ts
if (
  err instanceof RequestValidationError ||
  err instanceof DatabaseConnectionError ||
  err instanceof NotFoundEror
) {
  return res.status(err.statusCode).send({ errors: err.serializeErrors() });
}
```

## Verifying Our Custom Error

```ts
// custom-error.ts
export abstract class CustomError extends Error {
  abstract statusCode: number;

  constructor(message: string) {
    super(message);

    Object.setPrototypeOf(this, CustomError.prototype);
  }

  abstract serializeErrors(): { message: string; field?: string };
}
```

```ts
// database-connection-error.ts
export class DatabaseConnectionError extends CustomError {
  statusCode = 500;
  reason = "Error connecting to database";
  constructor() {
    super("Error connecting to database");

    // Only because we are extending a built in class
    Object.setPrototypeOf(this, DatabaseConnectionError.prototype);
  }
  serializeErrors() {
    return [{ message: this.reason }];
  }
}

// request-validation-error.ts
export class RequestValidationError extends CustomError {
  statusCode = 400;
  constructor(public errors: ValidationError[]) {
    super("Request Validation Error");

    // Only because we are extending a built in class
    Object.setPrototypeOf(this, RequestValidationError.prototype);
  }
  serializeErrors() {
    return this.errors.map((err) => ({ message: err.msg, field: err.param }));
  }
}
```

## Define New Custom Errors

```ts
// not-found-error.ts
export class NotFoundEror extends CustomError {
  statusCode = 404;

  constructor() {
    super("Route not found");

    Object.setPrototype(this, NotFoundEror.prototype);
  }

  serializeErrors() {
    return [{ message: "Not Found" }];
  }
}
```

## Async Error Handling

```sh
npm install express-async-errors --save
```

```ts
// index.ts
import "express-async-errors";
```
