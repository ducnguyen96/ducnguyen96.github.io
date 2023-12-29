---
sidebar_label: Garbage Collection
---

# Garbage Collection

Các `nix-env` operations chẳng hạn như upgrade (`-u`) và uninstall (`-e`) không bao giờ xóa các packages khỏi hệ thống mà là tạo ra một user environment mới không chứa các symlinks tới các packages đã bị “xóa”.

Tất nhiên vì dung lượng bộ nhớ của ổ đĩa có hạn nên các packages không được sử dụng nữa sẽ bị xóa. Bạn có thể làm điều này bằng cách chạy garbage collector của Nix. Nó sẽ xóa các packages không được sử dụng (trực tiếp hoặc gián tiếp) bởi bất kì generation nào của bất kì profile nào.

Tuy nhiên nếu có bất cứ generation nào tham chiếu tới một package, nó sẽ không bị xóa. Vì vậy để garbage collector có hiệu quả, bạn cũng nên xóa (một số) generation cũ. Tất nhiên, điều này chỉ nên được thực hiện nếu bạn chắc chắn rằng bạn sẽ không cần rollback.

Để xóa tất cả các generation cũ của profile hiện tại:

```bash
nix-env --delete-generations old
```

Hoặc bạn cũng có thể xóa generations bất kỳ:

```bash
nix-env --delete-generations 10 11 14
```

Để xóa generations cũ hơn 14 ngày(trừ generation đang dùng):

```bash
nix-env --delete-generations 14d
```

Sau khi đã xóa generations thì bạn có thể chạy garbage collector:

```bash
nix-store --gc
```

Ở command này thì có 2 options có ảnh hưởng là `keep-derivations` (default: true) and `keep-outputs` (default: false).

`keep-derivations`: Derivations that are build-time dependencies of garbage collector roots: deravations ở đây có thể hiểu là các instructions hoặc informations để define nên các packages cần trong quá trình build các root packages hoặc các packages cần thiết.

`keep-outputs`: Output paths that are runtime dependencies: các output paths ở đây có thể hiểu là các file, thư mục, symlink, ... được tạo ra trong quá trình build các root packages hoặc các packages cần thiết.

Thông thường thì bạn sẽ muốn dùng các giá trị default của 2 options này. Tuy nhiên nếu bạn đang develop một package thì bạn có thể sẽ muốn sử dụng giá trị khác để có thể build lại package đó nhanh hơn.

Nếu bạn cảm thấy không chắc chắn, bạn có thể xem trước các file sẽ bị xóa:

```bash
nix-store --gc --print-dead
```

Tương tự thì `--print-live` sẽ in ra các file sẽ được giữ lại.

Ngoài ra thì có một utility khác là `nix-collect-garbage` có thể được dùng để chạy garbage collector và xóa các generations cũ. Khi sử dụng với `-d`(`--delete-old`) thì sẽ xóa tất cả các generations cũ của tất cả các profiles trong `/nix/var/nix/profiles`.

```bash
nix-collect-garbage -d
```
