---
sidebar_label: Flakes
---

# Flakes

Flake là một tính năng thử nghiệm của Nix được thêm vào từ bản 2.4

Flake là một tính năng để quản lý các Nix package giúp đơn giản hóa việc sử dụng và cải thiện reproducibility của Nix. Flakes quản lý các dependencies qua Nix expressions - đó là giao thức chính để chỉ định các package. Flakes thực hiện các giao thức này theo một schema nhất quán với một tập hợp các policy chung để quản lý các package.

Mỗi flake là một hệ thống tập tin mà thư mục gốc chứa `flake.nix`. Mỗi cài đặt thì có thể dùng một hoặc nhiều flakes, chúng có thể độc lập hoặc cũng có thể gọi lẫn nhau. Nội dung của file `flake.nix` tuân theo schema đồng nhất để biểu diễn các package và các dependencies. Nếu bạn là từng dev javascript thì có thể hiểu `flake.nix` tương tự như `package.json`. Flake cũng có cơ chế looking references và versions để có thể queries và update dễ dàng hơn. Bạn có thể hiểu `flake.lock` tương tự như `package-lock.json` trong javascript.

## Enable flakes

### Nix command

Để sử dụng flakes thì ta sẽ thêm flag `--experimental-features "flakes nix-command"` vào câu lệnh nix. Ví dụ:

```bash
nix --experimental-features "flakes nix-command" build github:edolstra/flake-compat
```

### NixOS

Để sử dụng flakes trên NixOS thì ta sẽ thêm `experimental-features = nix-command flakes` vào file `/etc/nixos/configuration.nix`:

```nix
nix.settings.experimental-features = "nix-command flakes";
```

### Linux distros with Home Manager

Để sử dụng flakes trên các distros linux với Home Manager ta update home-manager config:

```nix
  nix = {
    package = pkgs.nix;
    settings.experimental-features = [ "nix-command" "flakes" ];
  };
```

### Linux distros without Home Manager

Để sử dụng flakes trên các distros linux mà không có Home Manager thì ta update nix config(`~/.config/nix/nix.conf` hoặc `/etc/nix/nix.conf`):

```nix
experimental-features = nix-command flakes
```
