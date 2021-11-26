---
slug: mang-may-tinh
title: Mạng máy tính
authors: [ducnguyen96]
tags: [networking]
---

# Mạng máy tính

## Phần 1 - The TCP/IP Five-Layer Network Model

![7 layers](/img/docs/layers-responsibility.png)

The protocols at each layer carry the ones above them in order to get data from one place to the next.

### 1. Physical Layer

Đại diện cho những thiết bị vật lý kết nối với máy tính. Liên quan đến những thứ như cáp, thiết bị kết nối, gửi tín hiệu.

### 2. Data Link Layer

- The network interface or the network access layer.
- Lớp này chịu trách nhiệm định nghĩa các cách để diễn dịch (interpreting) các tín hiếu để cho các thiết bị có thể giao tiếp với nhau.
- Có rất nhiều giao thức (protocols) xuất hiện ở layer này nhưng phổ biến nhất là Ethernet.
- Các tiêu chuẩn của Ethernet cũng định nghĩa 1 giao thức chịu trách nhiệm cho việc nhận dữ liệu từ các node trên cùng 1 network.

### 3. Internet Layer

- Layer này cho phép các network khác nhau có thể giao tiếp được với nhau thông qua các routers.
- Giao thức phổ biến nhất ở layer này là IP (Internet Protocol).
- Một node riêng rẽ có thể chạy nhiều ứng dụng clients hoặc servers. Bạn có thể chạy 1 chương trình client email và web browser cùng lúc. Email và webserver cũng có thể chạy trên cùng 1 server.

### 4. Transport Layer

- Emails và Web pages có thể được gửi đến ứng dụng của bạn là nhờ transport layer.
- Khi Internet Layer chuyển dữ liệu giữa các node độc lập. Transport Layer phân loại ứng dụng client hoặc server nào thì nên nhận được data từ Internet layer.
- Giao thức phổ biến nhất ở layer này là TCP (Transmission Control Protocol). 1 số giao thức khác có sử dụng đến IP có thể kể đến như UDP (User Datagram Protocol).

**Lưu ý**: IP chịu trách nhiệm nhận dữ liệu từ node này sang node khác, trong khi TCP hoặc UDP thì chịu trách nhiệm phân loại dữ liệu nhận được từ IP đến ứng dụng cần thiết (applications or programs)

## Phần 2 - The Basics of Networking Devices

### 1. Cables

- Cáp kết nối những thiết bị khác nhau và cho phép data được truyền qua lại giữa các thiết bị.
- Cáp đồng (copper) là loại cáp được dùng phổ biến nhất. Nó được tạo thành từ các cặp dây đồng và được bọc bởi dây dẫn cách điện.
- Máy tính giao tiếp với nhau bằng 0 và 1. Chúng gửi các dữ liệu nhị phân bằng cách thay đổi voltage (điện thế).
- Thiết bị nhận được tín hiệu sẽ diễn dịch các thay đổi điện thế này thành 0 và 1 và sau đó được chuyển thành các dạng dữ liệu khác nhau.
- Các loại phổ biến nhất: Cat5, Cat5e, Cat6. Những loại này thì có các đặc điểm vật lý khác nhau, chẳng hạn số lần xoắn giữa các cặp dây đồng dẫn đến việc thay đổi chiều dài cáp cũng như tỉ lệ truyền tải.
- Cat5 là loại cũ nhất và gần như được thay thế bằng Cat5e và Cat6.

### 2. Hub

- Hub là thiết bị ở physical layer cho phép nhiều kết nối cùng 1 lúc đến từ nhiều máy tính.
- Các thiết bị kết nối đến 1 hub nào đó sẽ giao tiếp với nhau cùng lúc. Tùy thuộc vào các hệ thống kết nối của các thiết bị mà chúng sẽ quyết định xem data được truyền đến có phải dành cho chúng hay không. Điều nãy dẫn đến có rất nhiều noise trên network và gây ra 1 vấn đề được gọi là collision domain.

### 3. Collision Domain

![Collision Domain](/img/docs/collision-domain.png)

Many or all devices on a network shared a single collision domain. All data in collision domain is snet to all the nodes connected to it.

Collision Domain là 1 network segment (phân đoạn) nơi cùng lúc chỉ 1 thiết bị có thể giao tiếp. Nếu nhiều hệ thống cố truyền dữ liệu cùng lúc thì các xung điện được gửi trong sợi cáp sẽ gây trở ngại cho nhau. Việc này dẫn đến việc các hệ thống kết nối với hub phải chờ 1 thời gian trước khi chúng cố tái gửi dữ liệu. Chính vì vậy mà mạng lưới rất chậm nên gần như ngày này chúng ta không còn sử dụng hub nữa và được thay thế bằng switch.

