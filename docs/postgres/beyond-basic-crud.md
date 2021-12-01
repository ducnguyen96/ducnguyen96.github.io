---
sidebar_position: 3
---

# Beyond basic CRUD (Create, Read, Update and Delete)

Bài này sẽ tập trung vào aggregatin, transactions, reading và parsing CSV files và inserting data vào database.

Đồng thời cũng sẽ đề cập qua cách mà PostgreSQL xử lý và index text data.

## 1. Thay đổi table schema

- Khi tạo table thì việc xảy ra lỗi là không thể tránh khỏi, bạn có thể nhầm type, nhầm key và constraint khi tạo table.

- PostgreSQL hỗ trợ tính năng thay đổi table trên live database, ngay cả khi application đang chạy.

Ví dụ:

```sql
CREATE TABLE fav (
  id SERIAL,
  oops TEXT,
  post_id INTEGER REFERENCES post(id) ON DELETE CASCADE,
  account_id INTEGER REFERENCES account(id) ON DELETE CASCADE,
  UNIQUE(post_id, account_id),
  PRIMARY KEY(id)
);
```

```sql
ALTER TABLE fav DROP COLUMN oops;
```

### Add, Drop, Alter column

```sql
ALTER TABLE post ALTER COLUMN content TYPE TEXT;
ALTER TABLE fav ADD COLUMN how_much INTEGER;
```

### Reading commands from a file

```bash
\i 03-Techniques-load.sql
```

## 2. Dates

### Setting default values

- Ta có thể lược bỏ được 1 vài dòng codes bằng cách bảo Postgres rằng tự điền field date khi có 1 row mới được inserted vào.

```sql
CREATE TABLE fav (
  id SERIAL,
  oops TEXT, -- Sẽ bị remove sau với ALTER
  post_id INTEGER REFERENCES post(id) ON DELETE CASCADE,
  account_id INTEGER REFERENCES account(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(post_id, account_id),
  PRIMARY KEY(id)
);
```

### TIMESTAMPTZ - Best Practice

- Lưu time stamps cùng timezone, nên dùng UTC.
- Client sẽ convert đến local timezone khi nhận data.

```sql
SELECT NOW(), NOW() AT TIME ZONE 'UTC', NOW() AT TIME ZONE 'HST';
```

```json
              now              |          timezone          |          timezone
-------------------------------+----------------------------+----------------------------
 2021-12-01 02:49:25.550491+00 | 2021-12-01 02:49:25.550491 | 2021-11-30 16:49:25.550491

```

### Casting

- Convert từ type này sang type khác.
- Postgres có 1 số forms casting như sau.

```sql
SELECT NOW()::DATE, CAST(NOW() AS DATE), CAST(NOW() AS TIME);
```

```json
    now     |    now     |       now
------------+------------+-----------------
 2021-12-01 | 2021-12-01 | 02:51:22.764287

```

### Intervals

```sql
SELECT NOW(), NOW() - INTERVAL '2 days', (NOW() - INTERVAL '2 days')::DATE;
```

```json
             now              |           ?column?           |    date
------------------------------+------------------------------+------------
 2021-12-01 03:00:26.60175+00 | 2021-11-29 03:00:26.60175+00 | 2021-11-29
```

### date_trunc()

```sql
SELECT id, content, created_at FROM comment
    WHERE created_at >= DATE_TRUNC('day', NOW())
    AND created_at < DATE_TRUNC('day', NOW() + INTERVAL '1 day');
```

### Performance: Table Scans

- Không phải tất cả các queries đều có performance giống nhau.
- Ví dụ câu query dưới đây sẽ cho performance kém hơn cách dùng date_trunc() ở trên.

```sql
SELECT id, content, created_at FROM comment
    WHERE created_at::DATE = NOW()::DATE
```

Câu query này sẽ full-table scan còn với query ở `date_trunc` phía trên thì không.

## 3. DISTINCT/GROUP BY

- Khi ta query thì việc data lặp lại ở hàng dọc xảy ra khá là thường xuyên.
- `DISTINCT` chỉ trả về các unique rows, giới hạn duplicate trên một số columns.
- `GROUP BY` được kết hợp với các aggregate function như: `COUNT`, `MAX`, `SUM`, `AVE` ...

### DISTINCT

![distinct](/img/docs/postgresql/postgres_distinct.png)

**DISTINCT ON**
![distinct](/img/docs/postgresql/postgres_distinct_on.png)

### Aggregate / GROUP BY

```sql
SELECT COUNT(abbrev), abbrev FROM pg_timezone_names GROUP BY abbrev LIMIT 10;
```

```json
 count | abbrev
-------+--------
     2 | +00
    20 | PST
    10 | IST
     8 | -01
    14 | HST
    30 | +05
    12 | +09
     2 | -12
     8 | NZDT
    71 | EST
```

