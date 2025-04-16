---
slug: system-design-ecommerce-marketplace
title: "System Design Example: ECommerce Marketplace"
authors: [ducnguyen]
tags: [system design]
---

# System Design Example: E-Commerce Marketplace

Ở bài viết này thì mình sẽ design một hệ thống phức tạp khác - E-Commerce Marketplace.

Cũng như bài trước thì mình vẫn theo một phương phác gồm các bước sau để đạt được các functional và non-functional requirement của hệ thống:

- Thu thập các requirements
- Thiết kế API (bài viết này xin bỏ qua phần này vì mình sẽ chỉ tập trung và thiết kế hệ thống)
- Tạo diagram mô tả hệ thống đáp ứng được các functional requirements
- Tinh chỉnh diagram để đáp ứng được các non-functional requirements

Về tổng quan thì ta cần thiết kế một hệ thống tương tự như Amazone, Shopee, Lazada hay Tiki.

<!-- truncate -->

Đối tượng sử dụng chính là:

- Merchants:

  - Upload products
  - Sell products

- Buyers:

  - Browse(lướt) qua products
  - Search products
  - Buy products

## 1. Thu thập các requirements

### 1.1. Functional Requirement

Ở đây thì ta sẽ chia ra requirements cho các đối tượng riêng biệt vì cách/mục tiêu 2 đối tượng này sử dụng hệ thống của chúng ta hoàn toàn khác nhau.

**Merchants**

Đối với merchants thì ta sẽ quan tâm tới một số câu hỏi như:

- Loại sản phẩm sẽ bán, vật lý hay dạng digital?
- Những thông tin nào về sản phẩm merchant sẽ cung cấp.
- Nhưng data nào mà ta cần cung cấp cho Merchants.
- Merchants có thể thực hiện được những operations nào trên hệ thống?

**Users/Buyers**

Đối với buyers thì mình sẽ quan tâm tới một số vấn đề như:

- User có cần đăng ký để tìm kiếm/mua product không?
- Ta có cần phải design luôn cả phần review sản phẩm hay không?
- Cần cung cấp những tính năng gì cho công cụ tìm kiếm.
- Có cần thiết phải design luôn phần checkout/payment/delivery không hay sử dụng bên thứ 3.
- Phiên bản UI cần hỗ trợ(có cần cả web cả mobile không)

Mình sẽ tự trả lời các câu hỏi trên để có được các requirements cho bài design hôm nay. Và kết quả là ta có một số requirements sau.

#### Product Requirements

- Các sản phẩm có thể bán là sản phẩm vật lý
- Mỗi product chứa các thông tin:

  - Title
  - Description
  - Categories
  - Images
  - Optional attributes (sizes, colors, etc)

**Với Marchants**

- Cần **một hệ thống quản lý products**(Product Management System) cho **merchants** với các tính năng:

  - Signup
  - Create new products
  - Update product properties
  - Update product inventory
  - View product data

- Cần thêm **hệ thống phân tích sản phẩm**(Product Analytics) với các tính năng:

  - View real-time số lượng visitor trên từng product
  - View lịch sử về performance của từng product

**Với users/buyers**

- Storefont

  - User có thể sử dụng web/mobile để:

    - Browse products
    - Search products với title/categories/description

- Checkout

  - Navigate checkout page và xem chi tiết về số tiền cần thanh toán.
  - Hoàn thành thanh toán sau khi đã cung cấp thông tin về shipping và payments.
  - Hệ thống cần gửi các thông tin cập nhật về order cho buys qua email/notifications.

**NOTE:** Bài viết này sẽ hạn chế scope của hệ thống và không bao gồm phần:

- User registration
- Product reviews
- Delivery
- Payment

### 1.2. Non-functional requirements

Vì mục đích và cách sử dụng hệ thống của merchants và buyers là khác nhau nên ta cũng có những requirements riêng biệt cho từng đối tượng.

**Với merchants**

- Khả năng scale

  - Không cần quá cao vì số lượng merchants sử dụng hệ thống cùng lúc không quá nhiều(vài nghìn merchants).
  - Thời gian sử dụng cũng ngắn hơn

- Performance

  - Với merchant thì repsonse time có thể cao hơn, dưới 1 giây(với tỉ lệ 50%) sẽ khá là ok.

- CAP

  - Ưu tiên CP vì merchants luôn muốn thông tin chính xác nhất về các sản phẩm của họ.

- High Availability

  - Tương tự với performance thì ta có thể thoải mái hơn về uptime(99.5%)

**Với Users/Buyers**

- Khả năng scale

  - 10-100 triệu người dùng hằng ngày.
  - phục vụ users từ nhiều quốc gia
  - Lượng traffic đổ vào sẽ rất cao vào các ngày giảm giá, lễ.

