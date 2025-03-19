---
slug: bitwise-operations-in-coding-problems
title: "Bitwise Operations: Tối ưu hóa trong lập trình thuật toán"
authors: [ducnguyen]
tags: [bitwise operations, coding problems]
---

Trong lập trình, đặc biệt là khi giải các bài toán thuật toán, các phép toán bitwise là một công cụ mạnh mẽ nhưng thường bị bỏ qua. Chúng không chỉ giúp tối ưu hóa hiệu suất mà còn giải quyết một số vấn đề phức tạp một cách ngắn gọn và hiệu quả. Trong bài viết này, chúng ta sẽ khám phá các phép toán bitwise cơ bản, cách áp dụng chúng trong các bài toán thực tế, và minh họa bằng các ví dụ cụ thể sử dụng C++.

<!-- truncate -->

## 1. Bitwise Operations là gì?

Bitwise operations là các phép toán hoạt động trực tiếp trên các bit (0 và 1) của số nguyên trong hệ nhị phân. Thay vì xử lý số ở mức độ thập phân, chúng ta thao tác trên từng bit riêng lẻ. Các phép toán bitwise cơ bản bao gồm:

- **AND (`&`)**: So sánh từng bit của hai số, trả về 1 nếu cả hai bit đều là 1, ngược lại trả về 0.
- **OR (`|`)**: Trả về 1 nếu ít nhất một trong hai bit là 1.
- **XOR (`^`)**: Trả về 1 nếu hai bit khác nhau, 0 nếu giống nhau.
- **NOT (`~`)**: Đảo ngược tất cả các bit (0 thành 1, 1 thành 0).
- **Left Shift (`<<`)**: Dịch các bit sang trái, thêm 0 vào bên phải.
- **Right Shift (`>>`)**: Dịch các bit sang phải, loại bỏ các bit thừa.

## 2. Tại sao Bitwise lại quan trọng trong các bài toán thuật toán.

- **Tối ưu hiệu suất:** Các phép toán bitwise nhanh hơn nhiều so với các phép toán số học thông thường(như nhân, chia).
- **Tiết kiệm bộ nhớ:** Bitwise cho phép lưu trữ và xử lý dữ liệu dạng nhị phân hiệu quả, đặc biệt trong các bài toán liên quan đến `set` hoặc trạng thái.
- **Giải pháp ngắn gọn:** Một số bài toán phức tạp có thể được giải quyết chỉ với vài dòng nhờ bitwise.

## 3. Ứng dụng thực tế

Dưới đây là một số ứng dụng phổ biến của bitwise:

#### Kiểm tra số chẵn/lẻ

```cpp
bool isEven(int n) {
    return (n & 1) == 0; // Bit cuối là 0 thì số chẵn
}
```

Ví dụ:

Giả sử `n = 6`

```plaintext
  6   =  0110  (nhị phân)
  1   =  0001  (nhị phân)
-----------------
6 & 1  =  0000  (kết quả = 0, tức là số chẵn)
```

Giả sử `n = 7`

```plaintext
  7   =  0111  (nhị phân)
  1   =  0001  (nhị phân)
-----------------
7 & 1  =  0001  (kết quả = 1, tức là số lẻ)

```

Ta có thể thấy rằng vì dạng nhị phân của 1 là `0001` nên không quan trọng dạng nhị phân của `n` là như thế nào, các phép `AND` của các bit trước chắc chắn `= 0` trừ bit cuối.

#### Nhân/chia cho 2

```cpp
int multiplyBy2(int n) {
    return n << 1; // Dịch trái 1 bit = nhân 2
}

int divideBy2(int n) {
    return n >> 1; // Dịch phải 1 bit = chia 2
}
```

Ví dụ:

Giả sử `n = 6`

```plaintext
6   =  0110  (nhị phân)
6<<1=  1100 = 2^3 + 2^2 + 0 + 0 = 8 + 4 = 12
```

#### Đếm số bit 1

```cpp
int countBits(int n) {
    int count = 0;
    while (n) {
        count += n & 1; // Kiểm tra bit cuối
        n >>= 1;       // Dịch phải để kiểm tra bit tiếp theo
    }
    return count;
}
```

Cách tối ưu hơn

```cpp
int countBitsOptimized(int n) {
    int count = 0;
    while (n) {
        n &= (n - 1); // Xóa bit 1 ngoài cùng bên phải
        count++;
    }
    return count;
}
```

Giải thích cách hoạt động của `n &= (n - 1)`:

- Biểu thức `n - 1` sẽ lật bit `1` ngoài cùng bên phải của `n` thành `0` và đồng thời biến tất cả các bit `0` sau nó thành `1`.
- Toán tử `n &= (n - 1)` thực hiện phép `AND` bit, giúp xóa bỏ bit `1` ngoài cùng bên phải trong mỗi lần lặp.

Ví dụ:

