---
sidebar_position: 3
---

# Những ý tưởng cơ bản về microservices

## What is a microservice ?

Để trả lời câu hỏi này thì trước hết ta sẽ review lại cách hoạt động của Monolithic Server.

![microservice-dg-1](/img/docs/microservices/microservices-dg-1.png)
Chúng ta có toàn bộ code nằm trong 1 single code base và chúng ta deploy như 1 unit.

Flow của 1 request sẽ như sau: Đầu tiên thì có thể đi qua 1 số middleware, sau đó qua 1 số router, router sẽ inspect request đó và gửi đến feature nhất định để xử lý, chẳng hạn đọc hoặc ghi dữ liệu ở database sau cùng là gửi response lại cho người tạ request.

![microservice-dg-2](/img/docs/microservices/microservices-dg-2.png)
Chúng ta có thể nói là monolith chứa routing, middlewares, business logic cũng như truy cập database để thực hiện `toàn bộ tính năng` của app.

![microservice-dg-3](/img/docs/microservices/microservices-dg-3.png)
Còn với microservices thì mỗi service chứa routing, middlewares, business logic cũng như truy cập vào database để thực hiện `1 tính năng` của app.

![microservice-dg-4](/img/docs/microservices/microservices-dg-4.png)
Chúng ta sẽ chia các features ra và đói gói lại trong những service khác nhau và độc lập với nhau, chúng có middlewares riêng, router riêng, thậm chí có database riêng cho từng service. Vì các services độc lập với nhau nên dù 1 hay nhiều services crash thì các services còn lại vẫn hoạt động.

## Data in microservices

Nhìn biểu đồ trên thì chúng ta có thể nói răng microservices cũng dễ thôi, tất cả việc chúng ta làm chỉ là chia các features ra và đóng gói lại thành 1 service. Nhưng thực tế thì không chỉ đơn giản như vậy, khi chúng ta implement app với kiến trúc microservices thì sẽ gặp phải một số vấn đề lớn sau đây.

![microservice-dg-5](/img/docs/microservices/microservices-dg-5.png)
Quản lý data giữa các services: cụ thể là cách chúng ta lưu data cũng như chia sẻ data giữa các services.
![microservice-dg-6](/img/docs/microservices/microservices-dg-4.png)
Các chúng ta đọc và ghi dữ liệu trong microservices thì không giống với cách chúng ta vẫn làm với kiến trúc monolith.
Trong microservices mỗi service sẽ có 1 database riêng nếu service đó cần đến database. Tại sao lại như vậy ?

![microservice-dg-7](/img/docs/microservices/microservices-dg-8.png)

- Các service cần độc lập với nhau không phụ thuộc vào services khác.
- Database schema có thể thay đổi một cách bất ngờ.
- Các services khác nhau thì có thể hoạt động một cách hiệu quả hơn đối với từng loại db khác nhau (sql vs nosql).

Đầu tiên thì ta sẽ nói về việc truy cập dữ liệu
![microservice-dg-8](/img/docs/microservices/microservices-dg-7.png)
Một service sẽ không bao giờ truy cập vào database của 1 service khác để lấy dữ liệu.
![microservice-dg-9](/img/docs/microservices/microservices-dg-9.png)
Chúng ta hay xem xét sẽ như thế nào nếu tất cả service dùng chung 1 database.

- Nếu có vấn đề xảy ra với database chung này thì tất cả các services sẽ crash ngay lập tức.
- Một vấn đề nữa là việc scale db này sẽ rất khó khăn. Chúng ta sẽ phải scale db này để đủ phục vụ tất cả các services, sẽ đơn giản hơn nhiều nếu phải scale db cho 1 khối lượng dữ liệu bé hơn cũng như số lượng requests đến db nhỏ hơn.

