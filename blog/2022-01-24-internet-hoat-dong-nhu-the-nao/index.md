---
slug: internet-hoat-dong-nhu-the-nao
title: Internet hoạt động như thế nào
authors: [ducnguyen96]
tags: [roadmap, networking, general]
---

## Giới thiệu

Bài viết này giải thích cơ sở hạ tầng và các công nghệ giúp Internet hoạt động. Nó không đi sâu, nhưng bao gồm đủ từng lĩnh vực để cung cấp hiểu biết cơ bản về các khái niệm liên quan.

## Các địa chỉ Internet

Vì Internet là một mạng toàn cầu gồm các máy tính nên mỗi máy tính được kết nối với Internet phải có một địa chỉ duy nhất. Địa chỉ Internet có dạng nnn.nnn.nnn.nnn trong đó nnn phải là một số từ 0 - 255. Địa chỉ này được gọi là địa chỉ IP. (IP là viết tắt của Internet Protocol hay giao thức Internet; chúng ta sẽ nói thêm về điều này sau.)

Hình bên dưới minh họa hai máy tính được kết nối Internet; máy tính của bạn có địa chỉ IP 1.2.3.4 và một máy tính khác có địa chỉ IP 5.6.7.8. Internet được biểu diễn như một đối tượng trừu tượng ở giữa.

<div style={{textAlign: 'center'}}>

![diagram-1](/img/blogs/ruswp_diag1.gif)

</div>

Nếu bạn kết nối với Internet thông qua Nhà cung cấp dịch vụ Internet (ISP: phổ biến nhất ở VN là Viettel, FPT, VNPT), bạn thường được chỉ định một địa chỉ IP tạm thời tức là IP động, sẽ thay đổi theo thời gian. Nếu bạn kết nối Internet từ mạng cục bộ (LAN), máy tính của bạn có thể có địa chỉ IP tĩnh hoặc có thể lấy địa chỉ IP động từ DHCP server. Trong cả 2 trường hợp, nếu máy tính của bạn kết nối Internet, thì nó phải có một địa chỉ IP duy nhất.

| The Ping Program                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Nếu bạn đang sử dụng Windows hoặc Linux và có kết nối với Internet, có một phần mềm để kiểm tra Internet. Mở command prompt. Gõ ping google.com thì ping sẽ gửi một message (thực chất là ICMP (Internet Control Message Protocol)) đến máy tính được đặt tên - google.com. Máy tính được ping sẽ trả lời. ping sẽ tính thời gian hết hạn cho đến khi trả lời trở lại (nếu có). Ngoài ra, nếu bạn nhập tên miền (tức là google.com) thay vì địa chỉ IP, ping sẽ phân giải tên miền và hiển thị địa chỉ IP của máy tính. |

## Protocol Stacks and Packets

Chúng ta biết mỗi máy tính trên mạng Internet đều phải có một
