---
sidebar_position: 3
---

# Maximum Likelihood và Maximum A Posteriori

Phần này mình tìm hiểu 2 cách ước lượng tham số thường được dùng trong các mô hình machine learning thống kê.

## 1. Giới thiệu

- Có rất nhiều mô hình machine learning được xây dựng dựa trên các mô hình thống kê.
- Ký hiệu $\theta$ là tập hợp tất cả các tham số của mô hình đó.
- Learning là quá trình **estimate** bộ tham số $\theta$ sao cho mô hình tìm được khớp với phân phối của dữ liệu nhất.

| Maximum Likelihood estimation(ML estimation) - MLE | Maximum A Posteriori estimation(MAP estimation) - MAP                                                                                                       |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| - Dựa trên dữ liệu đã biết trong tập training.     | - + những thông tin có được bằng **cảm quan** của người xây dựng mô hình, cảm quan càng rõ ràng, càng hợp lý thì khả năng thu được bộ tham số tốt càng cao. |

## 2. Maximum Likelihood estimation(ML estimation) - MLE

Giả sử có các điểm dữ liệu $\mathbf{x_1,x_2,...,x_N}$. Giả sử thêm rằng ta đã biết các điểm dữ liệu này tuân theo một phân phối nào đó được mô tả bởi bộ tham số $\theta$.

MLE là việc đi tìm bộ tham số $\theta$ sao cho xác suất sau đây đạt giá trị lớn nhất:

$$
\theta = \max_{\theta}{p(\mathbf{x_1,...x_N}|\theta)}
$$

### 2.1. Log-likelihook

Việc giải bài trực tiếp bài toán đi tìm mô hình xác suất đồng thời cho toàn bộ dữ liệu là ít khả thi nên ta sẽ tiếp cận bằng cách tìm xấp xỉ likelihood(giả sử rằng các điểm dữ liệu $\mathbf{x}_n$ là độc lập với nhau):

$$
p(\mathbf{x}_1,...\mathbf{x}_N|\theta) \approx \prod_{n=1}^N p(\mathbf{x}_n | \theta)
$$

Việc tối ưu một tích thường phức tạp hơn việc tối ưu một tổng nên ta chuyển về dạng sau:

$$
\theta = \max_\theta\displaystyle\sum_{n=1}^N \log(p(\mathbf{x}_n)|\theta)
$$

<br/>

\* $\log$ của một tích bằng tổng các $\log$ và vì $\log$ là một hàm đồng biến, một biểu thức dương sẽ là lớn nhất nếu $\log$ của nó là lớn nhất và ngược lại.

