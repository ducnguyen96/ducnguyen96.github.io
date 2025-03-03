---
sidebar_position: 1
---

# Setup

Dưới đây là 1 nix flake cung cấp môi trường để chạy python mà mình public [ở đây](https://github.com/ducnguyen96/ai-tools/blob/stable-diffusion/flake.nix)

## Chú ý

- Nếu không dùng packages ngoài thì hãy comment tất cả những packages không cần thiết.
- Ở đây mình có includes `pip` và `virtualenv` vì có thể `nixpkgs` phiên bản của bạn không có bản prebuilt.
- Mặc dù có thể vừa truy cập được các packages cài đặt qua nix, vừa dùng được các packages cài qua pip cho virtualenv nhưng các package thuộc `python3.withPackages` có thể sẽ không tương thích với phiên bản mà bạn cài đặt qua `pip`.

## Flake

```nix
{
  description = "Python with Pip Nix flakes";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = {
    self,
    nixpkgs,
    flake-utils,
  }:
    flake-utils.lib.eachDefaultSystem (system: let
      pkgs = import nixpkgs {
        inherit system;
        config.allowUnfree = true; #
      };
    in {
      devShells.default = pkgs.mkShell {
        buildInputs = with pkgs; [
          python3
          (python3.withPackages (ps:
            with ps; [
              pip
              jupyterlab
              ipykernel
            ]))
        ];

        shellHook = ''
          export LD_LIBRARY_PATH=${pkgs.gcc14.libc}/lib
          echo "Jupyter environment activated!"
          echo "Run 'jupyter lab' to start JupyterLab."
        '';
      };
    });
}
```
