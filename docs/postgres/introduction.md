---
sidebar_position: 1
---

# Introduction

Why Postgres ?

- Relational Database.
- Open-source.

## Creating a User and Database

```sql
CREATE USER pg4e WITH PASSWORD 'secret';

CREATE DATABASE people WITH OWNER 'pg4e';
```

## Connecting to a Database

```bash
psql people pg4e
```

## Creating a table

```sql
CREATE TABLE users (
  name VARCHAR(128),
  email VARCHAR(128)
);
```

## Display tables

```bash
\dt
```

## Describe table

```bash
\d+ users
```
