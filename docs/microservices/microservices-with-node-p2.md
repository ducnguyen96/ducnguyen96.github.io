---
sidebar_position: 4
---

# Một mini-microservices app

Ở bài trước thì chúng ta đã thấy một vài notes về cách chúng ta xử lý vấn đề giao tiếp giữa các microservices, bây giờ thì hãy bắt đầu viết một vài dòng code nào 😄.

Giờ ta sẽ xem qua mock-up của app mà chúng ta sẽ build để có hiểu hơn về async communication. Dưới đây là một vài chú ý về project tiếp theo chúng ta sẽ build.

## App Overview

![microservices-dg-27](/img/docs/microservices/microservices-dg-27.png)

- Mục tiêu đầu tiên của project là có cái nhìn qua về kiến trúc microservice. Ta sẽ build một project lớn hơn và toàn diện hơn sau, còn project thì chỉ với mục đích là làm quen với microservices.
- Mục tiêu thứ 2 là build mọi thứ từ đầu nhiều nhất có thể để hiểu được cách hoạt động của microservices.
- ℹ️ _Không nên sử dụng project này như một template nhé._

![microservices-dg-28](/img/docs/microservices/microservices-dg-28.png)
Chúng ta sẽ build một web app đơn giản có tính năng như tạo post, và comment vào post. Post sẽ chỉ có title không có body, ảnh hay bất cứ thứ gì khác.

Khi user mới vào app thì sẽ hiện 1 form để cho user nhập title, sau đó user submit thì sẽ hiển thị post ở dưới, mỗi post sẽ có 1 ô input để user có thể comment, sau khi submit thì post sẽ update số comment cũng như chi tiết về comment ở dưới.

Nhìn qua thì có vẻ rất đơn giản đúng không, nhưng với microservices thì cũng không đơn giản cho lắm đâu 😄

Đầu tiên thì chúng ta phải nghĩ là cần những service nào cho app này.
![microservices-dg-28](/img/docs/microservices/microservices-dg-29.png)
Với app này thì ta cần quản lý 2 resource đó là post và comment, trong một dự án thực tế thì không hẳn cứ phải tạo mỗi service riêng cho từng resource nhưng đối với project này thì ta sẽ làm như vậy để hiểu được cách giao tiếp giữa 2 services.
![microservices-dg-30](/img/docs/microservices/microservices-dg-30.png)
Ta sẽ tạo 2 services là postservice có chức năng là tạo post là list tất cả các post, commentservice có chức năng là tạo comment và list tất cả comment của post. Nhìn qua thì thấy postservice có vẻ đơn giản, nó chỉ cần 1 database lưu tất cả các post thế là ổn, còn commentservice thì có phức tạp hơn 1 xíu, lúc tạo 1 comment thì ta sẽ gắn comment đó với 1 post, vì vậy có depend với postservice nên chúng ta sẽ phải sử dụng 1 trong 2 cách giao tiếp đó là sync hoặc async, tương tự thì lúc list comment cũng thế, ta không thể list toàn bộ comment trong database ra cùng lúc mà ta sẽ chỉ trả comments tương ứng với từng post cụ thể.

## Project setup

Sau một đống lý thuyết thì cuối cùng cũng đến lúc được viết code rồi 😄

Đầu tiên nhìn lại cấu trúc project mà chúng ta sẽ build nhé.
![microservices-dg-31](/img/docs/microservices/microservices-dg-31.png)
Phía client thì ta sẽ dựng 1 web app với react, browser sẽ gửi request về các services, các service này được build với expressjs, hiện tại thì ta sẽ không sử dụng database cho project, chúng ta sẽ giải quyết vấn đề về database sau, project này ta sẽ lưu tất cả data trong bộ nhớ.

![microservices-dg-32](/img/docs/microservices/microservices-dg-32.png)

```javascript
yarn create react-app client
```

```javascript
mkdir posts
yarn init -y
yarn add express cors axios nodemon
```

```javascript
mkdir comments
yarn init -y
yarn add express cors axios nodemon
```

## Posts Service

Đầu tiên thì ta sẽ implement posts service cơ bản với expressjs để thực hiện các features của nó là tạo post và list posts, tạm chưa quan tâm tới microservices.
![microservices-dg-33](/img/docs/microservices/microservices-dg-33.png)
Vậy với post service thì ta sẽ tạo 1 route là /posts. Với method GET thì ta sẽ trả về tất cả các post và với method POST cùng với body chứa title thì ta sẽ tạo 1 post mới.

