---
sidebar_position: 3
---

# Managing Documents

## 1. Tạo và xóa indices

### 1.1. Tạo một index

**Lưu ý:** Chỉ tạo index theo cách này khi developer, trong môi trường production thì nên tạo theo giá trị mặc định hoặc bạn phải nắm rõ các tham số truyền vào.

```bash
PUT /products
{
  "settings": {
    "number_of_shards": 2,
    "number_of_replicas": 2,
  }
}
```

### 1.2. Xóa một index

```bash
DELETE /pages
```

## 2. Indexing documents

```bash
POST /products/_doc
{
  "name": "Coffee Maker",
  "price": 64,
  "in_stock": 10
}
```

hoặc

```bash
PUT /products/_doc/100
{
  "name": "Coffee Maker",
  "price": 32,
  "in_stock": 20
}
```

## 3. Retrieving an index

```bash
GET /products/_doc/100
```

## 4. Updating documents

```bash
POST /products/_update/100
{
  "doc": {
    "in_stock": 3,
    "tags": ["electronics"]
  }
}
```

### Documents là immutable

- Elasticsearch documents là immutable !
- Chúng ta chỉ thay thế nó chứ không làm biến đổi nó.

## 5. Scripted updates

Ở trên thì chúng ta đã update in_stock từ 4 --> 3 nhưng chúng ta phải chỉ rõ giá trị là 3 cho nó, vậy nếu ta muốn giảm 1 giá trị so với giá trị hiện tại thì phải làm thế nào ?

```bash
POST /products/_update/100
{
  "script": {
    "source": "ctx._source.in_stock--"
  }
}
```

hoặc

```bash
POST /products/_update/100
{
  "script": {
    "source": "ctx._source.in_stock -= params.quantity",
    "params": {
      "quantity": 1
    }
  }
}
```

Chúng ta có thể dùng if statement trong script và ignore việc thực hiện update.

```bash
POST /products/_update/100
{
  "script": {
    "source": """
      if (ctx._source.in_stock === 0) (
        ctx.op = 'noop';
      )

      ctx._source.in_stock--;
    """
  }
}
```

hay đơn giản hơn

```bash
POST /products/_update/100
{
  "script": {
    "source": """
      if (ctx._source.in_stock > 0) (
        ctx._source.in_stock--;
      )
    """
  }
}
```

## 6. Upsert

```bash
POST /products/_update/101
{
  "script": {
    "source": "ctx._source.in_stock -= params.quantity",
    "params": {
      "quantity": 1
    }
  },
  "upsert": {
    "name": "Blender",
    "price": 299,
    "in_stock": 5
  }
}
```

## 7. Replacing documents

```bash
PUT /products/_doc/100
{
  "name": "Toaster",
  "price": 79,
  "in_stock": 4
}
```

## 8. Delete documents

```bash
DELETE /products/_doc/101
```

## 9. Routing

#### Làm sao Elasticsearch biết lưu documents ở đâu và cách tìm thấy nó ?

--> Routing: Là quá trình resolving (phân giải) xem document nên được lưu ở shard nào.

- Có thể custom công thức routing nhưng khá phức tạp.
- Default routing đảm bảo rằng các documents được chia đều ra các shards.

![routing-evenly](/img/docs/elasticsearch_sharding_evenly.png)

Nhìn vào công thức trên ta có thể thấy việc thay đổi số lượng shards sau khi đã index sẽ khiến việc tìm lại document đó bị lỗi.

- \_routing mặc định chính là \_id của document.

## 10. Elasticsearch đọc dữ liệu như thế nào ?.

![elasticsearch_sharding_evenly.png](/img/docs/how_elasticserch_read_data.png)

- Một read request được nhận và xử lý bởi một _coordinating node_.
- Routing được sử dụng để phân giải đến replication group của document.

![elasticsearch_sharding_evenly.png](/img/docs/how_elasticserch_read_data_1.png)

- Kỹ thuật ARS được sử dụng để gửi query đến shard mà elasticsearch tin rằng sẽ cho performance tốt nhất.
- ARS viết tắt cho _Adaptive Replica Selection_.
- ARS giúp giảm thời gian response.
- ARS thực chất là 1 load balancer.
- Coordinating node thu thập response và gửi lại client.

## 11. Elasticsearch ghi dữ liệu như thế nào ?

![elasticsearch_sharding_evenly.png](/img/docs/how_elasticserch_write_data.png)

- Tương tự như đọc dữ liệu thì bước routing ở ghi dữ liệu cũng tương tự.
- Tuy nhiên request lần này không được gửi đến replicas mà gửi đến primary shard.
- Primary shard sẽ validate request, nếu valid sẽ thực hiện việc ghi
- Sau đó sẽ chạy song song update các replicas của nó.

### Xử lý lỗi

Một số lỗi có thể xảy ra khi thực hiện ghi dữ liệu.
![elasticsearch_sharding_evenly.png](/img/docs/how_elasticserch_write_data_error.png)

