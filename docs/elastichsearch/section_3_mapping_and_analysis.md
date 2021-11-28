---
sidebar_position: 4
---

# Mapping & Analysis

## 1. Introduction to analysis

![analysis](/img/docs/elasticsearch/analysis.png)

- Analysis hay thường được gọi là text analysis.
- Có thể áp dụng với các giá trị, fields text.
- Text sẽ được phân tích khi chúng ta index documents và kết quả được lưu dưới dạng 1 cấu trúc dữ liệu hiệu quả cho việc search.
- Object \_source mà ta nhận được khi GET thì không được sử dụng để search vì nó k hiệu quả.

![analysis](/img/docs/elasticsearch/analysis_1.png)

### 1.1. Character filters

- Ta có thể thêm bớt hoặc chỉnh sửa các characters ở đây.
- Analyzers có thể có không hoặc nhiều character filters.
- Các filters này được applied theo thứ tự định sẵn.
- Ví dụ _html_strip_ filter.

  - **Input:**"I&apos;m in a <em>good</em> mood&nbsp;-&nbsp;and I <strong>love</strong> acaí!"
  - **Output:**"I'm in a good mood - and I acaí!"

### 1.2. Tokenizers

- Mỗi Analyzer thì có 1 tokenizer.
- Dùng để tokenize string, ví dụ như splits string thành các tokens.
- Các ký tự ký có thể bị xém khi bị tokenize.
- Ví dụ:

  - **Input:** "I REALLY like beer!"
  - **Output:** ["I", "REALLY", "like", "beer"]

### 1.3. Token filters

- Nhận output của tokenizer là input.
- Có thể thêm bớt chỉnh sửa tokens.
- Mỗi analyzer có thể có không hoặc nhiều token filters.
- Được applied theo thứ tự được định sẵn.
- Ví dụ _lowercase_ filter

  - **Input:** ["I", "REALLY", "like", "beer"]
  - **Output:** ["i", "really", "like", "beer"]

## 2. Sử dụng Analyze API

```bash
POST /_analyze
{
  "text": "2 guys walk into   a bar, but the third... DUCKS! :-)",
  "analyzer": "standard"
}
```

kết quả

```json
{
  "tokens": [
    {
      "token": "2",
      "start_offset": 0,
      "end_offset": 1,
      "type": "<NUM>",
      "position": 0
    },
    {
      "token": "guys",
      "start_offset": 2,
      "end_offset": 6,
      "type": "<ALPHANUM>",
      "position": 1
    },
    {
      "token": "walk",
      "start_offset": 7,
      "end_offset": 11,
      "type": "<ALPHANUM>",
      "position": 2
    },
    {
      "token": "into",
      "start_offset": 12,
      "end_offset": 16,
      "type": "<ALPHANUM>",
      "position": 3
    },
    {
      "token": "a",
      "start_offset": 19,
      "end_offset": 20,
      "type": "<ALPHANUM>",
      "position": 4
    },
    {
      "token": "bar",
      "start_offset": 21,
      "end_offset": 24,
      "type": "<ALPHANUM>",
      "position": 5
    },
    {
      "token": "but",
      "start_offset": 26,
      "end_offset": 29,
      "type": "<ALPHANUM>",
      "position": 6
    },
    {
      "token": "the",
      "start_offset": 30,
      "end_offset": 33,
      "type": "<ALPHANUM>",
      "position": 7
    },
    {
      "token": "third",
      "start_offset": 34,
      "end_offset": 39,
      "type": "<ALPHANUM>",
      "position": 8
    },
    {
      "token": "ducks",
      "start_offset": 43,
      "end_offset": 48,
      "type": "<ALPHANUM>",
      "position": 9
    }
  ]
}
```

Nhìn vào kết quả ở trên thì ta thấy analyzer đã loại bỏ khoảng trắng (nhiều khoảng trắng liên tục), loại bỏ `...`, các ký tự không có giá trị trong việc search, lowercase,...etc.

Analyzer `standard` trên cũng tương tự với analyzer dưới đây.

```bash
POST /_analyze
{
  "text": "2 guys walk into   a bar, but the third... DUCKS! :-)",
  "char_filter": [],
  "tokenizer": "standard",
  "filter": ["lowercase"]
}
```

## 3. Hiểu về inverted indices

![analysis](/img/docs/elasticsearch/analysis_2.png)

