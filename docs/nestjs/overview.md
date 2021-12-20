---
sidebar_position: 2
---

# Overview

## 1. Controllers

`Controllers` có trách nhiệm xử lý các requests và trả lại responses cho client.

![img](/img/docs/nestjs/Controllers_1.png)

Mục đích của `controllers` là nhận các `requests` cụ thể cho ứng dụng. Cơ chế `routing` kiểm soát `controller` nào nhận được `request` nào. Thông thường, mỗi `controller` có nhiều hơn một `route` và các `route` khác nhau có thể thực hiện các hành động khác nhau.

Để tạo một `controller` cơ bản, ta sử dụng classes và decorators. `Decorators` liên kết các classes với `metadata` và cho phép Nest tạo `routing map` (liên kết `requests` với `controller` tương ứng).

```ts
// cats.controller.ts
import { Controller, Get, Req } from "@nestjs/common";
import { Request } from "express";

@Controller("cats")
export class CatsController {
  @Get("all")
  @Header("Cache-Control", "none") // headers
  @HttpCode(204) // status code
  findAll(@Req() request: Request): string {
    // request object
    return "This action returns all cats";
  }

  @Get("docs")
  @Redirect("https://docs.nestjs.com", 302) // redirect
  getDocs(@Query("version") version) {
    if (version && version === "5") {
      return { url: "https://docs.nestjs.com/v5/" };
    }
  }

  @Get(":id")
  findOne(@Param() params): string {
    // route parameters
    console.log(params.id);
    return `This action returns a #${params.id} cat`;
  }
}
```

Sub-domain routing

```ts
@Controller({ host: "admin.example.com" })
export class AdminController {
  @Get()
  index(): string {
    return "Admin page";
  }

  @Get()
  async findAll(): Promise<any[]> {
    // asynchronicity
    return [];
  }
}
```

Request payloads

```ts
export class CreateCatDto {
  name: string;
  age: number;
  breed: string;
}

@Post()
async create(@Body() createCatDto: CreateCatDto) {
  return 'This action adds a new cat';
}
```

## 2. Providers

`Providers` là một khái niệm cơ bản trong Nest. Nhiều Nest classes cơ bản có thể được coi như một `providers` - services, repositories, factories, helpers, v.v. Ý tưởng chính của một `providers` là nó có thể được `injected` như là `dependency`; điều này có nghĩa là `objects` có thể tạo ra nhiều `relationship` khác nhau với nhau và chức năng `wiring up` các `instances` của `object` phần lớn có thể được ủy quyền cho Nest.

![img](/img/docs/nestjs/Components_1.png)

### Services

Hãy bắt đầu bằng cách tạo một CatsService đơn giản. `Service` này sẽ chịu trách nhiệm lưu trữ và truy xuất dữ liệu và được thiết kế để sử dụng bởi `CatsController`, vì vậy nó là một ứng cử viên sáng giá để được xác định là một `provider`.

```ts
// cats.services.ts
import { Injectable } from "@nestjs/common";
import { Cat } from "./interfaces/cat.interface";

@Injectable()
export class CatsService {
  private readonly cats: Cat[] = [];

  create(cat: Cat) {
    this.cats.push(cat);
  }

  findAll(): Cat[] {
    return this.cats;
  }
}
```

`CatsService` là một class cơ bản với một thuộc tính và hai phương thức. Tính năng mới duy nhất là nó sử dụng `decorator` `@Injectable()`. Decorator `@Injectable()` đính kèm `metadata`, `metadata` này nói rằng `CatsService` là một lớp có thể được quản lý bởi Nest IoC container.

```ts
// cats.controller.ts
import { Controller, Get, Post, Body } from "@nestjs/common";
import { CreateCatDto } from "./dto/create-cat.dto";
import { CatsService } from "./cats.service";
import { Cat } from "./interfaces/cat.interface";

@Controller("cats")
export class CatsController {
  constructor(private catsService: CatsService) {}

  @Post()
  async create(@Body() createCatDto: CreateCatDto) {
    this.catsService.create(createCatDto);
  }

