---
sidebar_position: 2
---

# SQL cơ bản trong PostgreSQL

## 1. Working with Tables and PostgreSQL

### INSERT

```sql
INSERT INTO users (name, email) VALUES ('Chuck, 'csev@umich.edu');
```

### DELETE

```sql
DELETE FROM users WHERE email='ted@umich.edu';
```

### UPDATE

```sql
UPDATE users SET name='Charles' WHERE email='ted@umich.edu';
```

### SELECT

```sql
SELECT * FROM users WHERE email='ted@umich.edu';
```

### ORDER BY

```sql
SELECT * FROM users ORDER BY email;
```

### LIKE

```sql
SELECT * FROM users WHERE name LIKE '%e%';
```

### LIMIT/OFFSET

```sql
SELECT * FROM users ORDER BY email DESC LIMIT 2;
SELECT * FROM users ORDER BY email OFFSET 1 LIMIT 2;
```

### COUNTING

```sql
SELECT COUNT(*) FROM users;
```

## 2. Data Types in PostgreSQL

- Text fields (small and large)
- Binary fields (small and large)
- Numeric fields
- AUTO_INCREMENT fields

### 2.1. String fields

- Có thể index được cho searching.
- CHAR(n) chỉ định toàn bộ space (nhanh hơn cho các string nhỏ khi biết trước độ dài).
- VARCHAR(n) chỉ định một khoảng space tùy thuộc và dộ dài của dữ liệu(chiếm ít space hơn).
- Hãy sử dụng VARCHAR nếu bạn không chắc chắn độ dài được fixed sẵn.

### 2.2. Text fields

- Một set các ký tự - paragraphs hoặc HTML pages.
- TEXT có đọ dài thay đổi.
- Thường không được sử dụng với index và sorting.

### 2.3. Binary Types

- Byte = 8 bites of information.
  - BYTEA(n) có thể lên đến 255 bytes.
- Để lưu những ảnh nhỏ - data.
- Không được indexed và sorted.

### 2.4. Integer Numbers

- SMALLINT(-32768, +32768).
- INTEGER(2 billion).
- BIGINT -(10^18)

### 2.5. Floating Point Numbers

- REAL(32-bit) 10^38 với độ chính xác 7 chữ số.
- DOUBLE PRECISION (64-bit) 10^308 với đọ chính xác 14 chữ số.
- NUMERIC(accuracy, decimal) - xác định số lượng chữ số miêu ta độ chính xác, các lượng chữ số sau dấu chấm.

### 2.6. Dates

- TIMESTMAP - 'YYYY-MM-DD HH:MM:SS'
- DATE - 'YYYY-MM-DD'
- TIME - 'HH:MM:SS'
- NOW()

## 3. Keys and Indexes

- Khi table trở lên lớn hơn, nhiều rows hơn thì việc scan tất cả data để tìm 1 row rất expensive.
- Index là kỹ thuật tạo các shortcuts để có thể truy cập đến các rows nhanh hơn, kỹ thuật này yêu cầu cấu trúc dữ liệu đặc biệt.
- Phổ biến nhất là Hashes và Trees.

### B-Trees (Balanced Trees)

- Là một cây cấu trúc dữ liệu giúp data được sắp xếp và nhờ đó có thể search một cách nhanh chóng.
- B-Tree được tối ưu cho các hệ thống cần đọc và ghi 1 lượng lớn data, thường được sử dụng trong databases và hệ thống file.

- Ví dụ bạn có 1 TB dữ liệu, nó sẽ được chia làm các ranges nhỏ (được sắp xếp), index sẽ tạo thêm 1 mảng để lưu giá trị điểm đầu và điểm cuối của các range.

### Hashes

- Ví dụ: hash function sẽ map "John Smith"(key) --> 002 (hash).
- Hash functions được sử dụng nhiều nhất cho tác vụ tìm kiếm hoặc so sánh.

## 4. Musical Track Database (CSV)

Ở bài tiếp theo mình sẽ sử dụng tập dữ liệu sau đây, dưới đây là code khi chạy postgresql với docker.

