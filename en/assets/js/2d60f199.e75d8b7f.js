"use strict";(self.webpackChunkducnguyen_96_github_io=self.webpackChunkducnguyen_96_github_io||[]).push([[7467],{5912:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>i,contentTitle:()=>a,default:()=>o,frontMatter:()=>c,metadata:()=>h,toc:()=>d});var r=t(5893),s=t(1151);const c={sidebar_label:"S\u1eed d\u1ee5ng standard library"},a="S\u1eed d\u1ee5ng standard library",h={id:"go/rest-server/standard-library",title:"S\u1eed d\u1ee5ng standard library",description:'M\u1ed9t trong nh\u1eefng c\xe2u h\u1ecfi th\u01b0\u1eddng g\u1eb7p \u1edf Developer l\xfac chu\u1ea9n b\u1ecb start 1 project n\xe0o \u0111\u1ea5y l\xe0 "N\xean s\u1eed d\u1ee5ng framework n\xe0o?". \u0110\u1ed1i v\u1edbi nhi\u1ec1u ng\xf4n ng\u1eef th\xec \u0111i\u1ec1u n\xe0y l\xe0 ho\xe0n to\xe0n b\xecnh th\u01b0\u1eddng nh\u01b0ng v\u1edbi Go th\xec kh\xf4ng ph\u1ea3i l\xfac n\xe0o c\u0169ng v\u1eady. C\xf3 nhi\u1ec1u \xfd ki\u1ebfn tr\xe1i chi\u1ec1u v\u1ec1 vi\u1ec7c n\xean s\u1eed d\u1ee5ng frameworks hay kh\xf4ng v\u1edbi Go. M\u1ee5c ti\xeau c\u1ee7a series n\xe0y l\xe0 xem x\xe9t m\u1ed9t c\xe1ch kh\xe1ch quan t\u1eeb nhi\u1ec1u g\xf3c \u0111\u1ed9.',source:"@site/docs/go/rest-server/standard-library.md",sourceDirName:"go/rest-server",slug:"/go/rest-server/standard-library",permalink:"/en/docs/go/rest-server/standard-library",draft:!1,unlisted:!1,editUrl:"https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/docs/go/rest-server/standard-library.md",tags:[],version:"current",frontMatter:{sidebar_label:"S\u1eed d\u1ee5ng standard library"},sidebar:"docs",previous:{title:"REST Server",permalink:"/en/docs/category/rest-server"},next:{title:"S\u1eed d\u1ee5ng router package",permalink:"/en/docs/go/rest-server/using-a-router-package"}},i={},d=[{value:"The task",id:"the-task",level:2},{value:"Code",id:"code",level:2},{value:"The Model",id:"the-model",level:2},{value:"Setting up the server",id:"setting-up-the-server",level:2},{value:"Routing and handlers",id:"routing-and-handlers",level:2},{value:"Making improvements",id:"making-improvements",level:2},{value:"Ngu\u1ed3n",id:"ngu\u1ed3n",level:2}];function l(e){const n={a:"a",code:"code",em:"em",h1:"h1",h2:"h2",li:"li",ol:"ol",p:"p",pre:"pre",section:"section",strong:"strong",sup:"sup",ul:"ul",...(0,s.a)(),...e.components};return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(n.h1,{id:"s\u1eed-d\u1ee5ng-standard-library",children:"S\u1eed d\u1ee5ng standard library"}),"\n",(0,r.jsx)(n.p,{children:'M\u1ed9t trong nh\u1eefng c\xe2u h\u1ecfi th\u01b0\u1eddng g\u1eb7p \u1edf Developer l\xfac chu\u1ea9n b\u1ecb start 1 project n\xe0o \u0111\u1ea5y l\xe0 "N\xean s\u1eed d\u1ee5ng framework n\xe0o?". \u0110\u1ed1i v\u1edbi nhi\u1ec1u ng\xf4n ng\u1eef th\xec \u0111i\u1ec1u n\xe0y l\xe0 ho\xe0n to\xe0n b\xecnh th\u01b0\u1eddng nh\u01b0ng v\u1edbi Go th\xec kh\xf4ng ph\u1ea3i l\xfac n\xe0o c\u0169ng v\u1eady. C\xf3 nhi\u1ec1u \xfd ki\u1ebfn tr\xe1i chi\u1ec1u v\u1ec1 vi\u1ec7c n\xean s\u1eed d\u1ee5ng frameworks hay kh\xf4ng v\u1edbi Go. M\u1ee5c ti\xeau c\u1ee7a series n\xe0y l\xe0 xem x\xe9t m\u1ed9t c\xe1ch kh\xe1ch quan t\u1eeb nhi\u1ec1u g\xf3c \u0111\u1ed9.'}),"\n",(0,r.jsx)(n.h2,{id:"the-task",children:"The task"}),"\n",(0,r.jsxs)(n.p,{children:["\u0110\u1ea7u ti\xean, n\u1ebfu c\u1ea7n check l\u1ea1i ki\u1ebfn th\u1ee9c v\u1ec1 ",(0,r.jsx)(n.em,{children:"REST server"})," th\xec xem qua",(0,r.jsx)(n.a,{href:"/blog/2023/what-is-rest",children:"b\xe0i vi\u1ebft n\xe0y"}),'. Ph\u1ea7n c\xf2n l\u1ea1i c\u1ee7a series s\u1ebd gi\u1ea3 s\u1eed b\u1ea1n bi\u1ebft v\u1ec1 "path", "HTTP header", "response code", v.v.']}),"\n",(0,r.jsxs)(n.p,{children:["Server c\u1ee7a ch\xfang ta l\xe0 m\u1ed9t backend \u0111\u01a1n gi\u1ea3n cho \u1ee9ng d\u1ee5ng qu\u1ea3n l\xfd c\xf4ng vi\u1ec7c (t\u01b0\u01a1ng t\u1ef1 Google Keep, hay c\xe1c \u1ee9ng d\u1ee5ng Todo kh\xe1c); n\xf3 g\u1ed3m 1 s\u1ed1 APIs sau ",(0,r.jsx)(n.sup,{children:(0,r.jsx)(n.a,{href:"#user-content-fn-1",id:"user-content-fnref-1","data-footnote-ref":!0,"aria-describedby":"footnote-label",children:"1"})}),":"]}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-js",children:"POST   /task/              :  create task, tr\u1ea3 v\u1ec1 ID\nGET    /task/<taskid>      :  return task theo ID\nGET    /task/              :  returns all tasks\nDELETE /task/<taskid>      :  delete a task theo ID\nGET    /tag/<tagname>      :  returns list tasks ch\u1ee9a tag n\xe0y\nGET    /due/<yy>/<mm>/<dd> :  returns list tasks v\u1edbi ng\xe0y h\u1ebft h\u1ea1n\n"})}),"\n",(0,r.jsxs)(n.p,{children:["N\xf3 h\u1ed7 tr\u1ee3 ",(0,r.jsx)(n.code,{children:"GET"}),", ",(0,r.jsx)(n.code,{children:"POST"})," v\xe0 ",(0,r.jsx)(n.code,{children:"DELETE"})," requests, m\u1ed9t s\u1ed1 trong s\u1ed1 \u0111\xf3 c\xf3 nhi\u1ec1u \u0111\u01b0\u1eddng d\u1eabn kh\xe1c nhau. C\xe1c ph\u1ea7n gi\u1eefa d\u1ea5u ngo\u1eb7c ",(0,r.jsx)(n.code,{children:"<...>"})," \u0111\u1ec1 c\u1eadp \u0111\u1ebfn c\xe1c tham s\u1ed1 m\xe0 client cung c\u1ea5p nh\u01b0 l\xe0 m\u1ed9t ph\u1ea7n c\u1ee7a request; v\xed d\u1ee5, ",(0,r.jsx)(n.code,{children:"GET /task/42"})," l\xe0 m\u1ed9t request \u0111\u1ec3 ",(0,r.jsx)(n.code,{children:"GET"})," task v\u1edbi ID 42, v.v. Tasks th\xec duy nh\u1ea5t theo ID."]}),"\n",(0,r.jsxs)(n.p,{children:["D\u1eef li\u1ec7u \u0111\u01b0\u1ee3c encode d\u01b0\u1edbi d\u1ea1ng JSON. Trong POST ",(0,r.jsx)(n.code,{children:"/task/"}),' client s\u1ebd g\u1eedi m\u1ed9t 1 task theo format JSON. T\u01b0\u01a1ng t\u1ef1, m\u1ecdi n\u01a1i m\xe0 server "return" c\xe1i g\xec \u0111\xf3, d\u1eef li\u1ec7u tr\u1ea3 v\u1ec1 \u0111\u01b0\u1ee3c encode d\u01b0\u1edbi d\u1ea1ng JSON trong body c\u1ee7a HTTP response.']}),"\n",(0,r.jsx)(n.h2,{id:"code",children:"Code"}),"\n",(0,r.jsxs)(n.p,{children:["Ph\u1ea7n c\xf2n l\u1ea1i c\u1ee7a b\xe0i vi\u1ebft n\xe0y s\u1ebd gi\u1edbi thi\u1ec7u code c\u1ee7a server, vi\u1ebft b\u1eb1ng Go, theo t\u1eebng ph\u1ea7n. Code ho\xe0n ch\u1ec9nh c\u1ee7a server c\xf3 th\u1ec3 t\xecm th\u1ea5y ",(0,r.jsx)(n.a,{href:"https://github.com/ducnguyen96/ducnguyen96.github.io/tree/master/static/code/docs/go/rest-server/stdlib-basic",children:"\u1edf \u0111\xe2y"}),"; n\xf3 l\xe0 m\u1ed9t Go module \u0111\u1ed9c l\u1eadp, kh\xf4ng c\xf3 dependencies. Sau khi clone ho\u1eb7c copy, b\u1ea1n c\xf3 th\u1ec3 ch\u1ea1y server m\xe0 kh\xf4ng c\u1ea7n c\xe0i \u0111\u1eb7t b\u1ea5t c\u1ee9 th\u1ee9 g\xec:"]}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-bash",children:"$ SERVERPORT=4112 go run .\n"})}),"\n",(0,r.jsxs)(n.p,{children:["Ch\xfa \xfd r\u1eb1ng ",(0,r.jsx)(n.code,{children:"SERVERPORT"})," c\xf3 th\u1ec3 l\xe0 b\u1ea5t k\u1ef3 port n\xe0o; \u0111\xe2y l\xe0 port ",(0,r.jsx)(n.code,{children:"TCP"})," m\xe0 server local c\u1ee7a b\u1ea1n \u0111ang l\u1eafng nghe. Sau khi server ch\u1ea1y, b\u1ea1n c\xf3 th\u1ec3 t\u01b0\u01a1ng t\xe1c v\u1edbi n\xf3 trong m\u1ed9t terminal kh\xe1c b\u1eb1ng c\xe1ch s\u1eed d\u1ee5ng l\u1ec7nh ",(0,r.jsx)(n.code,{children:"curl"}),", ho\u1eb7c b\u1eb1ng b\u1ea5t k\u1ef3 c\xe1ch n\xe0o kh\xe1c m\xe0 b\u1ea1n th\u1ea5y ph\xf9 h\u1ee3p. Xem v\xed d\u1ee5 ",(0,r.jsx)(n.a,{href:"https://github.com/ducnguyen96/ducnguyen96.github.io/tree/master/static/code/docs/go/rest-server/testing/manual.sh",children:"\u1edf \u0111\xe2y"}),"."]}),"\n",(0,r.jsx)(n.h2,{id:"the-model",children:"The Model"}),"\n",(0,r.jsxs)(n.p,{children:['H\xe3y b\u1eaft \u0111\u1ea7u b\u1eb1ng c\xe1ch th\u1ea3o lu\u1eadn v\u1ec1 model (ho\u1eb7c "data layer") cho server - package ',(0,r.jsx)(n.code,{children:"taskstore"})," (th\u01b0 m\u1ee5c ",(0,r.jsx)(n.code,{children:"internal/taskstore"}),"). \u0110\xe2y l\xe0 API c\u1ee7a n\xf3:"]}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-go",children:'package taskstore\n\n\ntype Task struct {\n\tId   int       `json:"id"`\n\tText string    `json:"text"`\n\tTags []string  `json:"tags"`\n\tDue  time.Time `json:"due"`\n}\n\n// TaskStore l\xe0 m\u1ed9t database \u0111\u01a1n gi\u1ea3n l\u01b0u tr\u1eef c\xe1c task trong b\u1ed9 nh\u1edb; c\xe1c methods c\u1ee7a TaskStore c\xf3 th\u1ec3 g\u1ecdi concurrently.\ntype TaskStore struct {\n\tsync.Mutex\n\n\ttasks  map[int]Task\n\tnextId int\n}\n\nfunc New() *TaskStore\n\n// CreateTask t\u1ea1o m\u1ed9t task m\u1edbi trong store.\nfunc (ts *TaskStore) CreateTask(text string, tags []string, due time.Time) int\n\n// GetTask l\u1ea5y m\u1ed9t task t\u1eeb store, theo ID. N\u1ebfu kh\xf4ng c\xf3 ID n\xe0o t\u1ed3n t\u1ea1i, tr\u1ea3 v\u1ec1 l\u1ed7i.\nfunc (ts *TaskStore) GetTask(id int) (Task, error)\n\n// DeleteTask x\xf3a task v\u1edbi ID cho tr\u01b0\u1edbc. N\u1ebfu ID kh\xf4ng t\u1ed3n t\u1ea1i, tr\u1ea3 v\u1ec1 l\u1ed7i.\nfunc (ts *TaskStore) DeleteTask(id int) error\n\n// DeleteAllTasks x\xf3a t\u1ea5t c\u1ea3 c\xe1c task trong store.\nfunc (ts *TaskStore) DeleteAllTasks() error\n\n// GetAllTasks tr\u1ea3 v\u1ec1 t\u1ea5t c\u1ea3 c\xe1c task trong store, theo th\u1ee9 t\u1ef1 b\u1ea5t k\u1ef3.\nfunc (ts *TaskStore) GetAllTasks() []Task\n\n// GetTasksByTag tr\u1ea3 v\u1ec1 t\u1ea5t c\u1ea3 c\xe1c task c\xf3 tag cho tr\u01b0\u1edbc, theo th\u1ee9 t\u1ef1 b\u1ea5t k\u1ef3.\nfunc (ts *TaskStore) GetTasksByTag(tag string) []Task\n\n// GetTasksByDueDate tr\u1ea3 v\u1ec1 t\u1ea5t c\u1ea3 c\xe1c task c\xf3 due date cho tr\u01b0\u1edbc, theo th\u1ee9 t\u1ef1 b\u1ea5t k\u1ef3.\nfunc (ts *TaskStore) GetTasksByDueDate(year int, month time.Month, day int) []Task\n'})}),"\n",(0,r.jsxs)(n.p,{children:["Package ",(0,r.jsx)(n.code,{children:"taskstore"})," tri\u1ec3n khai API b\u1eb1ng c\xe1ch s\u1eed d\u1ee5ng ",(0,r.jsx)(n.code,{children:"map[int]Task"}),", nh\u01b0ng b\u1ea1n c\xf3 th\u1ec3 xem n\xf3 nh\u01b0 l\xe0 m\u1ed9t database. Trong m\u1ed9t \u1ee9ng d\u1ee5ng th\u1ef1c t\u1ebf, ",(0,r.jsx)(n.code,{children:"TaskStore"})," c\xf3 th\u1ec3 l\xe0 m\u1ed9t interface m\xe0 nhi\u1ec1u backends c\xf3 th\u1ec3 s\u1eed d\u1ee5ng, nh\u01b0ng v\u1edbi v\xed d\u1ee5 \u0111\u01a1n gi\u1ea3n c\u1ee7a ch\xfang ta th\xec API hi\u1ec7n t\u1ea1i l\xe0 \u0111\u1ee7."]}),"\n",(0,r.jsx)(n.h2,{id:"setting-up-the-server",children:"Setting up the server"}),"\n",(0,r.jsxs)(n.p,{children:["H\xe0m ",(0,r.jsx)(n.code,{children:"main"})," c\u1ee7a server kh\xe1 \u0111\u01a1n gi\u1ea3n:"]}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-go",children:'func main() {\n  mux := http.NewServeMux()\n  server := NewTaskServer()\n  mux.HandleFunc("/task/", server.taskHandler)\n  mux.HandleFunc("/tag/", server.tagHandler)\n  mux.HandleFunc("/due/", server.dueHandler)\n\n  log.Fatal(http.ListenAndServe("localhost:"+os.Getenv("SERVERPORT"), mux))\n}\n'})}),"\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.code,{children:"NewTaskServer"})," l\xe0 m\u1ed9t constructor. Server bao g\u1ed3m m\u1ed9t ",(0,r.jsx)(n.code,{children:"TaskStore"}),", c\xf3 th\u1ec3 ",(0,r.jsx)(n.a,{href:"/blog/2019/on-concurrency-in-go-http-servers",children:"truy c\u1eadp \u0111\u1ed3ng th\u1eddi"})," m\u1ed9t c\xe1ch an to\xe0n."]}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-go",children:"type taskServer struct {\n  store *taskstore.TaskStore\n}\n\nfunc NewTaskServer() *taskServer {\n  store := taskstore.New()\n  return &taskServer{store: store}\n}\n"})}),"\n",(0,r.jsx)(n.h2,{id:"routing-and-handlers",children:"Routing and handlers"}),"\n",(0,r.jsxs)(n.p,{children:[(0,r.jsx)(n.strong,{children:"Update (2023-10-16)"}),": trong ",(0,r.jsx)(n.code,{children:"Go 1.22"})," th\xec router t\u1eeb package ",(0,r.jsx)(n.code,{children:"http"})," \u0111\u01b0\u1ee3c c\u1ea3i thi\u1ec7n \u0111\xe1ng k\u1ec3. Xem ",(0,r.jsx)(n.a,{href:"/blog/2023/better-http-server-routing-in-go-122",children:"b\xe0i vi\u1ebft n\xe0y"})," \u0111\u1ec3 bi\u1ebft chi ti\u1ebft."]}),"\n",(0,r.jsxs)(n.p,{children:["Tr\u1edf l\u1ea1i v\u1edbi routing, s\u1eed d\u1ee5ng HTTP multiplexer c\xf3 s\u1eb5n trong package ",(0,r.jsx)(n.code,{children:"net/http"}),":"]}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-go",children:'mux.HandleFunc("/task/", server.taskHandler)\nmux.HandleFunc("/tag/", server.tagHandler)\nmux.HandleFunc("/due/", server.dueHandler)\n'})}),"\n",(0,r.jsxs)(n.p,{children:["Multiplexer c\xf3 s\u1eb5n r\u1ea5t \u0111\u01a1n gi\u1ea3n, ch\u1ec9 h\u1ed7 tr\u1ee3 matching ch\xednh x\xe1c c\u1ee7a path prefix. \u0110i\u1ec1u n\xe0y c\xf3 ngh\u0129a l\xe0 ",(0,r.jsx)(n.code,{children:"/task/"})," s\u1ebd match v\u1edbi ",(0,r.jsx)(n.code,{children:"/task/"})," v\xe0 ",(0,r.jsx)(n.code,{children:"/task/42"}),", nh\u01b0ng kh\xf4ng match v\u1edbi ",(0,r.jsx)(n.code,{children:"/task"})," (kh\xf4ng c\xf3 trailing slash). \u0110i\u1ec1u n\xe0y v\u1eeba l\xe0 \u0111i\u1ec3m m\u1ea1nh v\u1eeba l\xe0 \u0111i\u1ec3m y\u1ebfu c\u1ee7a n\xf3. \u0110i\u1ec3m m\u1ea1nh l\xe0 n\xf3 r\u1ea5t d\u1ec5 hi\u1ec3u. \u0110i\u1ec3m y\u1ebfu l\xe0 n\xf3 \u0111\xf4i khi l\xe0m cho vi\u1ec7c matching path tr\u1edf n\xean kh\xe1 phi\u1ec1n ph\u1ee9c v\xe0 ph\u1ea3i chia ra nhi\u1ec1u n\u01a1i, nh\u01b0 ch\xfang ta s\u1ebd th\u1ea5y ngay sau \u0111\xe2y."]}),"\n",(0,r.jsxs)(n.p,{children:["V\xec mux ch\u1ec9 h\u1ed7 tr\u1ee3 matching ch\xednh x\xe1c c\u1ee7a path prefix, n\xean ch\xfang ta b\u1eaft \u0111\u1ea7u v\u1edbi ",(0,r.jsx)(n.code,{children:"/task/"}),", ",(0,r.jsx)(n.code,{children:"/tag/"})," v\xe0 ",(0,r.jsx)(n.code,{children:"/due/"})," l\xe0 c\xe1c root c\u1ee7a c\xe1c API. C\xe1c handler cho c\xe1c root n\xe0y \u0111\u01b0\u1ee3c \u0111\u1ecbnh ngh\u0129a trong ",(0,r.jsx)(n.code,{children:"taskHandler"}),", ",(0,r.jsx)(n.code,{children:"tagHandler"})," v\xe0 ",(0,r.jsx)(n.code,{children:"dueHandler"}),":"]}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-go",children:'func (ts *taskServer) taskHandler(w http.ResponseWriter, req *http.Request) {\n  if req.URL.Path == "/task/" {\n    // Request is plain "/task/", without trailing ID.\n    if req.Method == http.MethodPost {\n      ts.createTaskHandler(w, req)\n    } else if req.Method == http.MethodGet {\n      ts.getAllTasksHandler(w, req)\n    } else if req.Method == http.MethodDelete {\n      ts.deleteAllTasksHandler(w, req)\n    } else {\n      http.Error(w, fmt.Sprintf("expect method GET, DELETE or POST at /task/, got %v", req.Method), http.StatusMethodNotAllowed)\n      return\n    }\n'})}),"\n",(0,r.jsxs)(n.p,{children:["Ch\xfang ta b\u1eaft \u0111\u1ea7u v\u1edbi exact match c\u1ee7a path v\u1edbi ",(0,r.jsx)(n.code,{children:"/task/"})," (ngh\u0129a l\xe0 kh\xf4ng c\xf3 ",(0,r.jsx)(n.code,{children:"<taskid>"})," theo sau). \u1ede \u0111\xe2y ta ph\u1ea3i x\xe1c \u0111\u1ecbnh HTTP method n\xe0o \u0111\u01b0\u1ee3c s\u1eed d\u1ee5ng, v\xe0 g\u1ecdi method th\xedch h\u1ee3p. H\u1ea7u h\u1ebft c\xe1c handler \u0111\u1ec1u l\xe0 c\xe1c wrapper \u0111\u01a1n gi\u1ea3n c\u1ee7a ",(0,r.jsx)(n.code,{children:"TaskStore"})," API. H\xe3y xem v\xed d\u1ee5 sau \u0111\xe2y:"]}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-go",children:'func (ts *taskServer) getAllTasksHandler(w http.ResponseWriter, req *http.Request) {\n  log.Printf("handling get all tasks at %s\\n", req.URL.Path)\n\n  allTasks := ts.store.GetAllTasks()\n  js, err := json.Marshal(allTasks)\n  if err != nil {\n    http.Error(w, err.Error(), http.StatusInternalServerError)\n    return\n  }\n  w.Header().Set("Content-Type", "application/json")\n  w.Write(js)\n}\n'})}),"\n",(0,r.jsx)(n.p,{children:"Handler n\xe0y c\xf3 2 vi\u1ec7c ch\xednh:"}),"\n",(0,r.jsxs)(n.ol,{children:["\n",(0,r.jsxs)(n.li,{children:["L\u1ea5y d\u1eef li\u1ec7u t\u1eeb model (",(0,r.jsx)(n.code,{children:"TaskStore"}),")"]}),"\n",(0,r.jsx)(n.li,{children:"\u0110i\u1ec1n v\xe0o HTTP response cho client"}),"\n"]}),"\n",(0,r.jsx)(n.p,{children:"C\u1ea3 2 \u0111\u1ec1u r\u1ea5t tr\u1ef1c quan, nh\u01b0ng n\u1ebfu b\u1ea1n nh\xecn v\xe0o c\xe1c handlers kh\xe1c th\xec b\u1ea1n s\u1ebd th\u1ea5y b\u01b0\u1edbc th\u1ee9 2 l\u1eb7p l\u1ea1i kh\xe1 nhi\u1ec1u - marshal JSON, write HTTP response header, v.v. Ch\xfang ta s\u1ebd quay l\u1ea1i v\u1ea5n \u0111\u1ec1 n\xe0y sau."}),"\n",(0,r.jsxs)(n.p,{children:["B\xe2y gi\u1edd tr\u1edf l\u1ea1i v\u1edbi ",(0,r.jsx)(n.code,{children:"taskHandler"}),"; cho \u0111\u1ebfn nay ch\xfang ta \u0111\xe3 th\u1ea5y c\xe1ch n\xf3 x\u1eed l\xfd c\xe1c exact match c\u1ee7a ",(0,r.jsx)(n.code,{children:"/task/"}),". C\xf2n ",(0,r.jsx)(n.code,{children:"/task/<taskid>"})," th\xec sao?"]}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-go",children:'} else {\n  // Request has an ID, as in "/task/<id>".\n  path := strings.Trim(req.URL.Path, "/")\n  pathParts := strings.Split(path, "/")\n  if len(pathParts) < 2 {\n    http.Error(w, "expect /task/<id> in task handler", http.StatusBadRequest)\n    return\n  }\n  id, err := strconv.Atoi(pathParts[1])\n  if err != nil {\n    http.Error(w, err.Error(), http.StatusBadRequest)\n    return\n  }\n\n  if req.Method == http.MethodDelete {\n    ts.deleteTaskHandler(w, req, id)\n  } else if req.Method == http.MethodGet {\n    ts.getTaskHandler(w, req, id)\n  } else {\n    http.Error(w, fmt.Sprintf("expect method GET or DELETE at /task/<id>, got %v", req.Method), http.StatusMethodNotAllowed)\n    return\n  }\n}\n'})}),"\n",(0,r.jsxs)(n.p,{children:["Khi path kh\xf4ng kh\u1edbp ch\xednh x\xe1c v\u1edbi ",(0,r.jsx)(n.code,{children:"/task/"}),", ch\xfang ta expect c\xf3 m\u1ed9t ID theo sau d\u1ea5u ",(0,r.jsx)(n.code,{children:"/"}),". \u0110o\u1ea1n code tr\xean parses ID n\xe0y v\xe0 g\u1ecdi handler ph\xf9 h\u1ee3p (d\u1ef1a tr\xean HTTP method)."]}),"\n",(0,r.jsxs)(n.p,{children:["Ph\u1ea7n c\xf2n l\u1ea1i th\xec c\u0169ng t\u01b0\u01a1ng t\u1ef1 v\xe0 d\u1ec5 hi\u1ec3u. Ch\u1ec9 c\xf3 ",(0,r.jsx)(n.code,{children:"createTaskHandler"})," h\u01a1i \u0111\u1eb7c bi\u1ec7t, v\xec n\xf3 ph\u1ea3i parse JSON data \u0111\u01b0\u1ee3c g\u1eedi b\u1edfi client trong request body. C\xf3 m\u1ed9t v\xe0i \u0111i\u1ec3m v\u1ec1 JSON parsing m\xe0 t\xf4i kh\xf4ng \u0111\u1ec1 c\u1eadp - h\xe3y xem ",(0,r.jsx)(n.a,{href:"/blog/2023/how-to-properly-parse-a-json-request-body",children:"b\xe0i vi\u1ebft n\xe0y"})," \u0111\u1ec3 bi\u1ebft chi ti\u1ebft h\u01a1n."]}),"\n",(0,r.jsx)(n.h2,{id:"making-improvements",children:"Making improvements"}),"\n",(0,r.jsx)(n.p,{children:"B\xe2y gi\u1edd ch\xfang ta \u0111\xe3 c\xf3 m\u1ed9t server c\u01a1 b\u1ea3n, h\xe3y xem xem n\xf3 c\xf3 th\u1ec3 c\xf3 nh\u1eefng v\u1ea5n \u0111\u1ec1 n\xe0o hay c\xf3 th\u1ec3 c\u1ea3i thi\u1ec7n \u0111\u01b0\u1ee3c ch\u1ed7 n\xe0o."}),"\n",(0,r.jsxs)(n.p,{children:["\u0110i\u1ec1u d\u1ec5 nh\u1eadn th\u1ea5y nh\u1ea5t l\xe0 ta c\xf3 th\u1ec3 c\u1ea3i thi\u1ec7n ph\u1ea7n l\u1eb7p \u0111i l\u1eb7p l\u1ea1i render JSON v\xe0o HTTP response. Chi ti\u1ebft b\u1ea1n c\xf3 th\u1ec3 xem ",(0,r.jsx)(n.a,{href:"https://github.com/ducnguyen96/ducnguyen96.github.io/tree/master/static/code/docs/go/rest-server/stdlib-factorjson",children:"\u1edf \u0111\xe2y"}),". D\u01b0\u1edbi \u0111\xe2y l\xe0 \u0111i\u1ec3m thay \u0111\u1ed5i ch\xednh:"]}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-go",children:'// renderJSON renders \'v\' as JSON and writes it as a response into w.\nfunc renderJSON(w http.ResponseWriter, v interface{}) {\n  js, err := json.Marshal(v)\n  if err != nil {\n    http.Error(w, err.Error(), http.StatusInternalServerError)\n    return\n  }\n  w.Header().Set("Content-Type", "application/json")\n  w.Write(js)\n}\n'})}),"\n",(0,r.jsx)(n.p,{children:"S\u1eed d\u1ee5ng h\xe0m n\xe0y th\xec ta c\xf3 th\u1ec3 vi\u1ebft l\u1ea1i t\u1ea5t c\u1ea3 c\xe1c handlers m\u1ed9t c\xe1ch ng\u1eafn g\u1ecdn h\u01a1n, ch\u1eb3ng h\u1ea1n nh\u01b0 sau:"}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-go",children:'func (ts *taskServer) getAllTasksHandler(w http.ResponseWriter, req *http.Request) {\n  log.Printf("handling get all tasks at %s\\n", req.URL.Path)\n\n  allTasks := ts.store.GetAllTasks()\n  renderJSON(w, allTasks)\n}\n'})}),"\n",(0,r.jsxs)(n.p,{children:["M\u1ed9t \u0111i\u1ec3m c\u1ea3i thi\u1ec7n kh\xe1c m\xe0 ta c\xf3 th\u1ec3 ngh\u0129 \u0111\u1ebfn l\xe0 l\xe0m cho vi\u1ec7c matching path tr\u1edf n\xean clear, hi\u1ec7n t\u1ea1i th\xec n\xf3 \u0111ang kh\xf4ng \u0111\u01b0\u1ee3c r\xf5 r\xe0ng cho l\u1eafm, ch\u1eb3ng h\u1ea1n n\u1ebfu mu\u1ed1n bi\u1ebft m\u1ed9t DELETE request t\u1edbi ",(0,r.jsx)(n.code,{children:"/task/<taskid>"})," s\u1ebd \u0111i t\u1edbi \u0111\xe2u:"]}),"\n",(0,r.jsxs)(n.ol,{children:["\n",(0,r.jsxs)(n.li,{children:["\u0110\u1ea7u ti\xean, t\xecm mux trong ",(0,r.jsx)(n.code,{children:"main"})," v\xe0 th\u1ea5y r\u1eb1ng ",(0,r.jsx)(n.code,{children:"/task/"})," s\u1ebd \u0111i t\u1edbi ",(0,r.jsx)(n.code,{children:"taskHandler"})]}),"\n",(0,r.jsxs)(n.li,{children:["Sau \u0111\xf3 trong ",(0,r.jsx)(n.code,{children:"taskHandler"})," ta ph\u1ea3i t\xecm ",(0,r.jsx)(n.code,{children:"else"})," khi m\xe0 route kh\xf4ng exact match v\u1edbi ",(0,r.jsx)(n.code,{children:"/task/"}),". Sau \u0111\xf3 ph\u1ea3i \u0111\u1ecdc ti\u1ebfp ph\u1ea7n code \u0111\u1ec3 parse ",(0,r.jsx)(n.code,{children:"<taskid>"})," th\xe0nh 1 integer"]}),"\n",(0,r.jsxs)(n.li,{children:["Cu\u1ed1i c\xf9ng th\xec ph\u1ea3i check request method m\u1edbi t\u1edbi \u0111\u01b0\u1ee3c ",(0,r.jsx)(n.code,{children:"deleteTaskHandler"})]}),"\n"]}),"\n",(0,r.jsxs)(n.p,{children:["Vi\u1ec7c \u0111\u1eb7t 3 b\u01b0\u1edbc tr\xean v\xe0o 1 ch\u1ed7 duy nh\u1ea5t sao cho d\u1ec5 hi\u1ec3u v\xe0 tr\u1ef1c quan nh\u1ea5t l\xe0 m\u1ee5c ti\xeau m\xe0 c\xe1c th\u01b0 vi\u1ec7n b\xean th\u1ee9 3 h\u01b0\u1edbng t\u1edbi. Ch\xfang ta s\u1ebd t\xecm hi\u1ec3u v\u1ec1 \u0111i\u1ec1u n\xe0y \u1edf ",(0,r.jsx)(n.a,{href:"/docs/go/rest-server/using-a-router-package",children:"b\xe0i vi\u1ebft ti\u1ebfp theo"}),"."]}),"\n",(0,r.jsx)(n.h2,{id:"ngu\u1ed3n",children:"Ngu\u1ed3n"}),"\n",(0,r.jsxs)(n.ul,{children:["\n",(0,r.jsx)(n.li,{children:(0,r.jsx)(n.a,{href:"https://eli.thegreenplace.net/2021/rest-servers-in-go-part-1-standard-library/",children:"https://eli.thegreenplace.net/2021/rest-servers-in-go-part-1-standard-library/"})}),"\n"]}),"\n",(0,r.jsxs)(n.section,{"data-footnotes":!0,className:"footnotes",children:[(0,r.jsx)(n.h2,{className:"sr-only",id:"footnote-label",children:"Footnotes"}),"\n",(0,r.jsxs)(n.ol,{children:["\n",(0,r.jsxs)(n.li,{id:"user-content-fn-1",children:["\n",(0,r.jsxs)(n.p,{children:["Ch\xfang ta s\u1ebd th\u1ea3o lu\u1eadn v\u1ec1 nh\u1eefng c\xe1ch c\xf3 c\u1ea5u tr\xfac/ti\xeau chu\u1ea9n h\u01a1n trong c\xe1c ph\u1ea7n sau. ",(0,r.jsx)(n.a,{href:"#user-content-fnref-1","data-footnote-backref":"","aria-label":"Back to reference 1",className:"data-footnote-backref",children:"\u21a9"})]}),"\n"]}),"\n"]}),"\n"]})]})}function o(e={}){const{wrapper:n}={...(0,s.a)(),...e.components};return n?(0,r.jsx)(n,{...e,children:(0,r.jsx)(l,{...e})}):l(e)}},1151:(e,n,t)=>{t.d(n,{Z:()=>h,a:()=>a});var r=t(7294);const s={},c=r.createContext(s);function a(e){const n=r.useContext(c);return r.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function h(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(s):e.components||s:a(e.components),r.createElement(c.Provider,{value:n},e.children)}}}]);