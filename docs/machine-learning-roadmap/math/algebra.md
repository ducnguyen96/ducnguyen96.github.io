---
sidebar_position: 1
---

# Đại số tuyến tính

Kiến thức dưới đây là mình giản lược lại từ cuốn sách của a Tiệp, các bạn có thể tham khảo thêm [ở đây](https://github.com/tiepvupsu/tiepvupsu.github.io/blob/master/ML_math.pdf).

## 1. Ôn tập đại số tuyến tính

### 1.1. Chuyển vị

Cho $\mathbf{A} \in \mathbb{R}^{m \times n}$, ta nói $\mathbf{B} \in \mathbb{R}^{n \times m}$ là chuyển vị của $\mathbf{A}$ nếu $b_{ij} = a_{ji}, \space \forall 1 \leq i \leq n, 1 \leq j \leq m$

$$
\mathbf{x} =
\begin{bmatrix}
x_1 \\
x_2 \\
\vdots \\
x_m
\end{bmatrix}
\Rightarrow \mathbf{x}^T =
\begin{bmatrix}
x_1 x_2 \dots & x_m
\end{bmatrix}
$$

<br/>

$$
\mathbf{A} =
\begin{bmatrix}
a_{11} & a_{12} & \dots & a_{1n} \\
a_{21} & a_{22} & \dots & a_{2n} \\
\vdots & \vdots & \ddots & \vdots \\
a_{m1} & a_{m2} & \dots & a_{mn}
\end{bmatrix}
\Rightarrow
\mathbf{A}^T =
\begin{bmatrix}
a_{11} & a_{21} & \dots & a_{m1} \\
a_{12} & a_{22} & \dots & a_{m2} \\
\vdots & \vdots & \ddots & \vdots \\
a_{1n} & a_{2n} & \dots & a_{mn}
\end{bmatrix}
$$

<br/>

Một cách ngắn gọn, chuyển vị của một ma trận là một ma trận nhận được từ ma trận cũ
thông qua phép phản xạ gương qua đường chéo chính của ma trận ban đầu.

### 1.2. Phép nhân 2 ma trận

Cho $\mathbf{A} \in \mathbb{R}^{m \times n}$, $\mathbf{B} \in \mathbb{R}^{n \times p}$, tích của hai ma trận được ký hiệu là $\mathbf{C} = \mathbf{AB} \in \mathbb{R}^{m \times p}$
trong đó phần tử ở hàng thứ $\textit{i}$, cột thứ $\textit{j}$ của ma trận kết quả được tính bởi.

$$
c_{ij} = \sum_{k=1}^{n} a_{ik} b_{kj}, \quad \forall \, 1 \leq i \leq m, \, 1 \leq j \leq p
$$

Một vài tính chất của phép nhân hai ma trận:

1. Không có tính chất giao hoán: $\mathbf{AB} \neq \mathbf{BA}$
2. Có tính chất kết hợp: $\mathbf{ABC} = \mathbf{(AB)C} = \mathbf{A(BC)}$
3. Có tính chất phân phối với phép cộng: $\mathbf{A(B+C)} = \mathbf{AB + BC}$
4. Chuyển vị một tích bằng tích chuyển vị theo thứ tự ngược lại: $\mathbf{(AB)^T = B^TA^T}$

Phép nhân của một ma trận $\mathbf{A} \in \mathbb{R}^{m \times n}$ với một vector $\mathbf{x} \in \mathbb{R}^{n}$ là một vector $\mathbf{b} \in \mathbb{R}^{m}$:

$$
\mathbf{Ax=b} \space với b_{i} = \mathbf{A}_{:,i}\mathbf{x}
$$

với $\mathbf{A}_{:,i}$ là vector hàng thứ $i$ của $\mathbf{A}$

Phép nhân Hadamand (element-wise) của <ins><b>2 ma trận cùng kích thước</b></ins> $\mathbf{A,B} \in \mathbb{R}^{m \times n}$ ký hiệu là $\mathbf{C = A \odot B} \in \mathbb{R}^{m \times n}$, trong đó:

$$
c_{ij} = a_{ij}b_{ij}
$$

### 1.3. Ma trận đơn vị và ma trận nghịch đảo

#### 1.3.1. Ma trận đơn vị

Ma trận đơn vị(Identity matrix) ký hiệu là $\mathbf{I}$ là ma trận đặc biệt có các phần tử trên đường chéo chính là 1 còn lại là 0.

Dưới đây là ma trận đơn vị bậc 3 và bậc 4.

$$
\mathbf{I}_{3} =
\begin{bmatrix}
1 & 0 & 0 \\
0 & 1 & 0 \\
0 & 0 & 1
\end{bmatrix}

,\space

\mathbf{I}_{4} =
\begin{bmatrix}
1 & 0 & 0 & 0 \\
0 & 1 & 0 & 0 \\
0 & 0 & 1 & 0 \\
0 & 0 & 0 & 1
\end{bmatrix}
$$

Tính chất:

- Nếu $\mathbf{A} \in \mathbb{R}^{m \times n}$, $\mathbf{B} \in \mathbb{R}^{n \times m}$ và $\mathbf{I}$ là một ma trận đơn vị bậc $n$ thì ta có $\mathbf{AI=A}$ và $\mathbf{IB=B}$
- Với mọi vector $\mathbf{x} \in \mathbb{R}^{n}$, ta có $\mathbf{I}_{n}\mathbf{x}=\mathbf{x}$

#### 1.3.2. Ma trận nghịch đảo

Cho ma trận vuông $\mathbf{A} \in \mathbb{R}^{n \times n}$ nếu tồn tại $\mathbf{B} \in \mathbb{R}^{n \times n}$ sao cho $\mathbf{AB}=\mathbf{I}_{n}$ thì ta gọi $\mathbf{A}$ là ma trận khả nghịch và $\mathbf{B}$ là ma trận nghich đảo của $\mathbf{A}$.

Nếu $\mathbf{A}$ khả nghịch thì ma trận nghịch đảo của $\mathbf{A}$ thường được ký hiệu là $\mathbf{A}^{-1}$

Tính chất:

$$
\mathbf{A^{-1}A=AA^{-1}=I}
$$

Áp dụng giải phương trình tuyến tính:

$$
\mathbf{Ax=b}
$$

có nghiệm duy nhất $\mathbf{x=A^{-1}b}$

### 1.4. Một vài ma trận đặc biệt khác

#### 1.4.1. Ma trận đường chéo

Là ma trận chỉ có các phần tử trên đường chéo chính là khác 0.

Ví dụ:

$$
\begin{bmatrix}
1
\end{bmatrix}
\space,\space

\begin{bmatrix}
2 & 0 \\
0 & 0
\end{bmatrix}
\space,\space

\begin{bmatrix}
1 & 0 & 0 \\
0 & 2 & 0
\end{bmatrix}
\space,\space

\begin{bmatrix}
-1 & 0 \\
0 & 2 \\
0 & 0
\end{bmatrix}
$$

Tính chất:

- Tích, tổng của hai ma trận đường chéo vuông cùng bậc là một ma trận đường chéo.
- Một ma trận đường chéo vuông là khả nghịch nếu và chỉ nếu mọi phần tử trên đường chéo chính
  là khác không.
- Nghịch đảo của một ma trận đường chéo khả nghịch cũng là một ma trận đường chéo.

#### 1.4.2. Ma trận tam giác

Một ma trận <ins><b>vuông</b></ins> được gọi là ma trận tam giác <ins>trên</ins> nếu các phần tử nằm <ins>dưới</ins> đường chéo chính của nó bằng 0, tưởng tự với ma trận tam giác dưới.

Các hệ phương trình tuyến tính mà ma trận hệ số có dạng tam giác thường được quan tâm
vì chúng có thể được giải với chi phí tính toán thấp.

$$
\left\{
\begin{array}{ccccccccc}
a_{11}x_1 & + & a_{12}x_2 & + & \cdots & + & a_{1,n-1}x_{n-1} & + & a_{1n}x_n = b_1 \\
          &   & a_{22}x_2 & + & \cdots & + & a_{2,n-1}x_{n-1} & + & a_{2n}x_n = b_2 \\
          &   &           &   & \ddots &   & \vdots           &   & \vdots \\
          &   &           &   &        &   & a_{n-1,n-1}x_{n-1} & + & a_{n-1,n}x_n = b_{n-1} \\
          &   &           &   &        &   &                   &   & a_{nn}x_n = b_n
\end{array}
\right.
$$

Nhận thấy rằng phương trình này có thể giải mà không cần tính ma trận nghịch đảo $\mathbf{A^{-1}}$ (quá trình tính ma trận nghịch đảo thường tốn khá nhiều thời gian), thay vào đó, ta có thể giải $x_{n}$ dựa vào phương trình cuối cùng. Sau khi có $x_{n}$, ta có thể thay nó vào phương trình gần cuối để suy ra $x_{n-1}$. Tiếp tục quá trình này, ta sẽ có nghiệm cuối cùng $\mathbf{x}$. Quá trình này gọi là _back substitution_. Tương tự đối với ma trận tam giác dưới thì ta gọi là _forward substitution_.

### 1.14. Chuẩn của vector và ma trận

Việc đo khoảng cách giữa hai điểm dữ liệu nhiều chiều, tức hai vector, là rất cần thiết trong
Machine Learning. Và đó chính là lý do mà khái niệm **chuẩn (norm)** ra đời. Để xác định
khoảng cách giữa hai vector $\mathbf{y}$ và $\mathbf{z}$, người ta thường áp dụng một hàm số lên vector hiệu $\mathbf{x = y − z}$. Hàm số này cần có một vài tính chất đặc biệt.

import NormGraph from "./norm_graph.png"

<div style={{textAlign: 'center'}}>
  <img src={NormGraph} height="300"/>
Minh họa $l_{1}$ norm và $l_{2}$ norm trong không gian hai chiều. $l_{2}$ norm chính là khoảng cách giữa hai điểm trong mặt phẳng. Trong khi đó $l_{1}$ norm là quãng đường ngắn nhất giữa hai điểm nếu chỉ được đi theo các đường song song với các trục toạ độ.
</div>

<ins><b>Định nghĩa:</b></ins>

Một hàm số $f: \mathbb{R}^n \to \mathbb{R}$ được gọi là một norm nếu nó thỏa mãn ba điều kiện sau đây:

1. $f(\mathbf{x}) \geq 0.$ Dấu bằng xảy ra $\Leftrightarrow \mathbf{x} = \mathbf{0}.$
2. $f(\alpha \mathbf{x}) = |\alpha| f(\mathbf{x}), \quad \forall \alpha \in \mathbb{R}.$
3. $f(\mathbf{x}_1) + f(\mathbf{x}_2) \geq f(\mathbf{x}_1 + \mathbf{x}_2), \quad \forall \mathbf{x}_1, \mathbf{x}_2 \in \mathbb{R}^n$

#### 1.14.1. Một số chuẩn vector thường dùng

Độ dài Euclid của một vector $\mathbf{x} \in \mathbb{R}^{n}$ chính là một norm, norm này được gọi là ${l}_{2}$ norm hoặc
Euclidean norm:

$$
||x||_{2} = \sqrt{x_1^2 + x_2^2  + \dots + x_n^2}
$$

Bình phương của $l_2$ norm chính là tích vô hướng của một vector với chính nó $||x||_{2}^2 = \mathbf{x^Tx}$

Với $p$ **là một số không nhỏ hơn 1** bất kỳ, hàm số:

$$
||x||_{p} = (x_1^p + x_2^p  + \dots + x_n^p)^\frac{1}{p}
$$

<br/>
được chứng minh thỏa mãn ba điều kiện của norm thì được gọi là $l_p$ norm.

Có một vài giá trị của $p$ thường được dùng:

1. Khi $p=2$ chúng ta có $l_2$ norm như ở trên.
2. Khi $p=1$ ta có $l_1$ norm là tổng các giá trị tuyệt đối của từng phẩn tử của $\mathbf{x}$.
3. Khi $p\to\infty$, giả sử $i=\argmax_{i=1,2,...,n}|x_{j}|$, khi đó norm $l_{\infty}$ chính bằng $|x_{i}|$

#### 1.14.2. Chuẩn Frobenius của ma trận

Với một ma trận $\mathbf{A} \in \mathbb{R}^{m \times n}$, chuẩn thường được dùng nhất là chuẩn Frobenius, ký hiệu là $||\mathbf{A}||_{F}$ là căn bậc 2 của tổng bình phương tất cả các phần tử của ma trận đó.

$$
||\mathbf{A}||_{F}= \sqrt{\displaystyle\sum_{i=1}^m\displaystyle\sum_{j=1}^n a_{ij}^2}
$$

Chú ý rằng $l_2$ norm $||\mathbf{A}||_2$ là một nỏm khác của ma trận, không phổ biến bằng Frobenius norm.
