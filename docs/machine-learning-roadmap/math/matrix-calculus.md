---
sidebar_position: 2
---

# Giải tích ma trận

Phần nay ta chủ yếu ôn lại cách tính và kiểm tra đạo hàm.

## 1. Đạo hàm của hàm trả về một số vô hướng

_Đạo hàm bậc nhất (first-order gradient)_ hay viết gọn là _đạo hàm (gradient)_ của một hàm số $f(\mathbf{x}): \mathbb{R}^n \to \mathbb{R}$ theo $\mathbf{x}$ được định nghĩa là:

$$
\nabla_{\mathbf{x}} f(\mathbf{x}) \triangleq
\begin{bmatrix}
\frac{\partial f(\mathbf{x})}{\partial x_1} \\
\frac{\partial f(\mathbf{x})}{\partial x_2} \\
\vdots \\
\frac{\partial f(\mathbf{x})}{\partial x_n}
\end{bmatrix}
\in \mathbb{R}^n
$$

trong đó $\frac{\partial f(\mathbf{x})}{\partial x_i}$ là _đạo hàm riêng_ của hàm số theo thành phần thứ $i$ của vector $\mathbf{x}$. Đạo hàm này được lấy khi tất cả các biến(ngoài $x_{i}$) được giả sử là hằng số.

**Đạo hàm của hàm số này là một vector có cùng chiều với vector đang được lấy đạo hàm**. Tức là nếu vector được viết ở dạng cột thì đạo hàm cũng phải được viết ở dạng cột.

_Đạo hàm bậc hai (second-order gradient)_ của hàm số trên còn được gọi là _Hessian_ được định nghĩa như sau:

$$
\nabla^2 f(\mathbf{x}) \triangleq
\begin{bmatrix}
\frac{\partial^2 f(\mathbf{x})}{\partial x_1^2} & \frac{\partial^2 f(\mathbf{x})}{\partial x_1 \partial x_2} & \cdots & \frac{\partial^2 f(\mathbf{x})}{\partial x_1 \partial x_n} \\
\frac{\partial^2 f(\mathbf{x})}{\partial x_2 \partial x_1} & \frac{\partial^2 f(\mathbf{x})}{\partial x_2^2} & \cdots & \frac{\partial^2 f(\mathbf{x})}{\partial x_2 \partial x_n} \\
\vdots & \vdots & \ddots & \vdots \\
\frac{\partial^2 f(\mathbf{x})}{\partial x_n \partial x_1} & \frac{\partial^2 f(\mathbf{x})}{\partial x_n \partial x_2} & \cdots & \frac{\partial^2 f(\mathbf{x})}{\partial x_n^2}
\end{bmatrix}
\in \mathbb{S}^n
$$

Đạo hàm cấp một hàm số $f(X) : \mathbb{R}^{n \times m} \rightarrow \mathbb{R}$ theo ma trận $\mathbf{X}$ được định nghĩa là:

$$
\nabla f(X) =
\begin{bmatrix}
\frac{\partial f(X)}{\partial x_{11}} & \frac{\partial f(X)}{\partial x_{12}} & \cdots & \frac{\partial f(X)}{\partial x_{1m}} \\
\frac{\partial f(X)}{\partial x_{21}} & \frac{\partial f(X)}{\partial x_{22}} & \cdots & \frac{\partial f(X)}{\partial x_{2m}} \\
\vdots & \vdots & \ddots & \vdots \\
\frac{\partial f(X)}{\partial x_{n1}} & \frac{\partial f(X)}{\partial x_{n2}} & \cdots & \frac{\partial f(X)}{\partial x_{nm}}
\end{bmatrix}
\in \mathbb{R}^{n \times m}
$$

là một ma trận trong $\mathbb{R}^{n \times m}$.

Cụ thể để tính đạo hàm của hàm này thì ta tính đạo hàm riêng của hàm số đó theo từng thành phần của ma trận khi **toàn bộ các thành phần khác được giả sử là hằng số**. Tiếp theo, ta sắp xếp các đạo hàm riêng tính được theo đúng thứ tự trong ma trận.

**Ví dụ:** Xét hàm số $f: \mathbb{R}^2 \to \mathbb{R}$, $f(\mathbf{x}) = x_{1}^2 + 2x_1x_2 + \sin({x_1}) + 2$

Đạo hàm bậc nhất theo $\mathbf{x}$ của hàm số đó là

$$
\nabla f(x) =
\begin{bmatrix}
\frac{\partial f(x)}{\partial x_1} \\
\frac{\partial f(x)}{\partial x_2}
\end{bmatrix} =
\begin{bmatrix}
2x_1 + 2x_2 + \cos(x_1) \\
2x_1
\end{bmatrix}
$$

