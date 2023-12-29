---
sidebar_label: nix-shell
---

# nix-shell

`nix-shell` là một tool cung cấp cho ta 1 shell cùng với các env variables cần thiết để vọc vạch derivation. Nó không build derivation nhưng mà nó thể giúp ta chạy từng bước build một manually.

Trong một nix env thì nếu bạn không có access tới 1 lib/program nào thì bạn phải cài đặt chúng với `nix-env`. Tuy nhiên cài đặt lib bằng `nix-env` không phải là 1 good practice, tương tự như viết app python vậy, bạn sẽ cần 1 môi trường biệt lập để dev.

```bash
$ nix-shell hello.nix
[nix-shell]$ make
bash: make: command not found
[nix-shell]$ echo $baseInputs
/nix/store/jff4a6zqi0yrladx3kwy4v6844s3swpc-gnutar-1.27.1 [...]
```

Gọi `nix-shell` tới 1 nix expression sẽ trả về 1 derivation và chúng ta access vào 1 shell nhưng shell này chưa có gì. Tuy nhiên ta có các env variables mà đã được set trong derivation như **$baseInputs**, **$buildInputs**, **$src**, ...

Điều này có nghĩa là ta có thể source `builder.sh` để build derivation. Tuy nhiên thì bạn có thể gặp lỗi vì user trong shell có thể không có quyền write tới **/nix/store**

```bash
[nix-shell]$ source builder.sh
...
```

## Builder for nix-shell

Để tiện hơn khi sử dụng nix-shell thì ta có thể split builder.sh ra thành 2 file là `setup.sh` và `builder.sh`.
Setup của chúng ta sẽ như tên gọi của nó là để setup trước khi build và builder thì sẽ gọi setup sau đó build.

Ta cũng sẽ wrap các phase trong quá trình setup thành các functions. `setup.sh` sẽ như sau:

```bash
unset PATH
for p in $baseInputs $buildInputs; do
  export PATH=$p/bin${PATH:+:}$PATH
done

function unpackPhase() {
  tar -xzf $src

  for d in *; do
    if [ -d "$d" ]; then
      cd "$d"
      break
    fi
  done
}

function configurePhase() {
  ./configure --prefix=$out
}

function buildPhase() {
  make
}

function installPhase() {
  make install
}

function fixupPhase() {
  find $out -type f -exec patchelf --shrink-rpath '{}' \; -exec strip '{}' \; 2>/dev/null
}

function genericBuild() {
  unpackPhase
  configurePhase
  buildPhase
  installPhase
  fixupPhase
}
```

Và `builder.sh` sẽ như sau:

```bash
set -e
source $setup
genericBuild
```

Cuối cùng ta sẽ thêm setup vào nix file:

```nix
pkgs: attrs:
  let defaultAttrs = {
    builder = "${pkgs.bash}/bin/bash";
    args = [ ./builder.sh ];
    setup = ./setup.sh;
    baseInputs = with pkgs; [ gnutar gzip gnumake gcc coreutils gawk gnused gnugrep binutils.bintools patchelf findutils ];
    buildInputs = [];
    system = builtins.currentSystem;
  };
  in
  derivation (defaultAttrs // attrs)
```

Bây giờ để chạy 1 step bất kỳ trong quá trình setup thì ta chỉ cần source `setup.sh` và gọi function tương ứng. Ví dụ:

```bash
$ nix-shell hello.nix
[nix-shell]$ source $setup
[nix-shell]$
```
