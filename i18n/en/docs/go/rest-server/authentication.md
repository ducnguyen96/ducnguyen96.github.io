---
sidebar_label: Authentication
---

# Authentication

In this part we're going to be talking about _authentication_ and security in general. In previous parts, if our task server was deployed publicly, its full API would have been accessible to anyone with an internet connection. While this is appropriate for some REST servers, it's not always what we want. Typically, at least parts of the API should be private/protected so that only authenticated users can access them.

## Authentication vs. Authorization

When we talk about "auth" in general, this can mean one of two things:

1. Authentication (_authn_) - providing access to the API only for registered/known users.
2. Authorization (_authz_) - the permissions different users have on the server.

To distinguish between the two, an analogy I like is the common Unix-style file system. Authentication is logging into the system with your username and password. Authorization is the read-write-execute access bits on specific files and directories: some files are private to specific users, some are visible to whole groups, all the while "root" users exist with access to everything.

In this post we'll be focusing on authentication, because it's the more fundamental concept and a prerequisite for authorization. Once our server implements authentication, adding authorization is typically straightforward, but also very use-case specific.

## HTTPS/TLS is the foundation

However you choose to do authentication on the internet these days, TLS should be the foundation you build upon. If you only remember one point from this article - this should be it. TLS is the bedrock of public internet security, and it's chiseled by a long history of counter-measures for real and potential threats. Never, ever roll your own crypto.

For REST servers over HTTP like our sample task server in this series, HTTPS is the transport protocol to use. For a basic exploration of adding HTTPS support for Go servers, please read [my earlier post](/blog/2021/go-https-servers-with-tls).

## HTTP basic access authentication over HTTPS

