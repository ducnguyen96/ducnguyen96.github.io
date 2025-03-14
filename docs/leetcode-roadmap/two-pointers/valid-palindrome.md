---
sidebar_position: 1
---

# [E] Valid Palindrome

## Đề bài

Một cụm từ được gọi là `palindrome` nếu sau khi đã convert sang lowercase + loại giữ ký tự đặc biệt và nó đọc từ trái sang phải và từ phải sang trái đều giống nhau. \

Cho một chuỗi `s`, hãy kiểm tra xem chuỗi đó có phải là `palindrome` hay không.

**Ví dụ 1:**

```plaintext
Input: s = "A man, a plan, a canal: Panama"
Output: true
```

**Giải thích** \
"amanaplanacanalpanama" là chuỗi `palindrome`.

**Constraints**

- `1 <= s.length <= 2 * 10^5`
- `s` chỉ chứa các ký tự ASCII

## Phân tích

- Nhận thấy rằng `palindrome` là chuỗi có tính chất đặc biệt nên ta có thể sử dụng kỹ thuật **two pointers** để giải bài toán này.

## Pseudocode

```plaintext
Funciton isPalindrome(s):
  left = 0
  right = s.length - 1
  While left < right:
    // Bỏ qua ký tự không phải là chữ cái hoặc số
    While left < right AND NOT isAlphanumeric(s[left]):
        left++
    While left < right AND NOT isAlphanumeric(s[right]):
        right--
    // So sánh 2 ký tự
    If toLowerCase(s[left]) != toLowerCase(s[right]):
        Return false
    left++
    right--
  Return true
```

## Solution

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
<TabItem value="cpp" label="C++">

```cpp
class Solution {
public:
  bool isPalindrome(string s) {
    int left = 0;
    int right = s.size() - 1;
    while (left < right) {
      while (left < right && !isalnum(s[left])) {
        left++;
      }
      while (left < right && !isalnum(s[right])) {
        right--;
      }
      if (tolower(s[left]) != tolower(s[right])) {
        return false;
      }
      left++;
      right--;
    }
    return true;
  }
}
```

</TabItem>

<TabItem value="go" label="Go">

```go
func cleanString(text string) string {
  clean_text := strings.ToLower(text)
  clean_text = strings.Join(strings.Fields(clean_text), "")
  regex, _ := regexp.Compile(`[^\p{L}\p{N} ]+`)
  return regex.ReplaceAllString(clean_text, "")
}

func isPalindrome(s string) bool {
  clean_text := cleanString(s)
  var i, j int
  rune := []rune(clean_text)
  for i = 0; i < len(rune)/2; i++ {
    j = len(rune) - 1 - i
    if string(rune[i]) != string(rune[j]) {
      return false
    }
  }

  return true
}
```

</TabItem>

<TabItem value="typescript" label="Typescript">

```typescript
function isPalindrome(s: string): boolean {
  let left = 0;
  let right = s.length - 1;
  while (left < right) {
    while (left < right && !s[left].match(/[a-zA-Z0-9]/)) {
      left++;
    }
    while (left < right && !s[right].match(/[a-zA-Z0-9]/)) {
      right--;
    }
    if (s[left].toLowerCase() !== s[right].toLowerCase()) {
      return false;
    }
    left++;
    right--;
  }
  return true;
}
```

</TabItem>

<TabItem value="python" label="Python">

```python
class Solution:
  def isPalindrome(self, s: strin) -> bool:
    left, right = 0, len(s) - 1
    while left < right:
      while left < right and not s[left].isalnum():
        left += 1
      while left < right and not s[right].isalnum():
        right -= 1

      if s[left].lower() != s[right].lower():
        return False

      left += 1
      right -= 1

    return True
```

</TabItem>

<TabItem value="rust" label="Rust">

```rust
impl Solution {
  pub fn is_palindrome(s: String) -> bool {
    let mut left = 0;
    let mut right = s.len() - 1;
    let s = s.as_bytes();
    while left < right {
      while left < right && !s[left].is_ascii_alphanumeric() {
        left += 1;
      }
      while left < right && !s[right].is_ascii_alphanumeric() {
        right -= 1;
      }
      if s[left].to_ascii_lowercase() != s[right].to_ascii_lowercase() {
        return false;
      }
      // Vì i và j có type là usize đã được tăng và giảm ở trên nên phải kiểm tra điều kiện này
      // để tránh overflow hoặc underflow
      if left >= right {
        break;
      }
      left += 1;
      right -= 1;
    }
    true
  }
}
```

</TabItem>

</Tabs>
