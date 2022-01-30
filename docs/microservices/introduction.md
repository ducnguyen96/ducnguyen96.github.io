---
sidebar_position: 1
---

# Introduction

## Services communication methods

### Sync

**Hoạt động**
Gửi request trực tiếp đến service chứa thông tin.

Ví dụ: Service D cần lấy thông tin của những products được ordered bởi 1 user cụ thể . Sau khi nhận được request từ client thì service D gửi request trực tiếp đến service A để xác nhận thông tin user, sau đó thì lại tiếp tục gửi request đến service D để lấy thông tin các orders của user, và cuối cùng request đến service B để lấy thông tin của products.
**Pros**

- Dễ hiểu
- Không cần thêm 1 database
  **Cons**
- Có depend với các service khác
- Nếu có 1 service nào mà request cần gọi tới fails --> request đó sẽ fails
- Có thể dễ dàng dẫn tới cả mạng lưới requests ở những services depend với nhau.

### Async

**Hoạt động**
Giao tiếp với nhau thông qua `events`.

Ví dụ: Service D nhận dược request từ client thì sẽ emit 1 event type là UserQuery và data là user_id, service A lắng nghe và thấy có 1 event cần xử lý thì sẽ lấy user_id và query thông tin của user sau đó emit 1 event với type là UserQueryResult cùng data. Service D lắng nghe thấy có 1 event như vậy thì lấy thông tin rồi tiếp tục emit những event khác để có đầy đủ thông tin cần thiết.
**Pros**

- Dễ hiểu.
- Không cần thêm database.
  **Cons**
- Có depend với các service khác
- Nếu có 1 service nào mà request cần gọi tới fails --> request đó sẽ fails
- Có thể dễ dàng dẫn tới cả mạng lưới requests ở những services depend với nhau.

### Kết hợp Async và database.

Cũng với ví dụ trên - service D cần show ra thông tin của những products được ordered của 1 user cụ thể. Lần này ta sẽ sử dụng giao tiếp dựa vào event cùng với 1 database. Để sử dụng 1 cách hiệu quả phương pháp này thi servce D cần trình bày rõ ra những thông tin mình cần để hạn chế việc duplicate database 1 cách tối đa.

![micro-service-1](/img/docs/microservices/microservice-1.png)
Cách thức hoạt động như sau: Mỗi khi có 1 user mới được tạo ra thì ở service A ta sẽ emit thêm 1 event để service D có thể thêm vào bảo user id của user cùng với product_ids là rỗng. Mỗi khi có 1 product được tạo ra thì tương tự emit 1 event để có thể cập nhật vào bảng products của serivce D và service C sẽ emit 1 event để update product_ids của bảng user.

Vậy mỗi khi có request service D đã có sẵn đầy đủ thông tin để response.
**Pros**

- Không có depend với những service khác.
- Sẽ rất nhanh vì đã có sẵn đầy đủ thông tin.
  **Cons**
- Data duplication, mặc dù bị trùng lặp data nhưng ta chỉ trùng những thông tin quan trọng và hơn nữa nếu có sử dụng storage của cloud thì cũng rất rẻ để lưu thêm thông tin như vậy, gần như là free.
- Hơi khó hiểu.

## Missing Events

![missing-event](/img/docs/microservices/microservice-missing-event.png)
Missing event xảy ra khi có 1 event được emit nhưng service cần lắng nghe lại không hoạt động vào lúc đấy.

**Cách giải quyết**
![resolve-missing-event](/img/docs/microservices/microservice-resolve-missing-event.png)
Ta sẽ sử dụng thêm 1 database để lưu lại những event đã được emit, khi 1 service được gọi đến thì đầu tiên sẽ query xem database còn event nào service này cần thực hiện mà chưa thực hiện thì sẽ xử lý nó trước rồi xử lý các event tiếp theo.
