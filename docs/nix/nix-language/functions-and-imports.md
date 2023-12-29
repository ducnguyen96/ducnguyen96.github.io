---
sidebar_label: Functions and Imports
---

# Functions and Imports

## Nameless and single parameter

Functions trong Nix là anonymous (lambdas), và chỉ có thể có 1 tham số.

```bash
nix-repl> x: x*2
«lambda»
```

Ta có thể store function này vào một biến:

```bash
nix-repl> double = x: x*2
nix-repl> double
«lambda»
nix-repl> double 3
6
```

## Multiple parameters

```bash
nix-repl> mul = a: (b: a*b)
nix-repl> mul
«lambda»
nix-repl> mul 3
«lambda»
nix-repl> (mul 3) 4
12
```

Chúng ta có thể bỏ qua dấu ngoặc:

```bash
nix-repl> mul = a: b: a*b
nix-repl> mul
«lambda»
nix-repl> mul 3
«lambda»
nix-repl> mul 3 4
12
nix-repl> mul (6+7) (8+9)
221
```

## Argument set

```bash
nix-repl> mul = s: s.a*s.b
nix-repl> mul { a = 3; b = 4; }
12
nix-repl> mul = { a, b }: a*b
nix-repl> mul { a = 3; b = 4; }
12
```

## Default and variadic attributes

### Default values

```bash
nix-repl> mul = { a, b ? 2 }: a*b
nix-repl> mul { a = 3; }
6
nix-repl> mul { a = 3; b = 4; }
12
```

### Passing more attributes than expected

```bash
nix-repl> mul = s@{ a, b, ... }: a*b*s.c
nix-repl> mul { a = 3; b = 4; c = 2; }
24
```

## Imports

`a.nix`

```bash
3
```

`b.nix`

```bash
4
```

`mul.nix`

```bash
a: b: a*b
```

```bash
nix-repl> a = import ./a.nix
nix-repl> b = import ./b.nix
nix-repl> mul = import ./mul.nix
nix-repl> mul a b
12
```

File sẽ được parsed thành expression. Tuy nhiên cần lưu ý rằng scope của các file được import sẽ không thừa kế scope của file import nó.

`test.nix`

```bash
x
```

```bash
nix-repl> let x = 5; in import ./test.nix
error: undefined variable `x' at /home/lethal/test.nix:1:1
```

Vậy thì ta có thể truyền thông tin vào module?
`test.nix`

```bash
{ a, b ? 3, trueMsg ? "yes", falseMsg ? "no" }:
if a > b
  then builtins.trace trueMsg true
  else builtins.trace falseMsg false
```

Ở đây ta truyền `{ a = 5; trueMsg = "ok"; }` như một argument vào module `test.nix`:

```bash
nix-repl> import ./test.nix { a = 5; trueMsg = "ok"; }
trace: ok
true
```
