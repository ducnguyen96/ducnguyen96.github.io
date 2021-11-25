---
slug: database-indexing-basic
title: Database indexing cơ bản
authors: [ducnguyen96]
tags: [database, indexing]
---

# Database indexing cơ bản

Những kiến thức dưới đây sẽ áp dụng được với postgres còn những database khác thì mình không chắc nhé.

## Row được lưu như thế nào ?

![heap-storage-structure](/img/blogs/basic-heap-storage-structure.png)

Cấu trúc được sử dụng để lưu trữ 1 `table` là 1 heap file - list các `page` có fixed size (thường là 8Kb). Trong 1 `table` thì tất cả các `page` đều tương đương về mặt logic, nên 1 `row` cụ thể có thể được lưu trữ ở bất kỳ page nào.

Cấu trúc của 1 page cụ thể như sau:
![heap-file-page](/img/blogs/heap_file_page.png)

- 1 Page thì có nhiều headers, chúng bao gồm checksum, start of free space, end of free space.
- Sau headers là 1 list các identifier bao gồm offset, length và trỏ đến 1 item(row).
- 1 Pointer đến 1 item thì được gọi là CTID và bạn có thể truy cập CTID bằng cách: `select ctid, * from users;`
- Các identifier thì được lưu ở đầu page trở xuống.
- Tuple ở đây chính là 1 row trong table, các row thì lại được lưu ngược lại từ dưới lên.

## Tại sao cần indexing ?

Vậy là chúng ta đã biết được row được gom thành các page(block) nối tiếp nhau trong file heap. Bây giờ sẽ như thế nào nếu ta tìm kiếm những row có 1 trường có giá trị cụ thể ?

Đối với những trường không unique thì khi search trên trường ấy chúng ta phải search trên toàn bộ(N) các block, đối với những trường là key (unique) thì có thể sử dụng Linear Search và yêu cầu trung bình truy xuất đến (N+1)/2 blocks.

Đối với những trường đã được sorted sẵn và unique thì lúc đấy có thể áp dụng Binary Search và bây giờ thì số lượng blocks cần truy xuất đến giảm xuống chỉ còn log2(N). Đối với N lớn thì performance sẽ tăng lên đáng kể. Và đây cũng chính là lý do mà chúng ta sẽ sử dụng indexing.

## Indexing là gì ?

Khi tạo 1 index thì 1 file mới sẽ được tạo ra và có shema như sau.

Schema của một index:

```postgres
Field name       Data type      Size on disk
firstName        Char(50)       50 bytes
(record pointer) Special        4 bytes
```

Sau khi tạo ra index này thì nó sẽ được sorted để có thể áp dụng Binary Searches. Việc tạo ra nhiều index không hợp lý sẽ dẫn đến việc tiêu tốn bộ nhớ ổ đĩa không cần thiết.

## Index hoạt động như thế nào ?

Giả sử chúng ta có 1 table có 5,000,000 rows tương tự như này:

```postgres
Field name       Data type      Size on disk
id (Primary key) Unsigned INT   4 bytes
firstName        Char(50)       50 bytes
lastName         Char(50)       50 bytes
emailAddress     Char(100)      100 bytes
```

Ta thấy thì mỗi row ở đây sẽ có fixed size là `204 bytes`, ở đây ta sẽ sử dụng postgres có size cho mỗi block(page) là 8Kb = `8192 bytes` vậy mỗi block sẽ có ~ 40 rows, mình sẽ tạm thời bỏ qua headers cũng như CTID và các thành phần khác.

**Note**: Ở đây thì char được sử dụng thay cho varchar để đảm bảo size on disk fixed và thuận tiện cho việc tính toán dưới đây.

Với 5,000,000 rows thì chúng ta sẽ có khoảng N = 5,000,000 / 40 = 125,000 blocks. Nếu query trường firstname thì ta sẽ phải query toàn bộ 125,000 blocks, còn với trường id đã unique và sorted sẵn nên số blocks truy xuất chỉ là ~17 blocks.

Nếu ta tạo index cho trường firstname vậy mỗi row sẽ có size là `54 bytes`, mỗi block `8192 bytes` vậy sẽ có 8192/54 ~ 150 rows trong mỗi block vậy N = 5,000,000 / 150 = 33,333 blocks. Để truy xuất đến 1 row có firstname bằng 1 giá trị nhất định thì lúc này chúng ta sẽ chỉ còn cần query ~ 15 + 1 = 16 blocks giảm 1 số lượng kinh khủng so với trước. +1 ám chỉ rằng sau khi lấy được record pointer thì ta sẽ cần query đến heap để lấy dữ liệu khác như lastname, emailAddress.

## Create Postgres Table with a moillion Rows (from scratch)

```postgres
create table temp(t int);
insert into temp(t) select random()*100 from generate_series(0, 1000000);
select count(*) from temp;
```

## Using Explain

![pg-explain-1](/img/blogs/pg-explain-1.png)

- Seq Scan có nghĩa là nó sẽ full-table scan (sẽ tìm đến heap và fetch tất cả để scan).
- Cost thường có 2 giá trị: giá trị đầu là số milisecond để pg fetch page đầu tiên của table, nếu bạn hay pg không yêu cầu việc gì (như ordering chẳng hạn) thì việc này sẽ tốn rất ít thời gian, nếu số này tăng cao thì nghĩa pg đang làm rất nhiều thứ khác trước khi fetching. Giá trị thứ 2 là thời gian mà pg suy nghĩ các việc sẽ làm.
- Rows là giá trị estimate mà query trả về.
- Width là giá trị bằng bytes của mỗi row.

Bài này mình xin phép dừng tại đây vì cũng khá dài rồi, mình sẽ tiếp tục cập nhật các bài viết khác trong chuỗi bài về postgres.

## Tham khảo

- [Introduction to PostgreSQL physical storage](http://rachbelaid.com/introduction-to-postgres-physical-storage/)
- [How does database indexing work](https://stackoverflow.com/questions/1108/how-does-database-indexing-work)
