---
sidebar_position: 3
---

# Fundamentals

## 1. Custom providers

### Dependency Injection fundamentals

Là một kỹ thuật inversion of control (IoC), bạn ủy nhiệm khởi tạo(instantiation) các dependencies cho IoC container (trường hợp của chúng ta là NestJS runtime system), thay vì khởi tạo thủ công.

Hoạt động như sau:

1. Trong `cats.service.ts`, `@Injectable()` decorator khao báo rằng CatsService class có thể được quản lý bởi Nest IoC container.
2. Trong `cats.controler.ts`, `CatsController` khai báo một dependency với constructor injection:

```ts
constructor(private catsService: CatsService)
```

3. Trong `app.module.ts`, đăng ký CatsService là một provider.

Khi Nest IoC container khởi tạo một `CatsController`, đầu tiên nó sẽ xem class này có dependencies nào không, nếu tìm thấy `CatsService` dependency nó sẽ tìm kiếm class này, giả định định rằng sử dụng `SINGLETON` scope(mặc định), Nest sẽ hoặc là tạo một instance sau đó cache và return nó hoặc là trả về class đang tồn tại.

## 2. Injection scopes

Hầu hết mọi người đến từ một ngôn ngữ lập trình khác có thể bất ngờ khi biết rằng trong Nest, hầu hết mọi thứ đều được shared cho mọi requests. Một connection pool đến database, singleton services, global state, etc. NodeJs không tuân theo model request/response stateless nhiều thread - mỗi request được xử lý bởi 1 luồng riêng biệt.

Tuy nhiên, có một vài trường hợp ta mong muốn provider có hành vi giống như vậy chẳng hạn như caching trên mỗi request trong các ứng dụng GraphQl, request tracking, multi-tenancy.

### Provider scopes

Một provider có thể có một trong các scopes sau:

- `DEFAULT`: Một instance duy nhất của provider được chia sẻ trên toàn bộ application. Một khi application bootstrapped, tất cả các singleton providers đều được khởi tạo.
- `REQUEST`: Một instance mới của provider sẽ được tạo ra cho mỗi request. Instance này sẽ được garbage-collected sau khi request được xử lý hoàn tất.
- `TRANSIENT`: Các transient providers không được chia sẻ cho mọi consumers. Mỗi consumer inject một transient provider sẽ nhận được 1 instance mới.

```ts
import { Injectable, Scope } from "@nestjs/common";

@Injectable({ scope: Scope.REQUEST })
export class CatsService {}
```

### Controller scope

```ts
@Controller({
  path: "cats",
  scope: Scope.REQUEST,
})
export class CatsController {}
```

## 3. Circular dependency

Circular dependency xảy ra khi 2 classes depend lẫn nhau. Trong nest thì cd có thể xảy ra giữa các modules và giữa các providers.

Trong khi circular dependencies luôn nên tránh, không phải bao giờ bạn cũng tránh được nên Nest cung cấp 2 giải pháp sau:

- forward referencing
- ModuleRef

### Forward reference

Một **forward reference** cho phép Nest reference classes chưa được defined bằng cách sử dụng `forwardRef()`. Ví dụ, nếu `CatsService` và `CommonService` depend lẫn nhau, ở cả 2 phía có thể sử dụng `@Inject()` và `@forwardRef()` để resolve CD.

```ts
// cats.service.ts
@Injectable()
export class CatsService {
  constructor(
    @Inject(forwardRef(() => CommonService))
    private commonService: CommonService
  ) {}
}
```

```ts
// common.service.ts
@Injectable()
export class CommonService {
  constructor(
    @Inject(forwardRef(() => CatsService))
    private catsService: CatsService
  ) {}
}
```

### ModuleRef

```ts
@Module({
  imports: [forwardRef(() => CatsModule)],
})
export class CommonModule {}
```

## 4. Module reference

Nest cung cấp `ModuleRef` class để navigate đến internal list các providers và nhận references.

## 5. Lazy-loading modules

Mặc định, ngay khi ứng dụng được loads thì tất cả các modules đều được load bất kể có cần thiết hay không. Điều này ổn với hầu hết tất cả các apps ngoại trừ `serverless` khi "cold start" rất quan trọng.

Lazy loading giúp giảm thời gian bootstrap bằng cách chỉ load những required modules hơn nữa thì bạn cũng có thể load các modules khác một cách bất đồng bộ một khi serverless function đã "warm".

## 6. Execution context

Nest cung cấp một số classes tiện ích giúp dễ dàng viết các ứng dụng hoạt động trên nhiều bối cảnh ứng dụng (ví dụ: Nest HTTP dựa trên máy chủ, microservices và bối cảnh ứng dụng WebSockets). Những tiện ích này cung cấp thông tin về execution context hiện tại có thể được sử dụng để build các guards chung, filters, interceptors chung mà có thể hoạt động trên nhiều controllers, methods, execution contexts.

### ArgumentsHost class

Lớp này cung cấp một số methods để nhận các arguments được truyền tới một handler.

## 5. Lifecycle events

Nest application và các thành phần của nó đều có một vòng đời và được quản lý bởi Nest. Nest cung cấp các lifecycle hooks giúp hiện thị lifecyle events chính và khả năng hoạt động (chạy code đã được registered trên module, injectable hoặc controller) khi chúng xảy ra.

![image](/img/docs/nestjs/lifecycle-events.png)

## 6. Testing

Automated testing được xem là một phần thiết yếu của bất cứ nỗ lực phát triển phần mềm nghiêm túc nào. Automation giúp việc repeat các tests cụ thể hoặc các bộ test nhanh và dễ hơn trong quá trình developement.

Một số tính năng Nest cung cấp:

- Tự động xây dựng các test mặc định cho cả unit tests và e2e tests.
- Cung cấp công cụ test runner được build tách biệt với app.
- Tích hợp Jest và Supertest.
- Mocking dependency injection dễ dàng.
