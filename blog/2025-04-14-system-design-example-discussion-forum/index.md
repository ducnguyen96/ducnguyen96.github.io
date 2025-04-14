---
slug: system-design-discussion-forum
title: "System Design Example: Discussion Forum"
authors: [ducnguyen]
tags: [system design]
---

# System Design Example: Discussion Forum

Design a Highly Scalable Public Discussion Forum(like Reddit, Quora, Stack Overflow, etc):

- Post questions/news to the public
- Comments on existing posts
- Upvote/Downvote posts/comments
- Feed of most popular posts

<!-- truncate -->

## System Design Step-By-Step Process

1. **Ask Questions** to capture

- Function Requirements

- Non-Functional Requirements

- System Constraints

2. Define the System's API

3. Create a Software Architecture Diagram to fulfill the Functional Requirements

4. Refine the Software Architecture Diagram to address the Non-Functional Requirements

## 1. Ask questions

- Can anyone post or view posts/comments? (or just logged in users)
- What can a post contain? (text/images/video)
- What is the meaning of "most popular posts"? (define popular)
- What is the structure of comments? (flat list vs tree)

### 1.1. Functional Requirements

1. A user can **signup** and **login** to post, vote, comment.
2. A user should be able to create a **new post** that contains a

- Title
- Topic tags
- Body(text or uploaded images)

3. A user should be able to **comment** on any existing post
4. **Comments** are ordered **chronologically** as a **flast list**
5. User can **delete** their own **post** or **comment**
6. **Logged-in** user can **update/downvote** an existing **post/comment**
7. Present the top **most popular posts**(Upvotes - Downvotes) in the **last 24 hours** on the homepage

### 1.2. Non-Functional Requirements

1. **Scalability** (millions of daily users)
2. **Performance** (less than 500ms response time 99p)
3. **Fault Tolerance/High Availability** (99.9%)
4. **Availability + Partition Tolerance** (AP over CP)
5. **Durability**

### 1.3. Constraints

1. **Technologies**
2. **Cloud Vendors**

## 2. API Definition

### 2.1. Identifying entities

- Users
- Posts
- Images
- Comments
- Votes

### 2.2. Mapping entities to URIs

```
users     ----------> /users
                      /users/{user-id}

posts     ----------> /posts
                      /posts/{post-id}

comments  ----------> /posts/{post-id}/comments
                      /posts/{post-id}/comments/{comment-id}

images    ----------> /posts/{post-id}/images
                      /posts/{post-id}/imagse/{image-id}

votes     ----------> /posts/{post-id}/vote
                      /posts/{post-id}/comments/{comment-id}/vote
```

### 2.3. Defining resources representations

**Posts**

`GET /posts/{post-id}`

```json
{
  "post_id": "12345sfe",
  "title": "How do I make money with stocks?",
  "user_id": "fesfkjes",
  "topics": ["investing", "stocks", "trading"],
  "upvotes": 5,
  "downvotes": 1,
  "body": "......"
}
```

**Comments**

`GET /posts/{post-id}/comments/{comment-id}`

```json
{
  "post_id": "12345sfe",
  "comments": [
    {
      "comment_id": 1231,
      "body": "I agree",
      "user_id": "esfkesh",
      "upvotes": 50,
      "downvotes": 3
    }
  ]
}
```

### 2.4. Assigning HTTP Methods to operations on resources

**Users**

```
POST /users/create  ----> create new user
     /users/login   ----> login existing user
```

**Posts**

```
POST   /posts            ----> create new post
GET    /posts            ----> view posts
GET    /posts/{post-id}  ----> view a post
DELETE /posts/{post-id}  ----> delete a post
```

### 2.5. API Pagination

## 3. Architecture Diagram

First we know that this is a web-based forum so we need a `Web App Service`

```
User ------> Web App Service
```

### 3.1. FR1 - A user can **signup** and **login** to post, vote, comment.

Since we're designing for scale, we'll follow microservice architecture style.

So we'll have a `Users Service` and the service will have a database to store the user's account information. We can use a SQL database here.

```
              create new user
  |----------------------------------> Users Service--[(SQL Database)]
  |             user login
  |
User ------> Web App Service
```

### 3.2. FR2 - A user should be able to create a **new post**

We will create another service called the `Posts Service` and we'll stwore the posts in a database.

Since we want to keep the structure of a post open ended, we'll use a NoSQL database

In addition, we need a place to store the images in that post. So we'll add an object store or a blob store for that purpose. So when user creates a new post, they can first upload their image, then the UI will reference that image URL in the post body markdown, which will be sent to the post service and stored in the database.

```
              create new user
  |----------------------------------> Users Service--[(SQL Database)]
  |             user login
  |
  |            create a post
  |----------------------------------> Posts Service--[(NoSQL Database)]
  |              view a post
  |
User ------> Web App Service--[(Blob Store)]
  ^                                 |
  |            get image            |
  |---------------------------------|
```

