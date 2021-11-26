---
slug: http-in-a-nutshell
title: Http in a nutshell
authors: [ducnguyen96]
tags: [http, https]
---

# Http in a nutshell

**_Hypertext Transfer Protocol (HTTP)_** là một giao thức(protocol) thuộc [lớp ứng dụng](/blog/mang-may-tinh/) được thiết kế cho để thực hiện giao tiếp giữa web browsers và web servers, nhưng nó cũng được sử dụng cho nhiều mục đích khác. HTTP tuân theo mô hình client-server cổ điển, với một client open connection để tạo request, sau đó chờ cho đến khi nhận được response. HTTP là một giao thức không có trạng thái, nghĩa là server không dữ trạng thái giữa 2 lần requests.

## HTTP Messages

HTTP messages là cách mà data được trao đổi giữa client và server. Có 2 loại messages: requests gửi từ client để trigger 1 action từ server và responses từ server.

![httpmsg2.png](/img/blogs/httpmsg2.png)

HTTP requests, responses có cấu trúc tương tự nhau:

1. start-line miêu ta requests được thực hiện hoặc là status của response.
2. Một set HTTP headres chỉ rõ về request hoặc là miêu tả body của response.
3. Một dòng trống chỉ rằng tất cả meta-info đều đã được gửi.
4. Một body chứa data của request (chẳng hạn như HTML form) hoặc là doc gửi theo response. Kích thước và loại data mà phần body chứa sẽ được chỉ rõ ở phần headers.
   ![httpmsgstructure2.png](/img/blogs/httpmsgstructure2.png)

## Content Security Policy (CSP)

**Content Security Policy** là một lớp bảo mật giúp phát hiện và giảm thiểu một vài thể loại tấn công bao gồm Cross-Site Scripting (XSS) và Data Injection. Những cuộc tấn công này được sử dụng cho tất cả mục đích từ trộm dữ liệu cho đến site defacement(thay đổi diện mạo của site) để phân tán malware.