Vấn đề tiếp theo là thay đổi database schema
![microservice-dg-10](/img/docs/microservices/microservices-dg-10.png)
Chẳng hạn service A access vào DB B để lấy dữ liệu của 1 user, ban đầu thì schema của user là `{name: 'Jill'}` nhưng sau đó chẳng may nếu team code service B bỗng dưng muốn thay đổi schema của user và đổi thành `{firstname: 'Jill'}` và không thông báo cho team code service A biết, và service A chắc là không thể ngờ tới việc thay đổi schema của user kết cục là sẽ gặp lỗi ở đây.

### Chúng ta hãy xem ví dụ về 1 app cụ thể dùng kiến trúc microservices để thấy được các vấn đề về database sẽ gặp phải

![microservice-dg-11](/img/docs/microservices/microservices-dg-11.png)

App này sẽ có các tính năng cơ bản sau:

- Signup
- List Products
- Buy Products

![microservice-dg-12](/img/docs/microservices/microservices-dg-12.png)
Với kiến trúc monolith thì server sẽ có 1 database để lưu trữ user, products và orders. Bây giờ chẳng hạn ta muốn thêm 1 tính năng là show ra những products đã được ordered của 1 user cụ thể.

![microservice-dg-13](/img/docs/microservices/microservices-dg-13.png)
Đầu tiên ta sẽ tìm đế bảng user để xác nhận là user id có tồn tại, sau đó là đến bảng orders để lấy cả product ids mà user đã ordered và cuối cùng là đến bảng products để lấy thông tin detail về các products đấy.

Việc implement 1 tính năng như này thì khá là đơn giản với kiến trúc monolith.

Chúng ta hãy tạm thời bỏ qua việc thêm tính năng này và xem việc implement các tính năng cũ sẽ được thực hiện như thế nào với kiến trúc microservices.
![microservice-dg-14](/img/docs/microservices/microservices-dg-14.png)
Chúng ta có service A chứa code để implement việc signup 1 user trong đấy, và như chúng ta đã thảo luận thì service A sẽ có 1 database riêng, cụ thể trong trường hợp này thì service A sẽ có 1 db chứa tất cả các user trong đấy.

Tương tự thì service B và C cũng vậy.

Bây giờ ta sẽ thêm 1 tính năng là show tất cả orders của 1 user cụ thể, với kiến trúc monolith thì chỉ việc đến bảng user để xác nhận user, và đến bảng orders để lấy tất cả của user đó, các table này đều nằm chung ở 1 database và service.

Đối với microservices thì sẽ không đơn giản như vậy, như đã nói ở trên thì ta không được phải cho 1 service này truy cập và db của 1 service khác. Vậy làm sao ta có thể thực hiện được tính năng này ? Chúng ta sẽ tìm hiểu cách giải quyết xuyên suốt series về microservices này.

## Sync communication giữa các services

![microservice-dg-15](/img/docs/microservices/microservices-dg-15.png)
Việc thêm service D trong ví dụ ở trên với cách tiếp cận là mỗi service sẽ có 1 database riêng thì chúng ta đang gặp phải vấn đề, bây giờ chúng ta sẽ giải quyết cách vấn đề đó.

Dưới đây là 2 chiến lược để giao tiếp giữa các services.
![microservice-dg-16](/img/docs/microservices/microservices-dg-16.png)
Có 2 chiến lược để giao tiếp giữa các services đó là sync và async, 2 từ này thì không mang nghĩa giống với sync và async trong javascript nhé.

- Sync strategies: các services giao tiếp trực tiếp với nhau (có thể là http, grpc,...)
- Async: các services giao tiếp với nhau thông qua events.

Xem ví dụ dưới đây để hiểu về sync communication
![microservice-dg-17](/img/docs/microservices/microservices-dg-17.png)
Thực hiện 1 request đến service D để show ra các products được ordered bởi 1 user cụ thể. Bây giờ service D sẽ gửi http(hoặc grpc,...) request đến service A để lấy xác minh user và nhận response từ service A, tiếp đến lại gửi request đến service C để lấy products Id, nhận response và cuối cùng là gửi request đến service B để lấy thông tin về products.

