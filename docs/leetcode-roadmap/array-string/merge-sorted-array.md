---
sidebar_position: 1
---

# [E] Merge Sorted Array

## Đề bài

Cho 2 integer arrays `nums1` và `nums2`, mỗi array đều được sắp xếp theo `thứ tự tăng dần`.
Hai số nguyên `m` và `n` lần lượt là độ dài của `nums1` và `nums2`.

Merge `nums2` vào `nums1` sao cho `nums1` array vẫn được sắp xếp theo `thứ tự tăng dần`.

**Ví dụ 1:**

```
Input: nums1 = [1,2,3,0,0,0], m = 3, nums2 = [2,5,6], n = 3
Output: [1,2,2,3,5,6]
```

**Giải thích** \
Hai mảng cần gộp là [1,2,3] và [2,5,6]. \
Kết quả sau khi gộp là [1,2,2,3,5,6], các phần tử được sắp xếp đúng thứ tự.

**Ví dụ 2:**

```
Input: nums1 = [1], m = 1, nums2 = [], n = 0
Output: [1]
```

**Constraints:**

- `nums1.length == m + n`
- `nums2.length == n`
- `0 <= m, n <= 200`
- `1 <= m + n <= 200`
- `-109 <= nums1[i], nums2[j] <= 109`

## Phân tích

- Vì mảng `nums1` có đủ chỗ trống để chứa mảng `nums2`, nên ta có thể gộp `nums2` vào `nums1` mà không cần tạo mảng mới.
- Nếu duyệt từ đầu mảng, việc chèn phần tử mới sẽ làm dịch chuyển các phần tử còn lại, dẫn đến độ phức tạp cao.
- Giải pháp tối ưu:
  - Duyệt từ cuối mảng `nums1` (vị trí `m + n -1`), điền giá trị lớn nhất.
  - Sử dụng 3 con trỏ:
    - `p1` trỏ tới vị trí cuối mảng `nums1` (vị trí `m - 1`).
    - `p2` trỏ tới vị trí cuối mảng `nums2` (vị trí `n - 1`).
    - `p` trỏ tới vị trí cuối mảng `nums1` (vị trí `m + n - 1`).

## Pseudocode

```plaintext
Function merge(nums1, m, nums2, n):
    p1 = m - 1         // Con trỏ cuối cùng của nums1
    p2 = n - 1         // Con trỏ cuối cùng của nums2
    p = m + n - 1      // Con trỏ cuối cùng của nums1 (vị trí cần điền giá trị)

    // Duyệt ngược từ cuối nums1, điền phần tử lớn hơn vào đúng vị trí
    While p1 >= 0 AND p2 >= 0:
        If nums1[p1] > nums2[p2]:   // Nếu nums1 có phần tử lớn hơn
            nums1[p] = nums1[p1]    // Gán vào vị trí p
            p1 = p1 - 1             // Lùi con trỏ nums1
        Else:
            nums1[p] = nums2[p2]    // Gán phần tử từ nums2 vào vị trí p
            p2 = p2 - 1             // Lùi con trỏ nums2
        p = p - 1                   // Lùi con trỏ vị trí điền

    // Nếu còn phần tử chưa xét trong nums2, sao chép vào nums1
    While p2 >= 0:
        nums1[p] = nums2[p2]
        p2 = p2 - 1
        p = p - 1
```

## Solution

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
<TabItem value="cpp" label="C++">

```cpp
class Solution {
public:
  void merge(vector<int>& nums1, int m, vector<int>& nums2, int n) {
    int p1 = m - 1;
    int p2 = n - 1;
    int p = m + n - 1;
    while (p1 >= 0 && p2 >= 0) {
      if (nums1[p1] > nums2[p2]) {
        nums1[p] = nums1[p1];
        p1--;
      } else {
        nums1[p] = nums2[p2];
        p2--;
      };
      p--;
    };
    while (p2 >= 0) {
      nums1[p] = nums2[p2];
      p2--;
      p--;
    };
  };
};
```

</TabItem>

<TabItem value="go" label="Go">

```go
func merge(nums1 []int, m int, nums2 []int, n int) {
  p1 := m - 1
  p2 := n - 1
  p := m + n - 1
  for p1 >= 0 && p2 >= 0 {
    if nums1[p1] > nums2[p2] {
      nums1[p] = nums1[p1]
      p1--
    } else {
      nums1[p] = nums2[p2]
      p2--
    }
    p--
  }
  for p2 >= 0 {
    nums1[p] = nums2[p2]
    p2--
    p--
  }
}
```

</TabItem>

<TabItem value="typescript" label="Typescript">

```typescript
function merge(nums1: number[], m: number, nums2: number[], n: number): void {
  let p1: number = m - 1;
  let p2: number = n - 1;
  let p: number = m + n - 1;
  while (p1 >= 0 && p2 >= 0) {
    if (nums1[p1] > nums2[p2]) {
      nums1[p] = nums1[p1];
      p1--;
    } else {
      nums1[p] = nums2[p2];
      p2--;
    }
    p--;
  }
  while (p2 >= 0) {
    nums1[p] = nums2[p2];
    p2--;
    p--;
  }
}
```

</TabItem>

<TabItem value="python" label="Python">

```python
class Solution:
  def merge(self, nums1: List[int], m: int, nums2: List[int], n: int) -> None:
    p1 = m - 1
    p2 = n - 1
    p = m + n - 1
    while p1 >= 0 and p2 >= 0:
      if nums1[p1] > nums2[p2]:
      nums1[p] = nums1[p1]
      p1 -= 1
      else:
      nums1[p] = nums2[p2]
      p2 -= 1
      p -= 1
    while p2 >= 0:
      nums1[p] = nums2[p2]
      p2 -= 1
      p -= 1
```

</TabItem>

<TabItem value="rust" label="Rust">

```rust
impl Solution {
  pub fn merge(nums1: &mut Vec<i32>, m: i32, nums2: &mut Vec<i32>, n: i32) {
    let mut p1 = m - 1;
    let mut p2 = n - 1;
    let mut p = m + n - 1;
    while p1 >= 0 && p2 >= 0 {
      if nums1[p1 as usize] > nums2[p2 as usize] {
        nums1[p as usize] = nums1[p1 as usize];
        p1 -= 1;
      } else {
        nums1[p as usize] = nums2[p2 as usize];
        p2 -= 1;
      }
      p -= 1;
    }
    while p2 >= 0 {
      nums1[p as usize] = nums2[p2 as usize];
      p2 -= 1;
      p -= 1;
    }
  }
}
```

</TabItem>

</Tabs>
