---
sidebar_label: Basic
---

# Basic

[Nix Language](https://nixos.org/manual/nix/stable/expressions/expression-language.html) được sử dụng để viết các expressions để tạo ra derivations. Công cụ `nix-build` được sử dụng để build derivations từ một expression.

## Value types

Nix 2.0 đã thêm `repl` để debug expressions. Có thể sử dụng `repl` để nghịch 1 vài thứ cơ bản. Để chạy repl, ta chạy `nix repl` và nhập các expressions vào.

```nix
nix-repl> 1+3
4

nix-repl> 7-4
3

nix-repl> 3*2
6
```

Thử dùng phép chia:

```nix
nix-repl> 6/3
/home/nix/6/3
```

Để chia 2 số, ta phải sử dụng `builtins.div`:

```nix
builtins.div 6 3
```

Hoặc phải thêm 1 space sau phép chia:

```nix
6/ 3
2
```

Nix có các kiểu là: integer, floating point, string, path, boolean, null

## Identifier

Nix cho phép sử dụng `-` như một identifier.

## Strings

Strings được đóng trong ngặc kép(") hoặc 2 ngoặc đơn('')

```nix
nix-repl> "foo"
"foo"
nix-repl> ''foo''
"foo"
```

Ta có thể interpolate các biến vào string bằng cách sử dụng `${}`:

```nix
nix-repl> foo = "strval"
nix-repl> "$foo"
"$foo"
nix-repl> "${foo}"
"strval"
nix-repl> "${2+3}"
error: cannot coerce an integer to a string, at (string):1:2
```

## Lists

Các phần tử được chia cách bởi space.

```nix
nix-repl> [ 2 "foo" true (2+3) ]
[ 2 "foo" true 5]
```

Giống như mọi thứ khác trong Nix thì lists cũng là immutable. Có thể thêm bớt phần tử nhưng sẽ tạo ra một list mới.

## Attribute sets

Attribute sets là một cấu trúc dữ liệu được sử dụng rất nhiều trong Nix. Nó giống với hash map trong các ngôn ngữ khác. Attribute sets có thể được định nghĩa bằng cách sử dụng `{}` hoặc `rec {}`:

```nix
nix-repl> { foo = 2; bar = "baz"; }
{ bar = "baz"; foo = 2; }

nix-repl> { a = 3; b = a+4; }
error: undefined variable `a' at (string):1:10

nix-repl> rec { a = 3; b = a+4; }
{ a = 3; b = 7; }
```

## If expressions

```nix
nix-repl> a = 3
nix-repl> b = 4
nix-repl> if a > b then "yes" else "no"
"no"
```

## Let expressions

```nix
nix-repl> let a = 3; b = 4; in a + b
7
```

## With expressions

Tương tự với **using** trong C++ hay **from module import** trong Python, ta có thể sử dụng `with` để truy cập các attribute trong một attribute set:

```nix
nix-repl> longName = { a = 3; b = 4; }
nix-repl> longName.a + longName.b
7
nix-repl> with longName; a + b
7
```

```nix
nix-repl> let a = 10; in with longName; a + b
14
nix-repl> let a = 10; in with longName; longName.a + b
7
```

## Laziness

Các expression trong Nix là lazy. Nó chỉ được evaluate khi cần thiết. Ví dụ:

```nix
nix-repl> let a = builtins.div 4 0; b = 6; in b
6
```

Vì a không được sử dụng nên nó không được evaluate cho nên ta không bị lỗi chia cho 0.