![microservices-dg-34](/img/docs/microservices/microservices-dg-34.png)
Ở đây ta sẽ sử dụng biến `posts = {}` để lưu tất cả các posts, điểm trừ ở đây là mỗi khi reset lại service thì sẽ mất tất cả các posts. Ngoài ra thì chúng ta sử dụng randomBytes để tạo unique id cho từng post.

![microservices-dg-35](/img/docs/microservices/microservices-dg-35.png)
Mình sử dụng [insomnia](https://insomnia.rest/) để test lại 2 api vừa code. Response trả về statuscode 200 và body như mong muốn 😄

## Comments Service

Tiếp theo ta sẽ code comments service nhưng trước hết điểm qua requirements.
![microservices-dg-36](/img/docs/microservices/microservices-dg-36.png)
Comments serrvice cos 1 route là /posts/:id/comments/. Với method POST thì tạo 1 comment tương ứng với post id và với method GET thì trả về tất cả comments ứng với postid ấy.
![microservices-dg-37](/img/docs/microservices/microservices-dg-37.png)
Tương tự như posts service thì ta có comments service như trên. Test qua nào
![microservices-dg-38](/img/docs/microservices/microservices-dg-38.png)

## Client

![microservices-dg-39](/img/docs/microservices/microservices-dg-39.png)
Trước khi implement client thì xem lại cấu trúc của phần này nhé. App sẽ có 2 component là PostList và PostCreate. PostCreate là form để user submit post và PostList là component chứa post title, CommnetList và form để user create comment

![microservices-dg-40](/img/docs/microservices/microservices-dg-40.png)

```javascript
// PostCreate
import { useState } from "react";

const PostCreate = (props) => {
  const [title, setTitle] = useState("");
  const onSubmit = (e) => {
    e.preventDefault();

    fetch("http://localhost:4000/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title }),
    })
      .then((response) => response.json())
      .then((_) => {
        props.setNumPost(props.numPost + 1);
        setTitle("");
      });
  };
  return (
    <>
      <h2>PostCreate</h2>
      <form
        action="/posts"
        method="POST"
        onSubmit={onSubmit}
        style={{ borderBottom: "1px solid black" }}
      >
        <label htmlFor="form-input">
          <p>Title</p>
        </label>
        <input
          type="text"
          id="form-input"
          placeholder="post title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ display: "block" }}
        />
        <button type="submit">Submit</button>
      </form>
    </>
  );
};

export default PostCreate;
```

```javascript
// PostList
import { useEffect, useState } from "react";
import Post from "../Post";

const PostList = (props) => {
  const [posts, setPosts] = useState([]);
  useEffect(() => {
    fetch("http://localhost:4000/posts", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })
      .then((data) => data.json())
      .then((data) => setPosts(data));
  }, [props.numPost]);

  return (
    <>
      <div style={{ display: "flex" }}>
        {Object.keys(posts).map((key) => (
          <Post key={key} id={posts[key].id} title={posts[key].title} />
        ))}
      </div>
    </>
  );
};
export default PostList;
```

```javascript
// Post
import { useState, useEffect } from "react";
const Post = (props) => {
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState("");
  useEffect(() => {
    fetch(`http://localhost:4001/posts/:${props.id}/comments`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })
      .then((data) => data.json())
      .then((data) => {
        setComments(data);
      });
  }, []);

  const onSubmit = (e) => {
    e.preventDefault();

    fetch(`http://localhost:4001/posts/:${props.id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: comment }),
    })
      .then((response) => response.json())
      .then((data) => {
        setComments(data);
      });
  };
  return (
    <>
      <div
        className="comment"
        style={{ margin: "2px", backgroundColor: "#c4ffff", padding: "10px" }}
      >
        <p>{props.title}</p>
        <span style={{ fontStyle: "italic" }}>{comments.length} comments</span>
        <ul>
          {comments.map((c) => (
            <li key={c.id}>{c.content}</li>
          ))}
        </ul>
        <p>Comment</p>
        <form
          action={`http://localhost:4001/posts/:${props.id}/comments`}
          method="POST"
        >
          <input value={comment} onChange={(e) => setComment(e.target.value)} />
          <button type="submit" onClick={onSubmit}>
            Submit
          </button>
        </form>
      </div>
    </>
  );
};
export default Post;
```

```javascript
// App.js
import { useState } from "react/cjs/react.development";
import PostCreate from "./components/PostCreate";
import PostList from "./components/PostList";