Đạo hàm bậc hai theo $\mathbf{x}$, hay _Hessian_ là

$$
\nabla^2 f(x) =
\begin{bmatrix}
\frac{\partial^2 f(x)}{\partial x_1^2} & \frac{\partial^2 f(x)}{\partial x_1 \partial x_2} \\
\frac{\partial^2 f(x)}{\partial x_2 \partial x_1} & \frac{\partial^2 f(x)}{\partial x_2^2}
\end{bmatrix} =
\begin{bmatrix}
2 - \sin(x_1) & 2 \\
2 & 0
\end{bmatrix}
$$

<br/>

Chú ý rằng _Hessian_ luôn là một ma trận đối xứng.

## 2. Đạo hàm của hàm trả về một vector

Xét một hàm trả về vector với đầu vào là một số thực $v(x): \mathbb{R} \rightarrow \mathbb{R}^n$:

Đạo hàm của hàm số này theo $x$ là một vector hàng như sau:

$$
\nabla v(x) \triangleq \left[ \frac{\partial v_1(x)}{\partial x} \quad \frac{\partial v_2(x)}{\partial x} \quad \ldots \quad \frac{\partial v_n(x)}{\partial x} \right]
$$

Đạo hàm bậc hai của hàm số này có dạng:

$$
\nabla^2 v(x) \triangleq \left[ \frac{\partial^2 v_1(x)}{\partial x^2} \quad \frac{\partial^2 v_2(x)}{\partial x^2} \quad \ldots \quad \frac{\partial^2 v_n(x)}{\partial x^2} \right]
$$

<br/>

**Ví dụ:** Cho một vector $ \mathbf{a} \in \mathbb{R}^n $ và một hàm số vector-valued $ v(x) = x\mathbf{a} $, đạo hàm bậc nhất và Hessian của nó lần lượt là

$$
\begin{align}
\nabla v(x) = \mathbf{a}^T, \quad \nabla^2 v(x) = 0 \in \mathbb{R}^{n \times n}
\end{align}
$$

<br/>

Xét một hàm trả về vector với đầu vào là một vector $ h(x) : \mathbb{R}^k \rightarrow \mathbb{R}^n $, đạo hàm bậc nhất của nó là

$$
\begin{align}
\nabla h(x) \triangleq
\begin{bmatrix}
\frac{\partial h_1(x)}{\partial x_1} & \frac{\partial h_2(x)}{\partial x_1} & \cdots & \frac{\partial h_n(x)}{\partial x_1} \\
\frac{\partial h_1(x)}{\partial x_2} & \frac{\partial h_2(x)}{\partial x_2} & \cdots & \frac{\partial h_n(x)}{\partial x_2} \\
\vdots & \vdots & \ddots & \vdots \\
\frac{\partial h_1(x)}{\partial x_k} & \frac{\partial h_2(x)}{\partial x_k} & \cdots & \frac{\partial h_n(x)}{\partial x_k}
\end{bmatrix}
= \left[ \nabla h_1(x) \space \nabla h_2(x) \space \cdots \space \nabla h_n(x) \right] \in \mathbb{R}^{k \times n}
\end{align}
$$

<br />

**Nếu một hàm số $ g : \mathbb{R}^m \rightarrow \mathbb{R}^n $, thì đạo hàm của nó là một ma trận thuộc $ \mathbb{R}^{m \times n} $**

Đạo hàm bậc hai của hàm số trên là một mảng ba chiều, chúng ta sẽ không nhắc đến ở đây.

Trường hợp đặc biệt đạo hàm của hàm số thường gặp, chúng ta cần biết hai tính chất quan trọng khác thường liên quan đến đạo hàm của một biến.

## 3. Tính chất quan trọng của đạo hàm

### 3.1. Quy tắc tích (Product rule)

Đề cho tổng quát, ta giả sử biến đầu vào là một ma trận. Giả sử rằng các hàm số có chiều phù hợp để các phép nhân ma trận thực hiện được. Ta có:

$$
\nabla (f(X)^T g(X)) = (\nabla f(X)) g(X) + (\nabla g(X)) f(X)
$$

<br/>

Biểu thức nâng niu hơn thực chứng ta đã quen thuộc:

$$
(f(x) g(x))^T = f^T(x) g(x) + g^T(x) f(x)
$$

<br/>

Chú ý rằng tích của vector và ma trận, ta không được sử dụng tính chất giao hoán.

### 3.2. Quy tắc chuỗi (Chain rule)

Khi có các hàm hợp thì

