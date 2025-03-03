---
sidebar_position: 3
---

Phần này mình ôn lại cách tính xác suất, phương sai và một số phân phối thường gặp.

# Ôn tập xác suất

## 1. Xác suất

### 1.1. Biến ngẫu nhiên (random variables)

- Là một đại lượng dùng để đo những đại lượng không xác định.
- Có thể được dùng để ký hiệu kết quả đầu ra của một thí nghiệm.
- Thông tin về các kết quả của thí nghiệm được đo bởi một **phân phối xác suất** được biểu diễn bằng một hàm $p(x)$.
- Có thể là rời rạc hoặc liên tục.

#### 1.1.1. Biến ngẫu nhiên rời rạc

- Lấy giá trị trong một tập hợp các điểm rời rạc cho trước (tung đồng xu -> sấp và ngửa).
- Có thể có thứ tự (khi tung xúc xắc) hoặc không có thứ tự (giá trị nắng, mưa, bão).
- Mỗi đầu ra có một giá trị xác suất tương ứng, không âm và có tổng bằng 1.

#### 1.1.2. Biến ngẫn nhiên liên tục

- Lấy các giá trị là các số thực, có thể hữu hạn(thời gian làm bài thi) hoặc vô hạn(thời gian chờ khách tiếp theo).
- Theo lý thuyết thì xác suất đầu ra bằng chính xác một giá trị nào đó là bằng 0, nhưng xác suất đầu ra rơi vào 1 khoảng giá trị nào đó là khác 0.
- Được miêu tả bởi hàm mật độ xác suất, luôn dương và tích phân trên toàn miền giá trị bằng 1.

### 1.2. Xác suất đồng thời

Xác suất đồng thời của $x$ và $y$ được ký hiệu là $p(x,y)$ là xác suất đồng thời xảy ra $x$ và $y$. $x$ và $y$ có thể cùng rời rạc, liên tục hoặc một 1 rời rạc 1 liên tục.

Một số tính chất:

- Cả $x$ và $y$ là rời rạc: $\displaystyle\sum_{x,y}p(x,y) = 1$
- Cả $x$ và $y$ là liên tục: $\int{p(x,y)dxdy} = 1$
- $x$ rời rạc, $y$ liên tục: $\displaystyle\sum_{x}\int{p(x,y)dy} = \int{(\displaystyle\sum_{x}p(x,y))}dy = 1$

### 1.3. Xác suất biên

Nếu biết xác suất đồng thời của nhiều biến ngẫu nhiên, ta cũng có thể xác định được phân
phối xác suất của từng biến bằng cách lấy tổng với biến ngẫu nhiên rời rạc hoặc tích phân
với biến ngẫu nhiên liên tục theo tất cả các biến còn lại:

Nếu $x,y$ rời rạc: $p(x) = \displaystyle\sum_{y}p(x,y); \quad p(y) = \displaystyle\sum_{x}p(x,y)$

Nếu $x,y$ liên tục: $p(x) = \int{p(x,y)dy}; \quad p(y) = \int{p(x,y)dx}$

Với nhiều biến hơn, chẳng hạn bốn biến rời rạc $x, y, z, w$, cách tính được thực hiện tương tự:

$$
p(x) = \displaystyle\sum_{y,z,w}p(x,y,z,w)
$$

<br/>

$$
p(x,y) = \displaystyle\sum_{z,w}p(x,y,z,w)
$$

Cách xác định xác suất của một biến dựa trên xác suất đồng thời của nó với các biến khác
được gọi là **marginalization**.

### 1.4. Xác suất có điều kiện

Xác suất để một biến ngẫu nhiên $x$ nhận được một giá trị nào đó biết rằng biến ngẫn nhiên $y$ có giá trị $y^*$ được gọi là xác suất có điều kiện, được ký hiệu là $p(x|y=y^*)$

Công thức:

$$
p(x|y) = \frac{p(x,y)}{p(y)}; \quad p(y|x) = \frac{p(y,x)}{p(x)}
$$

Từ đó ta có:

$$
p(x, y) = p(x|y)p(y) = p(y|x)p(x)
$$

Hay:

$$
\begin{aligned}
p(y|x) = \frac{p(x|y)p(y)}{p(x)} \\
= \frac{p(x|y)p(y)}{\displaystyle\sum_y{p(x,y)}} \\
= \frac{p(x|y)p(y)}{\displaystyle\sum_y{p(x|y)p(y)}}
\end{aligned}
$$

Khi có nhiều hơn 2 biến ngẫu nhiên ta có:

$$
\begin{aligned}
p(x, y, z, w) = p(x, y, z|w)p(w) \\
              = p(x, y|z, w)p(z, w) \\
              = p(x, y|z, w)p(z|w)p(w) \\
              = p(x|y, z, w)p(y|z, w)p(z|w)p(w)
\end{aligned}
$$

### 1.5. Biến ngẫn nhiên độc lập

Nếu biết giá trị của một biến ngẫn nhiên $x$ không mang lại thông tin về việc suy ra giá trị của biến ngẫn nhiên $y$(và ngược lại), thì ta nói rằng hai biến ngẫn nhiên là độc lập.

Tính chất:

$$
\begin{aligned}
p(x|y) = p(x)\\
p(y|x) = p(y)
\end{aligned}
$$

Thay vào biểu thức xác suất đồng thời ta có:

$$
p(x,y) = p(x|y)p(y)= p(y|x)p(x)
$$

### 1.6. Kỳ vọng