function App() {
  const [numPost, setNumPost] = useState(0);
  return (
    <div className="App">
      <PostCreate setNumPost={setNumPost} numPost={numPost} />
      <PostList numPost={numPost} />
    </div>
  );
}

export default App;
```

![microservices-dg-41](/img/docs/microservices/microservices-dg-41.png)
Hiện tại thì app của chúng ta đã chạy như mong muốn, nhưng có một vấn đề là sau khi query posts, chúng ta có tất cả các posts nhưng để có cả comments thì mỗi post ta lại phải query một lần nữa để lấy tất cả comment. Điều này thực sự không hiệu quả chút nào.

Vậy làm sao ta có thể chỉ với 1 request mà query được toàn bộ posts cũng như comments ? Ta có thể bổ sung thêm trong posts service với get posts api ta sẽ requests đến commentservice để lấy data về comment và trả về comments theo posts luôn. Nhưng như vậy thì số request được gọi vẫn không đổi, ta chỉ đổi từ gọi ở client sang gọi ở server, hơn nữa việc request từ postservice tới commentservice sẽ tạo dependency giữa các services - là vấn đề của sync communication. Và đây cũng chính là lúc ta sẽ sử dụng async communication để giải quyết vấn đề này.
![microservices-dg-42](/img/docs/microservices/microservices-dg-42.png)

Trước khi đi vào implement query service cũng như code lại các service khác để chúng sử dụng event bus thì có thể bạn sẽ có một vài thắc mắc sau đây:
![microservices-dg-43](/img/docs/microservices/microservices-dg-43.png)

1. Chúng ta có thực sự cần tạo thêm service mới mỗi khi cần join data hay không ?

- Không. Trên thực tế thì có thể posts và comments có thể cùng chung 1 service.

2. Sao lại cần quan tâm việc các service độc lập với nhau, cần gì phải dùng async communication làm quái gì cho lằng nhằng ?

- Một trong những lý do chính để sử dụng microservices là tính độc lập giữa các services giúp ứng dụng của bạn không dễ dàng crash hoàn như monolith.

3. Sử dụng cấu trúc phức tạp như vậy chỉ để có chút lợi ích như vậy ?

- Với app hiện tại thì có vẻ như vậy, nhưng khi app bắt đầu lớn lên dần thì sử dụng kiến trúc như này sẽ giúp bạn thấy dễ dàng hơn trong quá trình develope kể cả so với monolith.

4. Hệ thống thiết kế theo dạng event bus có thể sẽ không hoạt động chính xác trong trường hợp như này,... như kia,...

- Như đầu bài mình có nói thì không nên sử dụng app này như 1 template vì app này mục đích chỉ giúp bạn có cái nhìn tổng quan về microservices, project tiếp theo chúng ta sẽ đi sâu vào từng chi tiết hơn cũng như implement lại code một cách chuyên nghiệp hơn và có thể sử dụng để làm production được.

## Event Bus Overview

![microservices-dg-44](/img/docs/microservices/microservices-dg-44.png)

- Có nhiều cách triển khai Event Bus khác nhau: RabbitMQ, Kafka, NATS,... bạn có thể download và tự host để sử dụng hoặc có thể sủ dụng qua các dịch vụ cung cấp sẵn.
- Event Bus dùng để nhận events và publishes events tới listeners. Events ở đây là một dạng thông tin có thể là JSON, có thể là raw bytes cũng có thể là string, nó có thể là bất cứ thứ gì bạn muốn share với các services khác.
- Có nhiều tính năng khiến việc async communication dễ hơn nhiều hoặc khó hơn. Chúng ta sẽ tìm hiểu thêm ở project tiếp theo.
- Chúng ta sẽ sử dụng Expresjs để build event bus, như đã nói thì project này chỉ giúp bạn hiểu được cơ chế hoạt động của microservices nên event bus này cũng vậy, nó thiếu rất nhiều tính năng mà một bus có.
- Project tiếp theo chúng ta sẽ sử dụng event bus được sử dụng trong các project thực tế.

```javascript
// events bus
import axios from "axios";
import cors from "cors";
import bodyParser from "body-parser";
import express from "express";

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.post("/events", async (req, res) => {
  const event = req.body;
  await axios.post("http://localhost:4002/events", event).catch((err) => {
    console.log(err);
  });

  res.send({ status: "OK" });
});

