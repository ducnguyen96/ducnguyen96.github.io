---
sidebar_label: Derivation
---

# Derivation

## Derivation function

Từ góc nhìn của Nix language thì derivations là các sets chứa một vài attributes nhất định. Vì vậy nên ta có thể dùng derivations như các variables.

`derivation` nhận vào một argument là một set chứa các thông tin:

- `name`: tên của derivation.
- `system`: là tên của system có thể build được (ví dụ: `x86_64-linux`).
- `builder`: là binary program được sử dụng để build derivation.

Đầu tiên hãy xem tên system bạn đang sử dụng:

```bash
nix-repl> builtins.currentSystem
"x86_64-linux"
```

Thử fake name của system:

```bash
nix-repl> d = derivation { name = "myname"; builder = "mybuilder"; system = "mysystem"; }
nix-repl> d
«derivation /nix/store/z3hhlxbckx4g3n9sw91nnvlkjvyw754p-myname.drv»
```

Ở đây thì chúng ta chưa build derivation nhưng Nix đã tạo **.drv file**.

## `.drv` files

```bash
nix derivation show /nix/store/z3hhlxbckx4g3n9sw91nnvlkjvyw754p-myname.drv --extra-experimental-features nix-command
```

```json
{
  "/nix/store/z3hhlxbckx4g3n9sw91nnvlkjvyw754p-myname.drv": {
    "args": [],
    "builder": "mybuilder",
    "env": {
      "builder": "mybuilder",
      "name": "myname",
      "out": "/nix/store/40s0qmrfb45vlh6610rk29ym318dswdr-myname",
      "system": "mysystem"
    },
    "inputDrvs": {},
    "inputSrcs": [],
    "name": "myname",
    "outputs": {
      "out": {
        "path": "/nix/store/40s0qmrfb45vlh6610rk29ym318dswdr-myname"
      }
    },
    "system": "mysystem"
  }
}
```

Quan trọng: hash của out path được tạo ra chỉ dựa trên input derivations trong phiên bản hiện tại của Nix, không phải dựa trên nội dung của build product. Tuy nhiên, có thể có các content-addressable derivations ví dụ như tarballs mà chúng ta sẽ thấy sau.

Có nhiều fields đang empty trong file `.drv` này, tuy nhiên ta có thể tóm tắt format của `.drv` như sau:

1. Các output paths (có thể có nhiều). Mặc định thì Nix sẽ tạo ra một output path có tên là "out".

2. List các input derivations. Nó empty vì chúng ta không refer tới bất kỳ derivation nào khác. Nếu có thì sẽ là list các file `.drv` khác.

3. System và builder executable (là cái mà ta đã fake phía trên).

4. Danh sách các env variables được pass vào builder.

Đó là các thông tin cần thiết để build derivation.

Một điều quan trọng khác: các env variables được passed vào builder chỉ là những env variables bạn thấy trong file `.drv` cùng với một vài cấu hình khác (số core, temp dir, ...). Builder sẽ không lấy bất kỳ env variable nào từ shell đang chạy.

Hãy thử build fake derivation:

```bash
nix-repl> d = derivation { name = "myname"; builder = "mybuilder"; system = "mysystem"; }
nix-repl> :b d
[...]
these derivations will be built:
  /nix/store/z3hhlxbckx4g3n9sw91nnvlkjvyw754p-myname.drv
building path(s) `/nix/store/40s0qmrfb45vlh6610rk29ym318dswdr-myname'
error: a `mysystem' is required to build `/nix/store/z3hhlxbckx4g3n9sw91nnvlkjvyw754p-myname.drv', but I am a `x86_64-linux'
```

Nó sẽ báo lỗi vì chúng ta đang build trên `x86_64-linux` nhưng lại fake là `mysystem`.

## Build a derivation

Nix không build derivation trong quá trình evaluation của Nix expression. Trong thực tế, đó là lý do tại sao chúng ta phải dùng `:b drv` trong `nix repl` hoặc dùng `nix-store -r`.

**Instantiate/Evaluation time**: Nix expression được parse, interpret và cuối cùng trả về một derivation set. Trong quá trình evaluation, bạn có thể refer tới các derivation khác.
**Realise/Build time**: `.drv` từ derivation set được build, đầu tiên là build các `.drv` inputs (build dependencies).

Có thể xem 2 quá trình này như là compile time và link time trong C/C++ projects. Đầu tiên là compile tất cả các source files thành các object files. Sau đó link các object files thành một executable. Đầu tiên các Nix expression (thường là trong .nix file) được compile thành .drv, sau đó mỗi .drv được build và kết quả sẽ được install vào các out paths tương ứng.

## Sử dụng script làm builder

Cách dễ nhất để chạy một chuỗi command để build thứ gì đó là sử dụng bash script.

`simple.c`

```c
void main() {
  puts("Simple!");
}
```

`simple_builder.sh`

```bash
export PATH="$coreutils/bin:$gcc/bin"
mkdir $out
gcc -o $out/simple $src
```

`simple.nix`

```nix
let
  pkgs = import <nixpkgs> {};