- Performance

  - Product response time < 200ms(50%), 500ms(99%)
  - Checkout response time < 1s(99%)

- CAP

  - Storefont: AP
  - Checkout: CP

- High Availability

  - Uptime 99.99%

## 2. Tạo diagram mô tả các functional requirements

Ta sẽ bắt đầu trước các usage flows của merchants và buyers

import Ecommerce1 from "./images/ecommerce-1.png"

<div style={{ 'textAlign': 'center' }}>
  <img src={Ecommerce1} height="800"/>
</div>

**Merchant flows**

1. Sign Up -> Login
2. Create Product
3. Update Product (inventory/title/prices/...etc)
4. View Analytics

**Buyer flows**

1. Get Products (Paginated --> Infinity Scroll)
2. Search Products (Paginated --> Infinity Scroll)
3. Get Product Details (Metadata + Images)
4. Add Product to Cart
5. Checkout page để điền thông tin shipping.
6. Thực hiện thanh toán, update inventory.
7. Gọi tới API từ dịch vụ shipping từ bên thứ 3.
8. Notify User khi mà trạng thái order thay đổi.

### 2.1. Product Management System(PMS)

Chúng ta sẽ bắt đầu với requirements của merchants.

```
Merchants -> PMS--[(SQL database)]      Products--[(Document Store)]
              |-------|                   ^
                      |                   |
  [(Object Store)]    |-------------------↓
                                        inventory--[(Key/value Store)]
```

Ta cần cung cấp cho merchants 1 web-based UI service để merchant có thể đăng ký và đăng nhập.
Ta sẽ sử dụng một SQL database để lưu thông tin cũng như credentials của merchant.

Sau đó ta cần 1 `Products Service` để merchants có thể tạo và update products. Ta sẽ sử dụng 1 NoSQL(Document Store) để lưu thông tin về products vì các products có thể có các attributes khác nhau, ngoài ra thì ta sẽ cần Object Store để lưu image của product.

Ngoài ra thì ta cần thêm 1 `Inventory Service` để merchant xem và update inventory, ta sẽ dùng Key/value store database để đạt được performance tốt nhất.

### 2.2. Storefront

Ta sẽ tạm thời bỏ qua tính năng analytics của merchant vì vẫn chưa có user để tạo users.

Với storefront thì ta support cả web và mobile nên ta cần thêm 1 `Web App Service` cho web và `API Gateway` cho cả web và mobile để điều hướng request tới đúng service.

```
Merchants -> PMS--[(SQL database)]      Products--[(Document Store)]
              |-------|                   ^
                      |                   |
  [(Object Store)]    |-------------------↓
                                        inventory--[(Key/value Store)]

Web-Users ---> API Gateway --> Web App Service
            |
Mobile-Users
```

#### Products

Merchants và Buyers tương tác với product hoàn toàn khác nhau nên việc sử dụng chung 1 product service sẽ không hợp lý.

| Merchants             | Storefront Usewrs    |
| --------------------- | -------------------- |
| - **Write** nhiều hơn | - **Read** nhiều hơn |
| - Ưu tiên CP          | - Ưu tiên AP         |

**Giải pháp**: CQRS

Ta sẽ cần thêm 1 service `Products Search` sẽ nhận update product event từ `Products` service và lưu vào một database được tối ưu cho việc và search.

```
Merchants -> PMS--[(SQL database)]      Products--[(Document Store)]
              |-------|                   ^
                      |                   |
  [(Object Store)]    |-------------------|
                                          |
                                          ↓
                                        Products--[(Search Database)]
                  |--------------------->Search
                  |
                  |
                  |                     inventory--[(Key/value Store)]
                  |
Web-Users ---> API Gateway --> Web App Service
            |
Mobile-Users
```

### 2.3. Checkout

Ở luồng checkout thì ta sẽ cần thêm `Orders Service`, `Payment Service`, `Shipping Service`.

Ta có thể cho người dùng giữ connection cho tới khi inventory update, payments được xác nhận và shipping thông báo thành công. Tuy nhiên cách này có một vấn đề lớn là ta sẽ phải phụ thuộc vào response time của bên thứ 3 như payments hoặc shipping.

Một cách khác là sau khi `Order Service` nhận được thông tin là inventory đã được update thì ta sẽ response cho user luôn và thực hiện việc thanh toán và shipping một cách bất đồng bộ. Nhược điểm có cách này là nếu có vấn đề gì về payments hoặc shipping thì user sẽ nhận được thông tin này sau khi đã nhận được email/noti báo order thành công. Tuy nhiên điều này là một đánh đổi hợp lý.

