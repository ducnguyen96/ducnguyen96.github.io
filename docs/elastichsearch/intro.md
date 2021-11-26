---
sidebar_position: 1
---

# Introduction

`Elasticsearch` là một `open source` cho `analytics` và `full-text search engine`, được sử dụng cho tính năng search của app.

Chức năng của Elastichsearch:

- E.g. for search, data analysis, APM, server monitoring, security, etc.

- Mapping ,analyzers, synonyms, steamming, search-as-you-type, auto-completion. highlighting, relevance tuning, aggregations, etc.

## 1. Elastic Stack

Là một tổ hợp các công nghệ của công ty đứng sau `Elasticsearch` - là trái tim của `Elastic Stack`.

Các công nghệ trong Elastic Stack:

- X-Pack
- Kibana
- Beats
- LogsTash

### 1.1. Kibana

Là một nền tảng cho phân tích và visualize dữ liệu, có thể xem Kibana như một dashboard cho các data được lưu trong Elasticsearch.

Thực chất thì Kibana là web interface nên chúng ta không phải thêm data hay update bất cứ thứ gì.

### 1.2. Logstash

Được sử dụng để xử lý logs từ apps và gửi chúng đến Elasticsearch.

### 1.3. X-Pack

Bổ sung một số tính năng cho Elasticsearch:

- Security: thêm authentication và authorization cho cả Kibana và Elasticsearch.
- Monitor performance của Elastic Stack.
- Alerting: alert nếu có gì đó bất thường xảy ra.
- Reporting: tạo reports theo lệnh hoặc là theo lịch trình sẵn.
- Machine Learning.
- Abnormality Detection.
- Forecasting.
- Graph: đưa ra những sản phẩm liên quan hay là gợi ý bài hát,...
- Query DSL.

### 1.4. Beats

Là data shippers gửi data đến logstash hay Elasticsearch.

## 2. Common architectures

![common-arch](/img/docs/elasticsearch_common_arch.png)

Giả sử chúng ta có một Ecommerce app, dữ liêu được lưu ở database, khi một product page được requested, app sẽ tìm products ở database, renders page và send tới browsers.

Tuy nhiên thì database mà chúng ta thường dùng không thực sự tốt cho việc search, và ta quyết định sử dụng Elasticsearch. Vậy sẽ tích hợp elasticsearch như thế nào ?

### 2.1. Elasticsearch

Khi browser gửi request tới server, thì server sẽ gửi request đến elasticsearch (có thể qua http request hoặc một số client libraries cho elasticsearch), elasticsearch sau đó gửi response lại cho web server và web server lại xử lý và gửi lại page cho browser.

#### Làm sao thêm sản phẩm vào elasticsearch ?

Bất cứ khi nào một sản phẩm được thêm hoặc cập nhật ở database thì chúng ta cũng phải thêm, cập nhật sản phẩm đó ở elasticsearch, có thể thấy rằng chúng ta đang duplicate data ở đây nhưng đây là cách tiếp cận tốt nhất.

#### Tích hợp elasticsearch khi ứng dụng đã chạy rất lâu và có rất nhiều data sẵn.

Lúc này thì bạn sẽ phải import tất cả data đã có vào elasticsearch sau đó bất cứ có thêm hoặc cập nhật gì thì sẽ update elasticsearch,

### 2.2. Metricbeat

Khi app đã chạy và tiếp nhận nhiều visitors hơn, lúc này chúng ta muốn phân tích các chỉ số như CPU và sử dụng memory và Metricbeat giúp ta giải quyết việc này. Metricbeat sẽ được chạy ở webserver sau đó gửi dữ liệu về elasticsearch,

### 2.3. Filebeat

Tiếp đến chúng ta muốn phân tích access_log cũng như error_log, ta sẽ sử dụng Filebeat.

### 2.4. Logstash

Chúng ta có vẻ như đã xử lý được các tác vụ cần thiết, tuy nhiên mọi việc sẽ phức tạp nếu bạn sử dụng microservice hoặc gì đấy khiến việc logs sẽ được gửi từ nhiều nơi khác nhau đến elasticsearch, ta sẽ sử dụng logstash như một trung tâm logs.

### 2.5. Kibana

Vậy là ta đã có đủ các tools cần thiết để có thể gửi data đến elastichsearch, bây giờ chỉ việc connect Kibana đến Elastichsearch là có đầy đủ data để hiển thị rồi.