### 3.3. FR3 - A user should be able to **comment** on any existing post

Since comments and posts have very similar structure except they are alot more simpler. We'll combine `Comments Service` and `Posts Service` into one called `Posts and Comments Service`

We'll add `Comments Collection` to the same database with Posts so that we can load posts with comments easily.

### 3.4. FR6 - **Logged-in** user can **update/downvote** an existing **post/comment**

At first glance this looks very simple, we'll might think adding a counter is enough. But looking at the seventh requirement and we need to ensure that each user can only upvote/downvote 1 time on a vote/comment. We'll need to store the vote.

We'll create another service called `Votes Service` with a NoSQL Database. Each record need to have the follow information.

```json
{
  "user_id", "fesfesfs", "comment_id": "f4uhrfiwuh", "vote": 1, "timestamp": 23283749
  "user_id", "fesfesfs", "post_id": "esks", "vote": 1, "timestamp": 213422
}
```

We know that counting the votes this way is insufficient but we'll talk about it later.

```
              create new user
  |----------------------------------> Users Service--[(SQL Database)]
  |             user login
  |
  |            create/view/delete a post
  |----------------------------------> Posts/Comments Service--[(NoSQL Database)]
  |          create/view/delete a comment
  |
User ------> Web App Service--[(Blob Store)]
  ^                                 |
  |            get image            |
  |---------------------------------|
  |
  |         upvote/downvote
  |----------------------------------> Votes Service--[(NoSQL Database)]
```

### 3.5. FR7 - Present the top **most popular posts**

So to get the most popular posts we need to join information about posts and votes.

Since they are in 2 separate databases we'll use a variation of CQRS architecture pattern.

Using this pattern we'll pull information of posts and votes to another service called `Ranking Service` with a seperate NoSQL Database to store the posts in a sorted and ready to serve way.

#### Observations

- Recalculating and ranking the posts continuously is expensive
- No strict requirement to keep the list of posts,sorted all the times.

==> **Batch Processing**

So combine Batch Processing with CQRS pattern the ranking service will run maybe once in 10 minutes or 30 minutes or in an hour. Every time it runs it will pull the votes from the `Votes Service` in the last 24 hours.

The `Ranking Service` will sum the votes per post and sort the posts by popularity and the pull the post content from `Posts & Comments Service` and store in the database.

```
              create new user
  |----------------------------------> Users Service--[(SQL Database)]
  |             user login
  |
  |            create/view/delete a post
  |----------------------------------> Posts/Comments Service--[(NoSQL Database)]
  |          create/view/delete a comment         |
  |                                               | Posts
User ------> Web App Service--[(Blob Store)]      |
  ↑             |                   |             |
  |             | get popular posts |             ↓
  |             |------------------------> Ranking Service--[(NoSQL Database)]
  |                                 |             ↑
  |            get image            ↓             |
  |<--------------------------------|             |
  |                                               | Votes
  |         upvote/downvote                       |
  |----------------------------------> Votes Service--[(NoSQL Database)]
```

## 4. Non-Functional Requirements

### 4.1. Scalability

As the first step, we can place a load balancer in front of all the services.

Then we can place an API gateway to decouple the frontend code from the system's internal structure. This will allow us to make changes internally and increase our organizational scalability.

On the posts and comments database side, as we store more posts and comments, our database instance maybe run out of space. It also may not be able to hanlde the traffic from so many users.

So the solution will be sharding our posts and comments collections across different database shards. This way we can scale to as many posts or comments as we want by adding more instances and distributing our database across all those instances.

#### How to shard our data.

We can shard the posts easily by applying a hash function on the post ID, which should evenly distribute the posts across different shards.

On the other hand, when it comes to sharding comments, we need to think about it a bit harder.

If we simply shard comment ID using a hash function, we will distribute the comments among different shards. However, that means that comments from the same post will end up on completely different computers and getting them to the user will result in an inefficient broadcast operation to all our database shards.

If we shard comments using post ID, comments of same post will go to same shard however the comments will not be distributed evenly.

So the solution is using `Range Sharding Strategy` on compound index of post_id, comment_id which many NoSQL databases support.

### 4.2. Performance

#### Static files

--> using CDN

#### API level

--> caching

#### Databases level

1. Database indexing:

- post_id
- compound index (post_id, comment_id)

#### Message Broker

We can add a message broker publish event upvote/downvote so that we can increase/decrease the number the votes in `Posts/Comments Service`.

### 4.3. Fault Tolerance

To ensure we don't lose any data. We can introduce database replication.

Similarly, every message broker data store, microservice is replicated, adding to our overall system's full tolerance.

In addition, we can run our system across multiple data centers in different geographical locations and utilize a `GLBS- Global Load Balancing Service`. This way we can always fall over to another region if there is a natural disaster in one of those regions.
