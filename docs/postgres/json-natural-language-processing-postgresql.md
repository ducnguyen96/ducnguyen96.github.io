---
sidebar_position: 4
---

# JSON and Natural Language Processing

## 1. Allocating Rows to Blocks in PostgreSQL

![allocating](/img/docs/postgresql/allocating.png)

- PostgresQL sẽ lưu data dưới dạng các blocks (mỗi blocks có size mặc định là 8Kb). Mỗi blocks sẽ chứa các row và các row được thêm vào từ cuối trở về.
- Mỗi block cũng sẽ có các offset để định vị được điểm bắt đầu và kết thúc của mỗi row.
- Nếu row được update và size thay đổi thì các row sẽ được shifted.
- Khi chúng ta đọc 1 row thì ta sẽ đọc toàn bộ block ấy vào memory.
- Ta không thể biết được vị trí của 1 row trên disk mà ta chỉ biết được vị trí của 1 row trên block và block trên disk.
- Index map key-to-block.

## 2. Index Implementation Details

- PostgreSQl có 2 loại indexes chính:
  - Forward indexes.
  - Inverted indexes.
- Tất cả các loại indexes:
  - B-Tree: mặc định, tự động cân bằng.
  - BRIN: Block Range Index - nhỏ, nhanh hơn(chia làm các ranges nhỏ) nếu dữ liệu gần như được sorted trước.
  - Hash: Tìm kiếm các string keys nhanh hơn.
  - GIN: Generalized Inverted Indexes: multiple values in a column.
  - GiST: Generalized Search Tree
  - SP-GiST: Space Partitioned Generalized Search Tree.

## 3. Building an Inverted Index with SQL

### string_to_array

```sql
SELECT string_to_array('Hello world', ' ');
```

```json
 string_to_array
-----------------
 {Hello,world}
```

### unnest

```sql
SELECT unnest(string_to_array('Hello world', ' '));
```

```json
  unnest
--------
 Hello
 world
```

### select distinct

```sql
CREATE TABLE docs (id SERIAL, doc TEXT, PRIMARY KEY(id));
INSERT INTO docs (doc) VALUES ('This is SQL and Python and other fun teaching stuff'),
('More people should learn SQL from UMSI'),
('UMSI also teaches Python and also SQL');
```

```json
 id |                         doc
----+-----------------------------------------------------
  1 | This is SQL and Python and other fun teaching stuff
  2 | More people should learn SQL from UMSI
  3 | UMSI also teaches Python and also SQL
```

**Insert the keyword/primary key rows into a table**

```sql
CREATE TABLE docs_gin (
  keyword TEXT,
  doc_id INTEGER REFERENCES docs(id) ON DELETE CASCADE
);


INSERT INTO docs_gin (doc_id, keyword)
SELECT DISTINCT id, s.keyword AS keyword
FROM docs AS D, unnest(string_to_array(D.doc, ' ')) s(keyword)
ORDER BY id;
```

**Find all the distinct documents that match a keyword**

```sql
SELECT DISTINCT doc FROM docs AS D
JOIN docs_gin AS G ON D.id = G.doc_id
WHERE G.keyword = 'UMSI';
```

**We can remove duplicates and have more than one keyword**

```sql
SELECT DISTINCT doc FROM docs AS D
JOIN docs_gin AS G ON D.id = G.doc_id
WHERE G.keyword IN ('fun', 'people');
```

**We can handle a phrase**

```sql
SELECT DISTINCT doc FROM docs AS D
JOIN docs_gin AS G ON D.id = G.doc_id
WHERE G.keyword = ANY(string_to_array('I want to learn', ' '));
```

## 4. Natural Language Index (SQL only)

### 4.1. Break the document column into one row per word + primary key

```sql
SELECT DISTINCT id, s.keyword AS keyword
FROM docs AS D, unnest(string_to_array(lower(D.doc), ' ')) s(keyword)
ORDER BY id;
```

```sql
DROP TABLE docs_gin CASCADE;
CREATE TABLE docs_gin (
  keyword TEXT,
  doc_id INTEGER REFERENCES docs(id) ON DELETE CASCADE
);

DROP TABLE stop_words;
CREATE TABLE stop_words (word TEXT unique);
INSERT INTO stop_words (word) VALUES ('is'), ('this'), ('and');
```

### 4.2. Throw out all the words in the stop word list

```sql
INSERT INTO docs_gin (doc_id, keyword)
SELECT DISTINCT id, s.keyword AS keyword
FROM docs AS D, unnest(string_to_array(lower(D.doc), ' ')) s(keyword)
WHERE s.keyword NOT IN (SELECT word FROM stop_words)
ORDER BY id;
```

### 4.3. One word query

```sql
SELECT DISTINCT doc FROM docs AS D
JOIN docs_gin AS G ON D.id = G.doc_id
WHERE G.keyword = lower('UMSI');
```

```json
                  doc
----------------------------------------
 More people should learn SQL from UMSI
 UMSI also teaches Python and also SQL
```

### 4.4. Multi-word query

```sql
SELECT DISTINCT doc FROM docs AS D
JOIN docs_gin AS G ON D.id = G.doc_id
WHERE G.keyword = ANY(string_to_array(lower('UMSI'), ' '));
```

```json
                  doc
----------------------------------------
 More people should learn SQL from UMSI
 UMSI also teaches Python and also SQL
```

