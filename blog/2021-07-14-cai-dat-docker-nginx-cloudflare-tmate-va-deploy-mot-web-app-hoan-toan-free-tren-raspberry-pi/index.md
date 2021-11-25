---
slug: cai-dat-docker-nginx-cloudflare-tmate-va-deploy-mot-web-app-hoan-toan-free-tren-raspberry-pi
title: Cài đặt docker, nginx, cloudflare, tmate và deploy một web app hoàn toàn free trên raspberry pi
authors: [ducnguyen96]
tags: [tutorial, backend, devops, cloudflare, tmate, raspberry pi]
---

## 1. Cài đặt image cho Pi

Cài đặt [Raspbian](https://en.wikipedia.org/wiki/Raspberry_Pi_OS) bằng [raspberry pi imager](https://www.raspberrypi.org/software/)
**Lưu ý**: Raspberry Pi chạy chip ARM và Raspbian ở kiến trúc arm/v7 32bit nên các cài đặt ở phía dưới đều phải dùng cho kiến trúc này.

## 2. Cài tmate để ssh

Chúng ta dùng tmate bản [static build](https://github.com/tmate-io/tmate/releases/tag/2.4.0) arm/v7 32bit để có đầy đủ tính năng mới nhất như chạy foreground (-F).

```sh
wget https://github.com/tmate-io/tmate/releases/download/2.4.0/dbg-symbols-tmate-2.4.0-static-linux-arm32v7.tar.xz
```

Đăng ký API key để có static IP và session name giống nhau cho mỗi lần đăng nhập vào con Pi.
Link đăng ký ở [đây](https://tmate.io/#named_sessions) nhé.
Tạo 1 [systemd service](https://github.com/tmate-io/tmate/issues/198) để tự động chạy tmate mỗi lần reboot Pi theo

## 3. Cài đặt nginx cho Pi

Cài đặt nginx với apt

```sh
sudo apt install nginx
```

## 4. Cài đặt docker với convenience script

```sh
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

## 5. Build image cho Pi

Tạo builder

```sh
docker buildx create --platform linux/arm/v7 --name armbuilder
```

Sử dụng builder

```sh
docker buildx use armbuilder
```

Bootstrap builder

```sh
docker buildx inspect --bootstrap
```

Sau khi đã có builder mới chúng ta sẽ bắt đầu build image
Vì đa số chúng ta không sử dụng kiến trúc arm/v7 nên ta sẽ cần phải cài đặt thêm 1 cross-platform emulator cho docker để có thể build được image cho arm/v7. Xem chi tiết ở [đây](https://github.com/tonistiigi/binfmt#installing-emulators)

```sh
docker run --privileged --rm tonistiigi/binfmt --install all
```

Build image đầu tiên cho pi

```sh
docker buildx build --platform linux/arm/v7 -t ducnguyen96/drinkwater-api:0.0.13 --push .
```

**Lưu ý**: Với các bạn đang sử dụng bcrypt cho ứng dụng của mình thì các bạn nên chuyển sang bcryptjs vì bcrypt không hoạt động được trên arm/v7 nhé.

## 6. Docker run trên pi

Có rất nhiều image được built based từ alpine - 1 phiên bản linux tinh gọn dùng và chúng ta sẽ sử dụng chúng rất nhiều. Docker có tính năng security để cài đặt chặt chẽ các tính toán trên container, để có thể chạy tính năng này trên image Alpine thì nó yêu cầu libseccomp mà có vẻ như Alpine còn thiếu, vậy chúng ta sẽ tắt tính năng này đi.

```sh
--security-opt=seccomp=unconfined
```

Tham khảo tại [đây](https://www.gitmemory.com/issue/Koenkk/zigbee2mqtt/7662/852985841)
Khởi chạy container đầu tiên nào :3

```sh
docker run -it -d --name drinkwate-web --security-opt=seccomp=unconfined
-p 4000:4000 ducnguyen96/drinkwater-web:0.0.13
```

## 7. Self host với cloudflare

Cài đặt cloudflare cho pi ở [đây](https://docs.pi-hole.net/guides/dns/cloudflared/#armhf-architecture-32-bit-raspberry-pi)
Lưu ý: Thư mục gốc của cloudflare nằm ở /etc/cloudflared

1. Login

```sh
cloudflared tunnel login
```

Nếu pi chỉ chạy terminal thì copy link vào browser nhé

2. Create a tunnel

```sh
cloudflared tunnel create <NAME>
```

3. Config tunnel

```sh
tunnel: 6ff42ae2-765d-4adf-8112-31c55c1551ef
credentials-file: /root/.cloudflared/6ff42ae2-765d-4adf-8112-31c55c1551ef.js


ingress:
 - hostname: gitlab.widgetcorp.tech
 service: http://localhost:80
 - hostname: gitlab-ssh.widgetcorp.tech
 service: ssh://localhost:22
 - service: http_status:404
```

4. Route to tunnel theo mẫu sau
   ![dns-record](/img/blogs/dns-record.png)
5. Run cloudflare as a service

```sh
sudo cloudflared service install
```

```sh
sudo systemctl start cloudflared
```

```sh
sudo systemctl enable cloudflared
```

Vậy là chúng ta đã có thể host 1 web app hoàn toàn free :3 !
