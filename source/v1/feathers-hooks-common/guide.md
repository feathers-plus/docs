---
title: Guide
type: guide
order: 1
dropdown: extensions
repo: feathers-hooks-common
---

## fastJoin


We often want to combine rows from two or more tables based on a relationship between them. The `fastJoin` hook will select records that have matching values in both tables. It can batch service calls and cache records, thereby needing roughly an order of magnitude fewer database calls than the `populate` hook, i.e. *2* calls instead of *20*. It uses a [GraphQL](http://graphql.org/)-like imperative API.

`fastJoin` is not restricted to using data from Feathers services. Resources for which there are no Feathers adapters can [also be used](/v1/batch-loader/common-patterns.html#Using-non-Feathers-services). 

### Usage

  ``` js
  const postResolvers = {
    joins: {
      author: ...,
      starers: fieldNames => record => /* modify record */,
      comments: {
        resolver: ...,
        joins: {
          author: ...,
        }
      },
    }
  };
  
  const query = {
    author: true, // or falsy
    starers: ['name'], // [param1, param2, ...]
    comments: {
      args: [...], // [param1, param2, ...]
      author: true,
  };
  
  // Options for hook API
  fastJoin(postResolvers)
  fastJoin(postResolvers, query)
  fastJoin(context => postResolvers)
  fastJoin(postResolvers, context => query) // supports queries from client
  ```
  
The `fastJoin(resolvers, query)` API, like GraphQL, uses resolvers to provide a mapping between a portion of a operation and actual backend code responsible for handling it.

It also takes an optional query with which you can customise the current operation. For example, the returned information may have to differ depending on the needs of the client making the service call. 
    
### Resolvers

  ``` js
  // project/src/services/posts/posts.hooks.js
  const { fastJoin } = require('feathers-hooks-common');
  
  const postResolvers = {
    joins: {
      author: (...args) => async post => { post.author = (await users.find({ query: {
        id: post.userId
      } }))[0] },
      
      starers: $select => async post => { post.starers = await users.find({ query: {
        id: { $in: post.starIds }, $select: $select || ['name']
      } }) },
    }
  };
  
  module.exports = { after: {
      all: [ fastJoin(postResolvers) ],
  } };
  ```
  
The above example has two resolvers. Let's focus on `author`.
  
  Code fragment | Description
  ---|---
  `joins: {}` | Describes what operations to perform on each record stored in the hook.
  `author:` | Every operation has a property name. You use these names in the optional query to control which resolvers are run.
  `(...args) =>` | You can pass parameters in the query to the resolvers.
  `async post => {...}` | The record to be operated on is passed to the resolver func. The resolver function modifies it.
  `=> post.author = ` `await users.find(` `id: post.userId)` | A field is added containing the associated `users` record.
  `[0]` | Extract the single user record from the array returned by `users.find()`.
  `fastJoin(postResolvers)` | When no query is provided, all resolvers are run with undefined params.
  
The result would look like:
  
  ``` js  
  // Original record
  [ { id: 1, body: 'John post', userId: 101, starIds: [102, 103, 104] } ]
  
  // Result
  [ { id: 1,
      body: 'John post',
      userId: 101,
      starIds: [ 102, 103, 104 ],
      author: { id: 101, name: 'John' },
      starers: [ { name: 'Marshall' }, { name: 'Barbara' }, { name: 'Aubree' } ]
  }]
  ```
  
### Shaping the Result

  ``` js
  const query = {
    author: true
  };

  module.exports = { after: {
      all: [ fastJoin(postResolvers, query) ],
  } };
  ```
  
The above query requests the author resolver be run, but not the starers resolver. This is a GraphQL concept which *shapes* the result. The result will not contain the `starers` field which the starers resolver would have otherwise added. 

> All resolvers are run if query is not provided.

  ```js
  // Result
  [ { id: 1,
      body: 'John post',
      userId: 101,
      starIds: [ 102, 103, 104 ],
      author: { id: 101, name: 'John' }
  }]
  ```
  
### Customize Resolver Operation

  ``` js
  const query = {
    author: true,
    starers: [['id', 'name']]
  };
  
  const postResolvers = {
    joins: {
      author: ...,
      
      starers: $select => async post => { post.starers = await users.find({ query: {
        id: { $in: post.starIds }, $select: $select || ['name']
      } }) },
    }
  };

  module.exports = { after: {
      all: [ fastJoin(postResolvers, context => query) ],
  } };
  ```
  
Parameters may be passed to the resolver functions. The `starers` field will contain both the `id` and `name` from the user record, rather than the default of only `name`.
  
The `context => query` syntax shows the query can be dynamically modified based on information provided by the client.

> Being able to create dynamic queries is an important concept to remember.

  ```js  
  // Result
  [ { id: 1,
      body: 'John post',
      userId: 101,
      starIds: [ 102, 103, 104 ],
      author: { id: 101, name: 'John' },
      starers: [
        { id: 102, name: 'Marshall' },
        { id: 103, name: 'Barbara' },
        { id: 104, name: 'Aubree' }]
  }]
  ```
  
### Calculated Fields

  ``` js
  const postResolvers = {
    joins: {
      ...,
      starerCount: () => post => { post.starerCount = post.starIds.length },
    }
  };
  ```
  
A resolver function can make any sort of modification to the passed record; it is not limited to making service calls. Resolvers can use resources for which there is [no Feathers adapter](/v1/batch-loader/common-patterns.html#Using-non-Feathers-services).

Here, the starerCount resolver adds the field `starerCount` containing a count of the `starIds`. 

  ``` js
  // Result
  [ { id: 1,
      body: 'John post',
      userId: 101,
      starIds: [ 102, 103, 104 ],
      starerCount: 3,
      author: { id: 101, name: 'John' },
      starers: [ { name: 'Marshall' }, { name: 'Barbara' }, { name: 'Aubree' } ]
  } ]
  ```
  
### Recursive Operations

We have been operating on the passed record by adding data to it. We can also recursively operate of that added data. We have been using a convenience syntax for resolvers so far:
  ``` js
  // Convenience syntax
  starers: () => record => ...
  // Equivalent to
  starers: {
    resolver: () => record ==> ...
  }
  ```

The syntax for recursive operations uses the syntax below, where the `joins` will operate on the data returned by the comments resolver in the same fashion the top-level `joins` operated on the original record.
  ``` js
  comments: {
    resolver: () => records => ...,
    joins: { ... }
  }
  ```

The comments resolver below adds related comment records to the passed record. The resolver function returns those comments, and that is the data which we will recursively operate on.

> The resolver function must return the data that is to be recursively operated on.

  ``` js
  const postResolvers = {
    joins: {
      comments: {
        resolver: ($select, $limit, $sort) => async post => {
          post.comments = await comments.find({ query: {
            postId: post.id, $select: $select, $limit: $limit || 5, [$sort]: { createdAt: -1 }
          } });
          return post.comments;
        },
        
        joins: {
          author: $select => async comment => { comment.author = (await users.find({ query: {
            id: comment.userId, $select: $select
          } }))[0] },
        },
      },
    }
  };
  
  const query = {
    comments: {
      args: [...],
      author: [['id', 'name']]
    },
  };
  ```
  
  ``` js
  // Original record
  [ { id: 1, body: 'John post', userId: 101, starIds: [102, 103, 104] } ]
    
  // Result
  [ { id: 1,
      body: 'John post',
      userId: 101,
      starIds: [ 102, 103, 104 ],
      comments: 
       [ { id: 11,
           text: 'John post Marshall comment 11',
           postId: 1,
           userId: 102,
           author: { id: 102, name: 'Marshall' } },
         { id: 12,
           text: 'John post Marshall comment 12',
           postId: 1,
           userId: 102,
           author: { id: 102, name: 'Marshall' } },
         { id: 13,
           text: 'John post Marshall comment 13',
           postId: 1,
           userId: 102,
           author: { id: 102, name: 'Marshall' } } ]
  } ]
  ```

### Keeping Resolvers DRY

The comments records contain a `userId` field which we use to associate the user record. Comment records themselves may be associated with posts records, with other comment records, etc.

We don't want to have to include the resolver for the user record every time we include the comment record someplace. We can keep our resolvers [DRY](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself) by defining resolvers for each base table separately and then referring to those resolvers when we need them.

  ``` js
  const commentResolvers = {
    joins: {
      author: $select => async comment => { comment.author = (await users.find({ query: {
        id: comment.userId, $select: $select || [ 'name' ]
      } }))[0] },
    },
  };
  
  const postResolvers = {
    joins: {
      comments: {
        resolver: ($select, $limit, $sort) => async post => {
          post.comments = await comments.find({ query: {
            postId: post.id, $select: $select, $limit: $limit || 5, [$sort]: { createdAt: -1 }
          } });
          return post.comments;
        },
        
        joins: commentResolvers,
      },
    }
  };
  ```
  
The comments resolver no longer has its own resolvers defined inline within its `joins:`. A reference is made to the comments resolver definition. 
  
### Batch-loaders

We have been looking till now into the structure and flexibility of `fastJoin`. What we have done at so far makes as many database calls as the `populate` hook.

We will use batch-loaders to dramatically reduce the number of database calls needed. Its not uncommon for operations that would have required *20* database calls to make only *2* using batch-loaders.

You need to understand batch-loaders before we proceed, so [read about them now.](../batch-loader/guide.html)

### Using a Simple Batch-Loader

  ``` js
  const { fastJoin } = require('feathers-hooks-common');
  const BatchLoader = require('@feather-plus/batch-loader');
  const { loaderFactory } = BatchLoader;
  
  const postResolvers = {
    before: context => {
      context._loaders = { user: {} };
      context._loaders.user.id = loaderFactory(users, 'id', false)(context);
    },
  
    joins: {
      author: () => async (post, context) =>
        post.author = await context._loaders.user.id.load(post.userId),
  
      starers: () => async (post, context) => !post.starIds ? null :
        post.starers = await context._loaders.user.id.loadMany(post.starIds),
    }
  };
  ```
  
Let's look at the code in this example:

  Code fragment | Description
  ---|---
  `before:` | This function is executed before the operations start. Only the top-most `before` is run; any in recursive `joins` are ignored.
  `context._loaders` | An empty object is initialized by `fastJoin`. This is implemented as a stack, any value existing before `fastJoin` starts is stashed, and later restored as the hook terminates.
  `context._loaders.user.id` | You can avoid confusion by organizing batch-loaders unambiguously. In this example `user` indicates the batch-loader returns single `user` records; the `id` indicates its keys will match `user.id`.
  `loaderFactory(users,` ` 'id', false)` | A convenience method for building straight forward batch-loaders. The batch loader reads record from the `users` service. The keys passed to it are `id` fields which it will match to `user.id`. The `false` indicates the batch loader returns single records for each key rather than an array of records.
  `context._loaders` `.user.id.load()` | Obtains data from the batch-loader for one key. Externally it acts like `await users.find(...)`.
  `context._loaders` `.user.id.loadMany()` | This is how you obtain records for multiple keys from the data-loader.
  `!post.starIds ? null : ...` | Handle `posts.starIds` which may not exist.

  ``` js
  // Original record
  [ { id: 1, body: 'John post', userId: 101, starIds: [102, 103, 104] } ]
    
  // Result
  [ { id: 1,
      body: 'John post',
      userId: 101,
      starIds: [ 102, 103, 104 ],
      author: { id: 101, name: 'John' },
      starers: 
       [ { id: 102, name: 'Marshall' },
         { id: 103, name: 'Barbara' },
         { id: 104, name: 'Aubree' } ]
  } ]
  ```

> The batch-loader made just *2* database calls. `populate` would have made *8*.

### Using Batch-Loaders

The `loaderFactory(users, 'id', false)` above is just a convenience wrapper for building a BatchLoader. We can create our batch loaders directly should we need them to do more.

  ``` js
  const { fastJoin, makeCallingParams } = require('feathers-hooks-common');
  const BatchLoader = require('@feather-plus/batch-loader');
  const { getResultsByKey, getUniqueKeys } = BatchLoader;
  
  const postResolvers = {
    before: context => {
      context._loaders = { user: {} };
      
      context._loaders.user.id = new BatchLoader(async (keys, context) => {
          const result = await users.find(makeCallingParams(context, { id: { $in: getUniqueKeys(keys) } }));
          return getResultsByKey(keys, result, user => user.id, '!');
        },
        { context }
      );
    },
  
    joins: {
      author: () => async (post, context) =>
        post.author = await context._loaders.user.id.load(post.userId),
  
      starers: () => async (post, context) => !post.starIds ? null :
        post.starers = await context._loaders.user.id.loadMany(post.starIds),
    }
  };
  ```
  
> The [batch-loader guide](../batch-loader) explains how to create batch-loaders.
  
### Putting It All Together

Let's finish by putting together all we've seen in a comprehensive example.

Let's also add a `reputation` array of objects to `posts`. This will show the increased flexibility of `fastJoin`, as `populate` cannot handle such a structure directly.

  ``` js
  // project/src/services/posts/posts.hooks.js
  const { fastJoin, makeCallingParams } = require('feathers-hooks-common');
  const BatchLoader = require('@feather-plus/batch-loader');
  const { getResultsByKey, getUniqueKeys } = BatchLoader;
    
  const commentResolvers = {
    joins: {
      author: () => async (comment, context) => !comment.userId ? null :
        comment.userRecord = await context._loaders.user.id.load(comment.userId)
    },
  };
  
  const postResolvers = {
    before: context => {
      context._loaders = { user: {}, comments: {} };
  
      context._loaders.user.id = new BatchLoader(async (keys, context) => {
          const result = await users.find(makeCallingParams(context, { id: { $in: getUniqueKeys(keys) } }));
          return getResultsByKey(keys, result, user => user.id, '!');
        },
        { context }
      );

      context._loaders.comments.postId = new BatchLoader(async (keys, context) => {
          const result = await comments.find(makeCallingParams(context, { postId: { $in: getUniqueKeys(keys) } }));
          return getResultsByKey(keys, result, comment => comment.postId, '[!]');
        },
        { context }
      );
    },
  
    joins: {
      author: () => async (post, context) =>
        post.userRecord = await context._loaders.user.id.load(post.userId),
  
      starers: () => async (post, context) => !post.starIds ? null :
        post.starIdsRecords = await context._loaders.user.id.loadMany(post.starIds),
        
      reputation_author: () => async (post, context) => {
        if (!post.reputation) return null;
        const authors = await context._loaders.user.id.loadMany(post.reputation.map(rep => rep.userId));
        post.reputation.forEach((rep, i) => { rep.author = authors[i].name; });
      },
  
      comments: {
        resolver: (...args) => async (post, context) =>
          post.commentRecords = await context._loaders.comments.postId.load(post.id),
        joins: commentResolvers,
      },
    }
  };
  
  const query = {
    author: true,
    starers: [['id', 'name']],
    comments: {
      args: null,
      author: [['id', 'name']]
    },
  };
  
  module.exports = { after: {
      all: [ fastJoin(postResolvers, context => query) ],
  } };
  ```
  
We are using 2 batch-loaders, one for single user records, the other for arrays of comment records.
  
  ``` js
  // Original records
  [ { id: 1,
      body: 'John post',
      userId: 101,
      starIds: [102, 103, 104],
      reputation: [ // The `populate` hook cannot handle this structure.
        { userId: 102, points: 1 },
        { userId: 103, points: 1 },
        { userId: 104, points: 1 }
      ]},
    { id: 2, body: 'Marshall post', userId: 102, starIds: [101, 103, 104] },
    { id: 3, body: 'Barbara post', userId: 103 },
    { id: 4, body: 'Aubree post', userId: 104 }
  ]
    
  // Results
  [ { id: 1,
      body: 'John post',
      userId: 101,
      starIds: [ 102, 103, 104 ],
      reputation: 
       [ { userId: 102, points: 1, author: 'Marshall' },
         { userId: 103, points: 1, author: 'Barbara' },
         { userId: 104, points: 1, author: 'Aubree' } ],
      author: { id: 101, name: 'John' },
      comments: 
       [ { id: 11,
           text: 'John post Marshall comment 11',
           postId: 1,
           userId: 102,
           author: { id: 102, name: 'Marshall' } },
         { id: 12,
           text: 'John post Marshall comment 12',
           postId: 1,
           userId: 102,
           author: { id: 102, name: 'Marshall' } },
         { id: 13,
           text: 'John post Marshall comment 13',
           postId: 1,
           userId: 102,
           author: { id: 102, name: 'Marshall' } } ],
      starers: 
       [ { id: 102, name: 'Marshall' },
         { id: 103, name: 'Barbara' },
         { id: 104, name: 'Aubree' } ] },
    { id: 2,
      body: 'Marshall post',
      userId: 102,
      starIds: [ 101, 103, 104 ],
      author: { id: 102, name: 'Marshall' },
      comments: 
       [ { id: 14,
           text: 'Marshall post John comment 14',
           postId: 2,
           userId: 101,
           author: { id: 101, name: 'John' } },
         { id: 15,
           text: 'Marshall post John comment 15',
           postId: 2,
           userId: 101,
           author: { id: 101, name: 'John' } } ],
      starers: 
       [ { id: 101, name: 'John' },
         { id: 103, name: 'Barbara' },
         { id: 104, name: 'Aubree' } ] },
    { id: 3,
      body: 'Barbara post',
      userId: 103,
      author: { id: 103, name: 'Barbara' },
      comments: 
       [ { id: 16,
           text: 'Barbara post John comment 16',
           postId: 3,
           userId: 101,
           author: { id: 101, name: 'John' } } ] },
    { id: 4,
      body: 'Aubree post',
      userId: 104,
      author: { id: 104, name: 'Aubree' },
      comments: 
       [ { id: 17,
           text: 'Aubree post Marshall comment 17',
           postId: 4,
           userId: 102,
           author: { id: 102, name: 'Marshall' } } ] },
  ]
  ```

Each batch-loader made just one database call:
- `users.find({ query: { id: { $in: [ 101, 102, 103, 104] } } })`
- `comments.find({ query: { postId: { $in: [ 1, 2, 3, 4 ] } } })`

> Only *2* database calls were needed to construct the result above. `populate` requires *22* calls.

### The GraphQL Feathers Adapter

By now you have an understanding of the foundations of Facebook's [GraphQL](http://graphql.org/). GraphQL however is more powerful and flexible.

You may want to read about the Feathers service adapter [@feathers-plus/graphql](../graphql). **It supports SQL and non-SQL databases,** and automatically generates the resolver functions.

