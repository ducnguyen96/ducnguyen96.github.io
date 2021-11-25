---
slug: javascript-in-a-nutshell
title: Javascript in a nutshell
authors: [ducnguyen96]
tags: [javascript]
---

# Javascript in a nutshell

Do bài viết có rất nhiều mục và dài nên bạn đọc nhìn vào Table Of Content (TOC) ở side-bar bên phải để đọc mục mình quan tâm nhé.

Tham khảo: [javascript.info](https://javascript.info)

## Variables

### var

**"var" không có block scope**

```javascript
if (true) {
  var test = true; // dùng "var" thay "let"
}

alert(test); // true, var không có block scope nên nó được kéo ra khỏi block scope.
```

Nếu một block nằm trong 1 function thì `var` sẽ trở thành biến `function-level`

```javascript
function sayHi() {
  if (true) {
    var phrase = "Hello";
  }

  alert(phrase); // works
}

sayHi();
alert(phrase); // ReferenceError: phrase is not defined
```

**"var" chấp nhận khai báo lại**
Nếu chúng ta khai báo 1 biến với `let` 2 lần trong cùng 1 scope thì sẽ lỗi

```javascript
let user;
let user; // SyntaxError: 'user' has already been declared
```

Với var, chúng ta có thể khai báo lại bao nhiêu lần tùy ý.

```javascript
var user = "Pete";

var user = "John"; // this "var" does nothing (already declared)
// ...it doesn't trigger an error

alert(user); // John
```

**"var" có thể khai báo sau khi sử dụng**

```javascript
function sayHi() {
  phrase = "Hello";

  alert(phrase);

  var phrase;
}
sayHi();
```

Đoạn code trên tương đương với

```javascript
function sayHi() {
  var phrase;

  phrase = "Hello";

  alert(phrase);
}
sayHi();
```

Đây được gọi là `hoisting` (kéo lên), vì tất cả `var` đều được kéo lên đầu của 1 hàm.
**Khai báo thì được kéo lên còn gán giá trị thì không**

```javascript
function sayHi() {
  alert(phrase);

  var phrase = "Hello";
}

sayHi();
```

Đoạn code trên tương đương với

```javascript
function sayHi() {
  var phrase; // declaration works at the start...

  alert(phrase); // undefined

  phrase = "Hello"; // ...assignment - when the execution reaches it.
}

sayHi();
```

### let

**"let" có block scoped chứ không phải global scope hay local scope**

```javascript
let greeting = "say Hi";
let times = 4;
if (times > 3) {
  let hello = "say Hello instead";
  console.log(hello); // "say Hello instead"
}
console.log(hello); // hello is not defined
```

**"let" cho phép gán lại giá trị, không cho phép khai báo lại**

```javascript
let greeting = "say Hi";
console.log(greeting); //"say Hi"

greeting = "say Hello instead";
console.log(greeting); //"say Hello instead"
-----------------------------------------------------
let greeting = "say Hi";
let greeting = "say Hello instead"; // error: Identifier 'greeting' has been declared
```

**"let" có hoisted không ?**
Tham khảo ở [đây](/posts/backend/javascript-in-a-nutshell/#hoisted)

### const

`const` thì giống với `let` ở chỗ nó cũng có block scope và hoisting, tuy nhiên nó không thể gán lại giá trị của biến. Tuy nhiên đối với biến dạng reference (object, array, function) thì ta vẫn có thể cập nhật được giá trị thuộc tính của biến đó.

```javascript
const greeting = {
  message: "Hello",
  number: "five",
};
greeting.message = "say Hello instead";
console.log(greeting); // {message:"say Hello instead",number:"five"}
```

## Hoisted

Tất cả các khai báo trong javascript (var, let, const, function, function\*, class) đều được `hoisted`. Có nghĩa là nếu một biến được khai báo trong 1 scope, thì trong scope đó, định danh của nó sẽ luôn trỏ đến biến đó. Xem ví dụ dưới đây:

```javascript
x = "global";
// function scope:
(function() {
    x; // not "global"

    var/let/… x;
}());
// block scope (not for `var`s):
{
    x; // not "global"

    let/const/… x;
}
```

Ở trên ta có x được khai báo ở global scope, tuy nhiên ở trong function và block kia đều khai báo lại biến đó ở dưới cùng của block và nó được neo lên đầu, chính vì thế mà x không có giá trị là "global".

## Loops

### Labels for break/continue

Đôi khi ta muốn break khỉ nhiều vòng lặp lồng nhau cùng lúc.

```javascript
for (let i = 0; i < 3; i++) {
  for (let j = 0; j < 3; j++) {
    let input = prompt(`Value at coords (${i},${j})`, "");

    // what if we want to exit from here to Done (below)?
  }
}

alert("Done!");
```

Ví dụ chúng ta cần 1 cách để dừng xử lý khi người dùng cancel input. Break thông thường sẽ chỉ dừng 1 vòng lặp. Khi đó chúng ta sẽ cần đến label.

```
outer: for (let i = 0; i < 3; i++) {

  for (let j = 0; j < 3; j++) {

    let input = prompt(`Value at coords (${i},${j})`, '');

    // if an empty string or canceled, then break out of both loops
    if (!input) break outer; // (*)

    // do something with the value...
  }
}
alert('Done!');
```

Ở đoạn code trên, `break outer` đã tìm lên và thấy 1 label với tên `outer` và break vòng lặp đó.

Chúng ta cũng có thể sử dụng label cho cả `continue`, lúc đó thì code sẽ thực hiện nhảy đến vòng lặp tiếp theo của loop đã được đánh nhãn.

## Functions

### A Function Declaration can be called earlier than it is defined.

```javascript
sayHi("John"); // Hello, John

function sayHi(name) {
  alert(`Hello, ${name}`);
}
```

```javascript
sayHi("John"); // error!

let sayHi = function (name) {
  // (*) no magic any more
  alert(`Hello, ${name}`);
};
```

### Khi nào sử dụng Function Declaration vs Function Expression.

Như một quy luật, khi khai báo 1 function thì đầu tiên ta cân nhắc sử dụng Function Declaration. Nó giúp chúng ta sắp xếp code dễ dàng hơn vì chúng ta có thể gọi nó trước khi nó được khai báo.

Nhưng nếu Function Declaration không phù hợp vì 1 số lý do hoặc chúng ta cần 1 khai báo có điều kiện thì khi đó nên sử dụng Function Expression.

```javascript
let age = prompt("What is your age?", 18);

let welcome =
  age < 18
    ? function () {
        alert("Hello!");
      }
    : function () {
        alert("Greetings!");
      };

welcome(); // ok now
```

## The JavaScript "this" keyword

- In a method, this refers to the owner object.
- Alone, this refers to the global object.
- In a function, this refers to the global object.
- In a function, in strict mode, this is undefined.
- In an event, this refers to the element that received the event.
- Methods like call(), and apply() can refer this to any object.

## Object references and copying

### Khi một biến được gán vào 1 object thì nó không lưu trữ object đó mà là "địa chỉ bộ nhớ" - nói cách khác là "1 reference" tới object.

```javascript
let user = {
  name: "John",
};
```

Object được lưu ở đâu đấy trong bộ nhớ và biến user có 1 reference tới nó.

Chúng ta có thể xem user như 1 tờ giấy có địa chỉ có object trên đó. Khi chúng ta thực hiện action lên object chẳng hạn như `user.name` thì JavaScript engine sẽ nhìn lên địa chỉ đó và tìm đến object thực sự trong bộ nhớ và thực hiện hành động lên đó.

### Khi một biến object được cope thì địa chỉ được copy chứ không phải cái object mà địa chỉ trỏ đến, vì vậy object sẽ không được nhân bản lên.

```javascript
let user = { name: "John" };

let admin = user;

admin.name = "Pete"; // changed by the "admin" reference

alert(user.name); // 'Pete', changes are seen from the "user" reference
```

### Cloning and merging, Object.assign

```javascript
let user = { name: "John" };

let permissions1 = { canView: true };
let permissions2 = { canEdit: true };

// copies all properties from permissions1 and permissions2 into user
Object.assign(user, permissions1, permissions2);

// now user = { name: "John", canView: true, canEdit: true }
```

## Rest parameters and spread syntax

### Rest parameters ...

```javascript
function sum(a, b) {
  return a + b;
}

alert(sum(1, 2, 3, 4, 5)); // 3
```

```javascript
function sumAll(...args) {
  // args is the name for the array
  let sum = 0;

  for (let arg of args) sum += arg;

  return sum;
}

alert(sumAll(1)); // 1
alert(sumAll(1, 2)); // 3
alert(sumAll(1, 2, 3)); // 6
```

### The “arguments” variable

```javascript
function showName() {
  alert(arguments.length);
  alert(arguments[0]);
  alert(arguments[1]);

  // it's iterable
  // for(let arg of arguments) alert(arg);
}

// shows: 2, Julius, Caesar
showName("Julius", "Caesar");

// shows: 1, Ilya, undefined (no second argument)
showName("Ilya");
```

### Spread syntax

```javascript
let arr = [3, 5, 1];

alert(Math.max(...arr)); // 5 (spread turns array into a list of arguments)
```

## Lexical Environment

Trong JavaScript, tất cả các function, code block {...}, và cả file script đều có 1 internal object liên kết với chúng được ẩn đi là _Lexial Environment_

Object Lexical Environment thì chứa 2 phần:

- Environment Record - là một object lưu trữ tất cả các biến local và các thuộc tính của nó.
- Một reference đến outer lexical environment để kết nối với các code bên ngoài block hoặc function.

<!-- ![search-lexical-environment](/img/blogs/search-lexical-environment.png) -->

Khi một đoạn code muốn truy cập vào biến thì inner Lexical Environment sẽ được tìm kiếm đầu tiên -> outer -> outer .... -> global one.

## Closure

![closure](/img/blogs/closure.png)
Closure là một function mà có thể nhớ các biến bên ngoài của nó và có thể truy cập chúng. Ở một số ngôn ngữ thì điều này là không thể hoặc là function đó phải được viết một cách đặc biệt. Nhưng với JavaScript thì mọi functions đều là closures.

Hầu hết thì một Lexical Environment sẽ được loại khỏi bộ nhớ cùng với tất cả các biến sau khi function đã thực hiện xong vì không có references nào tới nó nữa.

Tuy nhiên, nếu có một function lồng nhau và nó vẫn reachable thì sau khi function kết thúc, thì nó vẫn có các property mà trỏ đến lexical environment.

Như ví dụ ở trên, counter() sau khi được gọi lần 1 nó thực hiện makeCounter() và trả về 0, tuy nhiên thì counter vẫn reachable và do đó các biến trong makeCounter vẫn được dữ lại, vì thế nếu bạn gọi counter() 1 lần nữa thì nó sẽ trả về 1, tiếp theo là 2, 3, ...

## The "new Function" syntax

```javascript
function getFunc() {
  let value = "test";

  let func = new Function("alert(value)");

  return func;
}

getFunc()(); // error: value is not defined
```

Tất cả function đều nhớ nó được tạo ra ở đâu nhờ vào 1 thuộc tính đặc biệt là `[[Environment]]`. Nó trỏ đến Lexical Environment nơi nó được tạo ra.

Nhưng nếu function được tạo sử dụng synxtax `new Function` thì `[[Environment]]` của nó sẽ được set để trỏ đến glocal Lexical Environment chứ không phải Lexical Environment. So với hàm được tạo 1 cách thông thường:

```javascript
function getFunc() {
  let value = "test";

  let func = function () {
    alert(value);
  };

  return func;
}

getFunc()(); // "test", from the Lexical Environment of getFunc
```

## Property flags and descriptors

Như ta đã biết thì objects có thể lưu trữ thuộc tính, thuộc tính không đơn giản chỉ là 1 cặp `key-value` mà nó linh hoạt hơn vậy.

### Property flags

```javascript
let user = {
  name: "John",
};

let descriptor = Object.getOwnPropertyDescriptor(user, "name");

alert(JSON.stringify(descriptor, null, 2));
/* property descriptor:
{
  "value": "John",
  "writable": true,
  "enumerable": true,
  "configurable": true
}
*/
```

Các thuộc tính của objects ngoài **value** thì còn có 3 attributes sau:

- **writeable**: if `true` thì **value** có thể thay đổi, còn không thì chỉ có thể `read`
- **enumerable**: if `true` thì được list ra trong vòng lặp và ngược lại
- **configurable**: if `true` thì thuộc tính này có thể bị deleted những attributes có thể được chỉnh sửa và ngược lại.

```javascript
let user = {};

Object.defineProperty(user, "name", {
  value: "John",
  // for new properties we need to explicitly list what's true
  enumerable: true,
  configurable: true,
});

alert(user.name); // John
user.name = "Pete"; // Error
```

Với defineProperty nếu 1 attribute không được chỉ định thì nó sẽ mặc định có giá trị là `false`.

## Property getters and setters

Object có 2 loại thuộc tính là `data properties` và `accessor properties`

### Getters and Setters

```javascript
let user = {
  name: "John",
  surname: "Smith",

  get fullName() {
    return `${this.name} ${this.surname}`;
  },

  set fullName(value) {
    [this.name, this.surname] = value.split(" ");
  },
};

// set fullName is executed with the given value.
user.fullName = "Alice Cooper";

alert(user.name); // Alice
alert(user.surname); // Cooper
```

### Smarter getters/setters

Getters/setters có thể được sử dụng như `wrapper` cho 1 thuộc tính để tăng thêm quyền điều khiển.

```javascript
let user = {
  get name() {
    return this._name;
  },

  set name(value) {
    if (value.length < 4) {
      alert("Name is too short, need at least 4 characters");
      return;
    }
    this._name = value;
  },
};

user.name = "Pete";
alert(user.name); // Pete

user.name = ""; // Name is too short...
```

### Using for compatibility

Ví dụ ta implement 1 object user như sau:

```javascript
function User(name, age) {
  this.name = name;
  this.age = age;
}

let john = new User("John", 25);

alert(john.age); // 25
```

Nhưng sau đó chúng ta quyết định là lưu `birthday` thay vì `age`, vì nó chính xác hơn và tiện hơn. Nhưng ta vẫn muốn giữ lại thuộc tính age vì age có thể được sử dụng ở nhiều nơi bởi nhiều người.

Ta sẽ thêm `age` như sau:

```javascript
function User(name, birthday) {
  this.name = name;
  this.birthday = birthday;

  // age is calculated from the current date and birthday
  Object.defineProperty(this, "age", {
    get() {
      let todayYear = new Date().getFullYear();
      return todayYear - this.birthday.getFullYear();
    },
  });
}

let john = new User("John", new Date(1992, 6, 1));

alert(john.birthday); // birthday is available
alert(john.age); // ...as well as the age
```

## Callbacks

Rất nhiều hàm được cấp bởi môi trường chạy JS cho phép bạn schedule những hành động bất đồng bộ. Nói cách khác là những hành động chúng ta khởi tạo bây giờ, nhưng sau này mới hoàn thành. Ví dụ 1 trong những function đó là `setTimeout`.

Xem ví dụ dưới đây:

```javascript
function loadScript(src) {
  // creates a <script> tag and append it to the page
  // this causes the script with given src to start loading and run when complete
  let script = document.createElement("script");
  script.src = src;
  document.head.append(script);
}
loadScript("/my/script.js"); // the script has "function newFunction() {…}"

newFunction(); // no such function!
```

`script.js` chứa hàm `newFunction()` và ta cần chạy hàm này ngay sau khi `loadScript` thành công. Hiện tại thì `loadScript` chưa cung cấp 1 cách nào để có thể theo dõi được việc load script thành công hay chưa, loadScript chạy và nó thực hiện ngay hàm tiếp theo dù script chưa được load hay chưa. Nhưng chúng ta cần biết khi nào load xong để sử dụng `newFunction()`. Và `callback` là giải pháp lúc này.

```javascript
function loadScript(src, callback) {
  let script = document.createElement('script');
  script.src = src;

  script.onload = () => callback(script);

  document.head.append(script);
}

loadScript('/my/script.js', function() {
  // the callback runs after the script is loaded
  newFunction(); // so now it works
  ...
});
```

## Promise

1. "producing code" là đoạn code mà cần thời gian để hoàn thành, chẳng hạn như load data từ network.
2. "consuming code" là đoạn code mà muốn result sau khi producing code hoàn thành. Nhiều hàm có thể cần đến result.
3. promise là một JS object mà kết nối "producing code" và "consuming code".

```javascript
let promise = new Promise(function (resolve, reject) {
  // executor (the producing code, "singer")
});
```

Hàm được truyền vào Promise được gọi là `executor`. Khi một Promise được tạo ra thì executor chạy ngay. resolver và reject là 2 callbacks mà JS tạo ra, code của chúng ta chỉ nằm trong executor.

![promise-1](/img/blogs/promise-1.png)

Khi executor có result thì nó sẽ gọi 1 trong 2 callbacks:

- resolve(value) - nếu job hoàn thành cùng với `value`.
- reject(error) - nếu có lỗi xảy ra, error là error object.

Tóm lại: Executor sẽ tự động chạy ngay khi Promise được tạo và nó sẽ cố hoàn thành công việc. Khi nó hoàn thành thì sẽ gọi `resolve` và gọi `reject` nếu có lỗi xảy ra.

Promise object chứa những thuộc tính sau:

- state - khởi tạo với `pending` sau đó thay đổi thành `fullfilled` hoặc `rejected`
- result - khởi tạo với `undefined` sau đó thay đổi thành `value` hoặc `error`

Ví dụ:

```javascript
function loadScript(src) {
  return new Promise(function (resolve, reject) {
    let script = document.createElement("script");
    script.src = src;

    script.onload = () => resolve(script);
    script.onerror = () => reject(new Error(`Script load error for ${src}`));

    document.head.append(script);
  });
}

let promise = loadScript(
  "https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.11/lodash.js"
);

promise.then(
  (script) => alert(`${script.src} is loaded!`),
  (error) => alert(`Error: ${error.message}`)
);

promise.then((script) => alert("Another handler..."));
```

Chúng ta có thể thấy ngay 1 vài lợi ích của promise so với callbacks:

- Promises cho phép chúng ta làm theo thứ tự tự nhiên hơn, ví dụ loadScript(script) sau đó thì `.then` để viết những thứ muốn làm với result.

- Đối với callback thì chúng ta phải biết làm gì tiếp theo với result ngay trước khi loadScript được gọi.

## Promise API

### Promise.all

Execute nhiều promises đồng thời và chờ cho đến khi tất cả đều hoàn thành.

```javascript
let promise = Promise.all([...promises...]);
```

- Nếu có bất cứ promise nào trong array promises kia bị rejected thì Promise.all sẽ bị reject cùng với lỗi, các promise không bị lỗi sẽ bị ignore chứ k bị cancel.
- Promise.all cho phép các giá trị không phải promise trong iterable.

### Promise.allSettled

Execute nhiều promises đồng thời và chờ cho đến khi tất cả đều hoàn thành, nếu có promise nào bị lỗi thì vẫn sẽ tiếp tục thực hiện và theo dõi những promise còn lại.

### Polyfill

Nếu browser không hỗ trợ Promise.allSetted thì chúng ta có thể làm như sau:

```javascript
if (!Promise.allSettled) {
  const rejectHandler = (reason) => ({ status: "rejected", reason });

  const resolveHandler = (value) => ({ status: "fulfilled", value });

  Promise.allSettled = function (promises) {
    const convertedPromises = promises.map((p) =>
      Promise.resolve(p).then(resolveHandler, rejectHandler)
    );
    return Promise.all(convertedPromises);
  };
}
```

### Promise.race

Tương tự Promise.all nhưng nó chỉ chờ cho đến khi 1 promise hoàn thành hoặc gặp lỗi.

### Promise.any

Tương tự Promise.race nhưng chờ cho đến khi 1 promise được fulfilled.

## Async/await

`async` trước 1 function có nghĩa là function đó sẽ luôn trả về 1 promise. Tất cả các giá trị khác đều được wrapped trong 1 resolved promise.

Ví dụ, function dưới đây sẽ trả về 1 resolved promise với giá trị là 1

```javascript
async function f() {
  return 1;
}

f().then(alert); // 1
```

`await` sẽ làm JS chờ cho đến khi 1 promise hoàn thành hoặc gặp lỗi.

```javascript
async function f() {
  let promise = new Promise((resolve, reject) => {
    setTimeout(() => resolve("done!"), 1000);
  });

  let result = await promise; // wait until the promise resolves (*)

  alert(result); // "done!"
}

f();
```
