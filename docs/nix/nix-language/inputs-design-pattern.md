---
sidebar_label: Inputs Design Pattern
---

# Inputs Design Pattern

Trước khi đi vào inputs design pattern thì ta hãy tạo thêm một ví dụ, lần này ta sẽ build graphviz.

### Packaging graphviz

Tái sử dụng autotools từ bài trước thì ta có thể dễ dàng tạo derivation như sau:
`graphviz.nix`

```
let
  pkgs = import <nixpkgs> {};
  mkDerivation = import ./autotools.nix pkgs;
in mkDerivation {
  name = "graphviz";
  src = ./graphviz-2.49.3.tar.gz;
}
```

Sử dụng `nix-build graphviz.nix` để build và ta sẽ có các binaries trong `result/bin`.

Hãy thử sử dụng graphviz để tạo 1 file png

```bash
$ echo 'graph test { a -- b }'|result/bin/dot -Tpng -o test.png
Format: "png" not recognized. Use one of: canon cmap [...]
```

Vì graphviz không hỗ trợ png natively nên ta cần cài plugin cho nó. Để đơn giản thì ta sẽ sử dụng `libgd`. graphviz configure script sử dụng **pkg-config** .

`setup.sh`

```bash
for p in $baseInputs $buildInputs; do
  if [ -d $p/bin ]; then
    export PATH="$p/bin${PATH:+:}$PATH"
  fi
  if [ -d $p/lib/pkgconfig ]; then
    export PKG_CONFIG_PATH="$p/lib/pkgconfig${PKG_CONFIG_PATH:+:}$PKG_CONFIG_PATH"
  fi
done
```

`graphviz.nix`

```bash
let
  pkgs = import <nixpkgs> {};
  mkDerivation = import ./autotools.nix pkgs;
in mkDerivation {
  name = "graphviz";
  src = ./graphviz-2.49.3.tar.gz;
  buildInputs = with pkgs; [
    pkg-config
    (pkgs.lib.getLib gd)
    (pkgs.lib.getDev gd)
  ];
}
```

## The inputs pattern

Vậy là ta đã có 2 ví dụ: `hello.nix` và `graphviz.nix`. Cả 2 đều có 1 vấn đề là nó rất phụ thuộc vào **nixpkgs**:

- Vấn đề đầu tiên: chúng import **nixpkgs** trực tiếp. Trong `autotools.nix` ta sử dụng 1 cách tiếp cận khác tốt hơn là **nixpkgs** như một argument.
- Vấn đề thứ hai: nếu ta muốn 1 phiên bản khác của graphviz mà không hỗ trợ libgd thì sao?
- Vấn đề thứ ba: nếu ta muốn build 1 phiên bản khác của graphviz với 1 phiên phản libdg cụ thể ?

Câu trả lời cho các câu hỏi trên nếu vẫn sử dụng cách viết như trên thì ta sẽ phải viết lại `graphviz.nix` và `autotools.nix` cho mỗi phiên bản khác nhau. Điều này không phải là 1 good practice.

Với **inputs** pattern ta sẽ để user thay đổi **inputs** của expression.

`graphviz.nix`

```bash
{ mkDerivation, lib, gdSupport ? true, gd, pkg-config }:

mkDerivation {
  name = "graphviz";
  src = ./graphviz-2.49.3.tar.gz;
  buildInputs =
    if gdSupport
      then [
          pkg-config
          (lib.getLib gd)
          (lib.getDev gd)
        ]
      else [];
}
```

`default.nix`

```bash
let
  pkgs = import <nixpkgs> {};
  mkDerivation = import ./autotools.nix pkgs;
in with pkgs; {
  hello = import ./hello.nix { inherit mkDerivation; };
  graphviz = import ./graphviz.nix { inherit mkDerivation lib gd pkg-config; };
  graphvizCore = import ./graphviz.nix {
    inherit mkDerivation lib gd pkg-config;
    gdSupport = false;
  };
}
```
