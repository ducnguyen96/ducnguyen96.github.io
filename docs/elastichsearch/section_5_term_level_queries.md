---
sidebar_position: 6
---

# Term Level Queries

## 1. Searching for a term

```bash
GET /product/_search
{
  "query": {
    "term": {
      "is_active": true
    }
  }
}
```

## 2. Searching for multiple terms

```bash
GET /product/_search
{
  "query": {
    "terms": {
      "tags.keyword": [
        "Soup",
        "Cake"
      ]
    }
  }
}
```

## 3. Retrieving documents based on IDs

```bash
GET /product/_search
{
  "query": {
    "ids": {
      "values": [1, 2, 3]
    }
  }
}
```

## 4. Matching documents with range values

```bash
GET /products/_search
{
  "query": {
    "range": {
      "in_stock": {
        "gte": 1,
        "lte" 5
      }
    }
  }
}
```

## 5. Working with relative date

```bash
GET /products/_search
{
  "query": {
    "range": {
      "created": {
        "gte": "2010/01/01||-1y-1d",
      }
    }
  }
}
```

![rounding](/img/docs/elasticsearch/date_math.png)

Rounding month before subtract.

```bash
GET /products/_search
{
  "query": {
    "range": {
      "created": {
        "gte": "2010/01/01||/M-1y",
      }
    }
  }
}
```

## 6. Matching documents with non-null values

```bash
GET /product/_search
{
  "query": {
    "exists": {
      "field": "tags"
    }
  }
}
```

## 7. Matching based on prefixes

```bash
GEt /product/_search
{
  "query": {
    "prefix": {
      "tags.keyword": "Vege"
    }
  }
}
```

## 8. Searching with wildcard

```bash
GET /product/_search
{
  "query": {
    "wildcard": {
      "tags.keyword": "Veg*ble"
    }
  }
}
```

## 9. Searching with regular expression

```bash
GET /product/_search
{
  "query": {
    "regexp": {
      "tags.keyword": "Veget[a-zA-Z]+ble"
    }
  }
}
```