- Các giá trị của 1 field được lưu trữ dưới nhiều dạng cấu trúc dữ liệu và tùy thuộc vào kiểu dữ liệu của field.
- Việc này đảm bảo việc truy cập dữ liệu một cách hiệu quả ví dụ như search.
- Được xử lý bởi Apache Lucene, không phải Elasticsearch.

![analysis](/img/docs/elasticsearch/analysis_3.png)

- Dùng để mapping dữ terms(token) và các documents chứa nó.
- Bên ngoài analyzers thì chúng ta sẽ sử dụng "terms".
- Terms được sắp xếp theo alphabet.
- Chứa không chỉ terms và document IDs (ví dụ như điểm số liên quan)
- Sẽ có 1 inverted index cho mỗi text field.
- Các dạng dữ liệu khác thì sẽ sử dụng BKD trees.

## 4. Giới thiệu về mapping

![analysis](/img/docs/elasticsearch/mapping.png)

- Dùng để định nghĩa cấu trúc của documents (ví dụ như các fields và kiểu dữ liệu của chúng), đồng thời thì được sử dụng để config các các giá trị được indexed.
- Tương tự như schema của các bảng trong relational database.
- Có 2 dạng mapping: explicit và dynamic
- Explicit như hình trên là do chúng ta tự định nghĩa.
- Dynamic là Elasticsearch sẽ tự generate mappings cho chúng ta.
- Có thể kết hợp cả explicit và dynamic mapping.

## 5. Tổng quan về data types trong Elasticsearch

### 5.1. Object

![analysis](/img/docs/elasticsearch/object_type.png)

- Sử dụng cho các JSON object.
- Các objects có thể nested.
- Mapping sử dụng _properties_
- Không được lưu dưới dạng object mà được flatten như hình dưới đây.

![analysis](/img/docs/elasticsearch/object_flatten.png)

Theo hình trên thì ta có thể thấy nếu ta insert mảng object thì khi flatten nó sẽ gộp lại thành array như sau:

![analysis](/img/docs/elasticsearch/object_array_flatten.png)

Điều này sẽ có lợi cho một số trường hợp cũng như bất lợi cho 1 số trường hợp khác chẳng hạn câu query trên ta sẽ không thể apply được _AND_ mà thay vì đó kết quả trả về sẽ là _OR_.

Để giải quyết vấn đề này thì ta có thể sử dụng kiểu data types sau.

### 5.2. Nested

- Tương tự như object nhưng vẫn giữ được mối quan hệ trong object (hữu ích khi index mảng objets).
- Có thể query các objects 1 cách độc lập (sử dụng nested query).
- Được lưu dưới dạng các documents ẩn (ví dụ ta index 1 document product có 10 reviews thì nó sẽ sinh ra 11 indices, 1 cho product và 10 cho reivew).

### 5.3. Keyword

- Sử dụng cho exact matching.
- Thường được sử dụng cho filtering, aggregations và sorting.
- Ví dụ như searching các articles với status là PUBLISHED.
- Nếu muốn full-text search thì sử dụng kiểu text.

## 6. Type coercion

- Corsion giúp convert data type về kiểu đúng với kiểu dữ liệu đã được index.
- Ví dụ nếu \_doc/1 bạn index với data `value: 7.2` ở đây 7.2 là float, tiếp tục bạn index \_doc/2 với `value: "7.2"` với 7.2 là string.
- Elasticsearch mặc định sẽ enable tính năng này và giúp bạn convert về dạng float tuy nhiên bạn nên disable nó và truyền đúng kiểu dữ liệu, nếu truyền sai sẽ bị reject và báo lỗi.

## 7. Arrays

- Không có kiểu dữ liệu array.
- Bất cứ field nào thì cũng có thể chứa 1 hoặc nhiều giá trị mà không cần config gì.
- Ví dụ với array of strings thì các strings sẽ được concat với khoảng trắng, sau đó tokenize cùng với off_set, các bạn có thể xem ví dụ dưới đây

```bash
POST /_analyze
{
  "text": ["Strings are simply", "merged together."],
  "analyzer": "standard"
}
```

Kết quả

```bash
{
  "tokens" : [
    {
      "token" : "strings",
      "start_offset" : 0,
      "end_offset" : 7,
      "type" : "<ALPHANUM>",
      "position" : 0
    },
    {
      "token" : "are",
      "start_offset" : 8,
      "end_offset" : 11,
      "type" : "<ALPHANUM>",
      "position" : 1
    },
    {
      "token" : "simply",
      "start_offset" : 12,
      "end_offset" : 18,
      "type" : "<ALPHANUM>",
      "position" : 2
    },
    {
      "token" : "merged",
      "start_offset" : 19,
      "end_offset" : 25,
      "type" : "<ALPHANUM>",
      "position" : 3
    },
    {
      "token" : "together",
      "start_offset" : 26,
      "end_offset" : 34,
      "type" : "<ALPHANUM>",
      "position" : 4
    }
  ]
}
```