Sau khi đã chọn được luồng xử lý thì ta cần tìm cách lưu thông tin về order. Ta có thể sử dụng một database và update dòng dữ liệu của order mỗi khi trạng thái của order thay đổi. Tuy nhiên thì do chỉ lưu 1 trạng thái duy nhất của order tại thời điểm hiện tại nên ta sẽ mất đi các thông tin khác về từng thời điểm cụ thể mà order thay đổi trạng thái.

Vì vậy ta sẽ chọn 1 giải pháp khác là sử dụng Event Sourcing pattern. Sử dụng pattern này ta sẽ đạt được 2 điều:

- `Notification Service` bây giờ có thể subscribe tới message broker để nhận toàn bộ event mỗi khi order có sự thay đổi.
- `Order Recovery Service` - giả sử trường hợp sau khi hoàn tất payments và chuẩn bị gọi tới `Order Service` để update order state và gửi request tới `Shipping Service` thì `Order Service` crashed. `Order Recovery Service` subscribe tới message broker và có thể theo dõi các order đang diễn ra, nếu nó detect được có order vẫn chưa được gửi tới `Shipping Service` trong 1 khoảng thời gian hợp lý thì nó có thể gửi 1 message tới `Order Service` để tiếp tục xử lý order.

### 2.4. Product Analytics

- Để đáp ứng được requirements thì ta cần dữ liệu `real-time` về số lượng visitor của các product pages.
- Ngoài ra để phân tích trend cũng như đánh giá performance của product thì ta cần phân tích từ nhiều nguồn khác nhau và xử lý `dữ liệu trên 1 khoảng thời gian dài` để đạt độ chính xác cao.

Vậy giải pháp cho chúng ta là `Lambda Architecture`

Để có được dữ liệu thì `Analytics Service` của chúng ta sẽ subscribe tới các message mỗi khi user ghé thăm 1 trang product nào đó hay khi user tạo 1 order. Lượng dữ liệu này sau đó được đưa vào 1 kiến trúc gồm 2 layers là Speed để phân tích real-time và batch layer để phân tích lịch sử dữ liệu và đánh giá chính xác trend/performance.

## 3. Tạo diagram mô tả các non-functional requirements

### PMS

Đối với merchant yêu cầu performance không quá cao thì ta có thể sử dụng 1 vài instances cho các service như PMS, Products Service, Inventory Service và đặt chúng sau Load Balancer. Vì số lượng merchants và products không quá nhiều nên ta sẽ không cần chia quá nhiều shards đối với database. Tuy nhiên để đảm bảo không mất dữ liệu thì việc sử dụng thêm 1 vài replicas là cần thiết.

### Storefront

Đây là phần sẽ thú vị hơn vì yêu cầu dành cho phần này cũng cao hơn và chặt chẽ hơn vì bất nếu các quality requirement này không đạt được thì sẽ rất dễ mất user và thất thoát hằng triệu đô.

Đầu tiên thì ta cần đặt các services còn lại sau các load balancer và config để cho hệ thống có thể tự scale khi có lượng tải tăng đột biến. Lưu ý là ta không cần đặt LB trước `Notification Service` cũng như `Order Recovery Service` vì 2 service này subscribe tới message broker và không nhận HTTP request trực tiếp từ API gateway hay các services khác.

Với `Products Search Service` - là một service sẽ chịu tải rất nặng nên ta cần nhiều replicas cho database, và ta cũng cần lựa chọn và config database để ưu tiên AP hơn CP.

Ngoài ra thì một yếu tố quan trọng khác ảnh hưởng lớn đến load time của user là images. Việc load các ảnh có độ phân giải lớn là không quá cần thiết và nó ảnh hưởng lớn nhiều đến trải nghiệm người dùng nên khi merchant upload product image lên thì ta cũng sẽ tạo thumbnail với độ phân giải bé hơn và lưu vào object store, ta cũng có đặt các static asset này lên CDN để user có thể load nhanh hơn, khi user request đến product thì ta sẽ trả về link tới CDN version thay vì link bản gốc.

Ta cũng có thể cải thiện performance của `Products Search Service` bằng cách thêm cache cho service này.

Và vì chúng ta phục vụ user từ nhiều quốc gia khác nhau nên ta có thể sử dụng thêm Global Server Load Balacing, vừa đảm bảo user sẽ được điều hướng đến server gần nhất, vừa đảm bảo nếu có thảm họa xảy ra ở 1 vùng cụ thể nào đó thì user vẫn có thể được phụ vụ bằng server tại những vùng khác.

## Source

- https://www.udemy.com/course/software-architecture-design-of-modern-large-scale-systems/
