---
sidebar_position: 1
---

# [H] Substring with Concatenation of All Words

## Đề bài

Cho một string `s` và một mảng `words` chứa các string có độ dài bằng nhau.

Một concatenated string là một string được ghép lại từ các string trong mảng `words`(mỗi word được dùng 1 lần duy nhất), và không quan trọng thứ tự của các word.

Hãy trả về các index trong `s` mà tại đó có thể tìm thấy concatenated string.

**Ví dụ:**

```plaintext
Input: s = "barfoothefoobarman", words = ["foo","bar"]
Output: [0,9]

Giải thích: Tại index 0, có thể tìm thấy concatenated string "barfoo" là kết hợp của "bar" và "foo". Tại index 9, có thể tìm thấy concatenated string "foobar" là kết hợp của "foo" và "bar".

Input: s = "wordgoodgoodgoodbestword", words = ["word","good","best","word"]

Output: []

Giải thích: Tại index 12 ta có thể tìm thấy goodbestword nhưng lại thiếu mất 1 chữ word. Vậy nên không tìm thấy concatenated string nào.
```

**Constraints:**

- `1 <= s.length <= 104`
- `1 <= words.length <= 5000`
- `1 <= words[i].length <= 30`
- `s` and `words[i]` consist of lowercase English letters.

## Phân tích

- Nhận thấy rằng mỗi word trong `words` đều phải được sử dụng, đối với những `words` có từ lặp lại thì nó vẫn phải được sử dụng hết. Vậy để kiểm tra xem một `string` có hợp lệ hay không, ta có thể đếm số lần xuất hiện của từng word trong `words`, sau đó so sánh với số lần xuất hiện của từng word trong `string s`.

- Ta có thể sử dụng kỹ thuật sliding window để vừa kiểm tra sự tồn tại của 1 word cũng như đếm số lần xuất hiện của từng word trong.

- Để tránh việc kiểm tra từng word trong `s` nhiều lần, vì word có length như nhau ta có thể sử dụng một sliding window với độ trượt là wordLength, và cũng vì word có length như nhau mà chỉ cần wordLength starting points thì ta có thể duyệt được toàn bộ các word trong s mà không bị lặp lại.

## Pseudocode

```plaintext
rs = [];

sLength = s.length;
wLength = words[0].length;
wCount = words.size;

for i from 0 to wLength:
  left = i;
  right = i;
  count = 0;
  map = {};
  while right + wLength <= sLength:
    word = s.substr(right, wLength);
    right += wLength;
    if word not in words:
      left = right;
      count = 0;
      map = {};
    else:
      map[word]++;
      count++;
      while map[word] > words[word]:
        map[s.substr(left, wLength)]--;
        count--;
        left += wLength;
      if count == wCount:
        rs.push(left);
        map[s.substr(left, wLength)]--;
        count--;
        left += wLength;
return rs
```

## Solution

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
<TabItem value="cpp" label="C++">

```cpp
class Solution {
public:
  vector<int> findSubstring(string s, vector<string> &words) {
    vector<int> result = {};

    const int sLength = s.length();
    const int wordCount = words.size();
    const int wordLength = words[0].length();

    // no result
    if (sLength < wordCount * wordLength) {
      return result;
    }

    // frequency of each word
    unordered_map<string, int> wordFreq;
    for (auto word : words) {
      wordFreq[word]++;
    }

    // Try each possible start index
    for (int i = 0; i < wordLength; i++) {
      int left = i;
      int right = i;
      int count = 0;
      unordered_map<string, int> windowWordFreq;

      // Sliding window
      while (right + wordLength <= sLength) {
        string word = s.substr(right, wordLength);
        right += wordLength;

        // not in words
        if (wordFreq.find(word) == wordFreq.end()) {
          count = 0;
          left = right;
          windowWordFreq.clear();
          // in words
        } else {
          windowWordFreq[word]++;
          count++;

          // remove exceed words
          while (windowWordFreq[word] > wordFreq[word]) {
            string leftWord = s.substr(left, wordLength);
            left += wordLength;
            windowWordFreq[leftWord]--;
            count--;
          }

          // find a result
          if (count == wordCount) {
            result.push_back(left);
            windowWordFreq[s.substr(left, wordLength)]--;
            count--;
            left += wordLength;
          }
        }
      }
    }

    return result;
  };
};
```