**Ví dụ:** Xem thêm [ở đây](https://github.com/tiepvupsu/tiepvupsu.github.io/blob/master/ML_math.pdf)

## 3. Maximum A Posteriori estimation(MAP estimation) - MAP

Khi tập training nhỏ thì việc ước lượng theo MLE là không đáng tin và nhiều khả năng đã bị overfitting. MAP ra đời nhằm giải quyết vấn đề này.

Trong MAP, ta giới thiệu một giả thiết biết trước được gọi là **prior** của tham số $\theta$, ta có hàm mục tiêu như sau:

$$
\theta = \arg\max_{\theta} p(\theta \mid \mathbf{x}_1, \dots, \mathbf{x}_N)
$$

### Định lý Bayes

$$
P(A|B) = \frac{P(B|A)P(A)}{P(B)} = \frac{likelihood * prior}{normalizing\_constant}
$$

Áp dụng vào công thức trên ta được

$$
\theta = \arg\max_{\theta} \lbrack \frac{p(\mathbf{x}_1, \dots, \mathbf{x}_N|\theta)p(\theta)}{p(\mathbf{x}_1, \dots, \mathbf{x}_N)} \rbrack \\
= \arg\max_{\theta}\lbrack p(\mathbf{x}_1, \dots, \mathbf{x}_N|\theta)p(\theta) \rbrack \\
= \arg\max_{\theta}\lbrack \prod_{i=1}^N p(\mathbf{x}_i | \theta) p(\theta) \rbrack
$$

Như vậy, điểm khác biệt lớn nhất giữa hai bài toán tối ưu MLE và MAP là việc hàm mục tiêu của MAP có thêm $p(\theta)$l, tức phân phối của $\theta$. Phân phối này chính là những thông tin ta biết trước về $\theta$ và được gọi là $prior$.

## 4. Áp dụng cho bài toán tung đồng xu

Tung đồng xu $N$ lần có $n$ lần nhận được mặt $head$ và $m = N-n$ lần nhận được mặt $tail$.

### 4.1. Sử dụng MLE

Vì đây là một xác suất của biến ngẫu nhiên nhị phân rời rạc, ta có thể nhận thấy việc nhận được mặt $head$ hay $tail$ khi tung đồng xu tuân theo phân phối Bernoulli:

$$
p(x_i | \lambda) = \lambda^{x_i} (1 - \lambda)^{1 - x_i}
$$

Khi đó tham số mô hình $\lambda$ có thể được ước lượng bằng việc giải bài toán tối ưu sau:

$$
\begin{align*}
\lambda &= \arg\max_{\lambda} \left[ p(x_1, x_2, \dots, x_N \mid \lambda) \right] = \arg\max_{\lambda} \left[ \prod_{i=1}^N p(x_i \mid \lambda) \right] \\
&= \arg\max_{\lambda} \left[ \prod_{i=1}^N \lambda^{x_i} (1 - \lambda)^{1 - x_i} \right] = \arg\max_{\lambda} \left[ \lambda^{\sum_{i=1}^N x_i} (1 - \lambda)^{N - \sum_{i=1}^N x_i} \right] \\
&= \arg\max_{\lambda} \left[ \lambda^n (1 - \lambda)^m \right] = \arg\max_{\lambda} \left[ n \log(\lambda) + m \log(1 - \lambda) \right]
\end{align*}
$$

Tới đây, bài toán tối ưu có thể được giải bằng cách lấy đạo hàm của hàm mục tiêu bằng 0. Tức $\lambda$ là nghiệm của phương trình

$$
\frac{n}{\lambda} - \frac{m}{1 - \lambda} = 0 \iff \frac{n}{\lambda} = \frac{m}{1 - \lambda} \iff \lambda = \frac{n}{n + m} = \frac{n}{N}
$$

### 4.2. Sử dụng MAP

Nhận thấy rằng phân phối Beta có cùng $họ$ với phân phối Bernoulli. Ta sẽ sử dụng MAP với prior là một Beta$[\alpha,\beta]$, được gọi là siêu tham số (hyperparameters).

Tối ưu MAP:

$$
\begin{align*}
\lambda &= \arg\max_{\lambda} \left[ p(x_1, \dots, x_N \mid \lambda) \right] \\
&= \arg\max_{\lambda} \left[ \left( \prod_{i=1}^N \lambda^{x_i} (1 - \lambda)^{1 - x_i} \right) \lambda^{\alpha - 1} (1 - \lambda)^{\beta - 1} \right] \\
&= \arg\max_{\lambda} \left[ \left( \lambda^{\sum_{i=1}^N x_i + \alpha - 1} \right) (1 - \lambda)^{\left( N - \sum_{i=1}^N x_i + \beta - 1 \right)} \right] \\
&= \arg\max_{\lambda} \left[ \lambda^{n+\alpha-1}(1-\lambda)^{m+\beta-1} \right]
\end{align*}
$$

Tương tự như MLE thì ta lấy log và lấy đạo hàm của hàm mục tiêu, ta được nghiệm:

$$
\lambda = \frac{n+\alpha-1}{N+\alpha+\beta-2}
$$

Việc còn lại là chọn $\alpha$ và $\beta$

import Hyperparameters from "./hyperparameters.png"

<div style={{textAlign: 'center'}}>
  <img src={Hyperparameters} height="300"/>
</div>

Nếu ta chọn $\alpha = \beta = 1$, ta nhận được phân phối đều vì đồ thị hàm mật độ xác suất là một
đường thẳng. Lúc này, xác suất của $\lambda$ tại mọi vị trí trong khoảng [0, 1] là như nhau và thay vào công thức trên ta được $\lambda = n/N$

Nếu chọn $\alpha = \beta = 2$ ta sẽ thu được $\lambda = \frac{n+1}{N+2}$. Chẳng hạn khi $N=5$ và $n=1$ như trong hình. MLE cho kết quả $\lambda=1/5$, MAP sẽ cho kết quả $\lambda=2/7$, gần với $1/2$ hơn.

## 5. MAP giúp tránh overfitting

Việc chọn các hyperparameter thường được dựa trên thực nghiệm, chẳng hạn bằng cross-
validation. Việc thử nhiều bộ tham số rồi chọn ra bộ tốt nhất là việc mà các kỹ sư machine
learning thường xuyên phải đối mặt. Cũng giống như việc chọn regularization parameter để
tránh overfitting vậy.

Nếu viết lại bài toán MAP dưới dạng:

$$
\begin{align*}
\theta &= \arg\max_{\theta} p(X|\theta)p(\theta) \\

&= \arg\max_{\theta} \left[ \log p(X|\theta) + \log p(\theta) \right]

\end{align*}
$$

Ta có thể thấy rằng hàm mục tiêu có dạng $\mathcal{L}(\theta) + \lambda\mathcal{R}(\theta)$ giống như trong regularization, với hàm log-likelihood đóng vai trò như hàm mất mát $\mathcal{L}(\theta)$, và log của prior đóng vai trò như hàm $\lambda\mathcal{R}(\theta)$. Ta có thể nói rằng, MAP chính là một phương pháp giúp tránh overfitting trong các mô hình machine learning thống kê.