CSP được thiết kế để có thể fully [backward compatibility](/blog/mot-so-thuat-ngu-pho-bien-ma-minh-gap-xuyen-suot-hoc-tap-va-lam-viec/#backward-compatibility-là-gì-). Những browsers mà không hỗ trợ CSP thì vẫn có thể kích hoạt lớp bảo mật này bằng server và ngược lại. Nếu một website không cung cấp CSP header thì browsers sẽ sử dụng [same-origin policy](/blog/mot-so-thuat-ngu-pho-bien-ma-minh-gap-xuyen-suot-hoc-tap-va-lam-viec/#same-origin-policy-l%C3%A0-g%C3%AC-).

Để kích hoạt CSP thì bạn cần cấu hình webserver trả về Content-Security-Policy HTTP header. (Thỉnh thoảng bạn sẽ thấy X-Content-Security-Policy header nhưng đây là 1 phiên bản cũ của CSP nên bạn không cần quan tâm đến nữa).

Hoặc bạn cũng có thể thêm thẻ sau vào file html để kích hoạt CSP:

```html
<meta
  http-equiv="Content-Security-Policy"
  content="default-src 'self'; img-src https://*; child-src 'none';"
/>
```

### Threats

1. Giảm thiểu XSS attacks.
   Mục tiêu chính của CSP là giảm thiểu XSS attacks. XSS attacks lợi dụng sự tin tưởng của browser vào content nhận được từ server. Các đoạn scripts độc có thể được thực thi bởi browser của nạn nhân vì browserđã tin tưởng vào nguồn của content mình nhận được, kể cả khi nó không đến từ nơi mà nó đáng lẽ phải đến từ.

CSP giúp server admin giảm thiểu XSS bằng cách chỉ rõ cho browser biết chỉ nên tin tưởng vào những domain cụ thể. Sau đó thì khi browser nhận được scripts thì nó sẽ chỉ thực thi những scripts có nguồn gốc được chỉ định từ web server hoặc từ thẻ meta ở trên và bỏ qua các scripts khác (kể cả inline scripts và event-handling HTML attributes)

2. Giảm thiểu packet sniffing attacks
   Để giảm thiểu sniffing thì cần giao tiếp qua HTTPS.

### Directives

Tham khảo thêm [ở đây](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy)

## Strict-Transport-Security

**HTTP Strict-Transport-Security** response header là một header webserver trả về và nó nói với browser là chỉ truy cập với giao thức HTTPS thay vì HTTP thông thường.

Syntax

```nginx
Strict-Transport-Security: max-age=<expire-time>;
Strict-Transport-Security: max-age=<expire-time>; includeSubDomains;
Strict-Transport-Security: max-age=<expire-time>; preload
```

- `expire-time` được tính bằng giây.
- `includeSubDomains` được chỉ định thì những quy tắc này cũng áp dụng với subdomains của site.
- `preload` xem thêm ở [đây](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security)

Nếu một site cho phép connect qua HTTP và sau đó redirects tới HTTPS thì người dùng có thể giao tiếp với phiên bản chưa được mã hóa của site trước khi được redirect, điều này tạo cơ hội cho [man-in-the-middle](/blog/mot-so-thuat-ngu-pho-bien-ma-minh-gap-xuyen-suot-hoc-tap-va-lam-viec/#man-in-the-middle-attack-l%C3%A0-g%C3%AC-) attack. Việc redirect cũng có thể được khai thác để hướng người dùng đến 1 site khác thay vì bản bảo mật của site gốc.

HSTS header nói với browsers rằng không bao giờ truy cập vào 1 site sử dụng giao thức HTTP mà nên tự động chuyển tất cả qua HTTPS.

Ví dụ: Bạn sử dụng Wifi miễn phí ở sân bay và bắt đầu truy cập web. Bạn truy cập dịch vụ ngân hàng để kiểm tra tài khoản và thanh toán 1 số hóa đơn. Không may rằng điểm wifi miễn phí đó lại đến từ laptop của hacker, và hacker đó chặn tất cả các HTTP request của bạn và chuyển hướng về 1 trang khác clone giao diện của bank mà bạn đang định dùng. Bây giờ bạn nhập tài khoản và mật khẩu vào thì hacker sẽ nhận được tất cả thông tin này.

HSTS giải quyết vấn đề này, một khi bạn đã truy cập vào trang web của bank sử dụng HTTPS và site đó sử dụng HSTS thì browser của bạn sẽ mặc chỉ giao tiếp với bạn qua HTTPS ngăn chặn hacker tấn công man-in-the-middle.

## Sử dụng HTTP cookies

**HTTP cookie** hay web cookie, browser cookie là một mảnh data nhỏ được gửi từ server đến browser. Browser có thể lưu nó và gửi lại cùng với những request tiếp theo cho browser. Tiêu biểu thì nó được sử dụng để server biết 2 requests đến cùng 1 browser giữ cho user logged-in.

Cookies được sử dụng cho 3 mục đích chính sau:

- Quản lý session: Logins, Shopping carts, game scores hay bất cứ thứ gì mà server nên nhớ.
- Personalization: Một số preferences của user, themes, cài đặt.
- Tracking: Lưu trữ và phân tích hành vi người dùng.

Cookies từng được sử dụng để lưu trữ chung phía client và từng là cách duy nhất, ngày nay thì lưu trữ phía client nên sử dụng các APIs như Web Storage API(localStorage và sessionStorage) và IndexedDB.

### Định nghĩa lifetime cho 1 cookie

Có 2 cách để định nghĩa như sau:

- Session cookies được xóa khi mỗi current session kết thúc - được quy định bởi browser, một số browser sử dụng lưu trữ lại session khi restart browser, việc này có thể làm cho session cookies kéo dài vô tận.
- Permanent cookies được set ngày cụ thể cho việc hết hạn, hoặc cũng có thể được set 1 khoảng thời gian hết hạn qua `Max-Age`.

Nếu site của bạn có authenticates users, thì bạn nên regenerate và gửi lại session cookies mỗi khi user authenticates cho dù session cookies đã tồn tại. Kỹ thuật này ngăn chặn session fixation attacks, khi mà 1 bên thứ 3 có thể sử dụng lại session của user.

### Hạn chế truy cập tới cookies

Có một số cách để đảm bảo cookies được gửi đi một cách bảo mật và không thể một cách không chủ ý thông qua thuộc tính `Secure` và `HttpOnly`.

Một cookie với thuộc tính `Secure` sẽ chỉ được gửi để sever khi đang kết nối bằng HTTPS. Các site với http thì không thể set `Secure` cho cookie. Tuy nhiên `Secure` cũng không thể đảm bảo chặn được tất các các truy cập vào thông tin nhạy cảm ở cookie; ví dụ nó có thể đọc dược và chỉnh sửa bởi người khác nếu họ truy cập được vào ổ cứng của client hoặc JS nếu `HttpOnly` không được set.

Một cookie với thuộc tính `HttpOnly` thì không thể được truy cập bằng `Document.cookie` API; nó sẽ chỉ được gửi đến sever. Ví dụ với những cookie mà giữ server-side sessions thì không cần truy cập bởi JS, và nên có thuộc tính này. Nó giảm thiểu XSS attacks.

Ví dụ:

```javascript
Set-Cookie: id=a3fWa; Expires=Thu, 21 Oct 2021 07:28:00 GMT; Secure; HttpOnly
```

## X-Content-Type-Options

**X-Content-Type-Options** header là một HTTP header được gửi từ webserver như là một cái mark được sử dụng để server chỉ ra những [MIME types](http://localhost:1313/blog/mot-so-thuat-ngu-pho-bien-ma-minh-gap-xuyen-suot-hoc-tap-va-lam-viec/#mime-types-l%C3%A0-g%C3%AC-) báo trong Content-Type headers không nên bị thay đổi và phải được tuân theo. Hay nói cách khác MIME types đã được cấu hình một cách cẩn thận.

Những tester về bảo mật sẽ luôn mong muốn header này được set.

Tìm hiểu thêm [ở đây](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options)

## X-Frame-Options

**X-Frame-Options** header là một HTTP header được gửi từ server để nói cho browser biết có nên đồng ý render một page trong một `frame`, `iframe`, `embed` hoặc `object` hay không. Các site có thể sử dụng header này để tránh [click-jacking](http://localhost:1313/blog/mot-so-thuat-ngu-pho-bien-ma-minh-gap-xuyen-suot-hoc-tap-va-lam-viec/#click-jacking-attack-l%C3%A0-g%C3%AC-) attacks, bằng cách đảm bảo rằng content của site không bị nhúng vào những sites khác.

Lớp bảo mật này chỉ được thêm vào khi browser của người dùng hỗ trợ `X-Frame-Options`

**Syntax**

```nginx
X-Frame-Options: DENY
X-Frame-Options: SAMEORIGIN
```

- DENY: page không thể hiển thị trong 1 frame
- SAMEORIGIN: page chỉ có thể được hiển thị trong 1 frame có cùng origin với page.
- ALLOW-FROM uri: không còn hoạt động ở trên browsers mới. Không nên sử dụng.

**Config trên Nginx**

```nginx
add_header X-Frame-Options SAMEORIGIN always;
```

**Config trên Express**

```javascript
const helmet = require("helmet");
const app = express();
app.use(helmet.frameguard({ action: "SAMEORIGIN" }));
```

## X-XSS-Protection

**X-Frame-Options** header là một HTTP header được gửi từ server, đây là một header để kích hoạt tính năng bảo vệ XSS attacks trên những trình duyệt như IE, Chrome, Safari ngăn việc load những page mà browser phát hiện khả năng có XSS attacks. Mặc dù tính năng này là không cần thiết vì hầu hết các site có thể implement CSP những vẫn có thể hữu ích đối với những browser cũ chưa hỗ trợ CSP.

**Note**:

- Chrome đã loại bỏ XSS Auditor
- Firefox sẽ không implement tính năng này.
- Edge cũng loại bỏ XSS filter.
