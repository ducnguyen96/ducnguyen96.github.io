---
sidebar_position: 1
---

# [M] Longest Substring Without Repeating Characters

## Đề bài

Cho một chuỗi `s`, hãy tìm độ dài của chuỗi con không chứa bất kỳ ký tự nào lặp lại.

**Ví dụ:**

```plaintext
Input: s = "abcabcbb"
Output: 3
Input: s = "bbbbb"
Output: 1
Input: s = "pwwkew"
Output: 3
```

**Constraints:**

- `0 <= s.length <= 5 * 104`
- `s` consists of English letters, digits, symbols and spaces.

## Phân tích

## Pseudocode

## Solution

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
<TabItem value="cpp" label="C++">

```cpp
class Solution {
public:
  int lengthOfLongestSubstring(string s) {
    int len = s.length();
    if (len < 2)
      return len;

    int left = 0, right = 0;
    int longest = 0;
    unordered_map<char, bool> map = {};
    while (right < len) {
      if (!map[s[right]]) {
        map[s[right]] = true;
        longest = max(longest, right - left + 1);
      } else {
        while (s[left] != s[right]) {
          map[s[left]] = false;
          left++;
        }
        left++;
      }
      right++;
    }

    return longest;
  }
};
```

</TabItem>

<TabItem value="go" label="Go">

```go
func lengthOfLongestSubstring(s string) int {
	length := len(s)
	if length < 2 {
		return length
	}
	str := []rune(s)
	left, right, longest := 0, 0, 0
	hashmap := make(map[rune]bool)
	for right < length {
		if !hashmap[str[right]] {
			hashmap[str[right]] = true
			longest = max(longest, right-left+1)
		} else {
			for str[left] != str[right] {
				hashmap[str[left]] = false
				left++
			}
			left++
		}
		right++
	}
	return longest
}
```

</TabItem>

<TabItem value="typescript" label="Typescript">

```typescript
function lengthOfLongestSubstring(s: string): number {
  const len = s.length;
  if (len < 2) return len;

  let [left, right, longest] = [0, 0, 0];
  const hashmap = {};
  while (right < len) {
    if (!hashmap[s[right]]) {
      hashmap[s[right]] = true;
      longest = Math.max(longest, right - left + 1);
    } else {
      while (s[right] !== s[left]) {
        hashmap[s[left]] = false;
        left++;
      }
      left++;
    }
    right++;
  }
  return longest;
}
```

</TabItem>

<TabItem value="python" label="Python">

```python
class Solution:
  def lengthOfLongestSubstring(self, s: str) -> int:
    length = len(s)
    if length < 2:
      return length
    left = 0
    right = 0
    longest = 0
    hashmap = {}

    while right < length:
      if s[right] not in hashmap or not hashmap[s[right]]:
        hashmap[s[right]] = True
        longest = max(longest, right - left + 1)
      else:
        while s[left] != s[right]:
          hashmap[s[left]] = False
          left += 1
        left += 1
      right += 1

    return longest
```

</TabItem>

</Tabs>
