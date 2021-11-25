---
slug: transaction-in-a-nutshell
title: Transaction in a nutshell
authors: [ducnguyen96]
tags: [acid, database, transaction]
---

# Transaction in a nutshell

_Transaction có thể được định nghĩa là 1 nhóm task. Một task đơn lẻ là 1 đơn vị xử lý mà không thể chia nhỏ hơn nữa._

_Lấy một ví dụ đơn giản. Giả sử một nhân viên ngân hàng chuyển 500 triệu từ tài khoản A đến tài khoản B. Đây là một transaction đơn giản chứa những task sau đây._

**A's Account**

```sh
Open_Account(A)
Old_Balance = A.balance
New_Balance = Old_Balance - 500
A.balance = New_Balance
Close_Account(A)
```

**B's Account**

```sh
Open_Account(B)
Old_Balance = B.balance
New_Balance = Old_Balance + 500
B.balance = New_Balance
Close_Account(B)
```

Một transaction phải duy trì được các thuộc tính [ACID](/blog/acid-trong-co-so-du-lieu/) đểm đảm bảo độ chính xác, tính nguyên vẹn của database.

## 1. States của Transactions

![state-of-transaction](/img/blogs/transaction_states.png)

- **Active**: Transaction bắt đầu được thực thi, đây là trạng thái khởi đầu của tất cả các transcation.
- **Partially Committed**: Một transaction sẽ thực hiện nhiều task, và khi task cuối cùng được thực hiện thì transaction sẽ được xem là ở trạng thái này.
- **Failed**: Bất cứ kiểm tra nào từ database bị báo lỗi thì transaction sẽ ở trạng thái này và sẽ không thể được xử lý tiếp.
- **Aborted**: Khi transaction đạt trạng thái failed thì database sẽ rolls back lại tất cả những task thực hiện việc ghi dữ liệu, để đưa database đạt lại trạng thái trước khi transaction được thực thi hoặc là re-start lại transaction.
- **Committed**: Nếu tất cả các task của transaction được thực hiện thành công thì transaction đạt trạng thái này, và những thay đổi đến database sẽ được lưu vĩnh viễn.

## 2. Schedules là gì ?

![types-of-schedule](/img/blogs/Types-of-Schedules-in-DBMS.png)

- **Schedule**: Là một chuỗi nối tiếp các transaction, mỗi transaction thì có nhiều tasks.
- **Serial Schedule**: Các transaction trong schedule được sắp xếp có trình tự, để khi 1 transaction hoàn thành vòng đời của nó thì transaction tiếp theo mới được thực thi. Schedule kiểu này được gọi là schedule tuần tự(serial schedule), vì các transaction trong serial schedule được thực thi 1 cách có tuần tự.
- **Non-Serial Schedules**: Nhiều transaction xảy ra đồng thời. và các operations của transactions thì có tác động đến nhau.

Các serial schedules thì có các đặc tính như: consistent, recoverable, cascadeless(không xếp tầng, chồng chất lên nhau), strict.

Còn non-serial schedule thì không phải bao giờ cũng đạt được những tính chất như vậy.

❓**Serial schedule đảm bảo như vậy, tại sao chúng ta lại cần non-serial schedule.**

Dễ hiểu khi trong serial schedule thì các transaction được thực hiện từng cái 1 theo trình tự, T1 hoàn thành òng đời xong rồi mới đến T2 nên rất là chậm, còn với non-serial schedule thì các transaction xảy ra song song nên rất nhanh, nhưng cũng vì đó mà không đạt được những tính chất để đảm bảo được cho database luôn đúng, vậy nên những method loại bỏ các vấn đề về concurrency được tạo nên như trên.

## 3. Serializability

Như ở trên chúng ta đã nói thì chúng ta muốn chạy các transactions đồng thời (concurrency) và cũng muốn các kết quả sau khi thực hiện các transactions này giống với cách của serial schedule. Ta gọi điều này là `Serializability`

![serializability-hierarchical](/img/blogs/Schedule-serializability.png)

Để đạt được serializability thì schedules cần đạt được một số equivalences dưới đây.

## 4. Equivalence Schedules - Các tính chất tương đương giữa schedules

