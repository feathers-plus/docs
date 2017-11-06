---
title: Common Patterns
type: guide
order: 3
dropdown: extensions
repo: batch-loader
---

## Sample Data

These recipes call Feathers database services containing the following data:

``` js
// app.service('posts')
const postsStore = [
  { id: 1, body: 'John post', userId: 101, starIds: [102, 103, 104] },
  { id: 2, body: 'Marshall post', userId: 102, starIds: [101, 103, 104] },
  { id: 3, body: 'Barbara post', userId: 103 },
  { id: 4, body: 'Aubree post', userId: 104 }
];

// app.service('comments')
const commentsStore = [
  { id: 11, text: 'John post Marshall comment 11', postId: 1, userId: 102 },
  { id: 12, text: 'John post Marshall comment 12', postId: 1, userId: 102 },
  { id: 13, text: 'John post Marshall comment 13', postId: 1, userId: 102 },
  { id: 14, text: 'Marshall post John comment 14', postId: 2, userId: 101 },
  { id: 15, text: 'Marshall post John comment 15', postId: 2, userId: 101 },
  { id: 16, text: 'Barbara post John comment 16', postId: 3, userId: 101 },
  { id: 17, text: 'Aubree post Marshall comment 17', postId: 4, userId: 102 }
];

// app.service('users')
const usersStore = [
  { id: 101, name: 'John' },
  { id: 102, name: 'Marshall' },
  { id: 103, name: 'Barbara' },
  { id: 104, name: 'Aubree' }
];
```

## Recipes

222

### blah blah

333