### Constraints

- Các giá trị trong array nên có cùng kiểu dữ liệu (coercion có thể giúp convert tuy nhiên không recommend).
- Coercion chỉ hoạt động khi các fileds đã đưuọc mapped.
- Không nên dùng coercion.

### Nested arrays

- Array có thể chứa nested arrays.
- Array được flattened khi index.
- Ví dụ: [1, [2, 3]] sẽ thành [1, 2, 3]

### Lưu ý

- Sử dụng kiểu dữ liệu `nested` cho arrays các objects và bạn muốn query các objects một cách độc lập.

## 8. Thêm explicit mapping

Thêm mapping

```bash
PUT /reviews
{
  "mappings": {
    "properties": {
      "rating": {"type": "float"},
      "content": {"type": "text"},
      "product_id": {"type": "integer"},
      "author": {
        "properties": {
          "first_name": {"type": "text"},
          "last_name": {"type": "text"},
          "email": {"type": "keyword"}
        }
      }
    }
  }
}
```

Thử thêm index với sai kiểu dữ liệu

```bash
PUT /reviews/_doc/1
{
  "rating": 5.0,
  "content": "Outstanding doc!",
  "product_id": 123,
  "author": {
    "first_name": "duc",
    "last_name": "nguyen",
    "email": {}
  }
}
```

Kết quả

```json
{
  "error": {
    "root_cause": [
      {
        "type": "mapper_parsing_exception",
        "reason": "failed to parse field [author.email] of type [keyword] in document with id '1'. Preview of field's value: '{}'"
      }
    ],
    "type": "mapper_parsing_exception",
    "reason": "failed to parse field [author.email] of type [keyword] in document with id '1'. Preview of field's value: '{}'",
    "caused_by": {
      "type": "illegal_state_exception",
      "reason": "Can't get text on a START_OBJECT at 8:14"
    }
  },
  "status": 400
}
```

Update lại đúng kiểu dữ liệu cho email

```bash
PUT /reviews/_doc/1
{
  "rating": 5.0,
  "content": "Outstanding doc!",
  "product_id": 123,
  "author": {
    "first_name": "duc",
    "last_name": "nguyen",
    "email": "fakefake@gmail.com"
  }
}
```

Kết quả

```json
{
  "_index": "reviews",
  "_type": "_doc",
  "_id": "1",
  "_version": 1,
  "result": "created",
  "_shards": {
    "total": 2,
    "successful": 1,
    "failed": 0
  },
  "_seq_no": 0,
  "_primary_term": 1
}
```

## 9. Retrieve mapping

```bash
GET /reviews/_mapping

GET /reviews/_mapping/field/content

GET /reviews/_mapping/field/author.email
```

Kết quả

```json
{
  "reviews": {
    "mappings": {
      "properties": {
        "author": {
          "properties": {
            "email": {
              "type": "keyword"
            },
            "first_name": {
              "type": "text"
            },
            "last_name": {
              "type": "text"
            }
          }
        },
        "content": {
          "type": "text"
        },
        "product_id": {
          "type": "integer"
        },
        "rating": {
          "type": "float"
        }
      }
    }
  }
}
```

## 10. Sử dụng dot notation trong field name

```bash
PUT /reviews
{
  "mappings": {
    "properties": {
      "rating": {"type": "float"},
      "content": {"type": "text"},
      "product_id": {"type": "integer"},
      "author.first_name": {"type": "text"},
      "author.last_name": {"type": "text"},
      "author.email": {"type": "keyword"}
      }
    }
  }
}
```

## 11. Thêm mappings vào những indices có trước

```bash
PUT /reviews/_mapping
{
  "properties": {
    "created_at": {
      "type": "date"
    }
  }
}
```

## 12. Kiểu date hoạt động như thế nào trong Elasticsearch?

- Có 3 dạng sau:
  - string.
  - milliseconds tính từ epoch (kiểu long).
  - seconds tính từ epoch (kiểu integer).
- Epoch là từ 1/1/1970.
- Có hỗ trợ định dạng custom.

### Default

- Hỗ trợ 3 formats:
  - date without time.
  - date with time.
  - milliseconds tính từ epoch (long).
