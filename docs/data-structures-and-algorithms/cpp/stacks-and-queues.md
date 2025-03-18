---
sidebar_position: 3
---

# Stacks and Queues

import SAQ from "./images/stacks-and-queues.png"

<div style={{ 'textAlign': 'center' }}>
  <img src={SAQ} height="300"/>
</div>

## Stacks

### Linked List Implementation

```cpp
struct Node {
  int data;
  Node *next;

  Node(int value) : data(value), next(nullptr) {}
};

class Stack {
private:
  Node *top;

public:
  Stack() : top(nullptr) {}

  void push(int value) {
    Node *newNode = new Node(value);
    newNode->next = top;
    top = newNode;
  }

  void pop() {
    if (isEmpty()) {
      std::cout << "Stack underflow" << std::endl;
    }
    Node *temp = top;
    top = top->next;
    delete temp;
  };

  int peek() {
    if (isEmpty()) {
      std::cerr << "Stack is empty" << std::endl;
      return -1;
    }
    return top->data;
  }

  bool isEmpty() { return top == nullptr; }

  ~Stack() {
    while (!isEmpty()) {
      pop();
    }
  }
};
```

### Array Implementation

```cpp
template <typename T> class FixedCapacityStack {
private:
  T *s;
  int N;
  int capacity;

public:
  FixedCapacityStack(int cap) : N(0), capacity(cap) { s = new T[capacity]; }
  ~FixedCapacityStack() { delete[] s; }

  bool isEmpty() { return N == 0; }

  void push(const T item) {
    if (N < capacity) {
      s[N++] = item;
    } else {
      std::cerr << "Stack overflow" << std::endl;
    }
  }

  T pop() {
    if (isEmpty()) {
      throw std::out_of_range("Stack underflow");
    }
    return s[--N];
  }
};
```

### Resizing Array Implementation

Việc resizing array rất đắt đỏ vì mỗi lần thêm phần tử mới vào stack, chúng ta phải tạo một mảng mới với kích thước lớn hơn và copy tất cả các phần tử từ mảng cũ sang mảng mới.

```cpp
private:
  void resize(int capacity) {
    T *copy = new T[capacity];
    for (int i = 0; i < N; i++) {
      copy[i] = s[i];
    }
    delete[] s;
    s = copy;
  }
```

Inserting N items đầu tiên sẽ mất 1 + 2 + 3 + ... + N ~ $N^2/2$ operations.
Chính vì vậy thì ta phải đảm bảo rằng việc resizing array không xảy ra quá thường xuyên.

**Giải pháp là gì?**

$\implies$ Nếu mảng đầy, tăng kích thước lên gấp đôi.

```cpp
public:
  void push(const T item) {
    if (N == capacity) {
      resize(2 * capacity);
    }
    s[N++] = item;
  }

```

Ở chiều ngược lại thì ta cũng gặp vấn đề tương tự khi shrink array. Nhưng thay vì giảm kích thước mảng khi mảng chỉ còn 1/2 phần tử được sử dụng, ta giảm kích thước mảng khi mảng chỉ còn 1/4 phần tử được sử dụng. Điều này giúp tránh việc resize array quá thường xuyên khi thực hiện push và pop xen kẽ nhau.

```cpp
public:
  T pop() {
    if (isEmpty()) {
      throw std::out_of_range("Stack underflow");
    }
    T item = s[--N];
    s[N] = nullptr;
    if (N > 0 && N == capacity / 4) {
      resize(capacity / 2);
    }
    return item;
  }
```

## Queues

### Linked List Implementation

```cpp
class Queue {
private:
  Node *first;
  Node *last;

public:
  Queue() : first(nullptr), last(nullptr) {}

  void enqueue(int value) {
    Node *newNode = new Node(value);
    if (first == nullptr) {
      first = last = newNode;
    } else {
      last->next = newNode;
      last = newNode;
    }
  }

  void dequeue() {
    if (isEmpty()) {
      std::cout << "Queue underflow" << std::endl;
    }
    Node *temp = first;
    first = first->next;
    delete temp;
  }

  bool isEmpty() { return first == nullptr; }
}
```

### Array Implementation

```cpp
template <typename T> class Queue {
private:
  T *q;
  int N;
  int capacity;
  int first;
  int last;

public:
  Queue(int cap) : N(0), capacity(cap), first(0), last(0) {
    q = new T[capacity];
  }
  ~Queue() { delete[] q; }

  bool isEmpty() { return N == 0; }

  void enqueue(const T item) {
    if (N == capacity) {
      resize(2 * capacity);
    }
    q[last++] = item;
    N++;
  }

  T dequeue() {
    if (isEmpty()) {
      throw std::out_of_range("Queue underflow");
    }
    T item = q[first];
    q[first] = nullptr;
    N--;
    first++;
    if (N > 0 && N == capacity / 4) {
      resize(capacity / 2);
    }
    return item;
  }

  void resize(int capacity) {
    T *copy = new T[capacity];
    for (int i = 0; i < N; i++) {
      copy[i] = q[(first + i) % N];
    }
    delete[] q;
    q = copy;
    first = 0;
    last = N;
  }
};
```

## Iterable

### Iterable Class

```cpp
template <typename T> struct Node {
  T data;
  Node *next;
  Node(T value) : data(value), next(nullptr) {}
};

template <typename T> class Iterable {
public:
  class Iterator {
  private:
    Node<T> *current;

  public:
    Iterator(Node<T> *node) : current(node) {}

    bool operator!=(const Iterator &other) const {
      return current != other.current;
    }

    T operator*() const { return current->data; }

    Iterator &operator++() {
      if (current)
        current = current->next;
      return *this;
    }
  };

  virtual Node<T> *getHead() const = 0;

  Iterator begin() const { return Iterator(getHead()); }

  Iterator end() const { return Iterator(nullptr); }
};

```

### Iterable Stack

```cpp
template <typename T> class Stack : public Iterable<T> {
private:
  Node<T> *top;
  size_t size;

public:
  Stack() : top(nullptr), size(0) {}
  ~Stack() {
    while (!isEmpty()) {
      pop();
    }
  }

  void push(T value) {
    Node<T> *newNode = new Node<T>(value);
    newNode->next = top;
    top = newNode;
    size++;
  }

  void pop() {
    if (isEmpty()) {
      throw std::out_of_range("Stack underflow");
    }
    Node<T> *temp = top;
    top = top->next;
    delete temp;
    size--;
  }

  T peek() const {
    if (isEmpty()) {
      throw std::out_of_range("Stack is empty");
    }
    return top->data;
  }

  bool isEmpty() const { return top == nullptr; }

  size_t getSize() const { return size; }

  Node<T> *getHead() const override { return top; }
};

int main() {
  Stack<int> stack;
  stack.push(10);
  stack.push(20);
  stack.push(30);

  std::cout << "Stack elements: ";
  for (int value : stack) {
    std::cout << value << " ";
  }
  std::cout << std::endl;

  return 0;
}
```
