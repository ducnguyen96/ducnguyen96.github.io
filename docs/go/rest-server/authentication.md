---
sidebar_label: Authentication
---

# Authentication

Trong bài này thì ta sẽ nói về _authentication_ và bảo mật nói chung. Trong các bài trước, nếu task server của ta được deployed publicly, thì toàn bộ API của nó sẽ được truy cập bởi bất kỳ ai có kết nối internet. Mặc dù điều này phù hợp với một số REST server, nhưng không phải lúc nào ta cũng muốn như vậy. Thông thường, ít nhất một phần của API phải là private/protected để chỉ có user đã được xác thực mới có thể truy cập.

## Authentication vs. Authorization

Khi ta nói về _auth_ nói chung, thì có thể có hai ý nghĩa:

1. Authentication (_authn_) - cung cấp quyền truy cập vào API chỉ cho những user đã đăng ký.
2. Authorization (_authz_) - quyền truy cập của các user khác nhau trên server.

Để phân biệt, thì ta có thể hệ thống file của Unix làm ví dụ. Authentication là việc đăng nhập vào hệ thống với username và password. Authorization là quyền đọc, ghi, thực thi trên các file và thư mục: một số file là private chỉ có thể truy cập bởi một số user, trong khi đó user _root_ có quyền truy cập vào tất cả.

Trong bài này, ta sẽ tập trung vào _authentication_, vì nó là khái niệm cơ bản và là tiền đề cho _authorization_. Một khi server của ta đã thực hiện được authentication, thì việc thêm authorization thường khá đơn giản, nhưng cũng phụ thuộc vào từng trường hợp cụ thể.

## HTTPS/TLS là nền tảng

Bất kỳ cách nào để thực hiện authentication trên internet thì TLS luôn là nền tảng. Nếu chỉ nhớ một điều từ bài này, thì đó là TLS là nền tảng của bảo mật internet, và nó được xây dựng dựa trên một lịch sử dài về các biện pháp bảo mật.

## HTTP basic access authentication over HTTPS