- Tải xuống csv

```bash
cd /home/d/study/postgresql && curl -O https://www.pg4e.com/tools/sql/library.csv
```

- Chạy postgres bằng docker và mount với dir mong muốn.

```bash
docker run -dit -p 5432:5432 --name postgres -e POSTGRES_PASSWORD=1 -v /home/d/study/postgresql:/home postgres
```

- Exec to container

```bash
docker exec -it postgres bash
```

- Tạo user

```sql
CREATE USER pg4e WITH PASSWORD 'secret';
```

- Tạo database mới

```bash
CREATE DATABASE music WITH OWNER 'pg4e';
```

- Exit và login với user mới

```bash
\q
psql music pg4e
```

```sql
CREATE TABLE track_raw
(
  title TEXT, artist TEXT, album TEXT, count INTEGER, rating INTEGER, len INTEGER
);
```

- Load data vừa tải xuống vào table track_raw với `\copy` command.

```sql
\copy track_raw(title, artist, album, count, rating, len) FROM '/home/library.csv' WITH DELIMITER ',' CSV;
```

## 5. Keys

- Primary key: là một integer field tự tăng (e.g: 1, 2, 3,... ).
- Logical key: what the outside world uses for lookup (e.g: email,... ).
- Foreign key: là một integer key trỏ đến một row của table khác.

**Best practices:**

- Không bao giờ sử dụng `logical key` là `primary key`.
- `Logical key` có thể thay đổi.
- Các `relationships` mà dựa trên maching string fields thì không hiệu quả bằng integers.

## 6. Building tables - One To Many

### `artist` table

```sql
CREATE TABLe artist (
  id SERIAL,
  name VARCHAR(128) UNIQUE,
  PRIMARY KEY(id)
);
```

### `album` table

```sql
CREATE TABLE album (
  id SERIAL,
  title VARCHAR(128) UNIQUE,
  artist_id INTEGER REFERENCES artist(id) ON DELETE CASCADE,
  PRIMARY KEY(id)
);
```

`ON DELETE CASCADE` ở đây có nghĩa là nếu bạn delete 1 row ở artist thì row của album trỏ đến row này cũng sẽ bị delete.

### `genre` table

```sql
CREATE TABLE genre (
  id SERIAL,
  name VARCHAR(128) UNIQUE,
  PRIMARY KEY(id)
);
```

### `track` table

```sql
CREATE TABLE track (
  id SERIAL,
  title VARCHAR(128),
  len INTEGER,
  rating INTEGER,
  count INTEGER,
  album_id INTEGER REFERENCES album(id) ON DELETE CASCADE,
  genre_id INTEGER REFERENCES genre(id) ON DELETE CASCADE,
  UNIQUE(title, album_id),
  PRIMARY KEY(id)
);
```

Lưu ý ở đây `UNIQUE(title_album_id)` nghĩa là ở mỗi album_id chỉ có 1 title duy nhất, vẫn tồn tại 2 title giống nhau nếu album_id là khác nhau.

### Describe table

```bash
\d track
```

```json
  Column  |          Type          | Collation | Nullable |              Default
----------+------------------------+-----------+----------+-----------------------------------
 id       | integer                |           | not null | nextval('track_id_seq'::regclass)
 title    | character varying(128) |           |          |
 len      | integer                |           |          |
 rating   | integer                |           |          |
 count    | integer                |           |          |
 album_id | integer                |           |          |
 genre_id | integer                |           |          |
Indexes:
    "track_pkey" PRIMARY KEY, btree (id)
    "track_title_album_id_key" UNIQUE CONSTRAINT, btree (title, album_id)
Foreign-key constraints:
    "track_album_id_fkey" FOREIGN KEY (album_id) REFERENCES album(id) ON DELETE CASCADE
    "track_genre_id_fkey" FOREIGN KEY (genre_id) REFERENCES album(id) ON DELETE CASCADE
```

## 7. Insert data