in
  pkgs.stdenv.mkDerivation {
    name = "simple";
    builder = "${pkgs.bash}/bin/bash";
    args = [ ./simple_builder.sh ];
    inherit (pkgs) gcc coreutils;
    src = ./simple.c;
    system = builtins.currentSystem;
}
```

Build

```bash
nix-build simple.nix
```

## Generic builder

`builder.sh`

```bash
set -e
unset PATH
for p in $buildInputs; do
  export PATH=$p/bin${PATH:+:}$PATH
done

tar -xf $src

for d in *; do
  if [ -d "$d" ]; then
    cd "$d"
    break
  fi
done

./configure --prefix=$out
make
make install
```

1. `set -e`: nếu một command nào đó fail thì script sẽ dừng ngay lập tức.
2. `unset PATH`: xóa PATH hiện tại.
3. `for p in $buildInputs; do`: với mỗi package trong buildInputs, thêm vào PATH.
4. `tar -xf $src`: giải nén source tarball.
5. `for d in *; do`: tìm thư mục đầu tiên trong thư mục hiện tại.
6. `./configure --prefix=$out`: chạy configure script.
7. `make`: build.
8. `make install`: install.

`hello.nix`

```nix
let
  pkgs = import <nixpkgs> {};
in
  derivation {
    name = "hello";
    builder = "${pkgs.bash}/bin/bash";
    args = [ ./builder.sh ];
    buildInputs = with pkgs; [ gnutar gzip gnumake gcc coreutils gawk gnused gnugrep binutils.bintools ];
    src = ./hello-2.12.1.tar.gz;
    system = builtins.currentSystem;
  }
