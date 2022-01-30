---
sidebar_position: 10
---

# Authentication Strategies and Options

## Fundamential Authentication Strategies

### 1. Sync Communication

![microservice-dg-107](/img/docs/microservices/microservices-dg-107.png)

### 1.1. Gateway

![microservice-dg-105](/img/docs/microservices/microservices-dg-105.png)

Cả 2 cách trên đều có nhược điểm của sync communication

### 2. Mỗi service đều có thể tự authenticate

![microservice-dg-106](/img/docs/microservices/microservices-dg-106.png)

- Điểm cộng: không phụ thuộc vào bất cứ service nào khác.
- Điểm trừ: duplicate authentication cho mọi service; một số issue khác mà chúng ta sẽ nói ngay ở phần dứoi

## 2. Huge Issues with Authentication Strategies

Như đã nói ở trên thì chúng ta sẽ chắc chắn sẽ không dùng cách 1 và 1.1 vì chúng phụ thuộc vào service khác mà sẽ dùng cách 2.

Trước tiên hãy xem lại flow của cách 2 nhé.
![microservice-dg-108](/img/docs/microservices/microservices-dg-108.png)

Đầu tiên thì user sẽ signin, email và password sẽ được gửi đến auth service, sẽ khi đã xác nhận thông tin thì auth service sẽ gửi về cho user 1 JWT hoặc cookie,...

![microservice-dg-106](/img/docs/microservices/microservices-dg-106.png)

User khi tạo order sẽ gửi kèm theo JWT hoặc Cookie,... order service sẽ dựa vào đó để xác minh user.

Tuy nhiên giả sử trường hợp user này có hành động không minh bạch và admin muốn ban user này thì sao ?

![microservice-dg-109](/img/docs/microservices/microservices-dg-109.png)
Lúc này admin user sẽ update lại thông tin user trong db của auth service để ban user. Tuy nhiên thì user vẫn có cookie kia và nó hoàn toàn sử dụng được,

![microservice-dg-110](/img/docs/microservices/microservices-dg-110.png)
Vì ta đã tách biệt hoàn toàn order service và auth service nên lúc này order service không thể nhận biết được user này đã bị ban. Vậy phải xử lý như thế nào ?

## Solving Issues with Option #2

![microservice-dg-111](/img/docs/microservices/microservices-dg-111.png)

![microservice-dg-112](/img/docs/microservices/microservices-dg-112.png)
More Secure with this approach
![microservice-dg-113](/img/docs/microservices/microservices-dg-113.png)

## Microservices Auth Requirements

![microservice-dg-114](/img/docs/microservices/microservices-dg-114.png)

### Có thể đưa ra thông tin chi tiết về user

![microservice-dg-115](/img/docs/microservices/microservices-dg-115.png)

### Có thể xử lý thông tin đăng nhập

Ví dụ trường hợp chỉ có admin mới tạo được Coupon
![microservice-dg-116](/img/docs/microservices/microservices-dg-116.png)

### Có cơ chế xử lý thông tin đăng nhập hết hạn hay chưa

![microservice-dg-117](/img/docs/microservices/microservices-dg-117.png)

### Có thể dễ hiểu bằng nhiều ngôn ngữ

![microservice-dg-118](/img/docs/microservices/microservices-dg-118.png)

### Không yêu cầu lưu trữ dữ liệu trên server.

![microservice-dg-119](/img/docs/microservices/microservices-dg-119.png)

## Issues with JWT's and Server Side Rendering

Với Client Side Rendering
![microservice-dg-120](/img/docs/microservices/microservices-dg-120.png)
Với Server Side Rendering - SEO + load speed
![microservice-dg-121](/img/docs/microservices/microservices-dg-121.png)
==> use cookie based JWT

## Cookies and Encryption

![microservice-dg-122](/img/docs/microservices/microservices-dg-122.png)
![microservice-dg-123](/img/docs/microservices/microservices-dg-123.png)

## Adding Session Support

```sh
npm i cookie-session @types/cookie-session
```

```ts
// index.ts
app.set("trust proxy", true); // trust nginx
app.use(cookieSession({ signed: false, secure: true }));
```

