---
slug: declarative-programming-vs-imperative-programming
title: "Declarative Programming vs. Imperative Programming: Hiểu đúng để viết code tốt hơn"
authors: [ducnguyen]
tags: [declarative, imperative]
---

import Meme from "./declarative_programming.png"

<div style={{ 'textAlign': 'center' }}>
  <img src={Meme} height="300"/>
</div>

Trong lập trình, có hai phong cách chính thường được nhắc đến: **Imperative Programming** (lập trình tường minh) và **Declarative Programming** (lập trình khai báo). Việc hiểu rõ sự khác biệt giữa hai phong cách này không chỉ giúp bạn viết code hiệu quả hơn mà còn giúp bạn lựa chọn công nghệ phù hợp với từng bài toán cụ thể.

<!-- truncate -->

## 1. Imperative Programming là gì?

**Imperative Programming** tập trung vào _cách một chương trình_ thực thi nhiệm vụ. Nó yêu cầu lập trình viên phải chỉ rõ từng bước mà máy tính cần thực hiện để đạt được kết quả mong muốn. Nói cách khác, đây là phong cách lập trình hướng đến quy trình.

**Ví dụ**:

Dưới đây là cách tính tổng các số trong một mảng bằng JavaScript theo phong cách Imperative:

```js
function sumArray(arr) {
  let sum = 0;
  for (let i = 0; i < arr.length; i++) {
    sum += arr[i];
  }
  return sum;
}
```

Trong đoạn code trên, chúng ta dùng vòng lặp `for` để duyệt qua từng phần tử của mảng và cộng dồn giá trị vào biến `sum`. Chúng ta phải chỉ rõ từng bước để đạt được kết quả.

### Đặc điểm của Imperative Programming:

- Kiểm soát chặt chẽ trình tự thực thi.
- Thay đổi trạng thái của chương trình thông qua các lệnh gán.
- Thường sử dụng vòng lặp và biến tạm.

Một số ngôn ngữ phổ biến hỗ trợ phong cách Imperative bao gồm `C`, `Java`, `Python`, `JavaScript`, `PHP`.

## 2. Declarative Programming là gì?

**Declarative Programming** tập trung vào _kết quả_ mong muốn thay vì cách đạt được kết quả đó. Người lập trình chỉ cần mô tả cái gì họ muốn mà không cần chỉ ra từng bước để thực thi.

**Ví dụ**:

Dưới đây là cách tính tổng các số trong mảng theo phong cách Declarative bằng JavaScript:

```js
const sumArray = (arr) => arr.reduce((sum, num) => sum + num, 0);
```

Ở đây, chúng ta sử dụng phương thức `.reduce()`, vốn là một hàm có sẵn trong JavaScript giúp tính tổng các phần tử của mảng mà không cần viết vòng lặp.

### Đặc điểm của Declarative Programming:

- Chỉ tập trung vào kết quả thay vì quy trình.
- Giảm thiểu việc thay đổi trạng thái chương trình.
- Dễ đọc hơn do ít sử dụng vòng lặp và biến tạm.

Một số ngôn ngữ phổ biến hỗ trợ phong cách Declarative bao gồm `SQL`, `Haskell`, `Lisp`, `HTML`, `CSS`, `Prolog`. Ngoài ra, các thư viện như `React`(UI),`Redux`(state management), và các công cụ như `Terraform`, `Nix` (hạ tầng) cũng áp dụng phong cách này.

## 3. So sánh Imperative vs. Declarative

| Tiêu chí           | Imperative Programming        | Declarative Programming     |
| ------------------ | ----------------------------- | --------------------------- |
| Cách tiếp cận      | Chỉ rõ từng bước thực hiện    | Chỉ mô tả kết quả mong muốn |
| Quản lý trạng thái | Có thể thay đổi trạng thái    | Hạn chế thay đổi trạng thái |
| Mức độ trừu tượng  | Thấp                          | Cao                         |
| Tính dễ đọc        | Dễ hiểu với người mới bắt đầu | Dễ đọc với code phức tạp    |
| Ứng dụng phổ biến  | Lập trình hệ thống, backend   | Web, UI, database queries   |

## 4. Khi nào nên chọn phong cách nào?

Không có phong cách nào _tốt hơn tuyệt đối_, mà việc chọn cách tiếp cận phụ thuộc vào bối cảnh:

- Dùng **Imperative** khi cần kiểm soát tường minh từng bước thực thi, như khi làm việc với các thuật toán phức tạp, tối ưu hiệu suất hoặc thao tác cấp thấp với bộ nhớ.
- Dùng **Declarative** khi muốn code ngắn gọn, dễ bảo trì, đặc biệt trong lập trình hàm (functional programming), UI development hoặc làm việc với dữ liệu.

## Kết luận

**Imperative Programming** và **Declarative Programming** là hai phong cách lập trình khác nhau về cách tiếp cận vấn đề. **Imperative** giúp kiểm soát từng bước thực thi, trong khi **Declarative** giúp đơn giản hóa logic và tăng tính trừu tượng. Lựa chọn phong cách nào phụ thuộc vào ngữ cảnh và yêu cầu cụ thể của dự án.
