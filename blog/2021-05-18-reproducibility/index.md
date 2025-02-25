---
slug: what-is-reproducibility
title: "Reproducibility là gì? Tại sao nó quan trọng và cách làm phần mềm của bạn reproducible"
authors: [ducnguyen]
tags: [reproducibility, reproducible]
---

import Meme from "./it-works-on-my-machine-meme.jpg"

<div style={{textAlign: 'center'}}>
  <img src={Meme} height="300"/>
</div>

Nếu bạn là một lập trình viên chắc hẳn bạn đã từng nói hoặc ít nhất là nghe tới câu **nó chạy ở trên máy tôi mà**. Vấn đề này nó có 1 khái niệm và như bạn có thể thấy là nó rất quan trọng - reproducibility(tính tái lập).

<!-- truncate -->

## Reproducibility là gì?

**Reproducibility** (tính tái lập) là khả năng tái tạo cùng một kết quả khi thực hiện lại một quá trình nhất định.
Trong phát triển phần mềm, điều này có nghĩa là nếu bạn hoặc người khác chạy cùng một đoạn mã trong cùng một môi trường, kết quả đầu ra phải giống hệt nhau.

## Vì sao reproducibility quan trọng?

1. Đảm bảo tính nhất quán: Nếu một phần mềm không thể chạy lại với kết quả như cũ, việc gỡ lỗi và bảo trì trở nên khó khăn.

2. Hỗ trợ cộng tác: Khi làm việc nhóm, nếu đồng nghiệp không thể tái tạo môi trường hoặc kết quả của bạn, tiến độ dự án sẽ bị chậm lại.

3. Tăng tính tin cậy: Các sản phẩm phần mềm có tính reproducibility cao thường ít lỗi hơn, giúp tăng sự tin tưởng của người dùng và khách hàng.

## Nguyên nhân khiến phần mềm không reproducible

1. Khác biệt môi trường

- Hệ điều hành khác nhau (Linux, Mac, Windows)
- Phiên bản thư viện/framework không đồng bộ
- Biến môi trường(environtment variables) khác nhau

2. Sự ngẫn nhiên trong quá trình thực thi

- Race conditions trong concurrency.

## Đảm bảo tính reproducibility

Để khắc phục các nguyên nhân trên thì ta có các giải pháp tương tự như sau

1. Quản lý môi trường

- Sử dụng container như **Docker** immutable như NixOS
- Xác định rõ các dependencies và lock versions
- Dùng các công cụ như **direnv** để quản lý biến môi trường

2. Kiểm soát sự ngẫu nhiên

- Tránh race condition bằng cách sử dụng: **Lock(Mutex)**, **Atomic variables**, **RwLock**,...

3. Sử dụng CI/CD và tự động kiểm tra

- Dùng CI/CD để đảm bảo mỗi lần build phần mềm đều có kết quả giống nhau.
