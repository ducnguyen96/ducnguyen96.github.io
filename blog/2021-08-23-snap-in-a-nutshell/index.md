---
slug: snap-in-a-nutshell
title: Snap in a nutshell
authors: [ducnguyen96]
tags: [os, snap]
---

# Snap in a nutshell

Snap là một hệ thống triển khai và đóng gói phần mềm được phát triển bởi [Canonical](<https://en.wikipedia.org/wiki/Canonical_(company)>) cho những hệ điều hành sử dụng nhân Linux.

## 1. Why Snap

Với các trình quản lý package khác như `apt` hay `yum` thì các packages được đóng gói và phân phối như 1 phần của os, điều này tạo ra `delay` giữa việc phát triển và triển khai ứng dụng đến user. Snap được sinh ra để các developers có thể publish lên `Snap Store` và đưa thẳng đến người dùng.

## 2. Hoạt động được trên hầu hết các Linux distro

Một đặc điểm khiến snap phổ biến là các `snaps (packages)` có thể hoạt động được trên hầu hết các Linux distro.

Các snap được nén với định dạng `SquashFS` với đuôi mở rộng là `.snap`. Các file này chứa ứng dụng, các dependencies và metadata. Metadata được biên dịch bởi `snapd` và thiết lập 1 `sandbox` bảo mật cho ứng dụng đấy. Sau khi snap được cài đặt thì nó được mount tới OS host và mỗi khi người dùng khởi chạy ứng dụng thì chúng sẽ được giải nén ngay lúc đấy, điều này giúp snap sử dụng ít dung lượng hơn nhưng khởi động ứng dụng lại lâu hơn.

## 3. Các snap có bảo mật không

Các snap đẩy lên Snap Store sẽ được tự động test và scan malware, mặc dù vậy thì chúng không đạt được độ tin cậy như những ứng dụng bình thường của distro.

Vào tháng 5(2018), 2 ứng dụng được phát triển bởi cùng 1 developer đã được tìm thấy là chứa miner tiền ảo, miner sẽ được chạy background khi mà ứng dụng này được thực thi. Khi vụ việc được biết đến thì Canonical đã gỡ 2 ứng dụng này khỏi Snap Store và chuyển quyền sở hữu đến 1 bên thứ 3 sau khi đã loại bỏ miner.

Mặc dù Snap sandbox đã giảm ảnh hưởng của những ứng dụng xấu nhưng Canonical vẫn khuyến khích users chỉ nên sử dụng snap của những publisher đã được người dùng tin tưởng.

## 4. Cài đặt snap cho debian

```sh
sudo apt install snapd
sudo snap install core
```

## 5. Tìm kiếm package

```sh
snap find <search_text>
```

## 6. Cài đặt package bằng snap

```sh
sudo snap install hugo --channel=extended
```

## 7. Xem danh sách packages

```sh
snap list
```

## 8. Gỡ package cài đặt bằng snap

```sh
sudo snap remove <package>
```

## 9. Update package

```sh
sudo snap refresh --list
```

## 10. Snap packages doesn't work on zsh or other shell?

zsh không đọc các packages cài đặt bởi snap ở thư mục `/snap/bin` nên chúng ta cần phải thêm `PATH` cho nó như sau

```sh
# .your-zsh-config-folder/.zshrc
export PATH=$PATH:/snap/bin
```
