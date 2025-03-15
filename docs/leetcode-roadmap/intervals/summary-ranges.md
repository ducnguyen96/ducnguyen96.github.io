---
sidebar_position: 1
---

# [E] Summary Ranges

## Đề bài

Cho một mảng số nguyên không trùng lặp đã được sắp xếp, trả về tất cả các đoạn liên tiếp trong mảng đó.

**Ví dụ:**

```plaintext
Input: nums = [0,1,2,4,5,7]
Output: ["0->2","4->5","7"]
Input: nums = [0,2,3,4,6,8,9]
Output: ["0","2->4","6","8->9"]
```

**Constraints:**

- `0 <= nums.length <= 20`
- `-231 <= nums[i] <= 231 - 1`
- All the values of `nums` are unique.
- `nums` is sorted in ascending order.

## Phân tích

## Solution

## Solution

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>

<TabItem value="cpp" label="C++">

```cpp
class Solution {
public:
  vector<string> summaryRanges(vector<int> &nums) {
    vector<string> rs = {};
    int n = nums.size();
    int start = 0;
    int end = 1;
    while (end <= n) {
      if (end == n || nums[end] > nums[end - 1] + 1) {
        string num_start = to_string(nums[start]);
        if (start == end - 1) {
          rs.insert(rs.end(), num_start);
        } else {
          rs.insert(rs.end(), num_start + "->" + to_string(nums[end - 1]));
        }
        start = end;
      }
      end++;
    }

    return rs;
  }
};
```

</TabItem>

<TabItem value="go" label="Go">

```go
func summaryRanges(nums []int) []string {
  rs := []string{}
  n := len(nums)
  start := 0
  end := 1
  for end <= n {
    if end == n || nums[end] > nums[end-1]+1 {
      numStart := strconv.Itoa(nums[start])
      if start == end-1 {
        rs = append(rs, numStart)
      } else {
        rs = append(rs, numStart+"->"+strconv.Itoa(nums[end-1]))
      }
      start = end
    }
    end++
  }
  return rs
}
```

</TabItem>

<TabItem value="typescript" label="Typescript">

```typescript
function summaryRanges(nums: number[]): string[] {
  const rs: string[] = [];
  const n = nums.length;
  let start = 0;
  let end = 1;
  while (end <= n) {
    if (end === n || nums[end] > nums[end - 1] + 1) {
      const numStart = nums[start].toString();
      if (start === end - 1) {
        rs.push(numStart);
      } else {
        rs.push(numStart + "->" + nums[end - 1]);
      }
      start = end;
    }
    end++;
  }
  return rs;
}
```

</TabItem>

<TabItem value="python" label="Python">

```python
class Solution:
  def summaryRanges(self, nums: List[int]) -> List[str]:
    rs = []
    n = len(nums)
    start = 0
    end = 1
    while end <= n:
      if end == n or nums[end] > nums[end - 1] + 1:
        num_start = str(nums[start])
        if start == end - 1:
          rs.append(num_start)
        else:
          rs.append(num_start + "->" + str(nums[end - 1]))
        start = end
      end += 1

    return rs
```

</TabItem>

</Tabs>
