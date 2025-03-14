---
sidebar_position: 1
---

# Minimum Size Subarray Sum

## Đề bài

Cho một mảng số nguyên `nums` và một số nguyên `target`, hãy tìm độ dài của dãy con liên tiếp nhỏ nhất sao cho tổng các phần tử trong dãy con đó lớn hơn hoặc bằng `target`. Nếu không có dãy con nào thỏa mãn, trả về `0`.

**Ví dụ 1:**

```plaintext
Input: target = 7, nums = [2,3,1,2,4,3]
Output: 2
```

**Ví dụ 2:**

```plaintext
Input: target = 4, nums = [1,4,4]
Output: 1
```

**Constraints**

- `1 <= target <= 109`
- `1 <= nums.length <= 105`
- `1 <= nums[i] <= 104`

## Phần tích

Như mình có đề cập ở bài viết về [kỹ thuật two pointers](/blog/two-pointers-technique) ta có thể sử dụng kỹ thuật này để giải bài toán này.

## Pseudocode

```plaintext
Function minSubArrayLen(target, nums) {
  left = 0
  right = 0
  sum = 0
  minLen = Infinity
  while right < nums.length {
    sum += nums[right]
    while sum >= target {
      minLen = min(minLen, right - left + 1)
      sum -= nums[left]
      left++
    }
    right++
  }
  return minLen ==  Infinity ? 0 : minLen
}
```

}

## Solution

import Tabs from '@ theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
<TabItem value="cpp" label="C++">

```cpp
class Solution {
public:
  int minSubArrayLen(int target, vector<int>& nums) {
    int n = nums.size();
    if (n == 0) {
      return 0;
    }
    int ans = INT_MAX;
    int left = 0, right = 0;
    int sum = 0;
    while (right < n) {
      sum += nums[right];
      while (sum >= target) {
        ans = min(ans, right - left + 1);
        sum -= nums[left];
        left++;
      }
      right++;
    }
    return ans == INT_MAX ? 0 : ans;
  }
}
```

</TabItem>

<TabItem value="go" label="Go">

```go
func minSubArrayLen(target int, nums []int) int {
  n := len(nums)
  if n == 0 {
    return 0
  }
  ans := 100001
  left, right, sum := 0, 0, 0
  for right < n {
    sum += nums[right]
    for sum >= target {
      ans = min(ans, right - left + 1)
      sum -= nums[left]
      left++
    }
    right++
  }
  if ans == 100001 {
    return 0
  }
  return ans
}
```

</TabItem>

<TabItem value="typescript" label="Typescript">

```typescript
function minSubArrayLen(target: number, nums: number[]): number {
  const n = nums.length;
  if (n == 0) return 0;
  let [left, right, sum] = [0, 0, 0];
  let ans = 100001;
  while (right < n) {
    sum += nums[right];
    while (sum >= target) {
      ans = Math.min(ans, right - left + 1);
      sum -= nums[left];
      left++;
    }
    right++;
  }
  return ans === 100001 ? 0 : ans;
}
```

</TabItem>

<TabItem value="python" label="Python">

```python
class Solution:
  def minSubArrayLen(self, target: int, nums: List[int]) -> int:
    n = len(nums)
    if n == 0:
      return 0
    left = right = sum = 0
    ans = 100001
    while right < n:
      sum += nums[right]
      while sum >= target:
        ans = min(ans, right - left + 1)
        sum -= nums[left]
        left += 1
      right += 1
    return 0 if ans == 100001 else ans
```

</TabItem>

<TabItem value="rust" label="Rust">

```rust
impl Solution {
  pub fn min_sub_array_len(target: i32, nums: Vec<i32>) -> i32 {
    let n = nums.len();
    if n == 0 {
      return 0;
    }
    let mut ans = i32::MAX;
    let (mut left, mut right, mut sum) = (0, 0, 0);
    while right < n {
      sum += nums[right];
      while sum >= target {
        ans = std::cmp::min(ans, (right - left + 1) as i32);
        sum -= nums[left];
        left += 1;
      }
      right += 1;
    }
    if ans == i32::MAX {
      return 0;
    }
    return ans;
  }
}
```

</TabItem>
</Tabs>
