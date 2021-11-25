---
slug: mot-so-thuat-ngu-pho-bien-ma-minh-gap-xuyen-suot-hoc-tap-va-lam-viec
title: Một số thuật ngữ phổ biến mà mình găp xuyên suốt quá trình học tập và làm việc
authors: [ducnguyen96]
tags: [terminology]
---

## 1. Website Defacement là gì ?

**Website Defacement** là một loại tấn công website mà nó thực hiện thay đổi giao diện của toàn bộ site hoặc chỉ 1 page. Cách thực hiện là chúng sẽ xâm nhập vào web server(bằng cách chẳng hạn như web shell) và thay thế site được host bằng site của chúng.

Mục đích: Phổ biến nhất là truyền bá thông tin nhằm kích động biểu tình chính trị hay tôn giáo.

## 2. Backward compatibility là gì ?

**Backward compatibility** là khả năng tương thích ngược - một thuộc tính của hệ thống, sản phẩm hay công nghệ mà cho phép tương thích với một hệ thống cũ hơn.

Một khái niệm đối ngược là **forward compatibility**. Là một thiết kế mà hướng tới tương thích với các tiêu chuẩn hay sản phẩm mới trong tương lai.

## Same-origin policy là gì ?

**Same-origin policy** là một cơ chế bảo mật quan trọng để hạn chế việc 1 document hay 1 script được load mởi 1 origin có thể tương tác với resource của 1 origin khác. Hiểu đơn giản hơn nếu `https://abc.xyz ` muốn load ảnh từ `https://cde.xyz` thì phải thêm cde.xyz là 1 origin trên header của site.

Nó giúp cô lập những documents khả nghi, giảm bớt nguy cơ bị tấn công.

## 3. Man in the middle attack là gì ?

Trong ngành mã hóa và bảo mật máy tính, **man-in-the-middle**, **monster-in-the-middle**, **machine-in-the-middle**, **person-in-the-middle** là một loại tấn công mà kẻ tấn công nghe lén hoặc là thay đổi giao tiếp giữa 2 bên mà họ tin rằng mình đang nói giao tiếp trực tiếp với nhau còn trên thực tế thì đang bị điều khiển bởi kẻ tấn công.

Ví dụ: Alice muốn giao tiếp với Bob. Mallory muốn ngăn chặn cuộc hội thoại để nghe trộm và cũng có thể đưa cho Bob những tin nhắn sai lệch.

Đầu tiên Alice sẽ hỏi public key của Bob. Nếu Bob gửi public key đến Alice và Mallory ngăn chặn được thì 1 cuộc tấn công bắt đầu. Mallory sẽ gửi cho Alice 1 tin nhắn giả mạo là từ Bob nhưng thay vì public key của Bob thì Mallory gửi public key của Mallory.

Alice tin đó là key của Bob nên đã mã hóa tin nhắn của Alice theo key kia và gửi lại cho Bob. 1 lần nữa thì Mallory lại chặn được tin nhắn này và giải mã tin nhắn đó, sau đó có thể thay đổi hay không thì tùy và lại 1 lần nữa mã hóa tin nhắn đó bằng key mà Bob cố gửi cho Alice. Khi Bob nhận được tin nhắn mới thì Bob tin rằng tin nhắn đó đến từ Alice.

## 4. MIME types là gì ?

Là một tiêu chuẩn để chỉ ra định dạng của tài liệu, file hay là 1 phân loại các bytes. Browsers sử dụng MIME type để quyết định cách xử lý 1 URL vậy nên việc servers gửi đúng MIME type trong Content-Type header rất là quan trọng. Nếu nó không được cấu hình đúng thì browser có thể hiểu sai nội dung files và sites sẽ không hoạt động chính xác, các file được tải về sẽ được sử lý sai.

MIME type đơn giản nhất chứa 1 `type` và 1 `subtype` đều là string và được nối với nhau bằng `/`: `type/subtype`

**type** thì đại diện cho phân loại chung của data chẳng hạn như `video` hoặc `text`. **subtype** thì chỉ rõ chính xác loại của data, chẳng hạn đối với `text` thì subtype là `plain` (plain text) hoặc `html` hoặc `calendar`.

**parameter** là 1 thuộc tính không bắt buộc có thể thêm vào để cung cấp thêm chi tiết:

```html
text/plain;charset=UTF-8
```

## 5. Click-jacking attack là gì ?

Click-jacking là một thủ đoạn đánh lừa user click vào 1 đường link hay 1 button,... khác với cái mà user nghĩ. Điều này có thể sử dụng để đánh cắp xác minh đăng nhập hoặc để lấy quyền của user để cài đặt malware.
