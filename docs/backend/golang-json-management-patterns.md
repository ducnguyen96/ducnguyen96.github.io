---
sidebar_position: 3
---

# Golang: Json management partterns

![json-management-partterns.png](/img/blogs/json-management-partterns.png)

Quản lý Json trong Go không phải là một vấn đề tầm thường. Có rất nhiều ví dụ về cách decode một json document đơn giản thành một cấu trúc, nhưng rất ít ví dụ trả lời được các câu hỏi không thể tránh được sau đây:

- Làm cách nào để cung cấp 1 giá trị mặc định cho các fields ?
- Làm cách nào để tạo 1 optional field ?
- Làm cách nào để tránh sử dụng giá trị mặc định cho một số trường nhất định (ví dụ: user id) ?
- Làm cách nào để ngăn chặn các vấn đề về pointer maintenance ?
- Làm cách nào để validate tất cả ?

Dưới đây mình đã phác thảo một số Parttens cung cấp các giải pháp lý tưởng, dễ sử dụng và dễ test các solutions mà cung cấp các features này. Các Partterns đạt được các tính năng khác nhau - do đó bạn có thể chọn giải pháp phù hợp nhất cho app của bạn.

## PRIMER

![json-management-partterns.png](/img/blogs/json-management-partterns.png)

Một Model là một struct mà có ý nghĩa trong app của chúng ta - User, Scene, Parcel. Models có thể được Marshaled thành json. Ngược lại, jsson có thể được Unmarshaled thành có Model mới. Trong hầu hết tất cả app của chúng ta, ta cần validate các json được gửi đến thường được thực hiện sau khi Unmarrshaling.

Khi Unmashaling json thành một Model, ta sử dụng các struct tags để biểu thị tên trường. Khi Marshaling, ta sử dụng các thẻ giống nhau, cũng như một thẻ mới để báo hiệu liệu nó có nên được ommited khi empty hay không:

```go
type Model struct {
  UserId uint `json:"user_id"`
  Address string `json:"address,omitempty"` // nếu empty thì đừng concode
}
```

## FEATURES

### DEfAULT FIELDS

```go
ProductCount uint // required, mặc định là 0
```

Đây là một field required, nhưng nếu không cung cấp giá trị thì nó sẽ có giá trị mặc định được cấp bởi Go.

Defaults trong Go là mặc định - nó có thể là (0, "", nil, etc.). Điều này có thể rất thuận tiện, nhưng nó chỉ hoạt động tỏng trường hợp giá trị mặc định có ý nghĩa(bạn không muốn cung cấp name mặc định người user.)

### CUSTOM DEFAULT FIELDS

```go
FavoriteColor string // default, nhưng ta không muốn 1 empty string.
```

Đây là field mà bạn muốn có giá trị mặc định nhưng không phải giá trị bằng 0

### OPTIONAL FIELDS

```go
Address *string // không required nhưng nếu có thì ta vẫn muốn validate.
```

Đây là 1 field có thể hoặc không available. Nếu available thì ta muốn muốn validate nó, nếu không thì ta không muốn fail validation.

Github đã phổ biến phương pháp sử dụng con trỏ cho mục đích này, vì giá trị mặc định của chúng là nil và không có cái gọi là con trỏ trong json. Nó là phức tạp hơn nhưng thực sự không có cách giải quyết nào khác cho vấn đề này.

Validation sẽ bớt tử nhạt hơn nếu bạn không sử dụng Easy Validation, vì bạn phải xử lý cả trường hợp field available và không available. Đối với các fields mà bạn không muốn đặt mặc định nhưng vấn muốn là required thì hãy sử dụng fields `Required Non Default`

### REQUIRED NON DEFAULT FIELDS

```go
UserId *uint // required, nhưng giá trị mặc định vô nghĩa.
```

Đây là một required field, nhưng ta không muốn cấp giá trị mặc định. Validate tương tự như `OPTIONAL FIELDS`, ngoại trừ trường hợp missing thì không hợp lệ.

Chúng ta có thể tái sử dụng con trỏ từ `OPTIONAL FIELDS`, và có thể thay đổi validation. Tuy nhiên, điều này dẫn đến pointer sẽ luôn có value -> unwanted maintenance. Ta có thể tránh điều này hoàn toàn với `DEREFERENCED REQUIRED FIELDS`.

### DEREFERENCED REQUIRED FIELDS

```go
type Request struct {
  UserId *uint // Required nhưng không default, cần pointer
}

type Model struct {
  UserId uint // Nếu không optional thì không sử dụng pointer
}
```

### EASY VALIDATION

```go
UserId *uint `validate:"nonzero"`
Age Uint `validate:"min=18"`
```

`EASY VALIDATION` cho phép Models của chúng ta ở trạng thái đúng sau khi Unmashaling mà không cần phải verify thủ công tất cả mọi field và mọi trường hợp.

Ở trạng thái đơn giản nhất, validation có thể được thực hiện thủ công, do đó giúp dễ dàng chuyển sang bất cứ giải pháp nào. Go Validator là một giải pháp thay thế cho validation. Tuy nhiên, có một số thủ thuật để làm cho nó hỗ trợ `OPTIONAL FIELDS` và `REQUIRED NON-DEFAULT FIELDS`. Chúng ta có thể đơn giản hóa nó hơn nữa thông qua các đại diện trung gian từ `DEREFERENCED REQUIRED FIELDS`.

