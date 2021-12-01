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

## 7.Createing and Loading Database

Tạo table

```bash
https://www.pg4e.com/lectures/03-Techniques.sql
```

Load data

```bash
https://www.pg4e.com/lectures/03-Techniques-Load.sql
```

## 8. Loading and Normalizing CSV Data

```sql
--- Load a CSV file and automatically normalize into one-to-many

-- Download
-- wget https://www.pg4e.com/lectures/03-Techniques.csv

-- x,y
-- Zap,A
-- Zip,A
-- One,B
-- Two,B

DROP TABLE IF EXISTS xy_raw;
DROP TABLE IF EXISTS y;
DROP TABLE IF EXISTS xy;

CREATE TABLE xy_raw(x TEXT, y TEXT, y_id INTEGER);
CREATE TABLE y (id SERIAL, PRIMARY KEY(id), y TEXT);
CREATE TABLE xy(id SERIAL, PRIMARY KEY(id), x TEXT, y_id INTEGER, UNIQUE(x,y_id));

\d xy_raw
\d+ y

\copy xy_raw(x,y) FROM '03-Techniques.csv' WITH DELIMITER ',' CSV;

SELECT DISTINCT y from xy_raw;

INSERT INTO y (y) SELECT DISTINCT y FROM xy_raw;

UPDATE xy_raw SET y_id = (SELECT y.id FROM y WHERE y.y = xy_raw.y);

SELECT * FROM xy_raw;

INSERT INTO xy (x, y_id) SELECT x, y_id FROM xy_raw;

SELECT * FROM xy JOIN y ON xy.y_id = y.id;

ALTER TABLE xy_raw DROP COLUMN y;

DROP TABLE xy_raw;
```

## 9. Tạo test data trong PostgreSQL

- **repeat()**: generate long strings(horizontal).

```sql
SELECT REPEAT('Neon ', 5);
```

```json
          repeat
---------------------------
 Neon Neon Neon Neon Neon
(1 row)

```

- **generate_series()**: generate lots of rows (vertical).

```sql
SELECT GENERATE_SERIES(1, 5);
```

```json
 generate_series
-----------------
               1
               2
               3
               4
               5
```

- **random()**: make rows unique.
  - Floating point 0 <= random() <= 1.0

```sql
SELECT random(), random(), trunc(random()*100);
```

```json
       random       |       random       | trunc
--------------------+--------------------+-------
 0.5890984854380257 | 0.9700410868564049 |    62
```

**combined**

```sql
SELECT 'https://ducnguyen96.github.io/' || TRUNC(RANDOM()*10000) || REPEAT('LEMON ', 5) || GENERATE_SERIES(1, 5);
```

```json
                             ?column?
-------------------------------------------------------------------
 https://ducnguyen96.github.io/2957LEMON LEMON LEMON LEMON LEMON 1
 https://ducnguyen96.github.io/9551LEMON LEMON LEMON LEMON LEMON 2
 https://ducnguyen96.github.io/4068LEMON LEMON LEMON LEMON LEMON 3
 https://ducnguyen96.github.io/1896LEMON LEMON LEMON LEMON LEMON 4
 https://ducnguyen96.github.io/7486LEMON LEMON LEMON LEMON LEMON 5
```

## 10. Text Function

- `Where` Clause Operations
  - LIKE, ILIKE, NOT LIKE, NOT ILIKE
  - SIMILAR TO, NOT SIMILAR TO
  - =, >, <, >=, <=, BETWEEN IN
- Manipulate `SELECT` results / `WHERE` clause
  - lower(), upper()

Tham khảo thêm: https://www.postgresql.org/docs/14/functions-string.html

Ví dụ:

```sql
CREATE TABLE textfun(
  content TEXT
);

CREATE INDEX textfun_b ON textfun(content);

SELECT pg_relation_size('textfun'), pg_indexes_size('textfun');
```

```json
 pg_relation_size | pg_indexes_size
------------------+-----------------
                0 |            8192
```

```sql
INSERT INTO textfun(content)
SELECT (
  CASE WHEN (random() < 0.5)
    THEN 'https://www.pg4e.com/neon/'
    ELSE 'https://www.pg4e.com/LEMONS/'
  END
) || GENERATE_SERIES(100000, 200000);
```

```json
 pg_relation_size | pg_indexes_size
------------------+-----------------
          6832128 |         8290304
```

```sql
SELECT content FROM textfun LIMIT 5;
```

```json
              content
------------------------------------
 https://www.pg4e.com/neon/100000
 https://www.pg4e.com/LEMONS/100001
 https://www.pg4e.com/LEMONS/100002
 https://www.pg4e.com/LEMONS/100003
 https://www.pg4e.com/LEMONS/100004
```

### Apply

```sql
SELECT content FROM textfun WHERE content LIKE '%150000%';
-- https://www.pg4e.com/neon/150000
SELECT UPPER(content) FROM textfun WHERE content LIKE '%150000%';
-- HTTPS://WWW.PG4E.COM/NEON/150000
SELECT RIGHT(content, 4) FROM textfun WHERE content LIKE '%150000%';
-- 0000
SELECT LEFT(content) FROM textfun WHERE content LIKE '%150000%';
-- http
SELECT STRPOS(content, 'ttps://') FROM textfun WHERE content LIKE '%150000%';
-- 2
SELECT SUBSTR(content, 2, 4) FROM textfun WHERE content LIKE '%150000%';
-- ttps
SELECT SPLIT_PART(content) FROM textfun WHERE content LIKE '%150000%';
-- neon
SELECT TRANSLATE(content, 'th.p/', 'TH!P_') FROM textfun WHERE content LIKE '%150000%';
-- HTTPS:__www!Pg4e!com_neon_1500000
```

## 11. B-Tree Performance

### So sánh 1

![b-tree](/img/docs/postgresql/b-tree.png);

- Ta có thể thấy các postgres filter sẽ khác nhau khi apply các pattern khác nhau.
- Câu query thích hợp sẽ giúp bạn tăng tốc độ lên cả 1000 lần.

### So sánh 2

![b-tree](/img/docs/postgresql/b-tree-1.png);

- LIMIT 1 có thể tăng performance vì postgres có thể dừng ngay sau khi tìm thấy target.

### So sánh 3

![b-tree](/img/docs/postgresql/b-tree-2.png);

- Sub-query có thời gian query rất lâu.

## 12. Character Sets

- Ngày trước thì mỗi ký tự sẽ được đại diện bằng một số từ 0 đến 127 và được lưu ở bộ nhớ 8 bits - 1 byte.
- Hàm `ascii()` cho ta biết giá trị bằng số của 1 ký tự ASCII.
- Hàm `chr()` map 1 số thành 1 ký tự.

```sql
SELECT ASCII('H'), ASCII('e'), ASCII('1'), CHR(72), CHR(42);
```

```json
 ascii | ascii | ascii | chr | chr
-------+-------+-------+-----+-----
    72 |   101 |    49 | H   | *
```

### Unicode - Tất cả các ký tự

- Unicode is 32/21 bits
- Unicode 12.1
  - 137.000 characters
  - 150 character sets

```sql
SELECT CHR(72), CHR(231), CHR(20013);
```

```json
 chr | chr | chr
-----+-----+-----
 H   | ç   | 中
```

### UTF-8

- UTF-8 là một phiên bản rút gọn cho Unicode
  - Represents 21 bits in 8-32 bits
  - 0-128 là ASCII
  - 128-255 là signals

```sql
SHOW SERVER_ENCODING;
```

```json
 server_encoding
-----------------
 UTF8
```