  @Get()
  async findAll(): Promise<Cat[]> {
    return this.catsService.findAll();
  }
}
```

`CatsService` được `injected` thông qua `constructor`. Cách viết tắt này cho phép chúng ta vừa khai báo vừa khởi tạo `CatService` ngay lập tức ở cùng một vị trí.

### Dependency Injection (DI)

Nest được xây dựng dựa trên `design pattern` được gọi là Dependency Injection (DI).

Mình sẽ có 1 bài blog về DI riêng - hoặc bạn có thể tham khảo thêm [ở đây](https://angular.io/guide/dependency-injection)

### Scopes

Các `providers` thường có scope("phạm vi") được đồng bộ hóa với vòng đời ứng dụng. Khi ứng dụng được khởi động(bootstrapped), mọi `dependencies` phải được resolved và do đó mọi `providers` phải được khởi tạo. Tương tự, khi ứng dụng tắt, mỗi `providers` sẽ bị hủy.

Đọc thêm [ở đây](https://docs.nestjs.com/fundamentals/injection-scopes)

### Custom providers

Nest tích hợp `inversion of control` ("IoC") giúp giải quyết các mối quan hệ giữa các `providers`. Tính năng này làm cơ sở cho tính năng `dependency injection` được mô tả ở trên, nhưng trên thực tế, nó `powerfull` hơn nhiều so với những gì đã mô tả. Có một số cách để define một `provider`: plain values, classes và các async hoặc sync factories.

Đọc thêm [ở đây](https://docs.nestjs.com/fundamentals/dependency-injection)

### Optional providers

```ts
import { Injectable, Optional, Inject } from "@nestjs/common";

@Injectable()
export class HttpService<T> {
  constructor(@Optional() @Inject("HTTP_OPTIONS") private httpClient: T) {}
}
```

### Property-based injection

Các kỹ thuật inject ở phía trên gọi là `constructor-based injection` vì các providers đưuọc injected qua constructor. Trong một số trường hợp, `property-based injection` có thể hữu ích. Ví dụ, ở phần trên cùng của class có thể dùng 1 hoặc nhiều providers, việc sử dụng chúng bằng cách gọi `super()` trong tất cả các sub-classes từ constructor rất phiền, để tránh điều này thì ta có thể làm như sau:

```ts
import { Injectable, Inject } from "@nestjs/common";

@Injectable()
export class HttpService<T> {
  @Inject("HTTP_OPTIONS")
  private readonly httpClient: T;
}
```

### Provider registration

```ts
// app.module.ts
import { Module } from "@nestjs/common";
import { CatsController } from "./cats/cats.controller";
import { CatsService } from "./cats/cats.service";

@Module({
  controllers: [CatsController],
  providers: [CatsService],
})
export class AppModule {}
```

### Manual instantiation

Ở phía trên thì chúng ta nêu ra cách Nest tự động handle các chi tiết về resolve dependencies. Trong một số trường hợp, bạn có thể cần lấy và khởi tạo các providers một cách thủ công.

Để có thể lấy được các instances đang tồn tại hay khởi tạo provider một cách dynamically thì có thể sử dụng `Module reference`.

## 3. Modules

Mô-đun là một class được chú thích bằng decorator `@Module()`. `@Module()` cung cấp `metadata` mà Nest sử dụng để tổ chức cấu trúc ứng dụng.

![image](/img/docs/nestjs/Modules_1.png)

Mỗi ứng dụng có ít nhất một mô-đun - `root module`. `Root module` là điểm khởi đầu Nest sử dụng để xây dựng biểu đồ ứng dụng - cấu trúc dữ liệu nội bộ mà Nest sử dụng để resolve relationships và dependencies của mô-đun và providers. Trong khi các ứng dụng rất nhỏ về mặt lý thuyết có thể chỉ có mô-đun gốc, đây không phải là trường hợp điển hình. Các mô-đun được khuyến khích sử dụng như một cách hiệu quả để tổ chức các thành phần của bạn. Do đó, đối với hầu hết các ứng dụng, kiến trúc sẽ sử dụng nhiều mô-đun, mỗi mô-đun đóng gói một tập hợp các chức năng có liên quan chặt chẽ với nhau.

### Feature modules

`CatsController` và `CatsService` thuộc về cùng một domain. Vì chúng liên quan chặt chẽ với nhau nên rất hợp lý để đưa chúng vào cùng một module. Một `feature module` tổ chức code liên quan đến một feature cụ thể. Điều này giúp chúng ta quản lý sự phức tạp và phát triển theo nguyên tắc `SOLID`.

```ts
// cats/cats.module.ts
import { Module } from "@nestjs/common";
import { CatsController } from "./cats.controller";
import { CatsService } from "./cats.service";

