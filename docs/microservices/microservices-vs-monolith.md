---
sidebar_position: 2
---

# Microservices vs Monoliths

Trong xu hướng mới nổi của microservices thì các cuộc tranh luận về nó và Monolith là không thể tránh khỏi. Kiến trúc microservices cung cấp những lợi ích như khả năng mở rộng ,tính linh thoạt và là một cách hiệu quả về chi phí đối với những ứng dụng nhiều tính năng. Những gã khổng lồ về công nghệ như Netflix, Amazon và Oracle thường triển khai kiến trúc microservice trong 1 hoặc nhiều ứng dụng. Ngược lại, Monolith ngày càng mất đi giá trị của nó vì nó gây rủi ro cho các phương pháp phân phối phần mềm hiện tại. Trước khi đi vào so sánh Microservices và Monoliths thì hãy nhìn lại từng kiến trúc.

## Microservices là gì ?

![microservice](/img/docs/microservices/Microservices-VS-Monolith-Diagramss-47-1024x1013.jpg)
Là những services nhỏ có thể deploy được, nó được mô hình hóa xung quanh các ứng dụng phức tạp. Chẳng hạn 1 app sẽ có chức năng quản lý user --> userservice, authentication --> authservice, quản lý product --> productservice,... Các service này có thể sử dụng ngôn ngữ khác nhau, deploy ở môi trường khác nhau (máy ảo, container, cloud,...), và chúng giao tiếp với nhau để tạo ra 1 application hoàn chỉnh.

## Monoliths là gì ?

![monoliths](/img/docs/microservices/Microservices-VS-Monolith-Diagramss-48-768x760.jpg)
Ngược lại với việc chia nhỏ thành các microservice, monolith sẽ đóng gói toàn bộ các service lại thành một khối thống nhất.

## Microservices vs Monoliths: Pros and Cons

### Monolithic architecture

**Pros**

- Điểm lợi ích đầu tiên có thể thấy ngay khi sử dụng kiến trúc Monolith là dễ dàng phát triển và deploy.
- Điểm lợi thứ 2 là vì tất cả các service đều tập trung nên chúng ta không phải gọi bị `Internet delay` như microservices. 1 ứng dụng với kiến trúc microservice có thể phải gọi hàng chục API khác nhau đến hàng chục microserrvice để load 1 UI screen, trong khi với Monolith thì chỉ cần 1 là đủ.

**Cons**

- Điểm trừ lớn nhất của monolithic là khó để scale.
- Code base lớn nên những người vào dự án sau này rất mất thời gian để hiểu được và bổ sung tính năng mới cho app.
- Khó debug.
- Khó ứng dụng các công nghệ mới.
- Release chậm, khi deploy thì depoy toàn bộ service nên user không thể tương tác được với app.

### Microservices architecture

**Pros**

- Điểm cộng lớn nhất là rất dễ nâng cấp và scale. Các services của 1 application không phải chịu lượng requests giống nhau, nếu có 1 service chịu lượng tải nhiều hơn thì ta chỉ cần scale service đó lên. Hơn nữa với cloud computing thì chỉ cần một vài click chuột là có thể scale được 1 service, điều này là không thể với monolith.
- Do các service tách biệt nên nếu 1 service bị lỗi thì các service vẫn hoạt động bình thường, còn với monolith thì chỉ cần 1 module bị lỗi là có thể kéo sập toàn bộ hệ thống.
- Các service khác nhau có thể viết bằng ngôn ngữ khác nhau, mỗi team có thể tập trung viết 1 service, đồng thời thì team size sẽ bé lại và làm việc hiệu quả hơn.
- Có thể deploy từng service riêng lẽ.

**Cons**

- Các module giao tiếp với nhau qua api nên có tốc độ không cao bằng monolith, ngoài ra thì mỗi module phải tự giải quyết các vấn đề bảo mật, transaction, lỗi két nối,...
- Đảm bảo tính đồng nhất trong dữ liệu sẽ trở nên phức tạp hơn.
- Nhiều service ở nhiều nơi nên quản lý, theo dõi các service phức tạp.
- Thiết kế được kiến trúc microservices hiệu quả rất khó.
