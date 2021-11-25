---
slug: what-is-rabbitmq
title: RabbitMQ overview
authors: [ducnguyen96]
tags: [rabbitmq, backend]
---

# RabbitMQ overview

Nguồn: https://www.youtube.com/watch?v=GN0xHSk2P8Q

## Message Broker - Message Queue

Trở lại với kiến trúc Monolithic, các components của app bó buộc chặt chẽ với nhau. Ví dụ với một ứng dụng bán lẻ, ta có một checkout service cần kết nối với inventory service thì thường sẽ được giải quyết bằng TCP connection, ngay khi checkout gửi message đến inventory thì nó cần ngay reply trước khi đến với tác vụ tiếp theo, hoặc tệ hơn nếu inventory crash thì nó sẽ cố gắng gửi request cho tới khi thiết lập connection, hoặc nếu có rất nhiều checkouts xảy ra cùng lúc thì inventory service không thể theo kịp.

- Decouple

Và đó là lúc message queue được tạo ra, nó sẽ đứng giữa 2 service cần giao tiếp với nhau (chẳng hạn checkout service và inventory service). Lúc này checkout message sẽ gửi 1 message đến broker và thực hiện tác vụ khác ngay. Inventory sau khi đã sẵn sàng thì có thể consume message đó, process theo message và ngay lập tức consume message tiếp theo. MQ giúp tách biệt 2 service ra.

- Scalable

Đồng thời nó cũng giúp scale app của bạn, ví dụ nếu số checkout tăng lên quá nhiều thì bạn có thể tăng số instances của inventory lên và số lượng message cho mỗi instance sẽ giảm xuống.

- Performant

MQ có thể được đặt ở 1 máy riêng, nó có thể giảm tải cho các tác vụ mà hoàn thành bởi web app giúp app đạt performence tốt hơn.

## RabbitMQ

![rabbitmq](/img/blogs/rabbitmq.png)

Là một triển khai của AMQP(Advanced Message Queueing Protocol) message model - 091.

Thay vì gửi message trực tiếp đến message queue, nó sẽ gửi đến một exchange. Một exchange có thể kết nối đến nhiều queue và mỗi queue có thể kết nối đến các services khác nhau.

Service gửi message đến exchange --> exchange được kết nối với các queues qua các connections được gọi là bindings được ref bởi binding key. Các consumer sẽ subsribe đến các queues để lắng nghe message. RabbitMQ là hệ thống bao gồm exchange và các queue, RabbitMQ rất linh hoạt nhờ các loại exchanges khác nhau mà nó hỗ trợ.

- Fanout exchange: Message được gửi từ service sẽ được duplicate và gửi đến tất cả các queues.
- Direct exchange: Message được gửi từ service chứa routing key, nó sẽ được map với binding key để chuyển tới queue.
- Topic exchange: Giống với direct exchange nhưng nó có thể match từng phần (partial match) chẳng hạn "ship.shoes" và "ship.any"
- Header exchange: Routing key sẽ bị bỏ qua và message được route theo header.
- Default exchange: Routing key match với tên của queue.

Cách gửi và nhận message trong RabbitMQ được defined bằng metadata là các key và loại exchange nên app và developer có thể control nhiều hơn.

- Cloudy friendly: Có thể deploy bằng container, deploy như 1 cluster.
- Cross-language: Ví dụ có thể produce bằng Go và consume bằng JS, Python,...
- Security: Support FASL, LDAP, TLS
- Acks: Comsumer ack message giúp broker biết rằng consumer đã nhận được message, và loại bỏ nó ra khỏi queue. Điều này tránh tình trạng miss message hoặc loss message vì nếu consumer không ack thì message vẫn được giữ trong queue.
- Greate management: Có management UI, CLI.
- Plug-in: Có rất nhiều plug-ins được phát triển bởi cộng đồng opensource.