Ta nhận thấy là không có lúc nào service D access trực tiếp đến database của các services mà chỉ gửi request trực tiếp đến các services đó.

Đối với sync communication thì có 1 số pros and cons như sau:
![microservice-dg-18](/img/docs/microservices/microservices-dg-18.png)
**pros:**

- Dể hiểu
- Service D không cần 1 db riêng

**cons:**

- Nó depend vào các services mà nó request tới. Điều này có nghĩa là nếu 1 trong số các services kia gặp lỗi thì request sẽ fail ngay lập tức.
- Tốc độ của cả request nhanh nhất cũng chỉ bằng tốc độ của request chậm nhất tới 1 service. Ví dụ gọi tới service A mất 10ms, C mất 10ms nhưng B lại mất tới 20s thì cả request mất ít nhất là 20.01s
- Tạo ra cả mạng lưới depend giữa các request với nhau. Chẳng hạn service A lại cần gọi đến service E nào đấy và E lại cần gọi đến F rồi G, ...--> không thể điều khiển.
  ![microservice-dg-19](/img/docs/microservices/microservices-dg-19.png)

Tổng hợp lại thì sync communication cũng có 1 vài điểm cộng nhất định nhưng lại gặp phải một số vấn đề cực lớn mà khó có thể chấp nhận được.

## Event-Based communication

![microservice-dg-20](/img/docs/microservices/microservices-dg-20.png)
Ý tưởng của async communication là ta sẽ dùng 1 thứ để giao tiếp giữa các service và khái niệm này sẽ được nhắc tới trong cả series về microservices - event bus.

Mục đích chính của event bus này là gửi thông báo đến các service rằng có events đã được emitted (phát ra) từ các services khác nhau của app. Các notification này miêu ta rằng có thứ gì đó đã xảy ra hoặc cần xảy ra trên toàn bộ app. các service kết nối với event bus sẽ có thể emit event hoặc là nhận events từ event bus.

Bây giờ hãy xem xét cách chúng ta dùng event bus để giải quyết gặp phải vấn đề gặp phải đối với service D.

- Service D sẽ emit 1 event với type là UserQuery chẳng hạn và có data là id bằng 1 ứng với userid là 1.
- EventBus sau khi nhận được event sẽ dựa vào type và route event này đến service A.
- Service A nhận được event sẽ query db để lấy thông tin cần thiết và emit 1 event với type UserQueryResult cùng data.
- EventBus nhận được event sẽ route event đó tới service D.

Chúng ta cũng tưởng tượng ra được những event tiếp theo được emit tới EventBus gửi request tới các service còn lại để lấy được thông tin của order và products.

Đây là một cách giao tiếp async giữa các services và chúng ta sẽ không sử dụng cách này trong thực tế vì một vài lý do như sau: Chúng hoàn toàn có những nhược điểm của sync communication, cộng thêm 1 vài nhược điểm riêng. Có dependencies giữa các services, nếu 1 request con fail thì toàn bộ request sẽ fail,...

Và chúng ta có cách tiếp cận thứ 2 để giải quyết vấn đề này

## Event-Based communication with database

![microservice-dg-20](/img/docs/microservices/microservices-dg-21.png)
Đầu tiên thì ta phải định nghĩa rõ lại mục tiêu của service, cấp id của 1 user và show title cùng image của tất cả các product mà user này đã order.

Dựa vào yêu cầu trên thì ta có thể hình dung ra được 1 database như sau (có thể sql hoặc nosql nhé, không bắt buộc).
![microservice-dg-20](/img/docs/microservices/microservices-dg-22.png)
Bảng đầu tiên là user chứa các thông tin là id và product_ids, chúng ta không cần quan tâm đến email hay first_name,... chúng ta chỉ cần id để match với id đã được cấp cũng như các product_ids mà user này đã ordered. Bảng Products cũng vậy, chúng ta chỉ quan tâm đến title và image, không quan tâm tới sản xuất từ đâu, tạo lúc nào, giá bao nhiêu,...

