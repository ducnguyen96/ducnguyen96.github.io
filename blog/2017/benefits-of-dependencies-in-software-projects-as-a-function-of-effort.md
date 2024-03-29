---
title: Hàm số biểu thị mối tương quan giữa effort bỏ ra và lợi ích khi sử dụng dependencies trong các dự án phần mềm.
description: Hàm số biểu thị mối tương quan giữa effort bỏ ra và lợi ích khi sử dụng dependencies trong các dự án phần mềm.
authors:
  - eliben
  - ducnguyen96
tags: [Programming]
hide_table_of_contents: false
---

# Hàm số biểu thị mối tương quan giữa effort bỏ ra và lợi ích khi sử dụng dependencies trong các dự án phần mềm

Một trong những tranh luận phổ biến nhất trong ngành phần mềm là dependencies tốt hay xấu. Có nên tự viết tất cả hoặc hầu hết các chức năng của dự án, hay là nên sử dụng các thư viện có sẵn để thực hiện các tác vụ con mà dự án cần thực hiện.

Một mặt, dependencies giúp các teams nhỏ có thể phát triển các ứng dụng tương đối phức tạp. Mặt khác thì việc có vô số thư viện và frameworks cũng là một vấn đề biểu hiện qua nhiều mặt khác nhau, từ [leftpad fiasco](https://en.wikipedia.org/wiki/Leftpad) cho đến các frameworks ra đời tràn lan làn, frameworks mới thay frameworks cũ, hợc chưa xong framework này thì đã có một framework khác.

Nếu bạn hay theo dõi tin tức về lập trình thì mọi người tranh luận về vấn đề này ở mọi nơi. Các bài viết như [viết web apps (chỉ sử dụng std lib)](https://golang.org/doc/articles/wiki/) gây nên [tranh cãi](https://news.ycombinator.com/item?id=13247858), một mặt thì ủng hộ "no-dependencies", ca ngợi tính rõ ràng, ít phụ thuộc, dễ dàng maintain và deploy. Mặt khác thì cũng có nhiều người cho rằng việc "reinvent the wheel" làm phí phạm những điều đã khó khăn để đạt được nhờ những người thư viện kia.

Bài viết này muốn đề ra một công thức đơn giản để xoa dịu bớt những cuộc tranh luận tương tự, vì theo ý kiến cá nhân thì cả 2 bên đều đúng - dựa vào từng tình huống cụ thể.

> Lợi ích của việc sử dụng dependencies thì tỷ lệ nghịch với lượng công sức bỏ ra cho dự án.

<div align="center">
 ![benefits-vs-effort.png](./img/benefits-vs-effort.png)
</div>

Càng nhiều nỗ lực phải bỏ ra cho một dự án thì càng ít lợi ích nhận được khi sử dụng dependencies. Những dự án cần ít effort hì càng sẽ hưởng lợi từ dependencies. Với các dự án lớn, lâu dài thì lợi ích là không nhiều, thậm chí thì hại còn nhiều hơn lợi.

Công thức này dựa trên sự quan sát trong suốt một sự nghiệp dài phát triển phần mềm, quản lý các nhà phát triển phần mềm, và quan sát kỹ càng thế giới của phát triển phần mềm.

Chẳng hạn với phát triển web. Nếu bạn là một nhà thầu thường xuyên phát triển web apps cho khách hàng mỗi 2-3 tuần, thì chắc chắn dự án của bạn sẽ sử dụng các thư viện và frameworks. Nó tiết kiệm rất nhiều thời gian và công sức, vậy tại sao không?

Tuy nhiên, nếu công ty bạn có một web app lớn và phức tạp mà 4 kỹ sư đã phát triển trong vài năm qua (và sẽ tiếp tục phát triển trong tương lai), thì khả năng là bạn chỉ sử dụng các thư viện cơ bản nhất (ví dụ như jQuery), và phần còn lại được phát triển trong công ty.

Sự khác biệt giữa các thư viện cơ bản và các thư viện khác còn là vấn đề về quy mô. Không nhiều công ty sẽ tự viết một database cho dự án của họ, nhưng nếu bạn phát triển một dự án với quy mô của Google thì việc tự viết một [database](https://en.wikipedia.org/wiki/Bigtable) là có thể hiểu được.

<div align="center">
 ![reinventing-the-wheel.jpg](./img/reinventing-the-wheel.jpg)
</div>

Điều thú vị là một dự án có thể đi qua các điểm khác nhau trên đường cong lợi ích vs effort trong suốt quá trình phát triển. Nhiều dự án bắt đầu nhỏ và đơn giản, phụ thuộc vào các dependencies. Tuy nhiên, khi thời gian trôi qua và nhiều effort được bỏ vào dự án, thì không thể tránh khỏi việc dependencies bị thay thế bằng các thư viện trong công ty. Điều này thường xảy ra khi các dependencies không còn đáp ứng được tất cả các use case mà dự án cần. Những lý do khác bao gồm tốc độ phát triển nhanh hơn; để cập nhật một dependency, cần phải push changes đến lib/frameworks và, chờ được aprroved và merged. Không phải team nào cũng thích chờ đợi.

Một ví dụ điển hình là các nhà phát triển game 3D. Hầu hết các studio nhỏ và các nhà phát triển đều bắt đầu bằng việc sử dụng một trong các game engine có sẵn và tập trung vào nội dung của game. Tuy nhiên, sau một thời gian, nhiều studio lớn hơn lại phát triển các engine riêng để phục vụ nhu cầu của riêng họ. Công sức bỏ ra cho dự án lớn hơn, vì vậy dependencies không còn có lợi nữa.

Một trong những bài viết trong nhất về chủ đề này là của Joel Spolsky's - [In Defense of Not-Invented-Here Syndrome (from 2001)](https://www.joelonsoftware.com/2001/10/14/in-defense-of-not-invented-here-syndrome/). Trong bài này thì Joel đã chỉ ra cách mà Microsoft Excel team đã phải đấu tranh để bỏ tất cả các dependencies ra khỏi dự án của họ, và tự viết riêng một C compiler. Họ không làm thế vì ngu ngốc hay kiêu ngạo mà đơn giản vì nó phù hợp cho dự án khổng lồ của họ.

Quan điểm của Joel hơi khác so với của tội - anh ấy cho rằng các tính năng cốt lõi nên tự phát triển. Điều này là đúng tuy nhiên công thức nêu trên muốn nhìn theo một góc độ khác. Khi mới bắt đầu thì framework mà bạn sử dụng không phải là tính năng cốt lõi - chỉ là một công cụ. Tuy nhiên theo thời gian thì có thể xem nó như là một tính năng cốt lõi, vì đã có rất nhiều effort đã được dành cho dự án; cái giá để loại bỏ nó được giảm bớt.

## Nguồn

- https://eli.thegreenplace.net/2017/benefits-of-dependencies-in-software-projects-as-a-function-of-effort/