### 4. Switching Hub

- Switch rất giống Hub ở chỗ chúng cho phép rất nhiều các thiết bị kết nối đến chúng. Điểm khác biệt là Hub thì ở layer 1 (Physical Layer) còn switch thì ở layer 2 (Data Link Layer).
- Switch có thể inspect (quan sát) nội dung bên trong dữ liệu của giao thức ethernet được gửi trong toàn mạng. Và quyết định xem dữ liệu nên được gửi đến hệ thống nào và chỉ gửi đến hệ thống đó. Switch gần như lọai bỏ hoàn toàn collision domain.

### 5. Routers

- Hubs và Switches được sử dụng để cho các thiết bị có thể kết nối đến cùng 1 mạng lưới cụ thể (LAN - Local Area Network), để có thể truyền nhận dữ liệu từ các network thì chúng ta cần đến router.
- Router là 1 thiết bị cho phép truyền tải dữ liệu giữa các networks. Router hoạt động ở layer 3.
- Switch có inspect dữ liệu Ethernet để quyết định chúng được gửi đến đâu, Router thì có thể inspect dữ liệu IP để quyết định chúng được gửi đến đây.
- Những routers mà ta thường thấy là những home routers, bảng routing table của chúng khá đơn giản. Mục đích của chúng là nhận traffic từ home hoặc office và gửi đến ISP (Internet Service Provider).
- Một khi traffic được gửi đên ISP thì 1 loại router mới phức tạp hơn nhiều nhận nhiệm vụ xử lý traffic. Những core ISP router này chịu trách nhiệm cho việc gửi và nhận dữ liệu hằng ngày trên internet của chúng ta.
- Routers chia sẻ dữ liệu với nhau qua giao thức BGP (Border Gateway Protocol). Giao thức này cho biết đoạn đường tối ưu nhất để truyền traffic.

### 6. Servers and Clients

- Chúng ta gọi mỗi thiết bị trên network là 1 nodes. 1 nodes có thể là 1 server hay là 1 client hoặc thường là vừa server và client. 1 server là 1 node mà được sử dụng để cung cấp dữ liệu cho 1 client nào đó, và client chính là node nhận dữ liệu.
- Chẳng hạn email server vừa có thể xem là 1 server vì chúng gửi email đến ứng dụng email của người dùng. Nhưng cũng có thể xem nó là 1 client của DNS server.

## Phần 3 - The Data Link Layer

![5-layers](/img/docs/layers-responsibility.png)

By dumping responsibility on the Data Link Layer, the Network, Transport, Application layers can all operate the same no matter how the device they're running on is connected.

### 1. Ethernet and MAC address

- Giao thức được sử dụng rộng rãi nhất để truyền dữ liệu giữa các links độc lập là Ethernet. Data Link Layer cung cấp 1 cách chung để sofware ở các layer cao hơn có thể truyền và nhận dữ liệu.
- MAC address là 1 định danh độc nhất được gắn với 1 network interface. Là 1 dãy số 48 bit gồm 6 cặp số hexadecimal(16 bits), 1 cách khác nữa để định danh MAC là Octet.

### 2. Unicast, Multicast and Broadcast

- Unicast frame: luôn gửi tới tất cả các thiết bị trên collision domain nhưng chỉ thục sự được nhận và xử lý bởi 1 địa chỉ.
- Multicast frame: gửi tới tất cả, nhưng nhận hoặc loại bỏ thì tùy vào từng thiết bị.
- Broadcast frame

### 3. Dissecting an Ethernet Frame

- Data packet là 1 thuật ngữa bao trùm đại diện cho bất kỳ 1 bộ dữ liệu nhị phân nào được truyền trong network. Data packet không được gắn với 1 layer cụ thể nào.
- Data packet ở Ethernet level đưuọc biết như các Ethernet frame.
- Ethernet Frame là 1 bộ sưu tập thông tin cấu trúc cao được trình bày trong 1 trình tự cụ thể. Như vậy, các network interfaces ở physical layer có thể chuyển 1 dãy bits thành dữ liệu có ý nghĩa và ngược lại.
  ![ethernet-frame](/img/docs/ethernet-frame.png)

  Các segment trong Ethernet Frame là không thể thiếu và hầu như là có kích thước cố định.

