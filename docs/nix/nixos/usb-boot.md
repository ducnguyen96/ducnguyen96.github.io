---
sidebar_label: Tạo USB boot
---

# Tạo USB boot

Tải bản iso stable mới nhất từ [trang chủ](https://nixos.org/nixos/download.html) hoặc bạn cũng có thể tải bản unstable từ https://channels.nixos.org/?prefix=nixos-unstable/ như sau:

```bash
wget https://channels.nixos.org/nixos-unstable/latest-nixos-minimal-x86_64-linux.iso
```

Hãy kiểm tra đường link phía trên để chọn đúng bản iso cho máy của bạn, hầu hết là `x86_64-linux` nhưng nếu bạn không chắc chắn thì hãy kiểm tra bằng lệnh sau:

```bash
uname -m
```

Sau khi tải xong, bạn có thể tạo USB boot bằng lệnh sau:

```bash
sudo dd bs=4M if=latest-nixos-minimal-x86_64-linux.iso of=/dev/sdX status=progress oflag=sync
```

Với `sdX` là đường dẫn của USB, bạn có thể kiểm tra bằng lệnh sau:

```bash
lsblk
```
