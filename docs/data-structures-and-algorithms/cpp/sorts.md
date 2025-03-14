---
sidebar_position: 4
---

# Sorts

## 1. Selection Sort

Selection ort là một thuật toán sắp xếp đơn giản nhưng không hiệu quả với dữ liệu lớn. Nó hoạt động bằng cách chia danh sách thành hai phần: phần đã sắp xếp và phần chưa sắp xếp. Trong mỗi lần lặp, thuật toán sẽ tìm phần tử nhỏ nhất trong phần chưa sắp xếp và hoán đổi nó với phần tử đầu tiên của phần chưa sắp xếp.

**Thuật toán**:

1. Duyệt qua danh sách từ đầu đến cuối.
2. Tìm phần tử nhỏ nhất trong phần chưa sắp xếp.
3. Hoán đổi phần tử nhỏ nhất đó với phần tử đầu tiên của phần chưa sắp xếp.
4. Dịch ranh giới giữa phần đã sắp xếp và chưa sắp xếp sang phải một đơn vị.
5. Lặp lại cho đến khi danh sách được sắp xếp.

```cpp
void selectionSort(std::vector<int> &arr) {
  int n = arr.size();
  for (int i = 0; i < n - 1; i++) {
    int minIndex = i;
    for (int j = i + 1; j < n; j++) {
      if (arr[j] < arr[minIndex]) {
        minIndex = j;
      }
    }
    std::swap(arr[i], arr[minIndex]);
  }
}
```

## 2. Insertion Sort

**Thuật toán:**

1. Bắt đầu từ phần tử thứ hai.
2. Lấy phần tử hiện tại và so sánh nó với các phần tử trước đó trong danh sách.
3. Dịch chuyển các phần tử lớn hơn nó sang bên phải để tạo khoảng trống.
4. Chèn phần tử hiện tại vào đúng vị trí.
5. Lặp lại quá trình này cho đến khi hết danh sách.

```cpp
void insertionSort(std::vector<int> &arr) {
  int n = arr.size();
  for (int i = 1; i < n; i++) {
    int key = arr[i];
    int j = i - 1;
    while (j >= 0 && arr[j] > key) {
      arr[j + 1] = arr[j];
      j--;
    }
    arr[j + 1] = key;
  }
}
```

## 3. Shell Sort

Shell Sort là một thuật toán sắp xếp dựa trên Insertion Sort nhưng được cải tiến bằng cách sắp xếp các phần tử không liền kề trước, sau đó dần thu hẹp khoảng cách giữa các phần tử được so sánh. Điều này giúp giảm số lần hoán đổi so với insertion sort thông thường, đặc biệt là khi dữ liệu có kích thước lớn.

**Thuật toán**:

- Chia danh sách cần sắp xếp thành các nhóm con bằng cách sử dụng một khoảng cách (gap).
- Sắp xếp từng nhóm con bằng Insertion Sort.
- Giảm khoảng cách (gap) và tiếp tục sắp xếp.
- Lặp lại cho đến khi gap = 1, tức là thực hiện một lượt Insertion Sort trên toàn bộ danh sách.

**Ví dụ**:

```js
arr = [9, 8, 3, 7, 5, 6, 4, 1];

# gap = 4
arrs = [[9, 5], [8, 6], [3, 4], [7, 1]];
sorted = [5, 6, 3, 1, 9, 8, 4, 7]

# gap = 2
arrs = [[5, 3, 9, 4], [6, 1, 8, 7]];
sorted = [3, 1, 4, 5, 9, 6, 8, 7]

# gap = 1
sorted = [1, 3, 4, 5, 6, 7, 8, 9]
```

```cpp
void shellSort(std::vector<int> &arr) {
  int n = arr.size();
  for (int gap = n / 2; gap > 0; gap /= 2) {
    for (int i = gap; i < n; i++) {
      int temp = arr[i];
      int j = i;
      while (j >= gap && arr[j - gap] > temp) {
        arr[j] = arr[j - gap];
        j -= gap;
      }
      arr[j] = temp;
    }
  }
}
```

## 4. Merge Sort

