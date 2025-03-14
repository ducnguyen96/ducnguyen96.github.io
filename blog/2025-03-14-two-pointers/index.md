---
slug: two-pointers-technique
title: "Kỹ thuật two pointers: Giải thuật hiệu quả cho các bài toán tối ưu"
authors: [ducnguyen]
tags: [algorithm, two pointers]
---

Kỹ thuật Two Pointers (hai con trỏ) là một phương pháp mạnh mẽ để tối ưu hóa thời gian xử lý, đặc biệt khi làm việc với mảng. Kỹ thuật này thường được sử dụng để giải các bài toán liên quan đến tìm kiếm, tính tổng, hoặc so sánh các phần tử trong một cấu trúc dữ liệu tuyến tính.

<!-- truncate -->

## 1. Kỹ thuật two pointers là gì?

Là kỹ thuật sử dụng 2 indexes(con trỏ) để duyệt qua một mảng nhằm giải quyết bài toán với độ phức tạp thấp hơn so với cách tiếp cận brute-force. Thay vì sử dụng hai vòng lặp lồng nhau ($\mathcal{O}(n^2)$), ta sử dụng hai con trỏ để duyệt qua mảng một cách song song($\mathcal{O}(n)$).

Hai con trỏ này có thể được đặt ở các vị trí khác nhau trong mảng, tùy thuộc vào bài toán:

- Cùng phía (Same Direction): Hai con trỏ di chuyển cùng chiều, thường dùng trong các bài toán sliding window.
- Ngược phía (Opposite Direction): Hai con trỏ bắt đầu từ hai đầu mảng và di chuyển về phía nhau, thường dùng trong các bài toán tìm cặp số.

## 2. Khi nào nên sử dụng two pointers?

Kỹ thuật này đặc biệt hữu ích trong các trường hợp sau:

- Tìm cặp số trong mảng có tổng bằng một giá trị cho trước.
- Kiểm tra tính chất của một đoạn liên tục trong mảng (ví dụ: đoạn có tổng nhỏ nhất/lớn nhất).
- Giải các bài toán liên quan đến chuỗi hoặc mảng đã được sắp xếp.
- Tối ưu hóa các bài toán yêu cầu duyệt qua nhiều phần tử mà không cần lưu trữ thêm dữ liệu.

## 3. Cách hoạt động của two pointers

Hãy cùng xem xét hai cách tiếp cận chính của kỹ thuật này:

### Hai con trỏ ngược phía (opposite direction)

Một con trỏ bắt đầu từ đầu mảng (left), một con trỏ bắt đầu từ cuối mảng (right). Hai con trỏ di chuyển về phía nhau dựa trên điều kiện của bài toán.

**Ví dụ:**

Cho mảng đã sắp xếp `arr = [2, 4, 6, 8, 10]` và `target = 14`. Tìm cặp số có tổng bằng 14.

```cpp
#include <iostream>
#include <vector>
using namespace std;

void findPair(vector<int>& arr, int target) {
  int left = 0, right = arr.size() - 1;
  while (left < right) {
    int sum = arr[left] + arr[right];
    if (sum == target) {
        cout << arr[left] << " + " << arr[right] << endl;
        return;
    } else if (sum < target) {
        left++;
    } else {
        right--;
    }
  }
  cout << "Không tìm thấy" << endl;
}

int main() {
    vector<int> arr = {2, 4, 6, 8, 10};
    int target = 14;
    findPair(arr, target);
    return 0;
}
```

Kết quả:

```plaintext
4 + 10
```

### Hai con trỏ cùng phía (same direction)

Hai con trỏ (`start` và `end`) di chuyển cùng chiều, thường để duy trì một "cửa sổ" (window) có tính chất đặc biệt.

**Ví dụ:**

Cho mảng `arr = [1, 2, 3, 4, 5]` và `maxSum = 7`. Tìm độ dài đoạn con dài nhất có tổng ≤ 7.

```cpp
#include <iostream>
#include <vector>
using namespace std;

int findLongestSubarray(vector<int>& arr, int maxSum) {
    int start = 0, end = 0;
    int currentSum = 0, maxLength = 0;

    while (end < arr.size()) {
        currentSum += arr[end];

        while (currentSum > maxSum && start <= end) {
            currentSum -= arr[start];
            start++;
        }

        maxLength = max(maxLength, end - start + 1);
        end++;
    }
    return maxLength;
}

int main() {
    vector<int> arr = {1, 2, 3, 4, 5};
    int maxSum = 7;
    cout << "Độ dài đoạn con dài nhất: " << findLongestSubarray(arr, maxSum) << endl;
    return 0;
}
```

Kết quả:

```plaintext
Độ dài đoạn con dài nhất: 3
```

## 4. Ưu điểm và hạn chế

### Ưu điểm

- Giảm độ phức tạp của thuật toán từ $\mathcal{O}(n^2)$ xuống còn $\mathcal{O}(n)$.
- Không cần sử dụng thêm bộ nhớ.
- Dễ triển khai.

### Hạn chế

- Thường yêu cầu mảng đã được sắp xếp.
- Không áp dụng được cho tất cả các bài toán, đặc biệt khi dữ liệu không có tính chất tuyến tính(graph - vd: tìm đường đi ngắn nhất).

## 5. Một số bài toán thường áp dụng kỹ thuật two pointers

- Tìm cặp số có tổng bằng một giá trị cho trước.
- Tìm chuỗi con dài nhất không có ký tự lặp lại.
- Tìm chuỗi con ngắn nhất chứa tất cả các ký tự trong một tập hợp cho trước.