```

Ta có thể nhận thấy rằng phần tham số của hàm derivation là 1 set bao gồm các attributes sẽ có thể tái sử dụng được chẳng hạn như builder, args, các inputs, systems. Nên ta có thể tách ra thành một set riêng và merge với 1 set khác nếu cần.

```bash
nix-repl> { a = "b"; } // { c = "d"; }
{ a = "b"; c = "d"; }
nix-repl> { a = "b"; } // { a = "c"; }
{ a = "c"; }
```

Nếu trùng key thì sẽ lấy value của set sau.

Đồng thời thì ta cũng có thể tách hàm derivation ra thành một file riêng. Kết quả ta được một file như sau:

`autotools.nix`

```nix
pkgs: attrs:
  let defaultAttrs = {
    builder = "${pkgs.bash}/bin/bash";
    args = [ ./builder.sh ];
    baseInputs = with pkgs; [ gnutar gzip gnumake gcc coreutils gawk gnused gnugrep binutils.bintools ];
    buildInputs = [];
    system = builtins.currentSystem;
  };
  in
  derivation (defaultAttrs // attrs)
```

Nếu evaluate file này thì ta sẽ nhận được 1 function nhận đầu vào là pkgs. Hàm này sẽ trả về một function nhận đầu vào là attrs và gọi hàm derivation với tham số là defaultAttrs // attrs.

Cuối cùng ta có thể sử dụng như sau:

```nix
let
  pkgs = import <nixpkgs> {};
  mkDerivation = import ./autotools.nix pkgs;
in
  mkDerivation {
    name = "hello";
    src = ./hello-2.12.1.tar.gz;
  }
```

Chú ý là ở file `builder.sh` cũ ta chưa thêm các path của baseInputs vào PATH. Nên ta sẽ thêm vào như sau:

```bash
for p in $baseInputs; do
  export PATH=$p/bin${PATH:+:}$PATH
done
```

## Buildtime dependencies

```bash
$ nix-instantiate hello.nix
/nix/store/z77vn965a59irqnrrjvbspiyl2rph0jp-hello.drv
$ nix-store -q --references /nix/store/z77vn965a59irqnrrjvbspiyl2rph0jp-hello.drv
/nix/store/0q6pfasdma4as22kyaknk4kwx4h58480-hello-2.10.tar.gz
/nix/store/1zcs1y4n27lqs0gw4v038i303pb89rw6-coreutils-8.21.drv
/nix/store/2h4b30hlfw4fhqx10wwi71mpim4wr877-gnused-4.2.2.drv
/nix/store/39bgdjissw9gyi4y5j9wanf4dbjpbl07-gnutar-1.27.1.drv
/nix/store/7qa70nay0if4x291rsjr7h9lfl6pl7b1-builder.sh
/nix/store/g6a0shr58qvx2vi6815acgp9lnfh9yy8-gnugrep-2.14.drv
/nix/store/jdggv3q1sb15140qdx0apvyrps41m4lr-bash-4.2-p45.drv
/nix/store/pglhiyp1zdbmax4cglkpz98nspfgbnwr-gnumake-3.82.drv
/nix/store/q9l257jn9lndbi3r9ksnvf4dr8cwxzk7-gawk-4.1.0.drv
/nix/store/rgyrqxz1ilv90r01zxl0sq5nq0cq7v3v-binutils-2.23.1.drv
/nix/store/qzxhby795niy6wlagfpbja27dgsz43xk-gcc-wrapper-4.8.3.drv
/nix/store/sk590g7fv53m3zp0ycnxsc41snc2kdhp-gzip-1.6.drv
```

Đây là tất cả các derivations được refer tới trong derivation của chúng ta, không nhiều hơn cũng chả ít hơn.

## Runtime dependencies

```bash
$ nix-instantiate hello.nix
/nix/store/z77vn965a59irqnrrjvbspiyl2rph0jp-hello.drv
$ nix-store -r /nix/store/z77vn965a59irqnrrjvbspiyl2rph0jp-hello.drv
/nix/store/a42k52zwv6idmf50r9lps1nzwq9khvpf-hello
$ nix-store -q --references /nix/store/a42k52zwv6idmf50r9lps1nzwq9khvpf-hello
/nix/store/94n64qy99ja0vgbkf675nyk39g9b978n-glibc-2.19
/nix/store/8jm0wksask7cpf85miyakihyfch1y21q-gcc-4.8.3
/nix/store/a42k52zwv6idmf50r9lps1nzwq9khvpf-hello
```

Dù `gcc` không cần thiết lúc runtime nhưng Nix vẫn thêm nó là 1 dependency vì outpaths của nó được mentioned trong "hello" binary. Quá trình build thì gcc lib path được thêm vào và nghĩ rằng nó cần thiết trong quá trình runtime nhưng không phải vậy.

Để loại bỏ nó thì ta sẽ thêm 1 phase cho builder gọi là `fixup` sử dụng [patchelf](https://github.com/NixOS/patchelf) và [strip](https://linux.die.net/man/1/strip)

```bash
find $out -type f -exec patchelf --shrink-rpath '{}' \; -exec strip '{}' \; 2>/dev/null
```

Để có 2 packages này trong builder thì ta cần thêm 2 packages **findutils** và **patchelf** vào `baseInputs` trong `autotools.nix`

Build lại `hello.nix`

```bash
$ nix-build hello.nix
[...]
$ nix-store -q --references result
/nix/store/94n64qy99ja0vgbkf675nyk39g9b978n-glibc-2.19
/nix/store/md4a3zv0ipqzsybhjb8ndjhhga1dj88x-hello
```

Ok, vậy là gcc không còn là runtime dependency của hello nữa.