- 7 bytes đầu tiên được sử dụng để đồng bộ internal clocks để điểu chỉnh tốc độ truyền tải dữ liệu.
- 1 bytes tiếp theo (SFD - Start Frame Delimiter) gửi tín hiệu rằng preamable đã kết thúc và frame bắt đầu ngay sau đó.
- 6 bytes tiếp là địa chỉ MAC.
- EtherType filed: dài 16 bits được sử dụng để miêu tả giao thức của nộidung của frame.
- VLAN: bất cứ frame nào có VLAN tag thì chỉ được gửi tới 1 ... cụ thể.

## Phần 4 - The Network Layer

### 1. The Network Layer

Trong mạng LAN thì các nodes đều chỉ giao tiếp với nhau trong 1 mạng nhỏ thông qua các cáp nên địa chỉ MAC có thể đáp ứng được như cầu. Nhưng có hàng tỷ các thiết bị trên thế giới có địa chỉ MAC độc lập và chúng không được sắp xếp theo 1 trình tự cụ thể nào nên việc giao tiếp với nhau ở mạng lưới toàn cầu sử dụng địa chỉ MAC là rất khó khăn. Chính vì thế IP sinh ra để giải quyết vấn đề này.

### 2. IP Addresses

![ip-addresses](/img/docs/ip-address.png)

IP là các giãy số dài 32 bit được tạo hành từ 4 octet. Mỗi octet có thể đại diện cho mọi số trong khoảng từ 0 đến 255.

ℹ️ **Chú ý**: Các địa chỉ IP thuộc về networks chứ không thuộc về các thiết bị kết nối với network. Laptop của bạn sẽ luôn có 1 địa chỉ MAC duy nhất từ khi sản xuất nhưng sẽ có IP khác nhau lúc bạn đi cafe, làm việc ở nhà, công ty,... Mạng LAN ở cafe, home, công ty sẽ cung cấp 1 địa chỉ IP tới laptop của bạn bằng 1 công nghệ gọi là DHCP (Dynamic Host Configuration Protocol)

- 1 địa chỉ IP được cấp bằng DHCP được gọi là Dynamic IP address (địa chỉ IP động), trái ngược với Static IP address là (địa chỉ IP tĩnh) được cấu hình trên 1 node thủ công.
- Trong hầu hết các trường hợp thì IP tĩnh được dùng cho servers và các thiết bị mang, IP động được dùng cho clients. Nhưng trong 1 số trường hợp thì có thể không đúng.

### 3. IP Datagrams and Encapsulation

![data-gram](/img/docs/datagram.png)

Giống như data packets ở Ethernet layer có 1 cái tên riêng - Ethernet Frame thì các packets ở Network layer cũng vậy - IP datagram - là 1 dãy các trường có cấu trúc cao được định nghĩa 1 cách chặt chẽ.
![data-encapsulated](/img/docs/datagram-encapsulated.png)

Contents của IP datagram được đóng gói thành payload của 1 Ethernet Frame. Và IP datagram cũng có payload được gửi xuống từ Transport layer.

### 4. IP Address Classes

![ip-addresses](/img/docs/ip-addresses.png)

Class A có 3 bits cho IP address. Mỗi octet có giá trị từ 0 đến 255 nên sẽ có tổng cộng 256*256*256=16777216 địa chỉ IP cho mỗi host class A

- Địa chỉ IP có thể chia làm 2 ## phần là address ID và host ID.
- IP có 3 classes: Class A(1 octets đầu là address ID, 3 octet tiếp là host ID), class B (2 octet đầu là address ID), class C (1 octet là address ID).
- Ở class D, mỗi 1 IP datagram có thể được gửi tới toàn bộ network cùng 1 lúc.

### 5. ARP - Address Resolution Protocol

ARP là một giao thức được sử dụng để tìm ra địa chỉ ## phần cứng của 1 node với 1 địa chỉ IP cụ thể. Khi mà IP datagram được hình thành 1 cách hoàn toàn thì nó cần được đóng gói trong 1 Ethernet Frame. Nghĩa là thiết bị truyền tín hiệu cần 1 địa chỉ MAC để có thể hoàn thành header trong Ethernet Frame.
![send-abroad](/img/docs/sending-arp-broadcast.png)

Khi muốn gửi ethernet frame đến 1 địa chỉ IP nào đó mà chưa có địa chỉ MAC thì thiết bị gửi sẽ truyền đi 1 ARP message broadcast đến toàn bộ các node trên network.
![arp-response](/img/docs/arp-response.png)

Các node khi nhận được arp message sẽ phản hồi và gửi địa chỉ MAC đến thiết bị gửi. Sau đó ARP sẽ cập nhật MAC address vào ARP table entries. Các entries này sẽ hết hạn trong 1 khoảng thời gian ngắn.
