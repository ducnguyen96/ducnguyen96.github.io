---
sidebar_position: 2
---

# Getting Started

## 1. Cài đặt Elasticsearch trên Linux

### 1.1. Cài đặt với apt

Nguồn: https://www.elastic.co/guide/en/elasticsearch/reference/7.15/deb.html#deb-repo

Cài đặt từ APT repository

##### Cài `apt-transport-https` package

```bash
sudo apt-get install apt-transport-https
```

##### Lưu repository definition đến `etc/apt/sources.list.d/elastic-7.x.list`

```bash
echo "deb https://artifacts.elastic.co/packages/7.x/apt stable main" | sudo tee /etc/apt/sources.list.d/elastic-7.x.list
```

##### Import Elasticsearch PGP Key

```bash
wget -qO - https://artifacts.elastic.co/GPG-KEY-elasticsearch | sudo apt-key add -
```

##### Cài với apt-get

```bash
sudo apt-get update && sudo apt-get install elasticsearch
```

### 1.2. Download package

#### 1.2.1. Tải elasticsearch tại [đây](https://www.elastic.co/downloads/elasticsearch)

#### 1.2.2. Giải nén với tar

```bash
tar -xvfz elastichsearch.tar.gz
```

#### 1.2.3. Move đến /user/local/

```bash
sudo mv elasticsearch /user/local/
```

#### 1.2.4. Run

```bash
/usr/local/elasticsearch/bin/elasticsearch
```

#### 1.2.5. Test

```bash
curl http://localhost:9200
```

## 2. Cài đặt Kibana trên Linux

### 2.1. Tải Kibana tại [đây](https://www.elastic.co/start)

### 2.2. Giải nén với tar

```bash
tar -xvfz kibana.tar.gz
```

### 2.3. Move đến /user/local/

```bash
sudo mv kibana /user/local/
```

### 2.4. Run

```bash
/usr/local/kibana/bin/elasticsearch
```

Kibana mặc định chạy trên cổng http://localhost:5601

## 3. Kiến trúc cơ bản của elasticsearch

- Khi chúng ta chạy elasticsearch trên laptop tức là chúng ta đang khởi chạy 1 node - là một instance của elasticsearch,
  chúng ta có thể chạy nhiều node khác nhau trên nhiều máy khác nhau, điều này giúp elasticsearch có thể lưu trữ hàng trăm TB ngay cả khi mỗi máy chỉ có khả năng lưu trữ vài trăm GB.

- Ta có thể chạy nhiều node trên 1 máy mà không cần phải lo lắng về VM hay containers.

- Các nodes được gom lại với nhau thành clusters, thông thường thì 1 cluster là đủ nhưng cũng có thể chạy nhiều clusters khác nhau cho các config và mục đích khác nhau.

- Khi chạy elasticsearch trên máy thì tự động 1 cluster sẽ được sinh ra và chứa nodes.

### 3.1. Data được phân tán giữa các nodes như thế nào ?

- Mỗi đơn vị dữ liệu được lưu trữ trên cluster được gọi là document - JSON object.

![person-object](/img/docs/elasticsearch_example_doc.png)

#### Vậy các objects này được sắp xếp như thế nào ? - indexes

- Mỗi document trong elasticsearch được lưu trữ với 1 index, mỗi index thì nhóm các documents theo 1 cách logic cũng như cung cấp các options cấu hình liên quan đến khả năng scale và tính khả dụng.
- Vậy có thể hiểu index là một collection các documents có đặc điểm giống nhau.

![person-index](/img/docs/elasticsearch_person_index.png)

### 3.2. Làm sao Elasticsearch biết data được lưu ở node nào ?

## 4. Inspecting cluster

Mỗi elasticsearch cluster expose 1 REST API mà chúng ta có thể giao tiếp qua HTTP request bằng một số http clients như cURL, postman, etc.

Hoặc chúng ta có thể giao tiếp với cluster thông qua dev tool trong Kibana.

```bash
GET /_cluster/health

GET /_cat/nodes?v

GET /_cat/indices?v

GET /.kibana/_search
{
  "query": {
    "match_all" :{}
  }
}
```

Với cURL

```bash
curl -XGET "http://localhost:9200/_cluster/health"
curl -XGET "http://localhost:9200/.kibana/_search" -H 'Content-Type: application/json' -d '{ "query": { "match_all": {} } }'
```

Giao tiếp với elastic cloud với cURL cần authentication

```bash
curl -XGET -u username:password "https://endpoint/.kibana/_search" -H 'Content-Type: application/json' -d '{ "query": { "match_all": {} } }'
```

## 5. Sharding and scalability

![sharding](/img/docs/elasticsearch_sharding.png)

Như đã nói ở trên thì mỗi cluster có thể có nhiều nodes, mỗi node đều có hạn chế về dung lượng ổ đĩa, việc chia data ra để tăng khả năng lưu trữ gọi là sharding.