app.listen(4005, () => {
  console.log("Listening on port 4005");
});
```

Ở đây chỉ có query service cần lắng nghe tới event PostCreated và CommentCreated.

## Implement query service

Emit event từ post service

```javascript
// post service
app.post("/posts", async (req, res) => {
  const id = randomBytes(4).toString("hex");
  const { title } = req.body;

  posts[id] = {
    id,
    title,
  };

  await axios
    .post("http://localhost:4005/events", {
      type: "PostCreated",
      data: {
        id,
        title,
      },
    })
    .catch((err) => {
      console.log(err);
    });

  res.status(200).send(posts[id]);
});
```

Emit event từ comment service

```javascript
// comment service
app.post("/posts/:id/comments", async (req, res) => {
  const id = randomBytes(4).toString("hex");
  const { content } = req.body;
  const postId = req.params.id.slice(1);

  const postComments = comments[postId] || [];
  postComments.push({ id, content });

  comments[postId] = postComments;

  await axios
    .post("http://localhost:4005/events", {
      type: "CommentCreated",
      data: {
        postId,
        id,
        content,
      },
    })
    .catch((err) => {
      console.log(err);
    });

  res.status(200).send(postComments);
});
```

Lắng nghe event từ query service

```javascript
// query service
import cors from "cors";
import express from "express";
import bodyParser from "body-parser";

const posts = {};

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.get("/posts", (req, res) => {
  res.send(posts);
});

app.post("/events", (req, res) => {
  const event = req.body;

  switch (event.type) {
    case "PostCreated":
      posts[event.data.id] = event.data;
      break;
    case "CommentCreated":
      const comments = posts[event.data.postId].comments || [];
      comments.push({ id: event.data.id, content: event.data.content });
      posts[event.data.postId].comments = comments;
    default:
      break;
  }
  res.send({ status: "OK" });
});

app.listen(4002, () => {
  console.log("Listening on port 4002");
});
```

Bây giờ thì ta có thể update api endpoint cho client được rồi 😄

```javascript
// PostList
import { useEffect, useState } from "react";
import Post from "../Post";