```sql
INSERT INTO artist (name) VALUES ('Led Zappelin');
INSERT INTO artist (name) VALUES ('AC/DC');
INSERT INTO album (title, artist_id) VALUES ('Who Made Who', 2);
INSERT INTO album (title, artist_id) VALUES ('IV', 2);
INSERT INTO genre (name) VALUES ('Rock');
INSERT INTO genre (name) VALUES ('Metal');
INSERT INTO track (title, rating, len, count, album_id, genre_id) VALUES ('Black Dog', 5, 297, 0, 2, 1);
INSERT INTO track (title, rating, len, count, album_id, genre_id) VALUES ('Stairway', 5, 482, 0, 2, 1);
INSERT INTO track (title, rating, len, count, album_id, genre_id) VALUES ('About to Rock', 5, 313, 0, 2, 1);
INSERT INTO track (title, rating, len, count, album_id, genre_id) VALUES ('Who Made Who', 5, 207, 0, 1, 2);
```

## 8. Sử dụng JOIN

- Bằng cách loại bỏ các dữ liệu bị lặp và thay thế bằng các `references`, chúng ta xây dựng một mạng lưới thông tin mà relational database có thể đọc rất nhanh, dù lượng thông tin là rất lớn.
- Thông thường khi chúng ta muốn một vài thông tin thì chúng sẽ đến từ một vài tables được liên kết với nhau bởi foreign keys.

```sql
SELECT track.title, artist.name, album.title, genre.name
FROM track
    JOIN genre ON track.genre_id = genre.id
    JOIN album ON track.album_id = album.id
    JOIN artist ON album.artist_id = artist.id;
```

```json
     title     | name  |    title     | name
---------------+-------+--------------+-------
 Black Dog     | AC/DC | IV           | Rock
 Stairway      | AC/DC | IV           | Rock
 About to Rock | AC/DC | IV           | Rock
 Who Made Who  | AC/DC | Who Made Who | Metal
```

## 9. ON DELETE CASCADE

### `track` trước khi delete

```sql
SELECT * FROM track;
```

Kết quả

```json
 id |     title     | len | rating | count | album_id | genre_id
----+---------------+-----+--------+-------+----------+----------
  1 | Black Dog     | 297 |      5 |     0 |        2 |        1
  2 | Stairway      | 482 |      5 |     0 |        2 |        1
  3 | About to Rock | 313 |      5 |     0 |        2 |        1
  4 | Who Made Who  | 207 |      5 |     0 |        1 |        2
```

Ở đây ta thấy có 3 rows với genre_id là 1.

### Delete genre

```sql
DELETE FROM genre WHERE id = 1;
```

### `track` sau khi delete

```json
 id |    title     | len | rating | count | album_id | genre_id
----+--------------+-----+--------+-------+----------+----------
  4 | Who Made Who | 207 |      5 |     0 |        1 |        2
(1 row)
```

### ON DELETE choices

- Default/RESTRICT: Không cho phép thay đổi sẽ phá vỡ constraint.
- CASCADE: Thay đổi các rows bằng cách loại bỏ hoặc update để duy trì độ ổn định.
- SET NULL: Set foreign key columns trong các rows con thành null.

## 10. Building tables - Many To Many

- Mỗi student tham gia nhiều courses.
- Mỗi course thì có nhiều students.

`student` table

```sql
CREATE TABLE student (
  id SERIAL,
  name VARCHAR(128),
  email VARCHAR(128) UNIQUE,
  PRIMARY KEY(id)
);
```

`course` table

```sql
CREATE TABLE course (
  id SERIAL,
  title VARCHAR(128) UNIQUE,
  PRIMARY KEY(id)
);
```

- Ta cần thêm 1 table để lưu lại mối quan hệ giữa student-course.
  `membber` table

```sql
CREATE TABLE member (
  student_id INTEGER REFERENCES student(id) ON DELETE CASCADE,
  course_id INTEGER REFERENCES course(id) ON DELETE CASCADE,
  role INTEGER,
  PRIMARY KEY (student_id, course_id)
);
```