## PATTERNS

Mỗi pattern cung cấp một tập con của các features phía trên. Các patterns tăng dần độ phức tạp.

### PARTTERN 1

Features: DEFAULT FIELDS, EASY VALIDATION

Đây trường hợp base đơn giản, rất ít maintenance, setup. Nếu api của bạn đơn giản thì nên chọn pattern này.

```go

// model
type User struct {
     Name string    `json:"name"    validate:"nonzero"`
     Age uint       `json:"age"     validate:"min=1"`
     Address string `json:"address" validate:"nonzero"`
}

// unmarshalling
var user User
if err := json.NewDecoder(jsonByteSlice).Decode(&user); err != nil {...}

// marshalling
if jsonByteSlice, err := json.Marshal(object); err != nil {...}

// validation
if errs := validator.Validate(user); errs != nil {...}
```

### PARTtERN 2

Features: DEFAULT FIELDS, OPTIONAL FIELDS, REQUIRED NON-DEFAULT FIELDS

Nếu không muốn sử dụng OPTIONAL FIELDS và REQURIED NON-DEFAULT FIELDS, không ngại validate thủ công và maintenance, sử dụng parttern này.

```go
// model
type User struct {
     Name          *string `json:"name"`              // required, but no defaults
     Age           *uint   `json:"age,omitempty"`     // optional
     Address       *string `json:"address,omitempty"` // optional
     FavoriteColor string  `json:"favoriteColor"`     // required, uses defaults
}

// unmarshalling
var user User
if err := json.NewDecoder(jsonByteSlice).Decode(&user); err != nil {...}

// marshalling
if jsonByteSlice, err := json.Marshal(object); err != nil {...}

// validation
func Validate(user User) {
     // default - validate value
     // optional - if non nil, validate value
     // required non default - validate not nil, then validate value
}
```

### PARTTERN 3

Features: DEFAULT FIELDS, OPTIONAL FIELDS, REQUIRED NON DEFAULT FIELDS, EASY VALIDATION

Bạn có thể làm parttern 2 hỗ trợ EASY VALIDATION bằng cách sử dụng nhiều validators và một số validator cho trường hợp ngách. Nếu Go Validator gặp phải 1 pointer và nó nil, nó sẽ ignores còn không thì nó sẽ dereferences và validate. Nếu bạn kết hợp nới nonzero validator, bạn có thể hỗ trợ `REQUIRED NON-DEFAULT FIELDS`

```go
UserId *uint `validate:"nonzero,min=100"`
```

Có một vấn đề nhỏ, ta không thể sử dụng nonzero validator cho `OPTIONAL FIELDS` và `NON DEFAULT FIELDS`. Có thể giải quyết bằng cách sử dụng `min=1`.

```go
// model
type User struct {
     Name          *string `json:"name"              validate:"nonzero,min=1"` // required, but no defaults
     Age           *uint   `json:"age,omitempty"     validate:"min=1"`         // optional
     Address       *string `json:"address,omitempty" validate:"min=1"`         // optional
     FavoriteColor string  `json:"favoriteColor"`                              // required, uses defaults
}

// unmarshalling
var user User
if err := json.NewDecoder(jsonByteSlice).Decode(&user); err != nil {..}

// marshalling
if jsonByteSlice, err := json.Marshal(object); err != nil {...}

// validation
if errs := validator.Validate(user); errs != nil {...}
```

### PARTTERN 4

```go
// post request
type UserPostRequest struct {
     Name               *string `json:"name" validate:"nonzero"` // required, but no defaults
     Age                *uint   `json:"age"`                     // optional
     Address            *string `json:"address"`                 // optional
     FavoriteInstrument string  `json:"favoriteInstrument"`      // required, uses defaults
     FavoriteColor      *string `json:"favoriteColor"`           // required, uses custom defaults
}

// model
type User struct {
     Name               string  `json:"name" validate:"nonzero"`            // required
     Age                *uint   `json:"age,omitempty" validate:"min=1"`     // optional
     Address            *string `json:"address,omitempty" validate:"min=1"` // optional
     FavoriteInstrument string  `json:"favoriteInstrument"`                 // required
     FavoriteColor      string  `json:"favoriteColor" validate:"nonzero"`   // required
}

// unmarshalling
var postRequest UserPostRequest
if err := json.NewDecoder(jsonByteSlice).Decode(&postRequest); err != nil {..}
if errs := validator.Validate(postRequest); errs != nil {...}

user.Name = *postRequest.Name
user.Age = postRequest.Age
user.Address = postRequest.Address
user.FavoriteInstrument = postRequest.FavoriteInstrument
user.FavoriteColor = "blue"
if postRequest.FavoriteColor != nil {
  user.FavoriteColor = *postRequest.FavoriteColor
}
if errs := validator.Validate(user); errs != nil {...}

// marshalling
if jsonByteSlice, err := marshal(object); err != nil {...}

// validation
if errs := validator.Validate(user); errs != nil {...}
```

Nguồn: http://brandonokert.com/articles/json-management-patterns-in-go/