$$
\nabla_{X}g(f(X)) = (\nabla_X f)^T (\nabla_{f}g)
$$

Quy tắc này cũng giống với quy tắc trong hàm một biến:

<!--(g \circ f(x))' = f'(x) g'(f)-->

$$
(g(f(x)))' = f'(x) g'(f)
$$

Một lưu ý nhỏ nhưng quan trọng khi làm việc với tích các ma trận là sự phù hợp về kích
thước của các ma trận trong tích.

## 4. Đạo hàm của các hàm số thường gặp

| $f(x)$                          | $\nabla f(x)$              | $f(X)$                                          | $\nabla_X f(X)$          |
| ------------------------------- | -------------------------- | ----------------------------------------------- | ------------------------ |
| $\mathbf{x}$                    | $\mathbf{I}$               | $\operatorname{trace}(\mathbf{X})$              | $\mathbf{I}$             |
| $\mathbf{a^Tx}$                 | $\mathbf{a}$               | $\operatorname{trace}(\mathbf{A^TX})$           | $\mathbf{A}$             |
| $\mathbf{x^TAx}$                | $\mathbf{(A+A^T)x}$        | $\operatorname{trace}(\mathbf{X^TAX})$          | $\mathbf{(A+A^T)X}$      |
| $\mathbf{x^Tx=\|\|x\|\|^2_{2}}$ | $\mathbf{2x}$              | $\operatorname{trace}(\mathbf{X^TX=\|X\|^2_F})$ | $\mathbf{2X}$            |
| $\mathbf{\|Ax - b\|^2_2}$       | $\mathbf{2A^T (Ax - b)}$   | $\operatorname{trace}(\mathbf{\|AX - B\|^2_F})$ | $\mathbf{2A^T (AX - B)}$ |
| $\mathbf{a^T x x^T b}$          | $\mathbf{(ab^T + ba^T) x}$ | $\operatorname{trace}(\mathbf{A^T X B})$        | $\mathbf{AB^T}$          |

## 5. Kiểm tra đạo hàm

### 5.1. Xấp xỉ đạo hàm của hàm một biến

Theo định nghĩa,

$$
f'(x) = \lim_{\epsilon \to 0} \frac{f(x + \epsilon) - f(x)}{\epsilon}
$$

<br />

Một cách thường được sử dụng là lấy một giá trị $\epsilon$ rất nhỏ, ví dụ $10^{-6}$, và sử dụng công thức:

$$
f'(x) \approx \frac{f(x + \epsilon) - f(x - \epsilon)}{2\epsilon}
$$

<br />

Cách tính này được gọi là $\textit{numerical gradient}$. Có hai cách giải thích cho công thức này, hãy xem sách của a Tiệp để hiểu hơn.

### 5.2. Kiểm tra đạo hàm với python

```python
from __future__ import print_function
import numpy as np

def check_grad(fn, gr, X):
  X_flat = X.reshape(-1) # convert X to an 1d array -> 1 for loop needed
  shape_X = X.shape # original shape of X
  num_grad = np.zeros_like(X) # numerical grad, shape = shape of X
  grad_flat = np.zeros_like(X_flat) # 1d version of grad
  eps = 1e-6 # a small number, 1e-10 -> 1e-6 is usually good
  numElems = X_flat.shape[0] # number of elements in X

  # calculate numerical gradient
  for i in range(numElems): # iterate over all elements of X
    Xp_flat = X_flat.copy()
    Xn_flat = X_flat.copy()
    Xp_flat[i] += eps
    Xn_flat[i] -= eps
    Xp = Xp_flat.reshape(shape_X)
    Xn = Xn_flat.reshape(shape_X)
    grad_flat[i] = (fn(Xp) - fn(Xn))/(2*eps)

  num_grad = grad_flat.reshape(shape_X)

  diff = np.linalg.norm(num_grad - gr(X))
  print(’Difference between two methods should be small:’, diff)

# ==== check if grad(trace(A*X)) == A^T ====
m, n = 10, 20
A = np.random.rand(m, n)
X = np.random.rand(n, m)

def fn1(X):
  return np.trace(A.dot(X))

def gr1(X):
  return A.T

check_grad(fn1, gr1, X)
# ==== check if grad(x^T*A*x) == (A + A^T)*x ====
A = np.random.rand(m, m)
x = np.random.rand(m, 1)

def fn2(x):
  return x.T.dot(A).dot(x)

def gr2(x):
  return (A + A.T).dot(x)

check_grad(fn2, gr2, x)
```

Kết quả:

```bash
Difference between two methods should be small: 2.02303323394e-08
Difference between two methods should be small: 2.10853872281e-09
```