const PostList = (props) => {
  const [posts, setPosts] = useState([]);
  useEffect(() => {
    fetch("http://localhost:4002/posts", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })
      .then((data) => data.json())
      .then((data) => setPosts(data));
  }, [props.numPost]);

  return (
    <>
      <div style={{ display: "flex" }}>
        {Object.keys(posts).map((key) => (
          <Post
            key={key}
            id={posts[key].id}
            title={posts[key].title}
            comments={posts[key].comments}
          />
        ))}
      </div>
    </>
  );
};
export default PostList;
```

```javascript
// Post
import { useState } from "react";
const Post = (props) => {
  const [comments, setComments] = useState(props.comments || []);
  const [comment, setComment] = useState("");
  // useEffect(() => {
  //   fetch(`http://localhost:4001/posts/:${props.id}/comments`, {
  //     method: "GET",
  //     headers: { "Content-Type": "application/json" },
  //   })
  //     .then((data) => data.json())
  //     .then((data) => {
  //       setComments(data);
  //     });
  // }, []);
  ....
};
export default Post;
```

## Tính năng mới, flag comments

![microservices-dg-45](/img/docs/microservices/microservices-dg-45.png)

Yêu cầu về tính năng mới: đánh dấu 1 comment nếu nó chứa từ 'orange'

![microservices-dg-46](/img/docs/microservices/microservices-dg-46.png)

- Thực tế thì tính năng này cực kỳ dễ làm trên react, chỉ cần hard code check là xong, tuy nhiên nếu từ khóa này thay đổi nhiều lần thì sẽ không phù hợp nếu ta deploy lại react app liên tục.
- Tính năng này cũng dễ nếu implement luôn trên comments service hiện tại tuy nhiên vì mục đích nêu lên được vấn đề về event bus nên ta sẽ sử dụng 1 service mới.
- Cũng tương tự như trên thì ta sẽ giả sử service mới này mất nhiều thời gian để đánh giá cũng như chỉnh sửa comment.

![microservices-dg-47](/img/docs/microservices/microservices-dg-47.png)

### Yêu cầu

Yêu cầu của tính năng này là sau khi comment, nếu service mới - `moderate service` chưa xử lý xong comment thì user phải nhận được trạng thái của comment là `awaiting` chứ không phải không thấy comment, sau khi xử lý xong thì nếu được approve comment sẽ hiển thị bình thường còn không sẽ hiển thị bị rejected.

![microservices-dg-48](/img/docs/microservices/microservices-dg-48.png)
Để user biết được trạng thái của comment thì react app phải biết được sự khác nhau giữa các trạng thái.

![microservices-dg-49](/img/docs/microservices/microservices-dg-49.png)

### Solution

Cách tiếp cận đầu tiên mà ta nghĩ đến là: Sau khi user summit comment, comment service sẽ tạo 1 event, event này sẽ được lắng nghe bởi moderation service, moderation service sẽ đánh giá comment và update trạng thái của comment sau đó tạo 1 event mới, query service lắng nghe event này và update lại comment trong db của mình.

Như đã giả sử ở trên thì moderation service này có thể mất nhiều thời gian để xử lý comment mới được tạo, ví dụ như cần xử lý ngôn ngữ tự nhiên chẳng hạn hoặc cần liên quan đến hệ thống recommendation, nếu sử dụng cách tiếp cận trên thì user sẽ phải chờ 1 lúc để moderation handle xong mới thấy comment của mình được hiển thị.
![microservices-dg-50](/img/docs/microservices/microservices-dg-50.png)

Để giải quyết vấn đề của cách tiếp cận đầu tiên thì ta có thể nghĩ đến ngay là ngay khi có event CommentCreated từ commentservice thì đồng thời queryservice cũng lắng nghe event này và update vào db với status là pending, sau khi moderation kiểm tra comment xong thì sẽ emit event với type là CommentModerated, queryservice lại nhận được event này và update status mới cho queryservice.

![microservices-dg-51](/img/docs/microservices/microservices-dg-51.png)
Chúng ta đã giải quyết được vấn đề user sẽ không thấy gì xảy ra sau khi comment bằng cách trên vì phải chờ moderation xử lý bằng cách trên nhưng liệu nó có ổn với 1 app lớn với 1 hệ thống comment phức tạp ?

QueryService được tạo ra với mục đích là lấy dữ liệu, nó không nên quan tâm tới bất cứ thứ gì khác như buniness,... Nếu chỉ với 1 type là Moderated thì sẽ ổn nhưng với nhiều type như vậy và nhiều xử lý khác nhau như vậy thì ta nên chúng ở một service khác chuyên biệt về comment hơn như CommentService.
![microservices-dg-52](/img/docs/microservices/microservices-dg-52.png)

### Tạo Moderation Service

Đầu tiên tạo moderation service lắng nghe CommentCreated event.

```javascript
// moderation service
import cors from "cors";
import express from "express";
import bodyParser from "body-parser";
import axios from "axios";

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.post("/events", async (req, res) => {
  const event = req.body;

  switch (event.type) {
    case "CommentCreated":
      event.data.status = event.data.content.includes("orange")
        ? "rejected"
        : "approved";
      await axios
        .post("http://localhost:4005/events", {
          type: "CommentModerated",
          data: event.data,
        })
        .catch((err) => {
          console.log(err);
        });
    default:
      break;
  }
  res.send({ status: "OK" });
});

