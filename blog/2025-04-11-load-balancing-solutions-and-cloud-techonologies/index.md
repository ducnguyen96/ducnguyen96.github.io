---
slug: load-balancing-solutions-and-cloud-technologies
title: "Loading Balancing Solutions & Cloud Technologies"
authors: [ducnguyen]
tags: [system design, load balancing]
---

## Các Giải Pháp Cân Bằng Tải Mã Nguồn Mở

### [HAProxy](http://www.haproxy.org/)

HAProxy là một phần mềm cân bằng tải TCP/HTTP miễn phí và mã nguồn mở, nổi tiếng với độ tin cậy và hiệu suất cao.
Nó đặc biệt phù hợp với các website có lưu lượng truy cập rất lớn, và đang được sử dụng bởi nhiều trang web nổi tiếng nhất thế giới. HAProxy được xem là tiêu chuẩn mặc định của các phần mềm cân bằng tải mã nguồn mở, và có sẵn trong hầu hết các bản phân phối Linux phổ biến.
HAProxy hỗ trợ hầu hết các hệ điều hành theo phong cách Unix.

<!-- truncate -->

### [NGINX](https://www.nginx.com/)

NGINX là một máy chủ HTTP và reverse proxy (cân bằng tải) mã nguồn mở, hiệu suất cao.
Nó được biết đến với hiệu năng vượt trội, độ ổn định, bộ tính năng phong phú và cấu hình đơn giản.

## Các Giải Pháp Cân Bằng Đám Mây

### [AWS - Elastic Load Balancing (ELB)](https://aws.amazon.com/elasticloadbalancing/)

Amazon ELB là một giải pháp cân bằng tải có khả năng mở rộng cao.
Nó là lựa chọn lý tưởng khi chạy trên nền tảng AWS và tích hợp liền mạch với tất cả các dịch vụ của AWS.

ELB hỗ trợ 4 chế độ hoạt động:

1. [Application Load Balancer (Layer 7)](https://aws.amazon.com/elasticloadbalancing/application-load-balancer/?nc=sn&loc=2&dn=2)
2. [Network Load Balancer (Layer 4)](https://aws.amazon.com/elasticloadbalancing/network-load-balancer/?nc=sn&loc=2&dn=3)
3. [Gateway Load Balancer](https://aws.amazon.com/elasticloadbalancing/gateway-load-balancer/)

4. [Classic Load Balancer (Layer 4 và 7)](https://aws.amazon.com/elasticloadbalancing/classic-load-balancer/?nc=sn&loc=2&dn=5)

### [GCP - Cloud Load Balancing](https://cloud.google.com/load-balancing)

Cloud Load Balancing của Google Cloud Platform là một giải pháp cân bằng tải có khả năng mở rộng cao và mạnh mẽ.

`Cloud Load Balancing cho phép bạn đặt tài nguyên của mình phía sau một địa chỉ IP duy nhất, có thể truy cập từ bên ngoài hoặc nội bộ trong mạng Virtual Private Cloud (VPC)`.

Một số loại cân bằng tải có sẵn trong GCP Cloud Load Balancing gồm:

1. [External HTTP(S) Load Balancer](https://cloud.google.com/load-balancing/docs/https)

2. [Internal HTTP(S) Load Balancer](https://cloud.google.com/load-balancing/docs/l7-internal)

3. [External TCP/UDP Network Load Balancer](https://cloud.google.com/load-balancing/docs/network)

4. [Internal TCP/UDP Load Balancer](https://cloud.google.com/load-balancing/docs/internal)

### [Microsoft Azure Load Balancer](https://azure.microsoft.com/en-us/services/load-balancer/)

Giải pháp cân bằng tải của Microsoft Azure cung cấp 3 loại cân bằng tải khác nhau:

1. [Standard Load Balancer](https://docs.microsoft.com/en-us/azure/load-balancer/load-balancer-overview)
2. [Gateway Load Balancer](https://docs.microsoft.com/en-us/azure/load-balancer/gateway-overview)

3. [Basic Load Balancer](https://docs.microsoft.com/en-us/azure/load-balancer/skus)

## Các Giải Pháp GSLB (Global Server Load Balancing)

- [Amazon Route 53](https://aws.amazon.com/route53/)

- [AWS Global Accelerator](https://aws.amazon.com/global-accelerator/)

- [Google Cloud Platform Load Balancer & Cloud DNS](https://cloud.google.com/load-balancing)

- [Azure Traffic Manager](https://azure.microsoft.com/en-us/services/traffic-manager/)