Vậy chúng ta có thể nói rằng với 1 database như vậy thì chúng ta đã giải quyết được vấn đề đặt ra, hơn nữa lại độc lập hoàn toàn không depend tới service nào khác hay database của service khác.

Câu hỏi đặt ra là làm sao chúng ta có thể tạo được 1 database như vậy, cùng với các thông tin cần thiết về user cũng như products.

Hãy xem lại cấu trúc app hiện tại
![microservice-dg-20](/img/docs/microservices/microservices-dg-23.png)
Chúng ta có thể tạo request đến từng service A, B, C để signup cũng như tạo products và tạo order nhưng hiện tại chưa có cách nào để những thông tin này có thể được cập nhật vào database của service D. Chúng ta có thể bảo service A gửi 1 request đến service D mỗi khi có 1 user signup nhưng như thế thì lại thêm 1 depend vào service A, vậy mỗi khi service crash thì service A cũng không thể dùng để signup được.

Nếu bạn đang nghĩ giống mình thì bạn đúng rồi đấy, như cách giải quyết vấn đề depend ở sync communication thì chúng ta sẽ lại sử dụng eventbus.
![microservice-dg-20](/img/docs/microservices/microservices-dg-24.png)

Service D sẽ có 1 database với schema như hình trên. Bây giờ mỗi khi service A nhận được request signup, nó sẽ đồng thời emit 1 event tới EventBus để thông báo cho service D biết, service D nhận được event sẽ tạo 1 row mới trong bảng user với id là user và product_ids là [].

Mỗi khi service B nhận được request tạo 1 request thì đồng thời nó cũng emit 1 event đến EventBus, thông báo với service D rằng có 1 product mới được tạo với title và image như này, service D nhận được event thì tạo 1 row mới trong table products với id, title, image được cung cấp trong event message.

Tương tự thì mỗi khi service C nhận được request tạo order nó cũng sẽ emit 1 event, và sau đó service D update product_ids ở bảng user.

Bây giờ thì service D đã có đầy đủ thông tin cần thiết để thực hiện chức năng của mình.

## Pros and Cons of Async communication

![microservice-dg-20](/img/docs/microservices/microservices-dg-25.png)
Mặt tích cực thì async communication giúp service D độc lập với các service khác (khi service D nhận được request show products đã đươc ordered bởi 1 user cụ thể thì service D đã có đầy đủ thông tin ở database của chính nó, không cần gọi đến service khác cũng như không access đến database của service khác), đồng thời thì nó cũng cực kỳ nhanh vì không bị depend request.

Điểm trừ ở đây là lặp lại dữ liệu, chúng ta có thể thấy là mỗi khi user signup thì đồng thời cũng tạo 1 bản ghi mới trong bản user của service D, thế nên chúng ta mới phải define rõ ràng yêu cầu của service để không lặp lại toàn bộ thông tin của user. Lặp lại dữ liệu cũng đồng nghĩa với việc trả thêm phí cho dịch vụ cung cấp db, nhưng thực sự thì phí này không đáng bao nhiêu, gần như là free.
![microservice-dg-20](/img/docs/microservices/microservices-dg-26.png)
Như hình trên ta có thể thấy với dữ liệu của 1 product đầy đủ (trên hình là thông tin 1 product trên amazon) thì nó có kích thước ~1250bytes, vậy với 100,000,000 products thì sẽ tốn của chúng ta ~14$/tháng. Vậy có thể nói là vấn đề về chi phí của lặp database thì có thể loại bỏ, lặp lại dữ liệu có thể gây nến các vấn đề khác mà chúng ta sẽ thảo thuận sau.

Một điểm trừ nữa là nó hơi khó hiểu cũng như code dài dòng hơn, nhưng để bù lại ưu điểm trên thì hoàn toàn xứng đáng và đây là cách sẽ được implement cho app của chúng ta.

Bài tiếp theo chúng ta sẽ thực hiện demo 1 app nhỏ với kiến trúc micro-services.