Schema basic authentication đã có từ rất lâu, được mô tả ở [RFC 7617](https://tools.ietf.org/html/rfc7617). Nếu không kết hợp với các biện pháp bảo mật khác thì đừng bao giờ sử dụng nó, vì nó gửi username/password dưới dạng plaintext (được encode base64).

Ngày nay, khi sử dụng qua HTTPS, thì có thể sử dụng basic auth một cách an toàn[^1]. Một khi kết nối HTTPS được thiết lập, thì tất cả dữ liệu trao đổi giữa server và client đều được bảo mật bởi mã hóa mạnh, và không cần phải thêm các lớp bảo mật khác. Quá nhiều lớp bảo mật có thể làm cho hệ thống _dễ bị_ tấn công hơn.

Basic auth thực sự rất đơn giản: nếu một request HTTP chưa được xác thực được gửi đến server, thì server sẽ thêm một header đặc biệt vào response: `WWW-Authenticate`. Client có thể gửi một request khác, được xác thực, bằng cách thêm header `Authorization`.

Xem ví dụ [tại đây](https://github.com/ducnguyen96/ducnguyen96.github.io/tree/master/static/code/docs/go/rest-server/auth/basic-sample/https-basic-auth-server.go). Đây là một server đơn giản có sử dụng basic auth cho path `secret/`:

```go
func main() {
  addr := flag.String("addr", ":4000", "HTTPS network address")
  certFile := flag.String("certfile", "cert.pem", "certificate PEM file")
  keyFile := flag.String("keyfile", "key.pem", "key PEM file")
  flag.Parse()

  mux := http.NewServeMux()
  mux.HandleFunc("/", func(w http.ResponseWriter, req *http.Request) {
    if req.URL.Path != "/" {
      http.NotFound(w, req)
      return
    }
    fmt.Fprintf(w, "Proudly served with Go and HTTPS!\n")
  })

  mux.HandleFunc("/secret/", func(w http.ResponseWriter, req *http.Request) {
    user, pass, ok := req.BasicAuth()
    if ok && verifyUserPass(user, pass) {
      fmt.Fprintf(w, "You get to see the secret\n")
    } else {
      w.Header().Set("WWW-Authenticate", `Basic realm="api"`)
      http.Error(w, "Unauthorized", http.StatusUnauthorized)
    }
  })

  srv := &http.Server{
    Addr:    *addr,
    Handler: mux,
    TLSConfig: &tls.Config{
      MinVersion:               tls.VersionTLS13,
      PreferServerCipherSuites: true,
    },
  }

  log.Printf("Starting server on %s", *addr)
  err := srv.ListenAndServeTLS(*certFile, *keyFile)
  log.Fatal(err)
}
```

Nếu bạn chưa rõ về certificate/TLS, thì hãy đọc lại bài viết về [HTTPS servers in Go](/blog/2021/go-https-servers-with-tls). Ở đây ta chỉ tập trung vào handler cho path `secret/`:

```go
mux.HandleFunc("/secret/", func(w http.ResponseWriter, req *http.Request) {
  user, pass, ok := req.BasicAuth()
  if ok && verifyUserPass(user, pass) {
    fmt.Fprintf(w, "You get to see the secret\n")
  } else {
    w.Header().Set("WWW-Authenticate", `Basic realm="api"`)
    http.Error(w, "Unauthorized", http.StatusUnauthorized)
  }
})
```

`net/http` của Go hỗ trợ basic auth natively và parse header tương ứng trong request; nó trích xuất username và password và đưa chúng vào hàm `BasicAuth`. Ta sẽ xem hàm `verifyUserPass` sau, nhưng trước tiên hãy hiểu xem server làm gì nếu user không thể được xác thực. Nó trả về một response lỗi với mã HTTP "unauthorized" (401). Nó set header `WWW-Authenticate` của response này để chỉ ra rằng nó sử dụng basic auth

Đây là hàm `verifyUserPass`. Nó chỉ giả lập việc xác thực username/password:

```go
var usersPasswords = map[string][]byte{
  "joe":  []byte("$2a$12$aMfFQpGSiPiYkekov7LOsu63pZFaWzmlfm1T8lvG6JFj2Bh4SZPWS"),
  "mary": []byte("$2a$12$l398tX477zeEBP6Se0mAv.ZLR8.LZZehuDgbtw2yoQeMjIyCNCsRW"),
}

// verifyUserPass verifies that username/password is a valid pair matching
// our userPasswords "database".
func verifyUserPass(username, password string) bool {
  wantPass, hasUser := usersPasswords[username]
  if !hasUser {
    return false
  }
  if cmperr := bcrypt.CompareHashAndPassword(wantPass, []byte(password)); cmperr == nil {
    return true
  }
  return false
}
```

`usersPasswords` là một map, trong thực tế thì nó sẽ là một database table. Phần quan trọng cần chú ý ở đây là sử dụng package `bcrypt` để hash password. _Không bao giờ lưu password_ dưới dạng plaintext; luôn sử dụng một dạng hash nào đó, để giảm thiểu thiệt hại khi có một vụ leak dữ liệu và database bị truy cập bởi attacker. [bcrypt](https://en.wikipedia.org/wiki/Bcrypt) cung cấp một số bảo vệ:

- Nó chống lại các [timing attack](https://en.wikipedia.org/wiki/Timing_attack) (khi attacker có thể lấy được thông tin về password từ việc tính toán thời gian để verify password).
- Nó có [salting](<https://en.wikipedia.org/wiki/Salt_(cryptography)>) để chống lại brute-force attack với rainbow tables.
- Nó chậm, làm cho brute-force attack khó hơn.

Khi user đăng ký, hash bcrypt của password sẽ [được tính toán](https://pkg.go.dev/golang.org/x/crypto/bcrypt#GenerateFromPassword) và lưu vào database. Server không bao giờ lưu password dưới dạng plaintext.

Hãy chạy server này trên local:

```bash
$ go run /usr/local/go/src/crypto/tls/generate_cert.go --ecdsa-curve P256 --host localhost
2021/05/08 06:51:57 wrote cert.pem
2021/05/08 06:51:57 wrote key.pem

$ go run https-basic-auth-server.go
2021/05/08 06:52:16 Starting server on :4000
```

Bây giờ ta có thể test với `curl`. Hãy thử root trước, để kiểm tra xem TLS đã được setup chưa:

```bash
$ curl --cacert cert.pem https://localhost:4000/
Proudly served with Go and HTTPS!
```

Bây giờ thử với `secret/`:

```bash
$ curl --cacert cert.pem https://localhost:4000/secret/
Unauthorized
```

Cuối cùng, test với user "joe" và password "1234". Header `Authorization` sẽ được encode base64:

```bash
$ echo -n "joe:1234" | base64
am9lOjEyMzQ=

$ curl --cacert cert.pem -H "Authorization: Basic am9lOjEyMzQ=" https://localhost:4000/secret/
You get to see the secret
```

Works! Code Go client hoàn chỉnh có thể được sử dụng để truy cập server [ở đây](https://github.com/ducnguyen96/ducnguyen96.github.io/tree/master/static/code/docs/go/rest-server/auth/basic-sample/https-basic-auth-client.go):

```go
func main() {
  addr := flag.String("addr", "localhost:4000", "HTTPS server address")
  certFile := flag.String("certfile", "cert.pem", "trusted CA certificate")
  user := flag.String("user", "", "username")
  pass := flag.String("pass", "", "password")
  flag.Parse()

  // Read the trusted CA certificate from a file and set up a client with TLS
  // config to trust a server signed with this certificate.
  cert, err := os.ReadFile(*certFile)
  if err != nil {
    log.Fatal(err)
  }
  certPool := x509.NewCertPool()
  if ok := certPool.AppendCertsFromPEM(cert); !ok {
    log.Fatalf("unable to parse cert from %s", *certFile)
  }

  client := &http.Client{
    Transport: &http.Transport{
      TLSClientConfig: &tls.Config{
        RootCAs: certPool,
      },
    },
  }

  // Set up HTTPS request with basic authorization.
  req, err := http.NewRequest(http.MethodGet, "https://"+*addr, nil)
  if err != nil {
    log.Fatal(err)
  }
  req.SetBasicAuth(*user, *pass)

  resp, err := client.Do(req)
  if err != nil {
    log.Fatal(err)
  }
  defer resp.Body.Close()

  html, err := io.ReadAll(resp.Body)
  if err != nil {
    log.Fatal(err)
  }
  fmt.Println("HTTP Status:", resp.Status)
  fmt.Println("Response body:", string(html))
}
```

`Request.SetBasicAuth` được gọi với username và password được truyền từ command line. Nó sẽ encode và thêm header tương ứng.

```bash
$ go run https-basic-auth-client.go -user joe -pass 1234 -addr localhost:4000/secret/
HTTP Status: 200 OK
Response body: You get to see the secret
```

Hãy thử test với password sai:

```bash
$ go run https-basic-auth-client.go -user joe -pass 1238 -addr localhost:4000/secret/
HTTP Status: 401 Unauthorized
Response body: Unauthorized
```

## HTTPS Task server và authentication middleware cho từng route.

Bây giờ ta đã hiểu cách thức thực hiện authentication, hãy quay lại với task server. Ta sẽ thêm HTTPS và basic auth vào server.

Code hoàn thiện có thể xem [ở đây](https://github.com/ducnguyen96/ducnguyen96.github.io/tree/master/static/code/docs/go/rest-server/auth/taskstore-auth).
Nó thực chất là 1 phiên bản cập nhật của [part 5](./middleware), được trang bị HTTPS và basic auth. Phần lớn thay đổi nằm trong hàm `main`.

```go
func main() {
  // highlight-start
  certFile := flag.String("certfile", "cert.pem", "certificate PEM file")
  keyFile := flag.String("keyfile", "key.pem", "key PEM file")
  flag.Parse()
  // highlight-end

  router := mux.NewRouter()
  router.StrictSlash(true)
  server := NewTaskServer()

  // highlight-start
  // The "create task" path is protected with the BasicAuth middleware.
  router.Handle("/task/",
    middleware.BasicAuth(http.HandlerFunc(server.createTaskHandler))).Methods("POST")
  // highlight-end
  router.HandleFunc("/task/", server.getAllTasksHandler).Methods("GET")
  router.HandleFunc("/task/", server.deleteAllTasksHandler).Methods("DELETE")
  router.HandleFunc("/task/{id:[0-9]+}/", server.getTaskHandler).Methods("GET")
  router.HandleFunc("/task/{id:[0-9]+}/", server.deleteTaskHandler).Methods("DELETE")
  router.HandleFunc("/tag/{tag}/", server.tagHandler).Methods("GET")
  router.HandleFunc("/due/{year:[0-9]+}/{month:[0-9]+}/{day:[0-9]+}/", server.dueHandler).Methods("GET")

  // Set up logging and panic recovery middleware for all paths.
  router.Use(func(h http.Handler) http.Handler {
    return handlers.LoggingHandler(os.Stdout, h)
  })
  router.Use(handlers.RecoveryHandler(handlers.PrintRecoveryStack(true)))

  // highlight-start
  addr := "localhost:" + os.Getenv("SERVERPORT")
  srv := &http.Server{
    Addr:    addr,
    Handler: router,
    TLSConfig: &tls.Config{
      MinVersion:               tls.VersionTLS13,
      PreferServerCipherSuites: true,
    },
  }

  log.Printf("Starting server on %s", addr)
  log.Fatal(srv.ListenAndServeTLS(*certFile, *keyFile))
  // highlight-end
}
```

Ta đã thay đổi:

- Thêm flags để set certificate và key files cho TLS.
- Ta wrap handler cho path "create new task" trong `middleware.BasicAuth`; ta sẽ xem code cho middleware này ngay sau đây. Đây cũng là cách để set up middleware cho từng path với Gorilla routing. Ta có thể dễ dàng thêm authentication cho tất cả các path trong server, nhưng ở đây ta chỉ muốn demo cách sử dụng nó cho một path cụ thể.
- Setup server để sử dụng HTTPS.

Đây là phần code cho `BasicAuth` middleware [^3]:

```go
// UserContextKey is the key in a request's context used to check if the request
// has an authenticated user. The middleware will set the value of this key to
// the username, if the user was properly authenticated with a password.
const UserContextKey = "user"

// BasicAuth is middleware that verifies the request has appropriate basic auth
// set up with a user:password pair verified by authdb.
func BasicAuth(next http.Handler) http.Handler {
  return http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
    user, pass, ok := req.BasicAuth()
    if ok && authdb.VerifyUserPass(user, pass) {
      newctx := context.WithValue(req.Context(), UserContextKey, user)
      next.ServeHTTP(w, req.WithContext(newctx))
    } else {
      w.Header().Set("WWW-Authenticate", `Basic realm="api"`)
      http.Error(w, "Unauthorized", http.StatusUnauthorized)
    }
  })
}
```

Đoạn code trên tương tự với `secret/` handler ở ví dụ trước. Điều khác biệt ở đây là middleware này attach một key vào context của request khi auth thành công; trong trường hợp của chúng ta, handler không sử dụng key này, nhưng trong các ứng dụng phức tạp hơn thì có thể sử dụng nó. Ví dụ, nó có thể được sử dụng cho _authorization_ nếu các user khác nhau có các quyền truy cập khác nhau trên các path cụ thể.

## Final notes

Ở các phần trước thì ta đã built nhiều bản REST server khác nhau sử dụng các cách tiếp cận khác nhau, tất cả đều không bảo mật, vì không sử dụng HTTPS và authentication.

Ở phần này ta đã tạo một phiên bản có bảo mật sử dụng HTTPS và basic authentication. Nó có thể được áp dụng cho tất cả các biến thể mà ta đã built.

Cách tiếp cận được giới thiệu trong bài viết khá cơ bản vì tiêu chính là giới thiệu đến bạn đọc. Về authentication thì còn có rất nhiều điều phức tạp khác như sessions, client-side state(cookies, JWT), server-side state, v.v. Theo kinh nghiệm thì không có quá nhiều điều kể trên áp dụng cho REST server. Trong REST, mỗi request nên được cô lập với các request khác, vì vậy sessions không phù hợp với khái niệm này. Mặc dù basic authentication works, tuy nhiên có nhiều điều có thể cải tiến. Ví dụ, tokens có thể được sử dụng thay vì password để chuyển gánh nặng của việc xác thực cho một bên thứ ba (ví dụ với OAuth 2.0).

[^1]: Disclaimer: Tôi không phải là một chuyên gia về bảo mật, và bài viết này tập trung vào cơ chế thực hiện authentication qua HTTPS trong Go, chứ không phải là các chi tiết về kỹ thuật bảo mật.

Nhìn vào APIs của một số services phổ biến như StackOverflow hay GitHub, thì chúng thường sử dụng secret tokens được tạo ra khi user đăng nhập. Secret tokens được gửi cùng với mỗi request. Một ưu điểm của token so với password là nó có thể dễ dàng bị thu hồi, và một user có thể có nhiều token khác nhau cho các mục đích và "access level" khác nhau. Token cũng có thể loại bỏ việc sử dụng `bcrypt` cho password, điều này có thể cải thiện latency (vì `bcrypt` được thiết kế chậm có mục đích).

Nếu bạn sử dụng bài viết này để setup security cho một ứng dụng/API nào đó yêu cầu độ bảo mật cau thì hãy tham khảo ý kiến của chuyên gia bảo mật.

[^2]: Bạn có thể sử dụng `curl` với `--user joe:1234`
[^3]: Middleware khá tương tự với [bản của Gin](https://pkg.go.dev/github.com/gin-gonic/gin#BasicAuth)

## Nguồn

- https://eli.thegreenplace.net/2021/rest-servers-in-go-part-6-authentication/
