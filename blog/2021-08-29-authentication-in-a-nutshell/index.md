---
slug: authentication-in-a-nutshell
title: Authentication in a nutshell
authors: [ducnguyen96]
tags: [authentication]
---

# Authentication in a nutshell

Như đã nói trong bài [này](/posts/backend/http-in-a-nutshell/), http không giữ trạng thái giữa 2 lần request vì vậy ví dụ sau khi đăng nhập sau, user đến một page nào đó cần xác minh chẳng hạn như setting thì user lại bị yêu cầu đăng nhập lần nữa. Nhưng với session hoặc token authentication thì server có thể nhận biết là user đã đăng nhập và nên được cấp quyền truy cập.

## Session based authentication

Sever tạo và lưu lại dữ liệu session ở server và lưu trữ session id trên trình duyệt của user.

![sesssion-based-authentication](/img/blogs/session-based-authentication.png)

- user đến trang đăng nhập vào gửi thông tin đăng nhập đến server.
- server sẽ tạo 1 session và lưu trữ lại, sau đó gửi session id vừa tạo cho user.
- user gửi request lấy profile của user (kèm session id).
- server so sánh session id với session data đã lưu để nhận biết user và gửi lại đúng profile của user này.

Vậy có thể nói trạng thái của user được lưu ở server.

## Token based authentication

Đối với token based authentication thì trạng thái của user được lưu ở client và phương pháp này được khuyên dùng hơn so với phương pháp session based.
![token-based-authentication](/img/blogs/token-based-authentication.png)

- user đến trang đăng nhập vào gửi thông tin đăng nhập đến server.
- Dữ liệu của người dùng sẽ được mã hóa dưới dạng JWT (Json Web Token) bằng 1 đoạn mã và gửi về client.
- JWT được lưu ở client (hầu hết là ở localStorage).
- user gửi request lấy profile của user (kèm jwt).
- Server nhận được JWT, sử dụng đoạn mã đã dùng để tạo ra JWT để giải mã và có thông tin người dùng.
- Server gửi lại đúng profile của user.

## OAuth

_Về cơ bản thì oauth là một phương thức chứng thực, mà nhờ đó một web service hay một application bên thứ 3 có thể đại diện cho người dùng để truy cập vào tài nguyên người dùng nằm trên một dịch vụ nào đó._

![oauth-flow](/img/blogs/blog-open1.webp)

Ở đây user chính là người dùng app của bạn, consumer là app của bạn - Yelp và service provider có thể là google, facebook,...

Khi người dùng click vào đăng nhập với google thì app của bạn sẽ direct bạn đến google, nếu bạn chưa đăng nhập google thì sẽ phải đăng nhập, sau đó google sẽ hỏi bạn đồng ý trao quyền truy cập cho Yelp. Sau khi bạn đồng ý thì google sẽ điều hướng bạn về Yelp cùng với 1 `Authorization Code`. Yelp gửi `Authorization Code` cho `Authorization Server` của google và nhận lại được `accessToken`. Yelp sẽ sử dụng `accessToken` này và gửi đến `Resource server` của google để nhận về được `resource` như avatar hoặc email,...

## JWT

Tham khảo [ở đây](https://viblo.asia/p/tim-hieu-ve-json-web-token-jwt-7rVRqp73v4bP)