@Module({
  controllers: [CatsController],
  providers: [CatsService],
  exports: [CatsService],
})
export class CatsModule {}
```

### Shared modules

Trong Nest, các modules được mặc định là `singletons` vì vậy bạn có thể chia sẻ cùng một instance của bất cứ provider nào giữa các modules một cách dễ dàng.
![image](/img/docs/nestjs/Shared_Module_1.png)

Mỗi module được tự động xem là một shared module. Mỗi khi được tạo nó có thể được tái sử dụng mởi bất cứ module nào. Để có thể sử dụng được bởi module khác thì ta phải export provider muốn share.

Bây giờ bất cứ module nào import `CatsModule` sẽ có thể access cùng 1 instance `CatsService`.

### Module re-exporting

```ts
@Module({
  imports: [CommonModule],
  exports: [CommonModule],
})
export class CoreModule {}
```

### Global module

Nếu bạn phải import cùng một module ở tất cả mọi nơi thì rất là phiền. Bạn có thể sử dụng `@Global()` decorator để set nó là một global module. Bây giờ thì tất cả các providers của module này đều available everywhere.

### Dynamic modules

Hệ thống module trong Nest có một tính năng rất mạnh được gọi là `dynamic modules`. Tính năng này cho phép bạn có thể tạo các modules có thể custom và có thể register và config các provider một cách linh động.

```ts
import { Module, DynamicModule } from "@nestjs/common";
import { createDatabaseProviders } from "./database.providers";
import { Connection } from "./connection.provider";

@Module({
  providers: [Connection],
})
export class DatabaseModule {
  static forRoot(entities = [], options?): DynamicModule {
    const providers = createDatabaseProviders(options, entities);
    return {
      module: DatabaseModule,
      providers: providers,
      exports: providers,
    };
  }
}
```

## 4. Moddileware

Middleware là một function được gọi trước route handler. Các middleware functions có quyền truy cập đến request, response objects và hàm `next()`.
![image](/img/docs/nestjs/Middlewares_1.png)

Nest middlewares mặc định tương đương với middleware trong express, nó dùng để thực hiện các nhiệm vụ sau:

- Thực thi code.
- Thay đổi request và response objects.
- Kết thúc vòng đời của request-response.
- Gọi đến middleware tiếp theo.
- Nếu middleware hiện tại không kết thúc vòng đời thì bắt buộc phải gọi next, không thì sẽ bị treo.

```ts
// logger.middleware.ts
import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log("Request...");
    next();
  }
}
```

### Applying middleware

Chúng ta không thể sử dụng middleware trong `@Module()` mà thay vào đó thì sử dụng `configure()` method trong module class. Module sử dụng middleware yêu cầu phải implement `NestModule` interface.

```ts
// app.module.ts
import { Module, NestModule, MiddlewareConsumer } from "@nestjs/common";
import { LoggerMiddleware } from "./common/middleware/logger.middleware";
import { CatsModule } from "./cats/cats.module";

@Module({
  imports: [CatsModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      // .exclude(
      //   { path: 'cats', method: RequestMethod.GET },
      //   { path: 'cats', method: RequestMethod.POST },
      //   'cats/(.*)',
      // )
      .forRoutes("cats");
    // .forRoutes({ path: 'cats', method: RequestMethod.GET });
  }
}
```

### Functional middleware

```ts
import { Request, Response, NextFunction } from "express";

export function logger(req: Request, res: Response, next: NextFunction) {
  console.log(`Request...`);
  next();
}
```

```ts
consumer.apply(logger).forRoutes(CatsController);
```

### Multiple middleware

```ts
consumer.apply(cors(), helmet(), logger).forRoutes(CatsController);
```

### Global middleware

```ts
const app = await NestFactory.create(AppModule);
app.use(logger);
await app.listen(3000);
```

## 5. Exception filters

Exception filters chịu trách nhiệm xử lý tất cả các exception chưa được xử lý xuyên suốt applicaiton. Khi một exception không được xử lý bởi code của bạn nó sẽ được layer này phát hiện và tự động gửi lại 1 response hợp lý đến user.

![image](/img/docs/nestjs/Filter_1.png)

### Throw standard exceptions

```ts
@Get()
async findAll() {
  throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
}
```

## 6. Pipes

Một pipe là một class với `@Injectable()` decorator
![image](/img/docs/nestjs/Pipe_1.png)

Pipes cps 2 công dụng điển hình:

- **transformation**: transform input data sang một form mong muốn (từ string sang integer).
- **validation**: đánh giá input data, nếu valid thì không thay đổi còn không thì sẽ throw một exception.

### Binding pipes

Để sử dung jpipe chúng ta cần bind một instance của pipe class đến một context phù hợp.

```ts
@Get(':id')
async findOne(@Param('id', ParseIntPipe) id: number) {
  return this.catsService.findOne(id);
}
```

Pipe này đảm bảo rằng hoặc là tham số ta nhận được trong findOne là number hoặc là nó sẽ throw 1 exception trước khi route handler được gọi, tránh trường hợp findOne bị gọi.

### Class validator

```ts
import { IsString, IsInt } from "class-validator";

export class CreateCatDto {
  @IsString()
  name: string;

  @IsInt()
  age: number;

  @IsString()
  breed: string;
}
```

```ts
import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from "@nestjs/common";
import { validate } from "class-validator";
import { plainToClass } from "class-transformer";

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }
    const object = plainToClass(metatype, value);
    const errors = await validate(object);
    if (errors.length > 0) {
      throw new BadRequestException("Validation failed");
    }
    return value;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