2 schedules có thể tương đương về mặt result, view, conflict.

**1. Result Equivalence**
![serial-schedule](/img/blogs/Equivalence-of-Schedules-Problem-01.png)
Nếu 2 schedules đều cho kết quả giống nhau sau khi được thực thi thì chúng được xem là `result equivalence`. Chúng có thể cho result giống nhau ở 1 vài giá trị nhưng cũng có thể khác nhau ở 1 vài giá trị khác. Vì thế mà loại này không có nhiều ý nghĩa.

Ở hình trên lấy X = 2 và Y = 5

- Kết quả của S1: X = 21 và Y = 10
- Kết quả của S2: X = 21 và Y = 10
- Kết quả của S3: X = 11 và Y = 10

✔️ Vậy S1 và S2 result equivalence.

**2. Conflict equivalent**
![conflice-equivalent](/img/blogs/Equivalence-of-Schedules-Problem-02.png)
Nếu 2 schedules thỏa mãn 2 điều kiện dưới đây thì chúng confict equivalent.

- Các transcation ở 2 schedules là giống nhau.
- Trình tự các cặp task confict ở 2 schedules là gióng nhau.

Như thế nào là 1 cặp task conflict ?

Các cặp task conflict là cặp task xảy ra trên 2 transaction cùng truy xuất và update đến 1 giá trị của database. Ví dụ như là T1 thực hiện Read(X) và T2 lại thực hiện Write(X) khiến giá trị của X lúc này ở 2 transaction là khác nhau. Có các cặp conflict như sau: R1(X) W2(X); W1(X) R2(X) và W1(X) W2(X).

Quay lại ở ví dụ trên thì đối với S1 thì 2 transaction chỉ cùng truy xuất và update dữ liệu của A, S2 cũng vậy.

Đối với S1 thì trình tự các cặp conflict như sau:

- R1(A), W2(A)
- W1(A), R2(A)
- W1(A), W2(A)

Đối với S2 thì trình tự các cặp conflict như sau:

- R1(A), W2(A)
- W1(A), R2(A)
- W1(A), W2(A)

Vậy ở đây ta có nói S1 và S2 là các conflict
equivalent schedules.

**3. View Equivalence**
2 schedules có view equivalence khi đáp ứng 3 yêu cầu sau:

- Với mỗi data item X, nếu transaction Ti reads X từ trạng thái đầu tiên ở S1, sau đó ở S2, Ti cũng phải reads X từ trạng thái đầu tiên. Nghĩa là lúc Ti ở S1 và S2 read X thì chúng phải có giá trị như nhau.
- Nếu transaction Ti reads 1 data item mà đã được update bởi 1 transaction Tj ở S1, thì ở S2 transaction Ti cũng phải reads được giá trị tương đương sau khi đã được update bởi 1 Tj khác trong S2.
- Với mỗi data item X, nếu X đã được update bởi ít nhất 1 transaction Ti trong S1 thì ở S2 nó cũng phải được update bởi ít nhất 1 transaction Ti trong S2.

Các phương pháp để kiểm tra xem 1 Schedule có View Serializable hay không ?

1. Kiểm tra xem schedule có conflict serializable hay không ?

- Nếu 1 schedule là conflict serializable thì chắc chắn nó view serializable.
- Nếu 1 schedule không conflict serializable thì nó có thể hoặc không view serializable, và kiểm tra tiếp theo bước dưới đây.

2. Kiểm tra xem schedule có tồn tại những blind write operation hay không?
   Blind write operation là những task thực hiện việc ghi mà không thực hiện việc đọc trước đó.

- Nếu không tồn tại, thì chắc chắn không phải view serializable.
- Nếu có tồn tại, thì kiểm tra theo bước dưới đây.

3. Dùng những yêu cầu đã nêu ở trên, viết lại tất cả các dependencies, vẽ graph, nếu không có vòng lặp nào trong graph thì schedule đó là view serializable và ngược lại.

## 4. Mình hay dùng postgres, vậy postgres thì serializability như thế nào ?

Câu này mình nghĩ sẽ tìm hiểu và trả lời trong 1 bài riêng về postgres 😄
