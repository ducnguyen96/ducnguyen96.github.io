---
slug: docker-volume-directory-permissions
title: Permissions khi sử dụng volume trong Docker
authors: [ducnguyen96]
tags: [docker, devops, backend, volume]
---

# Permissions khi sử dụng volume trong Docker

Nguồn:

- https://stackoverflow.com/questions/50325494/how-can-i-change-permission-of-mounted-volumes-in-docker-compose-yml-from-the-do
- https://stackoverflow.com/a/29251160/1811501

Hôm nay khi mình sử dụng docker-compose để chạy một số container trên local thì gặp lỗi này `warning: could not open directory 'databases/postgresql/': Permission denied `.

Với file `.yml` như sau:

```yaml
version: "3.8"

services:
  postgres:
    container_name: postgres
    image: postgres:13.2-alpine
    restart: always
    volumes:
      - ./databases/postgresql:/var/lib/postgresql/data
    env_file:
      - .env/.postgres
    ports:
      - 6432:5432
```

Thư mục `./databases` là thư mục có sẵn trong repo và mình clone về.

Mình xin phép được diễn giải lại 2 answers trên stackoverflow.

## Vấn đề

Khi bind một thư mục host với container, các files và thư mục duy trì permissions mà chúng có trên máy host, nó được thiết kế như vậy. Khu sử dụng bind-mount, bạn trao cho các container quyền truy cập đến các files có sẵn trên host, và Docker sẽ không thay đổi đến các files đó, việc thay đổi cũng rất nguy hiểm (chẳng hạn, bind thư mục home trên máy chủ của bạn với container sẽ thay đổi permissions của thư mục đó, điều này có thể dẫn đến việc bạn không thể sử dụng máy nữa).

Để thay đổi permissions của các files đó, thì chúng ta thay đổi trên host chứ không thay đổi bằng container.

## Permissions trên Linux

Permissions trên Linux dựa vào user và group _ids_ (`'uid'`/ `'gid'`). Mặc dù bạn thấy một user-gì đấy và tên group chính là owner, nhưng những cái tên đó không thực sự quan trọng trong Linux, nó chỉ có tác dụng cho user nhìn vào để biết ai là owner.

Bạn có thể set bất cứ `uid`/`gid` nào cho một file, một user không cần phải `tồn tại` khi cài đặt permissions.
Ví dụ:

```bash
touch foobar && sudo chown 1234:5678 foobar && ls -la foobar

# UID and GID được set là 1234 / 5678, mặc dù user ấy không tồn tại.
-rw-rw-r-- 1 1234 5678 0 Mar 25 19:14 foobar
```

## Kiểm tra permissions (trong và ngoài một container)

Như đã nói ở trên, Docker duy trì ownership của host khi sử dụng một volume. Ví dụ dưới đây cho ta thấy permissions và ownership trong volume là giống nhau giữa trong và ngoài container.

```bash
# (Tạo một dummy site)

mkdir -p volume-example/site && cd volume-example
echo "<html><body>hello world</body></html>" > site/index.html

# In permissions trên host;

ls -n site

# total 4
# -rw-rw-r-- 1 1002 1002 38 Mar 25 19:15 index.html

# In permissions phía trong một nginx container, sử dụng nó là volume:

sudo docker run --rm -v $(pwd)/site:/var/www nginx ls -n /var/www

# total 4
# -rw-rw-r-- 1 1002 1002 38 Mar 25 19:15 index.html
```

## Cách giải quyết

Như đã nói ở trên, một user không cần thiết phải tồn tại để sử dụng chúng, cho dù chúng ta không có một `www-data` user trên host, chúng ta vẫn có thể cài permissions chính xác nếu chúng ta biết `uid` và `gid` của nó bên trong container.

Hãy xem `uid` và `gid` của `www-data` user bên trong container nginx.

```bash
sudo docker run --rm nginx id www-data

# uid=33(www-data) gid=33(www-data) groups=33(www-data)
```

Đầu tiên kiểm tra trạng thái trước khi thay đổi permissions. Lần này ta sẽ chạy nginx container với `www-data` user.

```bash
sudo docker run \
  --rm \
  --volume $(pwd)/site:/var/www \
  --user www-data nginx touch /var/www/can-i-write.txt

# touch: cannot touch `/var/www/can-i-write.txt': Permission denied
# chưa có quyền để tạo file trong như mục `site`.
```

Tiếp theo, thay đổi permissions trên thư mục host.

```bash
sudo chown -R 33:33 site

sudo docker run \
   --rm \
   --volume $(pwd)/site:/var/www \
   --user www-data nginx touch /var/www/can-i-write.txt
```

Được rồi nè :D.

Có một cách giải quyết khác cho trường hợp của mình khi dev local không phải môi trường production. Mình có thể thay đổi permissions của 1 file/directory thay vì thay đổi owner.

```bash
sudo chmod -R 777 databases
```

Thao khảo: https://stackoverflow.com/questions/8328481/chmod-777-to-a-folder-and-all-contents