Kỳ vọng của một biến ngẫn nhiên được định nghĩa là:

Nếu $x$ là rời rạc

$$
E[x] = \displaystyle\sum_x{xp(x)}
$$

Nếu $x$ là liên tục

$$
E[x] = \int{xp(x)dx}
$$

<br />

Có thể hiểu nó là giá trị trung bình mà bạn mong đợi biến ngẫn nhiên đó nhận được nếu thử nghiệm được lặp đi lặp lại nhiều lần. Nó giống như "trọng tâm" của phân phối xác suất.
Ví dụ nếu bạn tung một con xúc xắc thì kỳ vọng của nó là $\frac{1+2+3+4+5+6}{6}=3.5$. =3.5. Điều này không có nghĩa là bạn sẽ luôn nhận được 3.5, mà là trung bình sau nhiều lần tung sẽ gần với 3.5.

Áp dụng cho hàm số $f(x)$, ta sẽ có:

$$
E[f(x)] = \displaystyle\sum_x{f(x)p(x)}
$$

Với xác suất đồng thời:

$$
E[f(x,y)] = \displaystyle\sum_{x,y}{f(x,y)p(x,y)dxdy}
$$

### 1.7. Phương sai và độ lệch chuẩn (với dữ liệu một chiều)

Được định nghĩa là:

$$
\bar{x} = \frac{1}{N}\displaystyle\sum_{n=1}^N x_n = \frac{1}{N}\mathbf{X1}
$$

$$
\sigma^2 = \frac{1}{N}\sum_{n=1}^N(x_n - \bar{x})^2
$$

<br />

Phương sai là trung bình công jcuar bình phương khoảng cách từ mỗi điểm tới kỳ vọng. Phương sai càng nhỏ thì các điểm dữ liệu càng gần với kỳ vọng, tức các điểm dữ liệu càng giống nhau. Phương sai càng lớn thì ta nói dữ liệu càng có tính phân tán.

Căn bậc hai của phương sai, $\sigma$ còn được gọi là độ lệch chuẩn (standard deviation) của dữ liệu.

## 2. Một vài phân phối thường gặp

### 2.1. Phân phối Bernoulli

Phân phối Bernoulli là một phân phối rời rạc mô tả các biến ngẫu nhiên nhị phân: trường hợp đầu ra chỉ nhận một trong hai giá trị $x \in \{0,1\}$.

Thường được miêu tả bằng một tham số $\lambda \in [0,1]$ và là xác suất để biến ngẫu nhiên $x=1$. Xác suất của mỗi đầu ra sẽ là:

$$
p(x=1) = \lambda, \quad p(x=0) = 1 - p(x=1) = 1 - \lambda
$$

Có thể viết gọn lại là:

$$
p(x) = \lambda^x (1-\lambda)^{1-x}
$$

### 2.2. Phân phối Categorical

Đây là một phân phối tổng quát của phân phối Bernoulli. Các đầu ra được mô tả bởi một phần tử trong tập hợp $\{ 1,2,...K \}$.

Thay vì biểu diễn đầu ra là một số k trong tập hợp $\{ 1,2,...K \}$, ta biểu diễn đầu ra là một vector ở dạng _one-hot_, tức một vector $K$ phần tử với chỉ phần tử thứ $k$ bằng một, các phần tử còn lại bằng không. Nói cách khác, tập hợp các đầu ra là tập hợp các vector đơn vị bậc K: $x \in \{ \mathbf{e_1}, \mathbf{e_2}, ...., \mathbf{e_K} \}$ với $\mathbf{e_k}$ là vector đơn vị thứ $k$. Khi đó ta có:

$$
p(\mathbf{x} = \mathbf{e}_k) = \prod_{j=1}^K{\lambda_j}^{x_j} = \lambda_k
$$

### 2.3. Phân phối chuẩn một chiều(Gaussian distribution)

Là một phân phối được sử dụng nhiều nhất với các **biến ngẫn nhiên liên tục**. Được định nghĩa như sau:

$$
p(x) = \frac{1}{\sqrt{2\pi\sigma^2}}\exp(-\frac{(x-\mu)^2}{2\sigma^2})
$$

### 2.4. Phân phối chuẩn nhiều chiều

Là trường hợp tổng quát của phân phối chuẩn khi biến ngẫu nhiên là nhiều chiều.

Giả sử là $D$ chiều thì ta có hàm mật độ xác suất dạng:

$$
p(\mathbf{x}) = \frac{1}{(2\pi)^{D/2}|\sum|^{1/2}} \exp(\frac{1}{2} (\mathbf{x-\mu}^T) \sum^{-1}(\mathbf{x-\mu}))
$$

### 2.5. Phân phối Beta

Là một phân phối liên tục được định nghĩa trên một biến ngẫu nhiên $\lambda \in [0,1]$. Dùng để mô tả tham số cho một phân phối khác. Nó phù hợp với việc mô tả sự biến động của tham số $\lambda$ trong phân phối Bernoulli.

Được định nghĩa:

$$
p(\lambda) = \frac{\Gamma(\alpha + \beta)}{\Gamma(\alpha)\Gamma(\beta)} \lambda^{\alpha-1} (1 - \lambda)^{\beta-1}
$$

Với $\Gamma(.)$ là hàm số gamma, được đinh nghĩa là:

$$
\Gamma(z) = \int_0^\infty t^{z-1} \exp(-t) \, dt
$$

### 2.6. Phân phối Dirichlet

... Đang update