- UTC nếu không được chỉ định timezone.
- Dates phải được formatted theo ISO 8601.

### Dates được lưu như thế nào ?

![date](/img/docs/elasticsearch/date.png)

- Lưu dưới dạng milliseconds kể từ epoch.
- Đều được convert về long.
- Được convert về UTC.
- Việc convert ở trên cũng áp dụng với lúc queries.

## 13. Missing fields được xử lý như thế nào ?

- Tất cả các fields trong Elasticsearch đều là optional.
- Thế nên bạn có thể bỏ trống 1 trường khi index.
- Đồng thời thì do optional nên bạn phải check ở phía application.
- Khi search thì Elasticsearch ngầm hiểu là field ấy có giá trị.

## 14. Tổng quan về mapping tham số

### format

![format](/img/docs/elasticsearch/format.png)

- Nên để mặc định.

### properties

![format](/img/docs/elasticsearch/properties.png)

- Định nghĩa các nested fields của object và nested fields.

### coerce

![format](/img/docs/elasticsearch/coerce.png)

- Dùng để enable hay disable coercion 1 giá trị (mặc định là enabled - true).

### doc_values

- Elasticsearch sử dụng nhiều cấu trúc dữ liệu cho các mục đích khác nhau.
- Inverted indices tuyệt vời cho việc search tuy nhiên không thực sự tốt cho nhiều kiểu truy xuất dữ liệu khác.
- doc_values là một cấu trúc dữ liệu sử dụng bởi Apache Lucene và được tối ưu cho việc truy xuất từ document -> terms.
- Là 1 kiểu ngược so với inverted indices.
- Được sử dụng cho sorting, aggregations, và scripting.
- Là một cấu trúc dữ liệu thêm vào chứ không phải thay thế các cấu trúc dữ liệu khác.
- Elasticsearch sẽ tự động queries cáu trúc dữ liệu thích hợp dựa vào từng query.

### disable doc_values

![format](/img/docs/elasticsearch/disable_doc_values.png)

- Set doc_values thành false sẽ giúp tiết kiệm không gian ổ cứng và đồng thời tăng tốc độ index lên 1 chút.
- Chỉ disable khi bạn không sử dụng aggregations, sorting và scripting.
- Hữu ích với những indices lớn, gần như không có giá trị với các indices nhỏ.
- Không thể thay đổi nếu không reindex tất cả documents đến index mới.
- Không nên động đến tham số này.

### norms

![format](/img/docs/elasticsearch/norms.png)

- Được sử dụng cho `relevance scoring` dùng cho xếp hạng - ranking.
- Có thể disable để tiết kiệm dung lượng ổ cứng.

### index

![format](/img/docs/elasticsearch/index.png)

- Dùng để tắt index 1 field.
- Vẫn được lưu và có trong \_source truy nhiên nó không được lưu dành cho search.
- Hữu ích nếu bạn không dùng field này để search.
- Tiết kiệm dung lượng ổ cứng và cải thiện speed khi index nếu disable.
- Thường được sử dụng cho các data về time series.
- Nếu disable thì field này vẫn có thể được sử dụng cho aggregations.

### null_value

- Field với tham số này không thể được indexed và search.

### copy_to

## 15. Update mappings

```bash
PUT /reviews/_mapping
{
  "properties": {
    "product_id": {
      "type": "keyword"
    }
  }
}
```

==> Lỗi

- Elasticsearch field mappings không thể bị thay đổi.
- Chỉ có thể add thêm field vào mappings.
- Một số ít có thể update được như dưới đây.

```bash
PUT /reviews/_mapping
{
  "properties": {
    "author": {
      "properties": {
        "email": {
          "type": "keyword",
          "ignore_above": 256
        }
      }
    }
  }
}
```

- Không thể thay đổi mapping vì nó sẽ gây sẽ nhiều vấn đề cho các documents đã tồn tại và có thể dẫn tới phải build lại cả cấu trúc dữ liệu.
- Kể cả những index empty thì cũng không thể update mapping.
- Các field của mapping không thể xóa, khi bạn index document thì có thể bỏ field này nếu không muốn.
- Giải pháp khi muốn update mapping là reindex lại toàn bộ documents đến index mới.

## 16. Reindexing documents

### 16.1. Tạo index mới

```bash
PUT /reviews_new
{
  "mappings" : {
    "properties" : {
      "author" : {
        "properties" : {
          "email" : {
            "type" : "keyword"
          },
          "first_name" : {
            "type" : "text"
          },
          "last_name" : {
            "type" : "text"
          }
        }
      },
      "content" : {
        "type" : "text"
      },
      "product_id" : {
        "type" : "keyword"
      },
      "rating" : {
        "type" : "float"
      }
    }
  }
}
```

