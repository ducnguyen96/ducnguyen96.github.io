---
sidebar_position: 5
---

# Introduction to Searching

## 1. Search hoạt động như thế nào ?

![how search work](/img/docs/elasticsearch/how_search_work.png)

- Giả sử ta có 1 cluster chứa 3 nodes và 1 index được phân phối tới 3 shards: A, B, C.
- Mỗi shard có 2 replicas, vậy mỗi replication group có 1 primary và 2 replicas.

- Giả sử client gọi search query đến cluster và được gửi đến node chứa shard B, node này được gọi là `coordinating node` nghĩa là node này chịu trách nhiệm gửi queries đến các node khác, merge response và gửi response lại client.

- Mặc định thì tất cả các nodes trong cluster đều có thể hoạt động như 1 coordinating node và nhận HTTP requests.
- Node này sau đó sẽ gửi request broadcast đến các shard khác (primary hoặc replicas).
- Khi nhận được phản hồi từ các shard khác thì `coodinating node` sẽ merge và sort chúng, sau đó gửi lại client.
- Trường hợp nếu query với ID thì request sẽ được gửi đến shard phù hợp chứ không phải gửi broadcast.

## 2. Debug

```bash
GET /product/1/_explain
{
  "query": {
    "name": "lobster"
  }
}
```

## 3. Query context

- Nếu query ảnh hưởng đến relevance --> query context, không thì --> filter context.
- Ví dụ bạn muốn search documents với term "salad" ở trong "title" field, nếu bạn muốn documents mà term này xuất hiện nhiều lần thì relevant hơn những yếu tốt khác --> query context.
- Nếu bạn muốn match bất cứ documents nào có term "salad" --> filter context.

### Query context

**How well do documents match ? Calculate relevance scores.**

### Filter context

**Do documents match ? No relevance scores are calculated.**

- Sử dụng cho dates, status, ranges, etc.
- Có thể cache.

## 4. Full text queries và term level queries.

Ta có 3 queries sau đây (với name là "Lobster - Live"):

### 1

```bash
GET /product/_search
{
  "query": {
    "term": {
      "name": "lobster"
    }
  }
}
```

==> Trả về kết quả

### 2

```bash
GET /product/_search
{
  "query": {
    "term": {
      "name": "Lobster"
    }
  }
}
```

=> Không

### 3

```bash
GET /product/_search
{
  "query": {
    "match": {
      "name": "Lobster"
    }
  }
}
```

==> Trả về kết quả

![term-vs-full-text](/img/docs/elasticsearch/term_vs_text.png)

- Term queries tìm kiếm exact values. Nhưng tại sao query 1 lại trả kết quả trong khi L đáng nhẽ phải capitalized ?
- Vì thực ra chúng ta đang search inverted index, không phải document. Ở đây thì inverted index đi qua `standard analyzer` có chứa `token filter` làm cho lowercase.
- Tương tự thì ở query 2 vì Lobster là capitalized trong khi inverted index đã được lowercase nên nó không tìm thấy.
- Không giống như term query, full text queries được analyzed, có nghĩa là search query trải qua quá trình analysis giống như text field.
