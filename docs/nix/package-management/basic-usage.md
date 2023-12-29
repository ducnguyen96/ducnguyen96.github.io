---
sidebar_label: Basic Usage
---

# Basic Usage

## Installation

Recommended option hiện tại cho Linux và MacOS:

```bash
bash <(curl -L https://nixos.org/nix/install) --daemon
```

Tham khảo thêm [ở đây](https://nixos.org/manual/nix/stable/installation/installation.html)

## Commands

Xem tất cả các commands [ở đây](https://nixos.org/manual/nix/stable/command-ref/experimental-commands.html)

## Declarative configuration

File config chính thức duy nhất liên quan tới Nix là `nix.conf`(nằm ở `/etc/nix`), nó chứa một số cài đặt liên quan tới cách Nix build, garbage collection, sandboxing và user permissions. Chi tiết xem [ở đây](https://nixos.org/manual/nix/stable/command-ref/conf-file)

[Nixpkgs] là repository lớn nhất của Nix packages và NixOS modules. Có thể cấu hình nó qua `~/.config/nixpkgs/config.nix`

[Home Manager](https://nixos.wiki/wiki/Home_Manager) là cách được khuyến khích sử dụng để declare env cho một user.

## Imperative Operations

Package và environment management trong Nix là imperative; user environments - bao gồm cả package installation và removal - được quản lý bằng lệnh `nix-env`, trong khi `nix-channels` xác định phiên bản của Nixpkgs được sử dụng.

### User Environments

Nix cung cấp một imperative package management command line tool là `nix-env` - nó có thể được sử dụng để cài đặt các package ở user level. Các package được cài đặt bằng `nix-env` chỉ có thể được sử dụng bởi user đó, và không thay đổi trạng thái của hệ thống.

Một số `nix-env` commands thường dùng:

|                         |                                |
| ----------------------- | ------------------------------ |
| Searching for packages  | nix search nixpkgs packagename |
| Installing packages     | nix-env -iA packagename        |
| List installed packages | nix-env -q                     |
| Uninstalling packages   | nix-env -e packagename         |
| Upgrading packages      | nix-env -u                     |

### Channels

Các Nix packages thì được phân phối qua một vài Nix channels: cơ chế để phân phối Nix expressions cũng như các binary caches liên quan tới chúng. Các channels này xác định phiên bản của các package, và chúng có thể được phân loại rộng rãi thành các channel stable và unstable. Hầu hết người dùng sẽ muốn channel stable, hiện tại là nixos-22.05. Để biết thêm thông tin về channels và cách chọn chúng, xem bài viết [Nix Channels](https://nixos.wiki/wiki/Nix_Channels).

Một số `nix-channel` commands thường dùng:

|                       |                                                                 |
| --------------------- | --------------------------------------------------------------- |
| List current channels | nix-channel --list                                              |
| Add a primary channel | nix-channel --add https://nixos.org/channels/channel-name nixos |
| Add other channels    | nix-channel --add https://some.channel/url my-alias             |
| Remove a channel      | nix-channel --remove channel-alias                              |
| Updating a channel    | nix-channel --update channel-alias                              |
| Update all channels   | nix-channel --update                                            |
