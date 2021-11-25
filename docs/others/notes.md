---
sidebar_position: 2
---

# Những vấn đề mình mắc phải trong quá trình học tập và làm việc

## 1. Gắn alias cho 1 địa chỉ IP

Có 1 vấn đề khi mình thuê nhiều server trên AWS là mình phải nhớ nhiều địa chỉ IP để SSH. Cách giải quyết là mình sẽ gắn tên cho từng địa chỉ bằng cách map name với ip trong file /etc/hosts.

## 2. Giao tiếp giữa 2 AWS instances

Phiên bản roadmap.fun hiện tại mình đang sử dụng 2 instances riêng biệt để xử lý front-end và back-end riêng, 1 instance cho nginx cùng webapp và 1 instance cho nodejs và postgres.

Lúc khởi tạo 1 instance trên AWS EC2, thì nó được gắn vào 1 security group. Ví dụ webapp thuộc group wizard-1 và nodejs thuộc group wizard-2:

1. Click vào instance nodejs
2. Click vào tab security
3. Click vào wizard-2
4. Ở tab inbound click edit inbound rule
5. Thêm rule vào. Ví dụ nodejs lắng nghe ở port 3000, bạn thêm type là Custom TCP, port range là 3000, source thì bạn có thể thêm là ip của instance webapp hoặc security zone của webapp.
6. Save rule

## 3. Lưu biến vào shell của bạn

Mình đang dùng ohmyzsh nên mình sẽ edit ~/.zshrc bạn nào dùng bash thì edit ~/.bashrc nhé

```bash
nano ~/.zshrc
```

```bash
export MY_AWS_REGION=your-aws-region
```

Save lại và load lại file config

```bash
source ~/.zshrc
```

## 4. Download 1 thư mục trên github với subversion

Cài đặt

```bash
sudo apt-get install subversion
```

Ví dụ với thư mục `sample/28-sse` trong repo nest của `nestjs` trên [github](https://github.com/nestjs/nest/tree/master/sample/28-sse)

https://github.com/nestjs/nest/tree/master/sample/28-sse

```bash
svn checkout https://github.com/nestjs/nest/trunk/sample/28-sse
```

Ở đường link trên thì `trunk` thay thế cho `tree/master` là tên của branch
Đối với branch khác thì ta thay thế `branches/branch-name` bằng `trunk`.

Tham khảo thêm ở [đây](https://stackoverflow.com/questions/7106012/download-a-single-folder-or-directory-from-a-github-repo).

## 5. Config pagination hugo

Mình cũng chỉ mới dùng được thằng gohugo này 2 ngày hôm nay và thực sự là chưa hiểu được hoàn toàn kiến trúc của thằng này. Và thực sự thì docs của hugo cho thằng pagination này chưa được rõ ràng lắm.
Vì vậy mà mình đốt 2 tiếng đồng hồ mới config được thằng pagination này 😑.

Mình đang dùng theme cactus nên các bạn chú ý xem có thể có khác biệt đấy nhé ℹ️.

Đầu tiên thì các bài posts của hugo được xuất hiện ở route home ('/') và các routes khác. Ỏ route home thì dùng file `layouts/index.html` để tạo ra list các bài viết, còn ở các routes khác thì tạo ra bằng file `layouts/_default/list.html`.

Các bạn vào 2 file đấy xem thì sẽ thấy được logic để hugo có thể gen ra cái thằng pagination.

Đối với màn home thì pagination được in ra khi `showAllPostsOnHomePage = true` cactus đang mặc định để thằng này là false và có thể config bằng `.Site.Params.ShowAllPostsOnHomePage`. Vậy trong `config.toml` ta cần set param này là true.

```bash
# config.toml
[params]
showAllPostsOnHomePage = true
```

Đối với các routes khác thì pagination được in ra khi `Site.Params.showAllPostsArchive false`. Vậy trong `config.toml` ta cần set param này là false

```bash
# config.toml
[params]
showAllPostsArchive = false
```

Một điều chú ý nữa là đối với mỗi page thì hugo mặc định có 10 posts, các bạn có thể thay đổi con số này qua thông số `paginate`.

```bash
# config.toml
paginate = 12
```

## 6. Add comments to hugo site

Ở đây mình sẽ hướng dẫn sử dụng disqus nhé.
Cũng tương tự như ở [#5 trên](#5-config-pagination-hugo) ta sẽ enable comments mà không cần vào doc của hugo bằng cách search `comments`. Chúng ta thấy file `layouts/partials/comments.html` chứa phần code để in ra comments cho site, pages của chúng ta.

```bash
{{ if (not (isset .Site.Params "comments")) }}
  {{ .Scratch.Set "enable_comments" false }}
{{ else if (isset .Params "comments") }}
  {{ .Scratch.Set "enable_comments" .Params.comments }}
```

Nhận thấy để enable comments thì chúng ta cần set params comments có thuộc tính enable = true. Chúng ta sẽ update file config như sau.

```bash
# config.toml
[params.comments]
  enabled = true
```

Ở phần javascript thì có nội dung như sau

```javascript
var disqus_shortname =
  "{{ if .Site.DisqusShortname }}{{ .Site.DisqusShortname }}{{ else }}{{ .Site.Title }}{{ end }}";
```

Vậy chúng ta config như sau

```bash
# config.toml
disqusShortname = 'ducnguyen96'
```

Vậy là đã có comments cho tất cả các pages của site nhé 💃.

## 7. Nginx multiple server

```nginx
http {
  server {
    server_name localhost;

    location / {
      proxy_pass http://localhost:8081/;
    }
  }

  server {
    server_name 127.0.0.1;

    location / {
      proxy_pass http://localhost:8082/;
    }
  }

  server {
    server_name admin.localhost;

    location / {
      proxy_pass http://localhost:8083/;
    }
  }
}
```

## 8. Docker exec postgres create database

1. Login với tên user của bạn và default database `postgres`

```docker
docker exec -it postgres psql -d postgres -U ducnguyen96
```

Với postgres 1 là tên docker container, postgres 2 là tên database và ducnguyen96 là tên user.

2. Tạo database

```psql
CREATE DATABASE mydb;
```

## 9. Graphql playground not loading due to Content Security Policy Directive

```javascript
app.use(
  helmet({
    contentSecurityPolicy:
      process.env.NODE_ENV === "production" ? undefined : false,
  })
);
```

## 10. 'http://localhost:8080' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.

```javascript
var socket = io("http://localhost", { transports: ["websocket"] });
```

## 11. How to apply a git ?

```bash
git apply abc.diff
```

## 12. How to get a substring from curl output ?

```bash
curl "https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT" | grep -oG 'lastPrice\":\"[0-9]*' | grep -oG '[0-9]*'
```

## 13. Lỗi khi test code typescript + express với mongodb-memory-server trên debian

Xem chi tiết ở [bài này](/posts/backend/microservices-with-node-p9/#fix-bug-mongodb-memory-server-trên-debian-11)

## 14. Docker remove repository images

```bash
docker rmi -f $(d images -f "dangling=true" -q)
```

## 15. Docker remove image based on repository name or tag

```bash
docker rmi -f $(docker images --format '{{.Repository}} {{.ID}}' | grep 'ducnguyen96' | awk '{print $2}')
```

## 16. Remove env file from all git histories

```bash
git filter-branch --index-filter "git rm -rf --cached --ignore-unmatch .env" HEAD
git push origin master --force
```
