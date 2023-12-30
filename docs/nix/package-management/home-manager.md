---
sidebar_label: Home Manager
---

# Home Manager

[Home Manager](https://github.com/nix-community/home-manager) là một hệ thống để quản lý môi trường user bằng cách sử dụng Nix package manager. Nói cách khác, Home Manager cho phép bạn

- cài đặt phần mềm declaratively trong profile của user, thay vì sử dụng nix-env.
- quản lý các dotfiles trong thư mục home của user.

Home Manager có rất nhiều options, nhìn vào sẽ thấy rất khó hiểu, nhưng hầu hết các options đó chỉ là tạo ra một số dotfile và cài đặt một số phần mềm theo cách tương tự như nix-env.

:::warning

Trước khi sử dụng Home Manager thì hãy đọc cảnh báo ở [đây](https://github.com/rycee/home-manager#words-of-warning)

:::

## Configuration

Home Manager có thể được configured cho mỗi user trong `~/.config/nixpkgs/home.nix` hoặc như một module trong `configuration.nix`.

### Cài đặt

Bạn có thể follow [official guide](https://nix-community.github.io/home-manager/index.xhtml#ch-installation) để cài đặt Home Manager.

#### Dùng flakes

##### Enable flake

Đầu tiên bạn phải enable flake và nix-commands trong file `~/.config/nix/nix.conf`:

```bash
experimental-features = nix-command flakes
```

##### Init Home Manager

Nếu bạn đang dùng bạn unstable:

```bash
nix run home-manager/master -- init --switch
```

Nếu bạn đang dùng Nixpkgs hoặc NixOS 23.11:

```bash
nix run home-manager/release-23.11 -- init --switch
```

Ta có thể kiểm tra phiên bản nixpkgs đang dùng bằng lệnh:

```bash
nix-instantiate --eval -E '(import <nixpkgs> {}).lib.version'
```

Khả năng rất cao là bạn đang dùng phiên bản unstable nếu bạn cài nix multi-user từ script của nixos.org.

Sau khi chạy lệnh init nó sẽ gen ra file `flake.nix` và `home.nix` trong thư mục `~/.config/home-manager` của bạn.

:::info

Quá trình init sẽ có thể gặp lỗi conflict nếu bạn đã từng cài Nix package nào đó. Hãy xem log biết cách xử lý.

Thường thì bạn sẽ sử dụng `nix-env -q` để xem đã cài package nào. Sau đó sử dụng `nix-env -e` để xóa package đó đi.

:::

## Usage

### Sử dụng Home Manager như một declarative version của nix-env

Do bản chất là imperative nên nix-env có một số vấn đề. Ví dụ, sau khi cài đặt java 8 với `nix-env -i jdk8`, chạy `nix-env --upgrade` sẽ upgrade java lên 10 mặc dù ban đầu ta đã yêu cầu cài đặt java 8.

Home Manager cung cấp một cách để cài đặt phần mềm declaratively trong profile của user, thay vì sử dụng nix-env. Ví dụ, để cài đặt java 8, ta chỉ cần thêm `pkgs.jdk8` vào `home.packages`:

```nix
{ pkgs, ... }: {
  home.packages = [ pkgs.jdk8 ];
}
```

### Sử dụng trên non-NixOS Linux

Home Manager có một option để tự động set một số biến môi trường giúp việc sử dụng phần mềm được cài đặt bằng nix trên non-NixOS linux dễ dàng hơn (fixing local issues, settings XDG_DATA_DIRS, etc.):

```nix
{ pkgs, ... }: {
  targets.genericLinux.enable = true;
}
```

### Quản lý dotfiles

```nix
  programs.git = {
    enable = true;
    userName  = "my_git_username";
    userEmail = "my_git_username@gmail.com";
  };
```

Home Manager sẽ gen ra một file `.config/git/config` với các options trên.

Với các programs mà Home Manager chưa có config options thì bạn có thể quản lý các dotfiles trực tiếp như sau:

```nix
  xdg.configFile."i3blocks/config".source = ./i3blocks.conf;
  home.file.".gdbinit".text = ''
      set auto-load safe-path /nix/store
  '';
```

Home Manager sẽ tạo symlink `$XDG_CONFIG_HOME/i3blocks/config` và `~/.gdbinit`.