Giả sử `n = 13` (biểu diễn nhị phân: `1101`), quá trình chạy hàm như sau:

| Lần lặp | Giá trị `n` (Nhị phân) | `n - 1` (Nhị phân) | `n &= (n - 1)` | `count` |
| ------- | ---------------------- | ------------------ | -------------- | ------- |
| 1       | `1101`(13)             | `1100`(12)         | `1100`(12)     | 1       |
| 2       | `1100`(12)             | `1011`(11)         | `1000`(8)      | 2       |
| 3       | `1000`(8)              | `0111`(7)          | `0000`(0)      | 3       |

Ta đếm được 3 đúng với dạng biểu diễn nhị phân `1101` mà ta thấy ở trên.

#### Tìm số single

Bài toán: Cho một mảng mà mọi số xuất hiện hai lần, trừ một số xuất hiện một lần. Tìm số đó.

```cpp
int singleNumber(vector<int>& nums) {
    int result = 0;
    for (int num : nums) {
        result ^= num;
    }
    return result;
}
```

**Tính chất quan trọng của XOR**:

- $a \oplus a = 0$ : một số XOR với chính nó bằng 0
- $a \oplus 0 = a$ : một số XOR với 0 thì bằng chính nó
- có tính chất giao hoán và kết hợp: $a \oplus b \oplus c = c \oplus a \oplus b$

Ví dụ:

```cpp
vector<int> nums = {4, 1, 2, 1, 2};
```

- result = 0
- result ^= 4 → result = 4
- result ^= 1 → result = 4 ^ 1
- result ^= 2 → result = 4 ^ 1 ^ 2
- result ^= 1 → result = 4 ^ (1 ^ 1) ^ 2 = 4 ^ 0 ^ 2 = 4 ^ 2
- result ^= 2 → result = (4 ^ 2) ^ 2 = 4 ^ (2 ^ 2) = 4 ^ 0 = 4

#### Kiểm tra lũy thừa của 2

```cpp
bool isPowerOf2(int n) {
    return n > 0 && (n & (n - 1)) == 0; // Chỉ có 1 bit 1 trong biểu diễn nhị phân
}
```

## 4. Khi nào nên dùng bitwise ?

- Khi cần tối ưu thời gian chạy (time complexity) hoặc không gian (space complexity).
- Khi xử lý các bài toán liên quan đến tập hợp, trạng thái, hoặc biểu diễn nhị phân.
- Khi muốn thay thế các phép toán số học bằng cách tiếp cận thấp cấp hơn.

## 5. Áp dụng cho bài toán cụ thể

### [Longest Nice Subarray](https://leetcode.com/problems/longest-nice-subarray/?envType=daily-question&envId=2025-03-19)

#### Quan sát

- Một subarrray "nice" thì OR bitwise của tất cả các phần tử trong subarrray sẽ có số bit 1 bằng tổng số bit 1 của từng phần tử.
- Có thể dùng sliding window để kiểm tra các subarray hợp lệ, theo dõi các bit đã sử dụng thông qua một bitmask.

#### Thuận toán

1. Sử dụng kỹ thuật sliding window:

   - Duy trì một cửa sổ với biến `mask` là kết quả `OR` của các phần tử trong cửa sổ.
   - `mask` đại diện cho tất cả các bit đã được "chiếm" trong cửa sổ hiện tại.

2. Với mỗi phần tử mới (`nums[right]`):

   - Kiểm tra xem nó có bit nào chung với `mask` không.
   - Nếu có bit chung, thu nhỏ cửa sổ từ bên trái (left) cho đến khi không còn bit chung.
   - Cập nhật `mask` và tính độ dài cửa sổ tối đa.

3. Lặp lại cho tới khi duyệt hết mảng

#### Solution

```cpp
class Solution {
public:
  int longestNiceSubarray(vector<int> &nums) {
    int n = nums.size();

    int left = 0;
    int right = 0;
    int mask = 0;

    int maxLength = 0;
    while (right < n) {
      while ((mask & nums[right]) != 0) { // Phép AND
        mask ^= nums[left]; // Phép XOR - unmerge, xem giải thích phía dưới
        left++;
      }
      mask |= nums[right]; // Phép OR - merge, xem giải thích phía dưới
      maxLength = std::max(maxLength, right - left + 1);
      right++;
    }

    return maxLength;
  };
};
```

Như ta đã quan sát thấy ở trên thì khi 2 `num` có kết quả của phép `&` là 0. Tức là tất cả các bit của chúng đều là khác nhau. Nếu ta dùng phép `OR`(trả về 1 nếu 1 trong 2 bit là 1) lên 2 số này thì kết quả là ta trích xuất được tất cả các bit 1 của 2 số. Đồng thời thì phép `XOR`(trả về 1 nếu 2 bit khác nhau, 0 nếu giống nhau), ta sẽ đảo ngược được quá trình merge ở phía trên.