### 4.5. Using steam

#### making dictionary word --> steam

```sql
CREATE TABLE docs_steam (word TEXT, steam TEXT);
INSERT INTO docs_steam (word, steam) VALUES ('teaching', 'teach'), ('teaches', 'teach');
```

#### add the steams as third column

```sql
SELECT id, keyword, steam FROM (
  SELECT DISTINCT id, s.keyword AS keyword
  FROM docs AS D, unnest(string_to_array(lower(D.doc), ' ')) s(keyword)
) AS K
LEFT JOIN docs_steam AS S ON K.keyword = S.word;
```

```json
 id | keyword  | steam
----+----------+-------
  3 | also     |
  1 | and      |
  3 | and      |
  2 | from     |
  1 | fun      |
  1 | is       |
  2 | learn    |
  2 | more     |
  1 | other    |
  2 | people   |
  3 | python   |
  1 | python   |
  2 | should   |
  1 | sql      |
  2 | sql      |
  3 | sql      |
  1 | stuff    |
  3 | teaches  | teach
  1 | teaching | teach
  1 | this     |
  3 | umsi     |
  2 | umsi     |
```

#### use steam, coalesce

```sql
SELECT id,
CASE WHEN steam IS NOT NULL THEN steam ELSE keyword END AS awesome,
keyword, steam
FROM (
  SELECT DISTINCT id, lower(s.keyword) AS keyword
  FROM docs AS D, unnest(string_to_array(D.doc, ' ')) s(keyword)
) AS K
LEFT JOIN docs_steam AS S ON K.keyword = S.word;
```

hoặc có thể sử dụng `COALESCE`

```sql
DELETE FROM docs_gin;
```

```sql
INSERT INTO docs_gin(doc_id, keyword)
SELECT id, COALESCE(steam, keyword) AS keyword
FROM (
  SELECT DISTINCT id, lower(s.keyword) AS keyword
  FROM docs AS D, unnest(string_to_array(D.doc, ' ')) s(keyword)
  WHERE s.keyword NOT IN (SELECT word FROM stop_words) -- without stop words
) AS K
LEFT JOIN docs_steam AS S ON K.keyword = S.word;
```

## 5. GIN-based Inverted Ingex with PostgreSQL

### 5.1. Simple Example

```sql
CREATE TABLE docs (id SERIAL, doc TEXT, PRIMARY KEY(id));

CREATE INDEX gin1 ON docs USING gin(string_to_array(doc, ' ') array_ops);
INSERT INTO docs (doc) VALUES ('This is SQL and Python and other fun teaching stuff'),
('More people should learn SQL from UMSI'),
('UMSI also teaches Python and also SQL');
```

```sql
SELECT id, doc FROM docs WHERE '{learn}' <@ string_to_array(doc, ' ');
```

```json
 id |                  doc
----+----------------------------------------
  2 | More people should learn SQL from UMSI
  5 | More people should learn SQL from UMSI
```

```sql
EXPLAIN SELECT id, doc FROM docs WHERE '{learn}' <@ string_to_array(doc, ' ');
```

```json
                                 QUERY PLAN
----------------------------------------------------------------------------
 Bitmap Heap Scan on docs  (cost=12.05..21.53 rows=6 width=36)
   Recheck Cond: ('{learn}'::text[] <@ string_to_array(doc, ' '::text))
   ->  Bitmap Index Scan on gin1  (cost=0.00..12.05 rows=6 width=0)
         Index Cond: (string_to_array(doc, ' '::text) @> '{learn}'::text[])
```

### 5.2. Using `tsquery` and `tsvector`

```sql
SELECT to_tsquery('english', 'Teach | teaches | teaching | and | the | if')
```

```json
         to_tsquery
-----------------------------
 'teach' | 'teach' | 'teach'
```

#### Building a GIN/tsvector Index

```sql
DROP TABLE docs CASCADE;
DROP INDEX gin1;

CREATE TABLE docs (id SERIAL, doc TEXT, PRIMARY KEY(id));

CREATE INDEX gin1 ON docs USING gin(to_tsvector('english', doc));

INSERT INTO docs (doc) VALUES ('This is SQL and Python and other fun teaching stuff'),
('More people should learn SQL from UMSI'),
('UMSI also teaches Python and also SQL');

-- filler rows
INSERT INTO docs (doc) SELECT 'Neon ' || generate_series(10000, 20000);
```

```sql
SELECT id, doc FROM docs WHERE
to_tsquery('english', 'learn') @@ to_tsvector('english', doc);
```

```json
 id |                  doc
----+----------------------------------------
  2 | More people should learn SQL from UMSI
```

```sql
EXPLAIN SELECT id, doc FROM docs WHERE
to_tsquery('english', 'learn') @@ to_tsvector('english', doc);
```

```json
                                      QUERY PLAN
--------------------------------------------------------------------------------------
 Bitmap Heap Scan on docs  (cost=208.27..268.71 rows=35 width=36)
   Recheck Cond: ('''learn'''::tsquery @@ to_tsvector('english'::regconfig, doc))
   ->  Bitmap Index Scan on gin1  (cost=0.00..208.26 rows=35 width=0)
         Index Cond: (to_tsvector('english'::regconfig, doc) @@ '''learn'''::tsquery)
```