Merge Sort là một thuật toán sắp xếp chia để trị (divide and conquer) với độ phức tạp thời gian trung bình là $O(n\log(n))$. Thuật toán này hoạt động bằng cách chia mảng thành các phần nhỏ hơn, sắp xếp từng phần rồi hợp nhất chúng lại thành một mảng đã sắp xếp.

**Thuật toán**:

1. Chia mảng thành hai nửa bằng nhau (hoặc gần bằng nhau).
2. Tiếp tục chia nhỏ hai nửa này cho đến khi mỗi phần chỉ còn một phần tử.
3. Ghép hai nửa đã sắp xếp lại với nhau theo thứ tự.

**Animation**: [Merge Sort](https://www.hackerearth.com/practice/algorithms/sorting/merge-sort/visualize/)

```cpp
void merge(std::vector<int> &arr, int l, int m, int r) {
  int n1 = m - l + 1; // Kích thước mảng con trái
  int n2 = r - m;     // Kích thước mảng con phải

  std::vector<int> L(n1), R(n2);

  // Sao chép dữ liệu vào mảng tạm
  for (int i = 0; i < n1; i++) {
    L[i] = arr[l + i];
  }
  for (int i = 0; i < n2; i++) {
    R[i] = arr[m + 1 + i];
  }

  int i = 0, j = 0, k = l;

  // Hợp nhất hai mảng đã sắp xếp
  while (i < n1 && j < n2) {
    if (L[i] <= R[j]) {
      arr[k] = L[i];
      i++;
    } else {
      arr[k] = R[j];
      j++;
    }
    k++;
  }

  // Sao chép các phần tử còn lại của L[] nếu có
  while (i < n1) {
    arr[k] = L[i];
    i++;
    k++;
  }

  // Sao chép các phần tử còn lại của R[] nếu có
  while (j < n2) {
    arr[k] = R[j];
    j++;
    k++;
  }
}

void mergeSort(std::vector<int> &arr, int l, int r) {
  if (l >= r) {
    return;
  }
  int m = l + (r - l) / 2;
  mergeSort(arr, l, m);
  mergeSort(arr, m + 1, r);
  merge(arr, l, m, r);
}
```

## 5. Quick Sort

Quick Sort là một thuật toán sắp xếp dựa trên chiến lược chia để trị (divide and conquer). Ý tưởng chính là chọn một phần tử trong mảng làm pivot (chốt), sau đó chia mảng thành hai phần: các phần tử nhỏ hơn pivot và các phần tử lớn hơn pivot. Sau đó, thuật toán đệ quy áp dụng quá trình này cho các phần nhỏ hơn cho đến khi toàn bộ mảng được sắp xếp.

**Lựa chọn Pivot**: Có nhiều cách chọn pivot khác nhau, một số cách phổ biến như chọn phần tử ở giữa, chọn phần tử đầu tiên hoặc cuối cùng(thường được dùng trong thực tế), chọn phần tử ngẫu nhiên.

**Ví dụ**:

```
[9, 8, 3, 7, 5, 6, 4, 1];
```

- Chọn pivot là 1.
- Chia thành 2 phần: \[1\], \[9, 8, 3, 7, 5, 6, 4\].
- Chọn pivot là 4.
- Chia thành 2 phần: [1], [3], [4], [9, 8, 7, 5, 6].
- Chọn pivot là 6.
- Chia thành 2 phần: [1], [3], [4], [5], [6], [9, 8, 7].
- ...
- Kết quả: [1, 3, 4, 5, 6, 7, 8, 9].

```cpp
void quickSort(std::vector<int> &arr, int low, int high) {
  if (low < high) {
    int pi = partition(arr, low, high);
    quickSort(arr, low, pi - 1);
    quickSort(arr, pi + 1, high);
  }
}

int partition(std::vector<int> &arr, int low, int high) {
  int pivot = arr[high];
  int i = low - 1;
  for (int j = low; j < high; j++) {
    if (arr[j] < pivot) {
      i++;
      std::swap(arr[i], arr[j]);
    }
  }
  std::swap(arr[i + 1], arr[high]);
  return i + 1;
}
```
