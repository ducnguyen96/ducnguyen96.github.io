---
sidebar_position: 17
---

# Managing a NATS Client

## Publishing Ticket Creation

Update NATS cho ticket service

```npm
npm update @ducnguyen96/ticketing-common
```

```ts
// src/events/publishers/ticket-created-publisher.ts
export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated;
}
```

Publish event in `create.ts` when create ticket

```ts
// src/routes/create.ts
await ticket.save();
await new TicketCreatedPublisher(client).publish({
  id: ticket.id,
  title: ticket.title,
  price: ticket.price,
  userId: ticket.userId,
});
```

## NATS Client Singleton

Cần connect đến NATS trước khi app.listen.

![microservice-dg-185](/img/docs/microservices/microservices-dg-185.png)

## Remember Mongoose ?

![microservice-dg-186](/img/docs/microservices/microservices-dg-186.png)
![microservice-dg-187](/img/docs/microservices/microservices-dg-187.png)

```ts
// src/nats-wrapper.ts
import nats, { Stan } from "node-nats-streaming";

class NatsWrapper {
  private _client?: Stan;

  connect(clusterId: string, clientId: string, url: string) {
    this._client = nats.connect(clusterId, clientId, { url });

    return new Promise<void>((resolve, reject) => {
      this._client!.on("connect", () => {
        console.log("Connected to NATS !");
        resolve();
      });

      this._client!.on("error", (err) => {
        reject(err);
      });
    });
  }
}
export const natsWrapper = new NatsWrapper();
```

```ts
// src/index.ts
try {
  await natsWrapper.connect('ticketing', 'drgdrgd', 'http://nats-srv:4222')
  await mongoose...
} catch (error) {
  console.error(error)
}
```

## Accessing the NATS client

```ts
class NatsWrapper {
  get client() {
    if (!this._client) {
      throw new Error("Cannot access NATS client before connecting");
    }

    return this._client;
  }
}
```

Get client on create ticket route

```ts
await new TicketCreatedPublisher(natsWrapper.client).publish({
  id: ticket.id,
  title: ticket.title,
  price: ticket.price,
  userId: ticket.userId,
});
```

## Graceful Shutdown

```ts
// index.ts
try {
  await natsWrapper.connect("ticketing", "drgdrgd", "http://nats-srv:4222");
  natsWrapper.client.on("close", () => {
    console.log("NATS connection closed !");
    process.exit();
  });

  process.on("SIGINT", () => natsWrapper.client.close());
  process.on("SIGTERM", () => natsWrapper.client.close());
} catch (error) {
  console.error(error);
}
```

## Ticket Update Publishing

```ts
// src/events/publishers/ticket-update-publisher.ts
export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
}
```

```ts
// src/routes/update.ts
await ticket.save();
new TicketUpdatedPublisher(natsWrapper.client).publish({
  id: ticket.id,
  title: ticket.title,
  price: ticket.price,
  userId: ticket.userId,
});

res.send(ticket);
```

## Failed Event Publishing

![microservice-dg-188](/img/docs/microservices/microservices-dg-188.png)
Đối với trường hợp tạo mới ticket ta đã await cho đến khi publishing event hoàn thành rồi mới send ticket về cho user. Lúc này nếu có bất kỳ lỗi nào xảy ra trong 2 await kia thì hệ thống đều bắt được và thông báo lỗi cho user.

![microservice-dg-189](/img/docs/microservices/microservices-dg-189.png)
Còn với update ticket thì ta đã không await, việc này sẽ giúp resquest không bị trễ bị ít do phải chờ publish event, tuy nhiên nếu publishing event lỗi thì hệ thống không bắt được và vẫn trả lại response cho user là mọi việc đều ổn.

Hãy thử tưởng tượng trường hợp trên xảy ra đối với hệ thống rút gửi tiền của ngân hàng.
![microservice-dg-190](/img/docs/microservices/microservices-dg-190.png)
Ngay sau khi user tạo transaction, transaction service ghi lại transaction vừa rồi nhưng ngay lập tức mất kết nối với NATS và không thể emit được event để accounts service có thể cập nhật được số dư của user.

Vì không await nên ngay sau khi nạp 70, user nhận được thông báo nạp tiền thành công, nhưng vào xem tài khoản thì vẫn chưa được cộng ===> critical issue.

## Handling Publish Failures

![microservice-dg-191](/img/docs/microservices/microservices-dg-191.png)
Để giải quyết vấn đề trên thì ta sẽ lưu lại các events, sau khi lưu thành công event thì sẽ có 1 đoạn code riêng để xử lý và sent events, trường hợp mất kết nối thì đoạn code này sẽ tiếp tục xử lý event này sau khi kết nối lại với nats.

Để đảm bảo là transaction tạo ra nhưng không có event thì ta phải dùng database transation để lưu banking transaction cùng events, nếu 1 trong 2 quá trình save bị lỗi thì phải rollback và báo lỗi đến user.

## Fixing a Few Test

![microservice-dg-192](/img/docs/microservices/microservices-dg-192.png)
![microservice-dg-193](/img/docs/microservices/microservices-dg-193.png)

## Providing a Mock Implementation

![microservice-dg-194](/img/docs/microservices/microservices-dg-194.png)

```ts
// src/__mocks__/nats-wrapper.ts
export const natsWrapper = {};
```

```ts
// src/routes/__test__/create.test.ts
jest.mock("../../nats-wrapper");
```

![microservice-dg-196](/img/docs/microservices/microservices-dg-196.png)
![microservice-dg-197](/img/docs/microservices/microservices-dg-197.png)

```ts
// src/__mocks__/nats-wrapper.ts
export const natsWrapper = {
  client: {
    publish: (subject: string, data: string, callback: () => void) => {
      callback();
    },
  },
};
```

Vậy là ta đã thêm được mock cho create event handler, tuy nhiên ta sẽ không thêm `jest.mock("../../nats-wrapper")` ở mọi nơi mà sẽ chỉ setup 1 lần ở file setup

```ts
// src/test/setup.ts
jest.mock("../nats-wrapper");

beforeEach(async () => {
  jest.clearAllMocks();
});
```

## Ensuring Mock Invocations

Hiện tại thì các test đã pass tuy nhiên chưa có gì chắc chắn là các event đã được publish.

```ts
// src/__mocks__/nats-wrapper.ts
export const natsWrapper = {
  client: {
    publish: jest
      .fn()
      .mockImplementation(
        (subject: string, data: string, callback: () => void) => {
          callback();
        },
      ),
  },
};
```

```ts
// src/routes/__test__/create.test.ts
// ở 1 test bát kỳ có gọi đến nats ta có thể expect rằng hàm publish của mock implementation đã được gọi
expect(natsWrapper.client.publish).toHaveBeenCalled();
```

## NATS Env Variables

Hiện tại thì ta đang kết nối với NATS qua hardcode string, ta sẽ dùng env variables để thay thế

```yml
containers:
  - name: tickets
    env:
      - name: NATS_CLIENT_ID
        valueFrom:
          fieldRef:
            fieldPath: metadata.name
      - name: NATS_URL
        value: "http://nats-srv:4222"
      - name: NATS_CLUSTER_ID
        value: ticketing
```