### HAVING clause

```sql
SELECT count(abbrev) AS ct, abbrev FROM pg_timezone_names
  WHERE is_dst='t' GROUP BY abbrev HAVING count(abbrev) > 10;
```

```json
 ct | abbrev
----+--------
 20 | AEDT
```

- Lưu ý ở đây WHERE đặt trước GROUP BY.
- HAVING đặt sau GROUP BY.
- WHERE cho kết quả --> GROUP BY --> HAVING (~ WHERE)

## 4. Sub-queries

- Là một query trong một query.
- Có thể sử dụng value hay một số values trong một query mà những values ấy được tính toán bởi một query khác.

Ví dụ:

```sql
SELECT * FROM account WHERE email='ed@umich.edu'; --> id = 7

SELECT content FROM comment WHERE account_id = 7;
```

Có thể viết lại với sub-query.

```sql
SELECT content FROM comment
WHERE account_id = (SELECT id FROM account WHERE email='ed@umich.edu');
```

![temp-table](/img/docs/postgresql/tem_table.png)

-Ở đây sub-query tạo ra 1 table tạm thời và câu query chính sẽ thực hiện query ở trên đó --> 2 queries.

## 5. Concurrency and Transactions

- Databases được thiết kế để có thể nhận nhiều SQL commands cùng lúc từ các nguồn khác nhau và hoạt động một cách `atomically`.
- Ví dụ: biến count hiện tại đang có giá trị là 100, có 3 SQL commands update count lên 1đến cùng lúc thì `atomically` đảm bảo biến count sẽ có giá 103 sau khi hoàn tất cả 3 commands.

### Transactions and Atomicity

- Dể đạt được atomicity thì PostgreSQL "locks" các `areas` trước khi bắt đầu 1 SQL command có thể thay đổi 1 area của database.
- Tất cả các access khác đến `area` đó sẽ phải chờ cho tới khi `area` được unlocked.

```sql
UPDATE trakcs SET count=count+1 WHERE id = 42;
```

==>

```sql
LOCK ROW 42 OF tracks
READ count FROM tracks ROW 42
count = count + 1
WRITE count TO tracks ROW 42
UNLOCK ROW 42 OF tracks
```

### ON CONFLICT

```sql
-- This will fail
INSERT INTO fav (post_id, account_id, howmuch)
  VALUES (1, 1, 1)
RETURNING * -- return tất cả sau khi insert;
```

```sql
INSERT INTO fav (post_id, account_id, howmuch)
  VALUES (1, 1, 1)
  ON CONFLICT (post_id, account_id)
  DO UPDATE SET howmuch = fav.howmuch + 1
RETURNING *;
```

### Multi-Statement Transactions

```sql
BEGIN;
SELECT how much FROM fav WHERE account_id=1 AND post_id=1 FOR UPDATE OF fav; -- bây giờ row này đang bị locked, nếu bạn thực hiện SELECT ở trên row này thì sẽ bị wait cho đến khi row này được unlocked.
-- Time passes
UPDATE SET howmuch=999 WHERE account_id=1 AND post_id=1;
SELECT howmuch FROM fav WHERE account_id=1 AND post_id=1;
ROLLBACK;
SELECT how much FROM fav WHERE account_id=1 AND post_id=1;
```

```sql
BEGIN;
SELECT how much FROM fav WHERE account_id=1 AND post_id=1 FOR UPDATE OF fav;
-- Time passes
UPDATE SET howmuch=999 WHERE account_id=1 AND post_id=1;
SELECT howmuch FROM fav WHERE account_id=1 AND post_id=1;
COMMIT;
SELECT how much FROM fav WHERE account_id=1 AND post_id=1;
```

- Sự triển khai transactions sẽ tạo nên sự khác biệt lớn trong database performance.
  - Lock granularity(độ chi tiết).
  - Lock implementation(sự triển khai).

## 6. Stored Procedures (thủ tục)

- Là một đoạn code chạy trong database server mà có thể tái sử dụng.
- Có nhiều ngôn ngữ có thể dùng để viết procedures, chỉ sử dụng "plpgsql".
- Mục đích chính là thực hiện ít SQL statements hơn.
- Nên có mục đích sử dụng rõ ràng:
  - Performance.
  - Khó có thể test/modify.
  - Phải tuân thủ theo rule nào đấy.

Ví dụ ở phía trên ta có sử dụng `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()` ở đây NOW sẽ được gọi mỗi khi có row mới được tạo, bây giờ ta cũng muốn làm điều tương tự với update.

### Sử dụng trigger cho `updated_at`

```sql
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW()
  RETURN NEW
END;
$$ LANGUAGE plpgsql;
```

```sql
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON fav
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();
```

Bây giờ khi có update đến 1 row của fav thì trường `updated_at` sẽ trigger `trigger_set_timestamp`.