```

```ts
@Post()
async create(
  @Body(new ValidationPipe()) createCatDto: CreateCatDto,
) {
  this.catsService.create(createCatDto);
}
```

## 7. Guards

Một guard là một class với `@Injectable()` decorators.

Guards có một nhiệm vụ duy nhất. Chúng quyết định xem 1 request cụ thể sẽ được xử lý bởi route handler hay không dựa vào một số điều kiện nhất định (permission, routes, ACLs, etc.). Nhiệm vụ này có thể được xem là authorization. Authorization thường được xử lý bởi middleware trong có express app. Middleware là một lựa chọn tốt cho authentication. Nhưng bản thân middleware thì `dumb`. Nó không biết handler nào sẽ được thực thi sau khi `next()` được gọi. Mặt khác thì **Guards** có quyền truy cập đến `ExecutionContext` và biết chính xác handler nào sẽ được thực thi.Chúng được thiết kế gióng với filter, pipes và interceptors cho phép bạn can thiệp vào xử lý logic.

Gợi ý: Guards được thực thi sau mỗi middleware và trước interceptor và pipe.

### Authorization guard

```ts
import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { Observable } from "rxjs";

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    return validateRequest(request);
  }
}
```

Mỗi guard đều phải implement một `canActive()` function. Function này trả về một boolean chỉ ra rằng request hiện tại có được cho phép hay không.

### Execution context

Hàm `canActive()` nhận một argument duy nhất là `ExecutionContext` - kế thừa từ `ArgumentsHost` và thê một số helper methods cung cấp details về execution process hiện tại. Những chi tiết này có thể giúp ích cho việc xây dựng guards bao quát hơn có thể sử dụng được trên nhiều controllers, methods, execution contexxts.

### Role-based authentication

Chi tiết: https://docs.nestjs.com/guards#putting-it-all-together

```ts
import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>("roles", context.getHandler());
    if (!roles) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    return matchRoles(roles, user.roles);
  }
}
```

```ts
@Controller("cats")
@UseGuards(RolesGuard)
export class CatsController {}
```

### Setting roles per handler

```ts
@Post()
@SetMetadata('roles', ['admin'])
async create(@Body() createCatDto: CreateCatDto) {
  this.catsService.create(createCatDto);
}
```

Hoặc

```ts
// roles.decorator.ts
import { SetMetadata } from "@nestjs/common";

export const Roles = (...roles: string[]) => SetMetadata("roles", roles);
```

```ts
// cats.controller.ts
@Post()
@Roles('admin')
async create(@Body() createCatDto: CreateCatDto) {
  this.catsService.create(createCatDto);
}
```

## 8. Interceptors

Sở hữu nhiều ứng dụng dựa trên AOP technique:

- bind logic trước và sau khi method được thực thi.
- transform result từ một function.
- transform exception được thrown từ một function.
- mở rộng hành vi của function.
- override hoàn toàn một function dựa trên một số điều kiện cụ thể (chẳng hạn caching).

Tham khảo thêm: https://docs.nestjs.com/interceptors