HTTP had a "basic" authentication scheme for a long time; the latest RFC describing it is [RFC 7617](https://tools.ietf.org/html/rfc7617). Used on its own, basic auth is a big no-no because it ships username/password pairs over the wire in plaintext (very thinly veiled in base64 encoding).

These days however, when used over HTTPS, basic auth should be safe [^1]. Once an HTTPS connection is established, all the data passing between servers and clients is secured by military-grade crypto, and there's no need to add additional layers of security. Over-complicating the system can make it _more_, not less vulnerable to attack.

Basic auth really is simple: if an unauthenticated HTTP request is made to the server, the server adds a special header to its response: `WWW-Authenticate`. The client can then send another request, properly authenticated, by adding an `Authorization` header.

Let's get right to [the code](https://github.com/ducnguyen96/ducnguyen96.github.io/tree/master/static/code/docs/go/rest-server/auth/basic-sample/https-basic-auth-server.go). Here's a simple Go HTTPS server that protects access to the `secret/` path with basic auth:

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

If the certificate / TLS setup is not clear, please go back and read the post on [HTTPS servers in Go](/blog/2021/go-https-servers-with-tls). Here I'll focus just on the handler for the `secret/` path:

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

Go's `net/http` supports basic auth natively and parses the appropriate header in the request; it extracts the username and password and makes them available with the `BasicAuth` method. We'll take a look at `verifyUserPass` shortly, but let's first understand what the server does if the user cannot be verified. It returns an error response with the HTTP "unauthorized" code (401). It sets the `WWW-Authenticate` header of this response to say it uses basic authentication, in the realm "api". The realm is arbitrary and can be chosen by the server - it's supposed to be a description of what kind of authorization is required if a server has several different security domains. Its value has no meaning at this level of the protocol - it's an implicit understanding between the server and client.

Here is the `verifyUserPass` function. All it does is emulate username/password verification for two known users:

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

The `usersPasswords` map would be some sort of database table in a real server. The critical part to pay attention to here is the usage of the `bcrypt` package to hash the passwords. _Never store passwords_ in plaintext; some kind of hash should always be used, to reduce the catastrophe of a data leak where the database becomes accessible to an attacker. [bcrypt](https://en.wikipedia.org/wiki/Bcrypt) is a clever scheme that provides several protections:

- It's resistant to timing attacks (where an attacker may gain information about the password from carefully calculating how long it takes to verify a password).
- It has [salting](<https://en.wikipedia.org/wiki/Salt_(cryptography)>) to protect against brute-force attacks with rainbow tables.
- It is slow by design, making brute-force attacks harder in general.

Presumably, a user signs up for your service (or obtains a username / password pair in some other way). At that point the bcrypt-ed hash of the password is [calculated](https://pkg.go.dev/golang.org/x/crypto/bcrypt#GenerateFromPassword) and stored in the database. The server never stores the plaintext version of the password.

Let's run this server locally:

```bash
$ go run /usr/local/go/src/crypto/tls/generate_cert.go --ecdsa-curve P256 --host localhost
2021/05/08 06:51:57 wrote cert.pem
2021/05/08 06:51:57 wrote key.pem

$ go run https-basic-auth-server.go
2021/05/08 06:52:16 Starting server on :4000
```

Now we can test it with `curl`. Let's try the root path first, to check that our TLS setup is working:

```bash
$ curl --cacert cert.pem https://localhost:4000/
Proudly served with Go and HTTPS!
```

We can try to access the `secret/` path without auth:

```bash
$ curl --cacert cert.pem https://localhost:4000/secret/
Unauthorized
```

Finally, let's access the same path authenticating as user "joe". This user's actual password is "1234", and the authentication header expects "joe:1234" to be base64-encoded [^2]:

```bash
$ echo -n "joe:1234" | base64
am9lOjEyMzQ=

$ curl --cacert cert.pem -H "Authorization: Basic am9lOjEyMzQ=" https://localhost:4000/secret/
You get to see the secret
```

It works! For completeness, [here's](https://github.com/ducnguyen96/ducnguyen96.github.io/tree/master/static/code/docs/go/rest-server/auth/basic-sample/https-basic-auth-client.go) a Go client that can be used to access our server:

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

The interesting part here is calling `Request.SetBasicAuth` with the username and password that were passed on the command line. It does the proper encoding for us and adds the appropriate header. With our server still running, we can run this client:

```bash
$ go run https-basic-auth-client.go -user joe -pass 1234 -addr localhost:4000/secret/
HTTP Status: 200 OK
Response body: You get to see the secret
```

But if we use the wrong password, we won't get access:

```bash
$ go run https-basic-auth-client.go -user joe -pass 1238 -addr localhost:4000/secret/
HTTP Status: 401 Unauthorized
Response body: Unauthorized
```

## Task server with HTTPS and per-path authentication middleware

Now that we have a better understanding of securing REST servers with HTTPS and basic authentication, let's get back to our original store server and retrofit it with the right security mechanism.

The full code for this server is [available here](https://github.com/ducnguyen96/ducnguyen96.github.io/tree/master/static/code/docs/go/rest-server/auth/taskstore-auth). I've taken the `gorilla-middleware` version from [part 5](./middleware) and equipped it with HTTPS and basic auth. The bulk of the change is in the `main` function; here's the new one, with lines that change from the previous version highlighted:

```go
func main() {
  // hightlight-start
  certFile := flag.String("certfile", "cert.pem", "certificate PEM file")
  keyFile := flag.String("keyfile", "key.pem", "key PEM file")
  flag.Parse()
  // highlight-end

  router := mux.NewRouter()
  router.StrictSlash(true)
  server := NewTaskServer()

  // hightlight-start
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

  // hightlight-start
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

Let's review the changes in detail:

- First, we add flags for setting the certificate and key files for TLS.
- We wrap the handler for the "create new task" path in `middleware.BasicAuth`; we'll see the code for this middleware shortly. This also demonstrates how to set up middleware per-path with Gorilla routing. We could easily require authentication for all paths in the server, but here I just want to demonstrate how to use it for specific path.
- We set up the server to use HTTPS.

Here's the code for the `BasicAuth` middleware [^3]:

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

The code should be familiar by now - it's very similar to our `secret/` handler from the previous example. The one thing that changes here is that this middleware attaches a key to the request's context when auth succeeds; in our case, the handler doesn't use this key, but in more sophisticated applications it could. For example, it could use it for _authorization_ if different users have different access rights on specific paths.

Finally, the `authdb` package has the `VerifyUserPass` function that's exactly similar to our earlier example, so I won't list it here. In reality, `authdb` would be a layer around a DB table mapping users to their bcrypt-ed passwords.

## Final notes

In the previous parts of the series, we built several variants of a REST API server using different approaches and frameworks. Neither of them was secure, however, due to the use of unencrypted HTTP and the lack of authentication.

In this part we created a secure version of our server, using HTTPS and basic authentication. This technique can be applied to every variant of the server since it has very few dependencies; the only outside-of-stdlib dependency is `x/crypto/bcrypt`, where `x/` is commonly considered to be the extended standard library and is maintained mostly by the Go team.

The approach presented here is simple on purpose. There is a lot of complexity and tooling around auth - sessions, client-side state (cookies, JWT), server-side state, etc. In my experience, not much of this applies to REST servers. In REST, every request should be isolated from every other, so sessions don't fit into the concept very well. Basic authentication works, though refinements are possible. For example, tokens could be used instead of passwords to make the access more ephemeral, or to shift the burden of authentication to a third party (for example with OAuth 2.0).

[^1]: Mandatory disclaimer: I'm not a security expert, and this post's focus is on the mechanics of setting up authentication over HTTPS in Go, not nuances of security engineering.

I've read several online resources when preparing to write this post, and my conclusion is that HTTP basic auth over TLS is safe. There are a number of gotchas you should be aware of when using basic auth as built into browsers (where it pops a gray box for you), but this rarely applies to REST APIs. The only legitimate criticism of this scheme I found is that sending the password for each request increases the attack window; this is true, but alternatives like stateful tokens don't feel very REST-like to me. REST is supposed to be stateless.

Looking at APIs for large services like StackOverflow or GitHub, these generally use secret tokens you generate when logged in. Secret tokens are sent for each request and aren't, generally, much different from passwords. One advantage of tokens over passwords is that they're more easily revoked, and a single user can have multiple tokens for different needs and "access levels". Tokens could also remove the need for `bcrypt`-ing passwords, which could improve latency (since `bcrypt` is slow by design).

If you're using this to set up security for a critical application/API, please consult a security expert.
[^2]: I'm demonstrating setting the auth header manually here, but `curl` can also do it for us if we pass `--user joe:1234` instead.
[^3]: This middleware is quite similar to [Gin's BasicAuth](https://pkg.go.dev/github.com/gin-gonic/gin#BasicAuth) middleware.

## Sources

- https://eli.thegreenplace.net/2021/rest-servers-in-go-part-6-authentication/
