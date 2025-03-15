---
sidebar_position: 1
---

# [E] Ransom Note

## Đề bài

Cho 2 string `ransomNote` và `magazine`, kiểm tra xem có thể tạo ra `ransomNote` từ `magazine` hay không. Nếu có thì trả về `true`, ngược lại trả về `false`.

Mỗi ký tự trong `magazine` chỉ có thể sử dụng 1 lần.

**Ví dụ:**

```plaintext
Input: ransomNote = "a", magazine = "b"
Output: false
Input: ransomNote = "aa", magazine = "ab"
Output: false
Input: ransomNote = "aa", magazine = "aab"
Output: true
```

**Constraints:**

- `1 <= ransomNote.length, magazine.length <= 105`
- `ransomNote` and `magazine` consist of lowercase English letters.

## Phân tích

Để tạo nên được chuỗi `randomNote` thì ta cần "x" ký tự "a", "y" ký tự "b", "z" ký tự "c",... \
Chẳng hạn "aa" thì cần 2 ký tự "a", "abc" thì cần 1 ký tự "a", 1 ký tự "b" và 1 ký tự "c".

Vậy để tạo được `randomNote` từ `magazine` thì ta cần đếm số ký tự xuất hiện trong `randomNote` và `magazine`. Ta có thể dùng hashmap để thực hiện việc đếm này một cách nhanh chóng.

## Pseudocode

```plaintext
Function can_construct(ransom_note, magazine) {
  count = {};
  for char in magazine:
    count[char]++
  for char in ransom_note:
    if count[char] == 0:
      return false
  return true
}
```

## Solution

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
<TabItem value="cpp" label="C++">

```cpp
class Solution {
public:
  bool canConstruct(string ransomNote, string magazine) {
    unordered_map<char, int> count = {};
    for (auto ch: magazine) {
      count[ch]++;
    }
    for (auto ch: randomNote) {
      if (count[ch] == 0) {
        return false;
      }
      count[ch]--;
    }

    return true;
  }
}
```

</TabItem>
<TabItem value="go" label="Go">

```go
func canConstruct(ransomNote string, magazine string) bool {
  count := make(map[rune]int)

  for _, ch := range magazine {
    count[ch]++
  }

  for _, ch := range ransomNote {
    if count[ch] == 0 {
      return false
    }
    count[ch]--
  }
  return true
}
```

</TabItem>

<TabItem value="typescript" label="Typescript">

```typescript
function canConstruct(ransomNote: string, magazine: string): boolean {
  const count = {};
  for (const ch of magazine) {
    count[ch] = count[ch] ? count[ch] + 1 : 1;
  }
  for (const ch of ransomNote) {
    if (!count[ch]) return false;
    count[ch]--;
  }
  return true;
}
```

</TabItem>

<TabItem value="python" label="Python">

```python
class Solution:
    def canConstruct(self, ransomNote: str, magazine: str) -> bool:
      count = {}
      for c in magazine:
        count[c] = count.get(c, 0) + 1
      for c in ransomNote:
        if count.get(c, 0) == 0:
          return False
        count[c] -= 1;
      return True

```

</TabItem>

<TabItem value="rust" label="Rust">

```rust
impl Solution {
  pub fn can_construct(ransom_note: String, magazine: String) -> bool {
    let mut count_map = std::collections::HashMap::new();
    for c in magazine.chars() {
      let count = count_map.entry(c).or_insert(0);
      *count += 1;
    }
    for c in ransom_note.chars() {
      let count = count_map.entry(c).or_insert(0);
      if *count == 0 {
        return false;
      }
      *count -= 1;
    }
    true
  }
}
```

</TabItem>
</Tabs>
