---
sidebar_position: 1
---

# Valid Sudoku

## Đề bài

Hãy xét xem một bảng Sudoku `9x9` có hợp lệ hay không. Chỉ những ô đã được điền cần được đánh giá theo các quy tắc sau:

- Mỗi hàng phải chứa các chữ số từ `1-9` mà không có chữ số nào lặp lại.
- Mỗi cột phải chứa các chữ số từ `1-9` mà không có chữ số nào lặp lại.
- Mỗi ô `3x3` phải chứa các chữ số từ `1-9` mà không có chữ số nào lặp lại.

**Lưu ý**:

- Một bảng Sudoku hợp lệ không nhất thiết phải là một bảng có thể giải được.
- Chỉ cần xác định xem các ô đã điền hợp lệ hay không.

**Ví dụ 1:**

```plaintext
Input: board =
[["5","3",".",".","7",".",".",".","."]
,["6",".",".","1","9","5",".",".","."]
,[".","9","8",".",".",".",".","6","."]
,["8",".",".",".","6",".",".",".","3"]
,["4",".",".","8",".","3",".",".","1"]
,["7",".",".",".","2",".",".",".","6"]
,[".","6",".",".",".",".","2","8","."]
,[".",".",".","4","1","9",".",".","5"]
,[".",".",".",".","8",".",".","7","9"]]
Output: true
```

**Constraints**

- `board.length == 9`
- `board[i].length == 9`
- `board\[i\]\[j\] is a digit 1-9 or '.'.`

## Phân tích

Đối với bài toán kiểm tra tính lặp lại thì ta thường dùng map/set để lưu trữ các giá trị đã xuất hiện vì có thể kiểm tra nhanh chóng với độ phức tạp `O(1)`.

Vì board có kích thước cố định là 9x9 nên ta cần 9 map/set để kiểm tra cho hàng, 9 map/set cho cột và 9 map/set cho ô 3x3.

Và điểm mấu chốt là cần xác định được ô đang xét thuộc map/set nào.

## Pseudocode

```plaintext
Function is_valid_sudolu(board):
  rows = Array(9).fill(new Set())
  cols = Array(9).fill(new Set())
  boxes = Array(9).fill(new Set())

  For i = 0 to 8:
    For j = 0 to 8:
      If board[i][j] != '.':
        num = board[i][j]
        boxIndex = Math.floor(i / 3) * 3 + Math.floor(j / 3)
        If rows[i].has(num) OR cols[j].has(num) OR boxes[boxIndex].has(num):
          Return false
        rows[i].add(num)
        cols[j].add(num)
        boxes[boxIndex].add(num)
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
  bool isValidSudoku(vector<vector<char>>& board) {
    vector<unordered_set<char>> rows(9);
    vector<unordered_set<char>> cols(9);
    vector<unordered_set<char>> boxes(9);
    for (int i = 0; i < 9; i++) {
      for (int j = 0; j < 9; j++) {
      if (board[i][j] != '.') {
        char num = board[i][j];
        int boxIndex = (i / 3) * 3 + j / 3;
        if (rows[i].count(num) || cols[j].count(num) || boxes[boxIndex].count(num)) {
          return false;
        }
        rows[i].insert(num);
        cols[j].insert(num);
        boxes[boxIndex].insert(num);
      }
      }
    }
    return true;
  }
};
```

</TabItem>

<TabItem value="go" label="Go">

```go
func isValidSudoku(board [][]byte) bool {
  rows := make([]map[byte]bool, 9)
  cols := make([]map[byte]bool, 9)
  boxes := make([]map[byte]bool, 9)
  for i := 0; i < 9; i++ {
    rows[i] = make(map[byte]bool)
    cols[i] = make(map[byte]bool)
    boxes[i] = make(map[byte]bool)
  }
  for i := 0; i < 9; i++ {
    for j := 0; j < 9; j++ {
      if board[i][j] != '.' {
        num := board[i][j]
        boxIndex := (i / 3) * 3 + j / 3
        if rows[i][num] || cols[j][num] || boxes[boxIndex][num] {
          return false
        }
        rows[i][num] = true
        cols[j][num] = true
        boxes[boxIndex][num] = true
      }
    }
  }
  return true
}
```

</TabItem>

<TabItem value="typescrpit" label="Typescript">

```typescript
function isValidSudoku(board: string[][]): boolean {
  const rows: Set<string>[] = Array.from({ length: 9 }, () => new Set());
  const cols: Set<string>[] = Array.from({ length: 9 }, () => new Set());
  const boxes: Set<string>[] = Array.from({ length: 9 }, () => new Set());
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (board[i][j] !== ".") {
        const num = board[i][j];
        const boxIndex = Math.floor(i / 3) * 3 + Math.floor(j / 3);
        if (rows[i].has(num) || cols[j].has(num) || boxes[boxIndex].has(num)) {
          return false;
        }
        rows[i].add(num);
        cols[j].add(num);
        boxes[boxIndex].add(num);
      }
    }
  }
  return true;
}
```

</TabItem>

<TabItem value="python" label="Python">

```python
class Solution:
  def isValidSudoku(self, board: List[List[str]]) -> bool:
    rows = [set() for _ in range(9)]
    cols = [set() for _ in range(9)]
    boxes = [set() for _ in range(9)]
    for i in range(9):
      for j in range(9):
        if board[i][j] != '.':
          num = board[i][j]
          boxIndex = (i // 3) * 3 + j // 3
          if num in rows[i] or num in cols[j] or num in boxes[boxIndex]:
            return False
          rows[i].add(num)
          cols[j].add(num)
          boxes[boxIndex].add(num)
    return True
```

</TabItem>

<TabItem value="rust" label="Rust">

```rust
impl Solution {
  pub fn is_valid_sudoku(board: Vec<Vec<char>>) -> bool {
    let mut rows = vec![std::collections::HashSet::new(); 9];
    let mut cols = vec![std::collections::HashSet::new(); 9];
    let mut boxes = vec![std::collections::HashSet::new(); 9];
    for i in 0..9 {
      for j in 0..9 {
      if board[i][j] != '.' {
        let num = board[i][j];
        let box_index = (i / 3) * 3 + j / 3;
        if rows[i].contains(&num) || cols[j].contains(&num) || boxes[box_index].contains(&num) {
          return false;
        }
        rows[i].insert(num);
        cols[j].insert(num);
        boxes[box_index].insert(num);
      }
      }
    }
    true
  }
}
```

</TabItem>

</Tabs>