app.listen(4003, () => {
  console.log("Listening on port 4003");
});
```

### Send CommentModerated Event To CommentService

EventBus sẽ gửi event đến comment service khi comment được moderated.

```javascript
// event service
app.post("/events", async (req, res) => {
  const event = req.body;
  switch (event.type) {
    case "CommentCreated":
    case "PostCreated":
      await Promise.all([
        axios.post("http://localhost:4002/events", event),
        axios.post("http://localhost:4003/events", event),
      ]).catch((err) => {
        console.log(err);
      });
      break;
    case "CommentModerated":
      await axios.post("http://localhost:4001/events", event).catch((err) => {
        console.log(err);
      });
      break;
    case "CommentUpdated":
      await axios.post("http://localhost:4002/events", event).catch((err) => {
        console.log(err);
      });
      break;
    default:
      break;
  }

  res.send({ status: "OK" });
});
```

### Handle CommentModerated Event

CommentService nhận thấy comment được moderated và update lại db đồng thời emit 1 event báo cho query service rằng comment vừa được update

```javascript
// comment service
app.post("/events", async (req, res) => {
  const event = req.body;

  switch (event.type) {
    case "CommentModerated":
      const comment = comments[event.data.postId].find(
        (c) => c.id === event.data.id,
      );
      comment.status = event.data.status;
      await axios
        .post("http://localhost:4005/events", {
          type: "CommentUpdated",
          data: event.data,
        })
        .catch((err) => {
          console.log(err);
        });
    default:
      break;
  }
  res.send({ status: "OK" });
});
```

### Handle CommentUpdated Event

QueryService nhận được event rằng comment được update nên update lại comment,

```javascript
// query service
app.post("/events", (req, res) => {
  const event = req.body;

  switch (event.type) {
    case "PostCreated":
      posts[event.data.id] = event.data;
      break;
    case "CommentCreated":
      const comments = posts[event.data.postId].comments || [];
      comments.push({
        id: event.data.id,
        content: event.data.content,
        status: event.data.status,
      });
      posts[event.data.postId].comments = comments;
      break;
    case "CommentUpdated":
      const comment = posts[event.data.postId].comments.find(
        (c) => c.id === event.data.id,
      );
      comment.status = event.data.status;
    default:
      break;
  }
  res.send({ status: "OK" });
});
```

### Missing Event

![microservices-dg-53](/img/docs/microservices/microservices-dg-53.png)
Vậy là mọi thứ có vẻ đã hoàn hảo, comment của user sẽ được xử lý ngay lập tức và được update lại sau khi moderation service xử lý xong.

![microservices-dg-54](/img/docs/microservices/microservices-dg-54.png)

Tuy nhiên nhìn kết quả phía trên, comment thứ 3 ta thấy lúc moderation service bị crash thì sẽ xảy ra hiện tượng missing event, moderation service đã miss 1 event CommentCreated dẫn tới không check được comment content đồng thời update lại status của comment.

![microservices-dg-55](/img/docs/microservices/microservices-dg-55.png)
Bất kỳ service nào bị crash cũng sẽ gây ảnh hưởng toàn bộ đến app. Vậy có cách giải quyết nào không.

### Missing Event Solution

![microservices-dg-56](/img/docs/microservices/microservices-dg-56.png)

Có thể bạn không tin nhưng đúng rồi đấy, trên thực tế thì người ta sẽ lưu trữ các event lại để tránh trường hợp bị missing event. Service bị crash sau khi start lại sẽ query để tìm những event cần được thực thi và thực thi chúng.

Ta sẽ lưu lại event

```javascript
// event service
const events = [];
app.post("/events", async (req, res) => {
  const event = req.body;
  events.push(event);
...
```

Query event

```javascript
// event service
app.get("/events", (req, res) => {
  res.send(events);
});
```

Query events mỗi khi start

```javascript
// query service
const handleEvent = (event) => {
  switch (event.type) {
    case "PostCreated":
      posts[event.data.id] = event.data;
      break;
    case "CommentCreated":
      const comments = posts[event.data.postId].comments || [];
      comments.push({
        id: event.data.id,
        content: event.data.content,
        status: event.data.status,
      });
      posts[event.data.postId].comments = comments;
      break;
    case "CommentUpdated":
      const comment = posts[event.data.postId].comments.find(
        (c) => c.id === event.data.id,
      );
      comment.status = event.data.status;
    default:
      break;
  }
};

app.post("/events", (req, res) => {
  const event = req.body;
  handleEvent(event);

  res.send({ status: "OK" });
});

app.listen(4002, async () => {
  const res = await axios.get("http://localhost:4005/events");

  for (let event of res.data) {
    handleEvent(event);
  }
  console.log("Listening on port 4002");
});
```

Vậy là ta đã xử lý xong trường hợp missing event cho query service, thử áp dụng vào moderation service nhé.

### Query Missing Event For Moderation Service

```javascript
// moderation service
const handleEvent = async (event) => {
  switch (event.type) {
    case "CommentCreated":
      event.data.status = event.data.content.includes("orange")
        ? "rejected"
        : "approved";
      await axios
        .post("http://localhost:4005/events", {
          type: "CommentModerated",
          data: event.data,
        })
        .catch((err) => {
          console.log(err);
        });
    default:
      break;
  }
};

app.post("/events", async (req, res) => {
  const event = req.body;
  await handleEvent(event);
  res.send({ status: "OK" });
});

app.listen(4003, async () => {
  const res = await axios.get("http://localhost:4005/events");

  for (let event of res.data) {
    await handleEvent(event);
  }
  console.log("Listening on port 4003");
});
```

Vậy là chúng ta đã hoàn thành được 1 mini microservice app, nắm được các khái niệm cơ bản về microservice. Bài tiếp theo chúng ta sẽ sử dụng docker để deploy chạy các services trên. Các bạn nhớ đón xem nhé 😄