### Sharding là gì ?

- Sharding là một cách để chia các indices thành những mảnh nhỏ.
- Mỗi mảnh được gọi là một shard.
- Sharding được thực hiện ở index level.
- Mục đích chính là để có thể scale theo chiều ngang (horizontally scale) khối lượng data.
- Mỗi shard là một index độc lập và là một Apache Lucene index.
- Một Elasticsearch index chứa 1 hoặc nhiều Lecene indices.
- Shard không có pre-defined về size, nó tăng lên khi có documents được thêm vào.

### Mục đích của sharding ?

- Mục đích chính là để lưu nhiều documents hơn.
- Chứa các indices lớn vào các nodes.
- Cải thiện performance (các queries được chạy song song).

### Config số shards ?

- Mỗi index mặc định chứa 1 shard.
- Indices trong Elasticsearch phiên bản < 7.0.0 được tạo với 5 shards --> over-sharding.
- Để tăng lượng shards --> Split API.
- Để giảm lượng shards --> Shrink API.
- Nếu indices lớn --> tăng thên shards, còn nếu không thì sử dụng mặc định là 1 shard.

## 6. Replication

- Chuyện gì sẽ xảy ra nếu ổ cứng của 1 node fails ?
- Phần cứng có thể lỗi bất cứ lúc nào và chúng ta phải tìm cách xử lý.
- Elasticsearch hỗ trợ replication cho trường hợp lỗi.
- Replication được supported chính thức và được mặc định cung cấp.
- Với nhiều databases, cài đặt replication có thể rất phức tạp.
- Cài đặt replication với elasticsearch cực dễ .

### 6.1 Replication hoạt động như thế nào ?

- Replication được cấu hình ở index level.
- Replication hoạt động bằng cách tạo nhiều copies của shards - được gọi là replica shards.
- Mỗi shard được replicated gọi là primary shard.
- Mỗi primary shard và replica của nó được gọi là một replication group.
- Mỗi replica shard đều có thể thực hiện search requests.
- Số lượng replicas có thể được cấu hình lúc tạo index.

### 6.2. Số lượng replica bao nhiêu là hợp lý ?

- Tùy trường hợp.
- Replicate shards 1 lần nếu việc mất data không phải là thảm họa.
- Với các hệ thống quan trọng, data nên được replicated ít nhất 2 lần.

### 6.3 Snapshot

- Elasticsearch hỗ trợ tạo snapshots để backup.
- Snapshots có thể được sử dụng để restore data tại 1 thời điểm cụ thể.
- Snapshots có thể tạo ở index level hoặc cả cluster.
- Sử dụng snapshot để backup và replication cho tính khả dụng cao (high availibility), performance tốt.

## 7. Node roles

### Master

- Một node có thể được chọn làm master node của cluster.
- Một master node chịu trách nhiệm cho việc tạo xóa indices và các thứ khác.
- Một node với role này sẽ không auto trở thành master node trừ khi đnag không có node nào với role này.
- Nếu cluster lớn thì việc có 1 master node nhất định (không thay đổi) là cần thiết.

**Configuration:** node.master: true| false

### Data

- Được sử dụng để lưu trữ data.
- Thực hiện queries liên quan đến data được lưu chẳng hạn như search.
- Với những cluster tương đối nhỏ thì role này hầu hết luôn được enabled.
- Nên có master nodes nhất định.
- Được sử dụng như 1 phần để cấu hình master node.

**Configuration:** node.data: true| false

### Ingest

- Node với role này có khả năng chạy ingest pipelines.
- Ingest pipelines là 1 chuỗi các steps(processors) được thực hiện khi indexing documents. (processors có thể thay đổi documents ví dụ đổi IP thành lat/lon).
- Có thể xem ingest là một phiên bản đơn giản của Logstash được tích hợp ngay trong Elasticsearch.
- Cần có các nodes nhất định cho role này.

**Configuration:** node.ingest: true| false

### Machine Learning

**Configuration**

- node.ml: true|false
- xpack.ml.enabled: true|false

### Coordination

- Chịu trách nhiệm về phân phối queries cũng như tập hợp results.

**Configuration**

- node.master: false
- node.data: false
- node.ingest: false
- node.ml: false
- xpack.ml.enabled: false

### Voting-only

- Hiếm khi được sử dụng.
- Một node với role này sẽ tham gia vào việc voting để chọn master node.
- Node này không thể được chọn làm master node.
- Chỉ sử dụng node này với những clusters lớn.

**Configuration:** node.voting_only: true|false

### Khi nào thì thay đổi node roles ?

- Hữu ích với các clusters lớn.
- Thay đổi để tối ưu cluster để scale số lượng requests.
- Trước khi thay đổi thì bạn nên hiểu rõ tài nguyên phần cứng mà bạn có.
- Chỉ thay đổi khi bạn biết nó sẽ ảnh hưởng như thế nào.