</TabItem>
<TabItem value="go" label="Go">

```go
func findSubstring(s string, words []string) []int {
	result := []int{}

	sLength := len(s)
	wordCount := len(words)
	wordLength := len(words[0])

	if sLength < wordCount*wordLength {
		return result
	}

	wordFreq := make(map[string]int)
	for _, word := range words {
		wordFreq[word]++
	}

	// Try each possible starting point
	for i := 0; i < wordLength; i++ {
		left, right := i, i
		count := 0
		window := make(map[string]int)

		// Sliding window
		for right+wordLength <= sLength {
			word := s[right : right+wordLength]
			right += wordLength

			// not in words
			if _, ok := wordFreq[word]; !ok {
				count = 0
				left = right
				window = make(map[string]int)
				// in words
			} else {
				window[word]++
				count++

				// remove exceed words
				for window[word] > wordFreq[word] {
					window[s[left:left+wordLength]]--
					left += wordLength
					count--
				}

				// find a result
				if count == wordCount {
					result = append(result, left)
					window[s[left:left+wordLength]]--
					count--
					left += wordLength
				}
			}
		}
	}

	return result
}
```

</TabItem>
<TabItem value="typescript" label="Typescript">

```typescript
function findSubstring(s: string, words: string[]): number[] {
  const result = [];

  const sLength = s.length;
  const wordCount = words.length;
  const wordLength = words[0].length;

  if (sLength < wordCount * wordLength) {
    return result;
  }

  const wordFreq = new Map<string, number>();
  for (const word of words) {
    wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
  }

  // Try each possible starting point
  for (let i = 0; i < wordLength; i++) {
    let left = i;
    let right = i;
    let count = 0;
    const wordSeen = new Map<string, number>();

    // Sliding window
    while (right + wordLength <= sLength) {
      const word = s.substr(right, wordLength);
      right += wordLength;

      // not in words
      if (!wordFreq.has(word)) {
        left = right;
        count = 0;
        wordSeen.clear();
        // in words
      } else {
        wordSeen.set(word, (wordSeen.get(word) || 0) + 1);
        count++;

        // remove exceeded words
        while (wordSeen.get(word) > wordFreq.get(word)) {
          const leftWord = s.substr(left, wordLength);
          left += wordLength;
          wordSeen.set(leftWord, wordSeen.get(leftWord) - 1);
          count--;
        }

        // found a result
        if (count === wordCount) {
          result.push(left);
          const leftWord = s.substr(left, wordLength);
          wordSeen.set(leftWord, wordSeen.get(leftWord) - 1);
          count--;
          left += wordLength;
        }
      }
    }
  }
  return result;
}
```

</TabItem>
<TabItem value="python" label="Python">

```python
class Solution:
    def findSubstring(self, s: str, words: List[str]) -> List[int]:
        result = []

        sLength = len(s)
        wordCount = len(words)
        wordLength = len(words[0])

        if sLength < wordCount * wordLength:
            return result

        wordFreq = {}
        for word in words:
            if word in wordFreq:
                wordFreq[word] += 1
            else:
                wordFreq[word] = 1

        # Try each possible starting point
        for i in range(wordLength):
            left = i
            right = i
            window = {}
            count = 0

            # Sliding window
            while right + wordLength <= sLength:
                word = s[right : right + wordLength]
                right += wordLength

                # not in words
                if word not in wordFreq:
                    count = 0
                    left = right
                    window.clear()
                else:
                    # in words
                    if word in window:
                        window[word] += 1
                    else:
                        window[word] = 1
                    count += 1

                    while window[word] > wordFreq[word]:
                        window[s[left : left + wordLength]] -= 1
                        left += wordLength
                        count -= 1

                    if count == wordCount:
                        result.append(left)
                        window[s[left : left + wordLength]] -= 1
                        count -= 1
                        left += wordLength

        return result
```

</TabItem>

</Tabs>