### 16.2. reindex

```bash
POST /_reindex
{
  "source": {
    "index": "reviews"
  },
  "dest": {
    "index": "reviews_new"
  }
}
```

### 16.3. Check lại index

```bash
GET /reviews_new/_search
{
  "query": {
    "match_all": {}
  }
}
```

Kết quả

```json
{
  "took": 428,
  "timed_out": false,
  "_shards": {
    "total": 1,
    "successful": 1,
    "skipped": 0,
    "failed": 0
  },
  "hits": {
    "total": {
      "value": 1,
      "relation": "eq"
    },
    "max_score": 1.0,
    "hits": [
      {
        "_index": "reviews_new",
        "_type": "_doc",
        "_id": "1",
        "_score": 1.0,
        "_source": {
          "rating": 5.0,
          "content": "Outstanding doc!",
          "product_id": 123,
          "author": {
            "first_name": "duc",
            "last_name": "nguyen",
            "email": "fakefake@gmail.com"
          }
        }
      }
    ]
  }
}
```

Như ta có thể thấy index reviews_new đã có documents tuy nhiên data type của product_id trong \_source vẫn là integer.

- data type trong \_source không phản ánh giá trị được indexed.
- \_source chứa giá trị của field tại thời điểm nó được index.
- Tuy nhiên bạn có thể muốn lấy giá tị có được từ \_source và mong muốn nó trả về type đúng thì có thể làm như sau.

Trước hết ta phải delete documents đã được index trước đó.

```bash
POST /reviews_new/_delete_by_query
{
  "query": {
    "match_all": {}
  }
}
```

Thực hiện index

```bash
POST /_reindex
{
  "source": {
    "index": "reviews"
  },
  "dest": {
    "index": "reviews_new"
  },
  "script": {
    "source": """
      if (ctx._source.product_id != null) {
        ctx._source.product_id = ctx._source.product_id.toString();
      }
    """
  }
}
```

### 16.4. reindex với query

```bash
POST /_reindex
{
  "source": {
    "index": "reviews",
    "query": {
      "range": {
        "rateing": {
          "gte": 4.0
        }
      }
    }
  },
  "dest": {
    "index": "reviews_new"
  },
}
```

### 16.5. reindex chỉ 1 số fields và loại bỏ 1 số fields

```bash
POST /_reindex
{
  "source": {
    "index": "reviews",
    "_source": ["content", "created_at", "rating"]
  },
  "dest": {
    "index": "reviews_new"
  },
}
```

### 16.6. thay đổi tên field khi reindex

```bash
POST /_reindex
{
  "source": {
    "index": "reviews",
  },
  "dest": {
    "index": "reviews_new"
  },
  "scrypt": {
    "source": """
      # Rename "content" field to "comment"
      ctx._source.comment = ctx._source.remove("content");
    """
  }
}
```

### 16.7. reindex với condition

```bash
POST /_reindex
{
  "source": {
    "index": "reviews",
  },
  "dest": {
    "index": "reviews_new"
  },
  "scrypt": {
    "source": """
      if (ctx._source.rating < 4.0) {
        ctx.op = "noop"; # Có thể set thành "delete"
      }
    """
  }
}
```

Sử dụng `query` được khuyến khích hơn sử dụng `ctx.op` và cũng cho performance tốt hơn.

### 16.8. Tham số

- Có nhiều tham số hơn ở phía trên, ví dụ như để xử lý xung đột version.
- Một snapshot được tạo ra trước khi reindex.
- Mặc định khi xảy ra xung đột version thì query sẽ bị bỏ.
- Destination khi reindex không nhất thiết phải empty.

### 16.9. Batching và throttling

- Có thể reindex theo batches.
- Throttling có thể config để giới hạn đến ảnh hưởng performance.
- Nếu bạn reindex nhiều documents thì nên check lại document.

## 17. Alias

Nếu bạn reindex chỉ để đổi tên field thì bạn có thể dùng alias thay thế.

```bash
PUT /reviews/_mapping
{
  "properties": {
    "comment": {
      "type": "alias",
      "path": "content"
    }
  }
}
```

![alias](/img/docs/elasticsearch/alias.png)

- Alias có thể update nhưng chỉ update target field bằng cách update mapping với `path` mới.
- Có thể update vì nó không ảnh hưởng đến việc index.