- Chẳng hạn sau khi update xong ở primary và replica B1 thì primary bỗng dưng lỗi khi chưa update replica B2.
- Lúc này 1 trong 2 replica sẽ được chọn để làm primary tuy nhiên vì B2 chưa được update nên state của nó khác với replica B1.

Để giải quyết vấn đề trên thì Elasticsearch đưa ra 2 khái niệm là _Primary terms_ và _sequence numbers_.

**Primary terms:**

- Là một cách để phân biệt giữa primary shard cũ và mới.
- Thực chất là một counter (bộ đếm) cho bao nhiêu lần primary shard thay đổi (ở ví dụ trên primary B failed 1 lần và đổi primary shard sang B2 nên primary term sẽ tăng lên 1).
- Primary term gắn liền với write operations.
- Primary term giúp Elasticsearch giải quyết được 1 số vấn đề tuy nhiên chưa đủ.

**Sequence numbers:**

- Gắn liền với write operations cùng với primary term.
- Thực chất là 1 counter tăng lên sau mỗi write operation.
- Primary shard làm tăng sequence number.

### Recovering khi 1 primary shard bị lỗi

- Primary terms và sequence number được Elasticsearch sử dụng để thực hiện việc recover khi primary shard bị lỗi.
- Với những indices lớn thì quá trình này sử dụng khả năng tính toán rất nhiều.
- Để cải thiện tốc độ thì Elasticsearch sử dụng _checkpoints_.

#### Global và local checkpoints

- Thực chất là các sequence numbers.
- Mỗi replication group đều có 1 global checkpoint.
- Mỗi replica shard có 1 local checkpoint.

## 12. Concurrency

![elasticsearch_sharding_evenly.png](/img/docs/how_elasticserch_concurrency.png)

- Như ví dụ trên ta có thể thấy, việc gửi write requests đến Elasticsearch concurrently có thể sinh ra lỗi.
- Theo cách truyền thống thì ta có thể sử dụng \_version để tránh trường hợp này.
- Với Elasticsearch phiên bản hiện tại thì chúng ta sẽ sử dụng \_primary_term và \_seq_no.
- Elasticsearch sẽ từ chối write operation nếu nó chứa sai primary term và sequence number (việc này nên được giải quyết ở lớp ứng dụng chứ không phải để Elasticsearch giải quyết).

```bash
POST /products/_update/100?if_primary_term=1&if_seq_no=9
{
  "doc": {
    "in_stock": 123
  }
}
```

## 13. Update bằng query.

```bash
POST /products/_update_by_query
{
  "script": {
    "source": "ctx._source.in_stock--"
  },
  "query": {
    "match_all": {}
  }
}
```

## 14. Delete bằng query

```bash
POST /products/_delete_by_query
{
  "query": {
    "match_all": {}
  }
}
```

## 15. Batch processing

Ở trên thì chúng ta đã biết cách create, delete, update từng document. Vậy để làm những tác vụ trên với nhiều documents đồng thời thì phải thực hiện như thế nào ?
--> Bulk API.

```bash
POST /_bulk
{ "index": { "_index": "products", "_id": 200 }}
{ "name": "Espresso Machine", "price": 199, "in_stock": 5}
{ "create": { "_index": "products", "_id": 201 }}
{ "name": "Mulk Frother", "price": 149, "in_stock": 15}
```

### index và create khác nhau chỗ nào ?

- create sẽ fail nếu document đã tồn tại.
- index sẽ thêm vào khi chưa tồn tại và replace nếu chưa.

Nếu các operations có cùng index thì ta có thể đặt index vào path như sau:

```bash
POST /products/_bulk
{ "update": { "_id": 201 }}
{ "doc": { "price": 129 }}
{ "delete": { "_id": 200 }}
```

### Lưu ý

- `Content-Type` header nên được set như sau: `Content-Type: application/x-ndjson`.
- Mỗi dòng kết thúc với `\n` hoặc `\r\n` kể cả dòng cuối, trong text editor thì dòng cuối kết thúc với empty.
- Không gõ `\n` hoặc `\r\n` trong text editor nhé 😄.
- Một action trong bulk fail thì không ảnh hưởng đến actions khác.
- Bulk API sẽ trả về thông tin chi tiết về mỗi action và theo thứ tự chúng được request.
- Bulk API hỗ trợ quản lý concurrency với tham số `if_primary_term` và `if_sequence_no`.

### Khi nào sử dụng Bulk API

- Khi cần thực hiện nhiều write operations cùng lúc ví dụ như import data hay thay đổi data.
- Bulk API thì cho performance tốt hơn so với từng request đơn lẻ vì nhiều bước liên quan đến network sẽ bị lược bỏ.

## 16. Import data với cURL.

```bash
curl -H "Content-Type: application/x-ndjson" -XPOST http://localhost:9200/products/_bulk --data-binary "@products-bulk.json"
```
