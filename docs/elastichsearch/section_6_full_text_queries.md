---
sidebar_position: 7
---

# Full Text Queries

## Match query

```bash
GET /recipe/_search
{
  "query": {
    "match": {
      "title": "Recipes with pasta or spaghetti"
    }
  }
}
```

## Matching phrase

```bash
GET /recipe/_search
{
  "queyr": {
    "match_phrase": {
      "title": "spaghetti puttanesca"
    }
  }
}
```

## Searching multiple fields

```bash
GET /recipe/_search
{
  "queyr": {
    "multi-match": {
      "query": "pasta",
      "fields": ["title", "description"]
    }
  }
}
```