## Generating a JWT

```sh
npm i jsonwebtoken @types/jsonwebtoken
```

```ts
// signup.ts
import jwt from "jsonwebtoken";

// Generate JWT
const userJwt = jwt.sign({ id: user.id, email: user.email }, "sfgertd");

// Store it on session object
req.session = {
  jwt: userJwt,
};
```

## JWT signing Keys

![microservice-dg-124](/img/docs/microservices/microservices-dg-124.png)
![microservice-dg-125](/img/docs/microservices/microservices-dg-125.png)

## Securely Storing Secret with Kubernetes

```sh
kubectl create secret generic jwt-secret --from-literal=JWT_KEY=sfgertd -n=ingress-nginx
```

## Accessing Secrets

```yml
# auth-depl.yml
env:
  - name: JWT_KEY
    valueFrom:
      secretKeyRef:
        name: jwt-secret
        key: JWT_KEY
```

```ts
// signup.ts
process.env.JWT_KEY!;
```

```ts
// index.ts
if (!process.env.JWT_KEY) {
  throw new Error("JWT_KEY must be defined");
}
```

## Common Response Properties

![microservice-dg-127](/img/docs/microservices/microservices-dg-127.png)

## Formatting JSON Properties

```ts
// users.ts
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.password;
        delete ret.__v;
      },
    },
  },
);
```

## The Signin Flow

![microservice-dg-128](/img/docs/microservices/microservices-dg-128.png)

```ts
// signin.ts
router.post(
  "/api/users/signin",
  [
    body("email").isEmail().withMessage("Email must be valid"),
    body("password")
      .trim()
      .notEmpty()
      .withMessage("You must supply a password"),
  ],
  (req: Request, res: Response) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      throw new RequestValidationError(errors.array());
    }
    res.send("Hi there !");
  },
);
```

## Common Request Validation Middleware

```ts
// validate-request.ts
export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    throw new RequestValidationError(errors.array());
  }
};
```

## Signin Logic

![microservice-dg-129](/img/docs/microservices/microservices-dg-129.png)

```ts
// signin.ts
const { email, password } = req.body;

const existingUser = await User.findOne({ email });
if (!existingUser) {
  throw new BadRequestError("Invalid credentials");
}

const passwordsMatch = await Password.compare(existingUser.password, password)

if (!passwordsMatch) {
  throw new BadRequestError("Invalid credentials");
}

const userJwt = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_KEY!;
);

req.session = {
  jwt: userJwt,
};
```

## Current User Handler

```ts
// current-user.ts
if (!req.session?.jwt) {
  return res.send({ currentUser: null });
}

try {
  const payload = jwt.verify(req.session.jwt, process.env.JWT_KEY!);
} catch (error) {
  return res.send({ currentUser: null });
}
```

## Signout

```ts
// siginout.ts
req.session = null;
res.send({});
```

## Creating a Current User Middleware

![microservice-dg-130](/img/docs/microservices/microservices-dg-130.png)

```ts
// src/middlewares/current-user.ts
interface UserPayload {
  id: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      currentUser?: UserPayload;
    }
  }
}

export const currentUser = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.session?.jwt) {
    return next();
  }

  try {
    const payload = jwt.verify(
      req.session.jwt,
      process.env.JWT_KEY!,
    ) as UserPayload;
    req.currentUser = payload;
  } catch (error) {}
  next();
};
```

```ts
// src/routes/current-user.ts
router.get("/api/users/currentuser", currentUser, (req, res) => {
  res.send({ currentUser: req.currentUser || null });
});
```

## Requiring Auth for Route Access

```ts
// src/errors/not-authorized-error.ts
export class NotAuthorizedError extends CustomError {
  statusCode = 401;

  constructor() {
    super("Not Authorized");

    Object.setPrototypeOf(this, NotAuthorizedError.prototype);
  }

  serializeErrors() {
    return [{ message: "Not Authorized" }];
  }
}
```

```ts
// src/middlewares/require-auth.ts
export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.currentUser) {
    throw new NotAuthorizedError();
  }

  next();
};
```
