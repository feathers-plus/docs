---
title: API
type: guide
order: 2
dropdown: extensions
repo: feathers-hooks-common
---

<!--=============================================================================================-->
## Usage

<p class="tip">Use feathers-hooks-common v3.10.0 with FeathersJS v3 (Auk).
Use feathers-hooks-common v4.x.x with FeathersJS v4 (Buzzard).</p>

``` js
npm install --save feathers-hooks-common

// project/src/services/user/user.hooks.js
const { disableMultiItemChange, populate } = require('feathers-hooks-common');

const schema = {
  include: {
    service: 'roles',
    nameAs: 'role',
    parentField: 'roleId',
    childField: '_id'
  }
};

module.exports = {
  before: {
    patch: [ disableMultiItemChange() ],
    remove: [ disableMultiItemChange() ]
  },

  after: {
    all: [ populate({ schema }) ],
  },
};
```

> May be used on the client.

<!--=============================================================================================-->
## Migrating from Auk to Buzzard

These changes may affect your projects when you switch from this repo's last Feathers *Auk* version (v3.10.0) to its first Feathers *Buzzard* version (v4.0.0).

  - Docs have been rewritten and now reside on the [Feathers-Plus web site.](https://feathers-plus.github.io/v1/feathers-hooks-common)
  - Added new hooks and utility functions.
    - `cache` - Persistent, least-recently-used record cache for services.
    - `fastJoin` - A much faster, more flexible alternative to `populate`.
    - `keep`, `keepQuery`.
    - `op` - Flexibly mutate data and results.
    - `opQuery` - Flexibly mutate the query object.
    - `makeCallingParams` utility - Help construct `context.params` when calling services within hooks.
    - `thenifyHook` utility - Let's you call a hook inside a `.then()` right after the service call.
    
  - These hooks are deprecated and will be removed in the next FeathersJS version *Crow*.
    - Deprecated `pluck` in favor of `keep`, e.g. `iff(isProvider('external'),` ` keep(...fieldNames))`. This deprecates the last hook with unexpected internal "magic". **Be careful!**
    - Deprecated `pluckQuery` in favor of `keepQuery` for naming consistency.
    - Deprecated `removeQuery` in favor of `discardQuery` for naming consistency.
    - Deprecated `client` in favor of `paramsFromClient` for naming consistency.
    - Deprecated `createdAt` and `updatedAt` in favor of `setNow`.
    - Deprecated `callbackToPromise` in favor of Node's `require('util').promisify`.
    - Deprecated `promiseToCallback` as there's probably no need for it anymore.
    
  - Removed hooks previously deprecated in *Auk*.:
    - Removed support for the deprecated legacy syntax in `populate`.
    - Removed `remove`.
          


<!--=============================================================================================-->
## Find Hooks using Tags

  Each Feathers hook and utility function is listed under all the tags relevant to it.


{% hooksByTags %}

<!--=============================================================================================-->
## Hooks

<!--=============================================================================================-->
<h3 id="debug">debug( label )</h3>

  
{% hooksApi debug %}


- **Arguments** 
  - `{String} label`

Argument | Type | Default | Description
---|:---:|---|---
`label` | `String` | | Label to identify the logged information.

- **Example**

  ``` js
  const { debug } = require('feathers-hooks-common');
  
  module.exports = { before: {
      all: [ debug('step 1'), setNow('updatedAt'), debug(' step 2') ],
  } };
  
  // Result
  * step 1
  type: before, method: create
  data: { name: 'Joe Doe' }
  query: { sex: 'm' }
  result: { assigned: true }
  * step 2
  type: before, method: create
  data: { name: 'Joe Doe', createdAt: 1510518511547 }
  query: { sex: 'm' }
  result: { assigned: true }
  error: ...
  ```

- **Details**

  `debug` is great for debugging issues with hooks. Log the hook context before and after a hook to see what the hook started with, and what it changed.

{% hooksApiFootnote debug %}

<!--=============================================================================================-->
<h3 id="depopulate">dePopulate( )</h3>

{% hooksApi dePopulate %}

- **Example**

  ``` js
  const { dePopulate } = require('feathers-hooks-common');
  
  module.exports = { before: {
      all: [ depopulate() ],
  } };
  ```
  
- **Details**

  Removes joined records, computed properties, and profile information created by [`populate`](#populate). Populated and serialized items may, after dePopulate, be used in service calls.

  
{% hooksApiFootnote dePopulate %}

<!--=============================================================================================-->
<h3 id="disableMultiItemChange">disableMultiItemChange( )</h3>

{% hooksApi disableMultiItemChange %}

- **Example**

  ``` js
  const { disableMultiItemChange } = require('feathers-hooks-common');
  
  module.exports = { before: {
    patch: disableMultiItemChange(),
    remove: disableMultiItemChange() 
  } };
  ```

- **Details**

  When using the `patch` or `remove` methods, a `null` id could mutate many, even all the records in the database, so accidentally using it may cause undesirable results.

{% hooksApiFootnote disableMultiItemChange %}

<!--=============================================================================================-->
<h3 id="disallow">disallow( ...transports )</h3>

{% hooksApi disallow %}

- **Arguments**

  - `{Array< String >} transports`

Argument | Type | Default | Description
---|:---:|---|---
`transports` | `Array< String >` | disallow all transports | The transports that you want to disallow.

`transports` | Value | Description
---|---|---
 | `socketio` | allow calls by Socket.IO transport
 | `primus` | allow calls by Primus transport
 | `rest` | allow calls by REST transport
 | `external` | allow calls other than from server
 | `server` | allow calls from server
 
- **Example**

  ``` js
  const { disallow, iff } = require('feathers-hooks-common');
  
  module.exports = { before: {
      // Users can not be created by external access
      create: disallow('external'),
      // A user can not be deleted through the REST provider
      remove: disallow('rest'),
      // disallow calling `update` completely (e.g. to allow only `patch`)
      update: disallow(),
      // disallow the remove hook if the user is not an admin
      remove: iff(context => !context.params.user.isAdmin, disallow())
  } };
  ```
  
- **Details**

  Prevents access to a service method completely or just for specific transports. All transports set the `context.params.provider` property, and `disallow` checks this.
  
{% hooksApiFootnote disallow %}

<!--=============================================================================================-->
<h3 id="discard">discard( ...fieldNames )</h3>

{% hooksApi discard %}

<p class="tip">The discard hook will remove fields even if the service is being called from the server. You may want to condition the hook to run only for external transports, e.g. `iff(isProvider('external'), discard(...))`.</p>

{% hooksApiFieldNames discard "One or more fields you want to remove from the record(s)." %}

- **Example**

  ``` js
  const { discard , iff, isProvider } = require('feathers-hooks-common');
  
  module.exports = { after: {
      all: iff(isProvider('external'), discard('password', 'address.city'))
  } };
  ```

- **Details**

  Delete the fields either from `context.data` (before hook) or `context.result[.data]` (after hook).
  
{% hooksApiFootnote discard %}

<!--=============================================================================================-->
<h3 id="discardquery">discardQuery( ...fieldNames )</h3>

{% hooksApi discardQuery %}

<p class="tip">The keep hook will remove any fields not specified even if the service is being called from the server. You may want to condition the hook to run only for external transports, e.g. `iff(isProvider('external'), discardQuery(...))`.</p>

{% hooksApiFieldNames discardQuery "One or more fields you want to remove from the query." %}

- **Example**

  ``` js
  const { discardQuery , iff, isProvider } = require('feathers-hooks-common');
  
  module.exports = { after: {
      all: iff(isProvider('external'), discardQuery('secret'))
  } };
  ```

- **Details**

  Delete the fields from `context.params.query`.
  
{% hooksApiFootnote discardQuery %}

<!--=============================================================================================-->
<h3 id="every">every( ...predicates )</h3>

{% hooksApi every %}

- **Arguments**
  - `{Array< Function >} predicates`

Argument | Type | Default | Description
---|:---:|---|---
`predicates` | `Array< Function >` | | Functions which take the current hook as a param and return a boolean result.

{% hooksApiReturns every "The logical and of <code>predicates</code>" %}

- **Example**

  ``` js
  const { iff, every } = require('feathers-hooks-common');
  
  module.exports = { before: {
      create: iff(every(hook1, hook2, ...), hookA, hookB, ...)
  } };
  ```

- **Details**

  `every` is a predicate function for use in conditional hooks. The predicate functions are run in parallel, and `true` is returned if every predicate returns a truthy value.
  
{% hooksApiFootnote every %}

<!--=============================================================================================-->
<h3 id="fastjoin">fastJoin( schema [, query] )</h3>

{% hooksApi fastJoin %}

  > `fastJoin` is preferred over using `populate`.
  
- **Arguments**
  - `{Object | Function} resolvers`
    - `{Function} [ before ]`
    - `{Function} [ after ]`
    - `{Object} joins`
    
  - `{Object | Function} [ query ]`

Argument | Type | Default | Description
---|---|---
`resolvers` | `Object` or `context` `=> Object` |  | The group of operations to perform on the data.
`query` | `Object` | run all resolvers with `undefined` params | You can customise the current operations with the optional query.

`resolvers` | Argument | Type | Default | Description
---|---|---|---
 | `before` | `context` `=> { }` |  | Processing performed before the operations are started. Batch-loaders are usually created here.
 | `after` | `context` `=> { }` |  | Processing performed after all other operations are completed.
 | `joins` | `Object` |  | Resolver functions provide a mapping between a portion of a operation and actual backend code responsible for handling it.

> Read the [guide](guide.md/fastjoin) for more information on the arguments.

- **Example using Feathers services**

  ``` js
  // project/src/services/posts/posts.hooks.js
  const { fastJoin } = require('feathers-hooks-common');
  
  const postResolvers = {
    joins: {
      author: (...args) => async post => post.author = (await users.find({ query: {
        id: post.userId
      } }))[0],
      
      starers: $select => async post => post.starers = await users.find({ query: {
        id: { $in: post.starIds }, $select: $select || ['name']
      } }),
    }
  };
  
  const query = {
    author: true,
    starers: [['id', 'name']]
  };
  
  module.exports = { after: {
      all: [ fastJoin(postResolvers, query) ],
  } };
  ```
  
- **Example with recursive operations**

  ``` js
  // project/src/services/posts/posts.hooks.js
  const { fastJoin } = require('feathers-hooks-common');
    
  const postResolvers = {
    joins: {
      comments: {
        resolver: ($select, $limit, $sort) => async post => post.comments = await comments.find({ query: {
          postId: post.id, $select: $select, $limit: $limit || 5, [$sort]: { createdAt: -1 }
        } }),
          
        joins: {
          author: $select => async comment => comment.author = (await users.find({ query: {
            id: comment.userId, $select: $select
          } }))[0],
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
      
  module.exports = { after: {
      all: [ fastJoin(postResolvers, query) ],
  } };
  ```
  
- **Example with simple batch-loaders**

  ``` js
  // project/src/services/posts/posts.hooks.js
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
      
  module.exports = { after: {
      all: [ fastJoin(postResolvers) ],
  } };
  ```
  
- **Comprehensive example**

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

- **Details**
  
  We often want to combine rows from two or more tables based on a relationship between them. The `fastJoin` hook will select records that have matching values in both tables. It can batch service calls and cache records, thereby needing roughly an order of magnitude fewer database calls than the `populate` hook, e.g. *2* calls instead of *20*.
  
  Relationships such as `1:1`, `1:m`, `n:1`, and `n:m` relationships can be related.
  
  `fastJoin` uses a GraphQL-like imperative API, and it is not restricted to using data from Feathers services. Resources for which there are no Feathers adapters can [be used.](../batch-loader/common-patterns.html#Using-non-Feathers-services)

{% hooksApiFootnote fastJoin %}

<!--=============================================================================================-->
<h3 id="iff">iff( predicate, ...hookFuncsTrue ).else( …hookFuncsFalse )</h3>

{% hooksApi iff %}

- **Arguments**
  - `{Boolean | Promise | Function} predicate`
  - `{Array< Function >} hookFuncsTrue`
  - `{Array< Function >} hookFuncsTrue`

Argument | Type | Default | Description
---|:---:|---|---
`predicate` | `Boolean`, `Promise` or `Function` | | Determine if `hookFuncsTrue` or `hookFuncsFalse` should be run. If a function, `predicate` is called with the `context` as its param. It returns either a boolean or a Promise that evaluates to a boolean.
`hookFuncsTrue` | `Array<` `Function >` | | Sync or async hook functions to run if `true`. They may include other conditional hooks.
`hookFuncsTrue` | `Array<` `Function >` | | Sync or async hook functions to run if `false`. They may include other conditional hooks.

- **Example**

  ``` js
  const { discard, iff, isProvider, populate } = require('feathers-hooks-common');
  const isNotAdmin = adminRole => context => context.params.user.roles.indexOf(adminRole || 'admin') === -1;
  
  module.exports = { before: {
    create: iff(
      () => new Promise((resolve, reject) => { ... }),
      populate('user', { field: 'authorisedByUserId', service: 'users' })
    ),
    
    get: [ iff(isNotAdmin(), discard('budget')) ]
    
    update:
      iff(isProvider('server'),
        hookA,
        iff(isProvider('rest'), hook1, hook2, hook3)
        .else(hook4, hook5),
        hookB
      )
      .else(
        iff(hook => hook.path === 'users', hook6, hook7)
      )
  } };
  ```

- **Details**

  Resolve the predicate, then run one set of hooks sequentially.

  The predicate and hook functions will not be called with `this` set to the service, as is normal for hook functions. Use `hook.service` instead.

{% hooksApiFootnote iff %}

<!--=============================================================================================-->
<h3 id="iffelse">iffElse( predicate, hookFuncsTrue, hookFuncsFalse )</h3>

{% hooksApi iffElse %}

- **Arguments**
  - `{Function} predicate`
  - `{Array< Functions >} hookFuncsTrue`
  - `{Array< Functions >} hookFuncsFalse` 

Argument | Type | Default | Description
---|:---:|---|---
`predicate` | `Boolean`, `Promise` or `Function` | | Determine if `hookFuncsTrue` or `hookFuncsFalse` should be run. If a function, `predicate` is called with the `context` as its param. It returns either a boolean or a Promise that evaluates to a boolean.
`hookFuncsTrue` | `Array<` `Function >` | | Sync or async hook functions to run if `true`. They may include other conditional hooks.
`hookFuncsTrue` | `Array<` `Function >` | | Sync or async hook functions to run if `false`. They may include other conditional hooks.

- **Example**

  ``` js
  const { iffElse, populate, serialize } = require('feathers-hooks-common');
  
  module.exports = { after: {
    create: iffElse(() => { ... },
      [populate(poAccting), serialize( ... )],
      [populate(poReceiving), serialize( ... )]
    )
  } };
  ```
  
- **Details**

  Resolve the predicate, then run one set of hooks sequentially.

  The predicate and hook functions will not be called with `this` set to the service, as is normal for hook functions. Use `hook.service` instead.

{% hooksApiFootnote iffElse %}

<!--=============================================================================================-->
<h3 id="isnot">isNot( predicate )</h3>

{% hooksApi isNot %}

- **Arguments**

  - `{Function | Boolean} predicate`

Argument | Type | Default | Description
---|:---:|---|---
`predicate` | `Function` `Boolean` |  | A sync or async function which take the current hook as a param and returns a boolean result.

{% hooksApiReturns isNot "The not of <code>predicate</code>" %}

- **Example**

  ``` js
  const { iff, isNot, isProvider, discard } = require('feathers-hooks-common');
  const isRequestor = () => context => new Promise(resolve, reject) => ... );
  
  module.exports = { after: {
      create: iff(isNot(isRequestor()), discard('password'))
  } };
  ```
  
- **Details**

  `isNot` is a predicate function for use in conditional hooks.

{% hooksApiFootnote isNot %}

<!--=============================================================================================-->
<h3 id="isprovider">isProvider( ...transports )</h3>

{% hooksApi isProvider %}

- **Arguments**
  - `{Array< String >} transports`

Name | Type | Default | Description
---|:---:|---|---
`transports` | `Array< String >` | | The transports you want to allow. 

`transports` | Value | Description
---|:---:|---
 | `socketio` | Allow calls by Socket.IO transport.
 | `primus` | Allow calls by Primus transport.
 | `rest` | Allow calls by REST transport.
 | `external` | Allow calls other than from server.
 | `server` | Allow calls from server.
 
{% hooksApiReturns isProvider "If the call was made by one of the <code>transports</code>." %}

- **Example**

  ``` js
  const { iff, isProvider, discard } = require('feathers-hooks-common');
  
  module.exports = { after: {
      create: iff(isProvider('external'), discard('password'))
  } };
  ```
  
- **Details**

  `isProvider` is a predicate function for use in conditional hooks. Its determines which transport provided the service call by checking `context.params.provider`.

{% hooksApiFootnote isProvider %}

<!--=============================================================================================-->
<h3 id="keep">keep( ...fieldNames )</h3>

{% hooksApi keep %}

<p class="tip">The keep hook will remove any fields not specified even if the service is being called from the server. You may want to condition the hook to run only for external transports, e.g. `iff(isProvider('external'), keep(...))`.</p>

{% hooksApiFieldNames keep "The only fields you want to keep in the record(s)." %}

- **Example**

  ``` js
  const { keep } = require('feathers-hooks-common');
    
  module.exports = { after: {
    create: keep('name', 'dept', 'address.city'),
  } };
  ```

- **Details**

  Update either `context.data` (before hook) or `context.result[.data]` (after hook).

{% hooksApiFootnote keep %}

<!--=============================================================================================-->
<h3 id="keepquery">keepQuery( ...fieldNames )</h3>

{% hooksApi keepQuery %}

<p class="tip">The keepQuery hook will remove any fields not specified even if the service is being called from the server. You may want to condition the hook to run only for external transports, e.g. `iff(isProvider('external'), keepQuery(...))`.</p>

{% hooksApiFieldNames keepQuery "The only fields you want to keep in the query object." %}

- **Example**

  ``` js
  const { keepQuery } = require('feathers-hooks-common');
    
  module.exports = { after: {
    create: keepQuery('name', 'address.city'),
  } };
  ```

- **Details**

  Updates `context.params.query`.

{% hooksApiFootnote keepQuery %}

<!--=============================================================================================-->
<h3 id="lowercase">lowerCase( ... fieldNames )</h3>
  
{% hooksApi lowerCase %}

{% hooksApiFieldNames keep "The fields in the record(s) whose values are converted to lower case." %}

- **Example**

  ``` js
  const { lowerCase } = require('feathers-hooks-common');
  
  module.exports = { before: {
    create: lowerCase('email', 'username', 'div.dept')
  } };
  ```

- **Details**

  Update either `context.data` (before hook) or `context.result[.data]` (after hook).

{% hooksApiFootnote lowerCase %}

<!--=============================================================================================-->
<h3 id="paramsFromClient">paramsFromClient( ...whitelist )</h3>

{% hooksApi paramsFromClient %}

- **Arguments**

  - `{Array< String > | String} whitelist`

Argument | Type | Default | Description
---|:---:|---|---
`whitelist` | dot notation | | Names of the props permitted to be in `context.params`. Other props are ignored. This is a security feature.

- **Example**

  ``` js
  // client
  const { paramsForServer } = require('feathers-hooks-common');
  
  service.update(id, data, paramsForServer({
    query: { dept: 'a' }, populate: 'po-1', serialize: 'po-mgr'
  }));
  
  // server
  const { paramsFromClient } = require('feathers-hooks-common');
  
  module.exports = { before: {
      all: [
        paramsFromClient('populate', 'serialize', 'otherProp'),
        myHook
      ]
  } };
  
  // myHook's `context.params` will now be
  // { query: { dept: 'a' }, populate: 'po-1', serialize: 'po-mgr' } }
  ```
  
- **Details**

  By default, only the `context.params.query` object is transferred from a Feathers client to the server, for security among other reasons. However you can explicitly transfer other `context.params` props with the client utility function `paramsForServer` in conjunction with the `paramsFromClient` hook on the server.

  This technique also works for service calls made on the server.

{% hooksApiFootnote paramsFromClient %}

<!--=============================================================================================-->
<h3 id="populate">populate( options )</h3>

{% hooksApi populate %}

  > `fastJoin` is preferred over using `populate`.
  
- **Arguments**
  - `{Object} options`
    - `{Object | Function} schema`
      - `{String} service`
      - `{any} [ permissions ]`
      - `{Array< Object > | Object} include`
        - `{String} service`
        - `{String} [ nameAs ]`
        - `{String} [ parentField ]`
        - `{String} [ childField]`
        - `{String} [ permissions ]`
        - `{Object} [ query ]`
        - `{Function} [ select ]`
        - `{Boolean} [ asArray ]`
        - `{Boolean | Number} [ paginate ]`
        - `{Boolean} [ useInnerPopulate ]`
        - `{undefined}} [ provider ]`
        - `{Array< Object > | Object} include`
          - ...
          
    - `{Function} [ checkPermissions ]`
    - `{Boolean} [ profile ]`

Argument | Type | Default | Description
---|---|---
`options` | `Object` | | Options.
`schema` | `Object` `Function` | `(context, options)` `=> {}`| Info on how to join records.
`checkPermissions` | `Function` | no permission check | Check if call allowed joins.
`profile` | `Boolean` | `false` | If profile info is to be gathered.

`schema` | Argument | Type | Default | Description
---|---|---
 | `service` | `String` | | The name of the service providing the items, actually its path.
 | `nameAs` | dot notation | `service` | Where to place the items from the join
 | `parentField` | dot notation | | The name of the field in the parent item for the relation.
 | `childField` | dot notation if database supports it | | The name of the field in the child item for the relation. Dot notation is allowed and will result in a query like `{ 'name.first':` `'John' }` which is not suitable for all DBs. You may use query or select to create a query suitable for your DB.
 | `permissions` | `any` | no permission check | Who is allowed to perform this join. See `checkPermissions` above.
 | `query` | `Object` | | An object to inject into `context.params.query`.
 | `select` | `Function` | `(context,` `parentItem,` `depth)` `=> {}` | A function whose result is injected into the query.
 | `asArray` | `Boolean` | `false` | Force a single joined item to be stored as an array.
 | `paginate` | `Boolean` `Number` | `false` | Controls pagination for this service.
 | `useInnerPopulate` | `Boolean` | `false` | Perform any `populate` or `fastJoin` registered on this service.
 | `provider` | `undefined` | | Call the service as the server, not with the client's transport.
 | `include` | `Array<` `Object >` or `Object` | | Continue recursively join records to these records.

> Read the [guide](guide.md/populate) for more information on the arguments.

- **Examples**

  - 1:1 relationship

  ```javascript
  // users like { _id: '111', name: 'John', roleId: '555' }
  // roles like { _id: '555', permissions: ['foo', bar'] }
  import { populate } from 'feathers-hooks-common';
    
  const userRoleSchema = {
    include: {
      service: 'roles',
      nameAs: 'role',
      parentField: 'roleId',
      childField: '_id'
    }
  };
    
  app.service('users').hooks({
    after: {
      all: populate({ schema: userRoleSchema })
    }
  });
    
  // result like
  // { _id: '111', name: 'John', roleId: '555',
  //   role: { _id: '555', permissions: ['foo', bar'] } }
  ```

  - 1:n relationship

  ```javascript
  // users like { _id: '111', name: 'John', roleIds: ['555', '666'] }
  // roles like { _id: '555', permissions: ['foo', 'bar'] }
  const userRolesSchema = {
    include: {
      service: 'roles',
      nameAs: 'roles',
      parentField: 'roleIds',
      childField: '_id'
    }
  };
  
  usersService.hooks({
    after: {
      all: populate({ schema: userRolesSchema })
    }
  });
    
  // result like
  // { _id: '111', name: 'John', roleIds: ['555', '666'], roles: [
  //   { _id: '555', permissions: ['foo', 'bar'] }
  //   { _id: '666', permissions: ['fiz', 'buz'] }
  // ]}
  ```

  - n:1 relationship

  ```javascript
  // posts like { _id: '111', body: '...' }
  // comments like { _id: '555', text: '...', postId: '111' }
  const postCommentsSchema = {
    include: {
      service: 'comments',
      nameAs: 'comments',
      parentField: '_id',
      childField: 'postId'
    }
  };
    
  postService.hooks({
    after: {
      all: populate({ schema: postCommentsSchema })
    }
  });
    
  // result like
  // { _id: '111', body: '...' }, comments: [
  //   { _id: '555', text: '...', postId: '111' }
  //   { _id: '666', text: '...', postId: '111' }
  // ]}
  ```

  - Multiple and recursive includes

  ```javascript
  const schema = {
    service: '...',
    permissions: '...',
    include: [
      {
        service: 'users',
        nameAs: 'authorItem',
        parentField: 'author',
        childField: 'id',
        include: [ ... ],
      },
      {
        service: 'comments',
        parentField: 'id',
        childField: 'postId',
        query: {
          $limit: 5,
          $select: ['title', 'content', 'postId'],
          $sort: {createdAt: -1}
        },
        select: (hook, parent, depth) => ({ $limit: 6 }),
        asArray: true,
        provider: undefined,
      },
      {
        service: 'users',
        permissions: '...',
        nameAs: 'readers',
        parentField: 'readers',
        childField: 'id'
      }
    ],
  };
    
  module.exports.after = {
    all: populate({ schema, checkPermissions, profile: true })
  };
  ```

  - Flexible relationship, similar to the n:1 relationship example above

  ```javascript
  // posts like { _id: '111', body: '...' }
  // comments like { _id: '555', text: '...', postId: '111' }
  const postCommentsSchema = {
    include: {
      service: 'comments',
      nameAs: 'comments',
      select: (hook, parentItem) => ({ postId: parentItem._id }),
    }
  };
  
  postService.hooks({
    after: {
      all: populate({ schema: postCommentsSchema })
    }
  });
    
  // result like
  // { _id: '111', body: '...' }, comments: [
  //   { _id: '555', text: '...', postId: '111' }
  //   { _id: '666', text: '...', postId: '111' }
  // ]}
  ```

- **Details**
  
  We often want to combine rows from two or more tables based on a relationship between them. The `populate` hook will select records that have matching values in both tables.

  `populate` supports 1:1, 1:n and n:1 relationships. It can provide performance profile information.
  
{% hooksApiFootnote populate %}

<!--=============================================================================================-->
<h3 id="preventchanges">preventChanges( ...fieldNames )</h3>

{% hooksApi preventChanges %}

{% hooksApiFieldNames preventChanges "The fields which may not be patched." %}

- **Example**

  ``` js
  const { preventChanges } = require('feathers-hooks-common');
  
  module.exports = { before: {
    patch: preventChanges('security.badge')
  } };
  ```
  
- **Details**

  Consider using validateSchema if you would rather specify which fields are allowed to change.

{% hooksApiFootnote preventChanges %}

<!--=============================================================================================-->
<h3 id="serialize">serialize( schema )</h3>

  
{% hooksApi serialize %}


- **Arguments**
  - `{Object | Function} schema`
    - `{Array< String> | String} only`
    - `{Array< String> | String} exclude`
    - `[fieldName]: {Object} schema`
    - `{Object} computed`
      - `[fieldName]: {Function} computeFunc`

Argument | Type | Default | Description
---|:---:|---|---
`schema` | `Object` `Function` | `context` `=> schema` | How to serialize the items.


`schema` | Argument | Type | Default | Description
---|---|:---:|---|---
 | `only` | `Array<` `String>` or `String` | | The names of the fields to keep in each item. The names for included sets of items plus `_include` and `_elapsed` are not removed by `only`.
 | `exclude` | `Array<` `String>` or `String` | | The names of fields to drop in each item. You may drop, at your own risk, names of included sets of items, `_include` and `_elapsed`.
 | `computed` | `Object` | | The new names you want added and how to compute their values.
 
`schema` `.computed` | Argument | Type | Default | Description
---|---|:---:|---|---
 | `fieldName` | `String` | | The name of the field to add to the records.
 | `computeFunnc` | `Function` | `(record,` `context)` `=> value` | Function to calculate the computed value. `item`: The item with all its initial values, plus all of its included items. The function can still reference values which will be later removed by only and exclude. `context`: The context passed to `serialize`.

- **Example**

  The schema reflects the structure of the populated records. The base records for this example have included `post` records, which themselves have included `authorItem`, `readersInfo` and `commentsInfo` records.

  ``` js
  const schema = {
    only: 'updatedAt',
    computed: {
      commentsCount: (recommendation, hook) => recommendation.post.commentsInfo.length,
    },
    post: {
      exclude: ['id', 'createdAt', 'author', 'readers'],
      authorItem: {
        exclude: ['id', 'password', 'age'],
        computed: {
          isUnder18: (authorItem, hook) => authorItem.age < 18,
        },
      },
      readersInfo: {
        exclude: 'id',
      },
      commentsInfo: {
        only: ['title', 'content'],
        exclude: 'content',
      },
    },
  };
  purchaseOrders.after({
    all: [ populate( ... ), serialize(schema) ]
  });
  
  module.exports = { after: {
    get: [ populate( ... ), serialize(schema) ],
    find: [ fastJoin( ... ), serialize(schema) ]
  } };
  ```
  
- **Details**

  Works with <code>fastJoin</code> and <code>populate</code>.

{% hooksApiFootnote serialize %}

<!--=============================================================================================-->
<h3 id="setNow">setNow( ...fieldNames )</h3>
  
{% hooksApi setNow %}

{% hooksApiFieldNames keep "The fields that you want to add or set to the current date-time." %}

- **Example**

  ``` js
  const { setNow } = require('feathers-hooks-common');
  
  module.exports = { before: {
    create: setNow('createdAt', 'updatedAt')
  } };
  ```

- **Details**

  Update either `context.data` (before hook) or `context.result[.data]` (after hook).
  
{% hooksApiFootnote setNow %}

<!--=============================================================================================-->
<h3 id="setSlug">setSlug( slug, fieldName )</h3>

> Work in Progress
  
{% hooksApi setSlug %}


- **Arguments**
  - `???`

Argument | Type | Default | Description
---|:---:|---|---
`transports` |  |  | 

- **Example**

  ``` js
  const { ??? } = require('feathers-hooks-common');
  
  module.exports = { before: {
      
  } };
  ```

{% hooksApiFootnote setSlug %}

<!--=============================================================================================-->
<h3 id="sifter">sifter( siftFunc )</h3>

{% hooksApi sifter %}

- **Arguments**

  - `{Function} siftFunc`

Argument | Type | Default | Description
---|:---:|---|---
`siftFunc` | `Function` |  | Function similar to `context => sift(mongoQueryObj)`. Information about the mongoQueryObj syntax is available at [crcn/sift](https://github.com/crcn/sift.js).

- **Example**

  ``` js
  const sift = require('sift');
  const { sifter } = require('feathers-hooks-common');
  
  const selectCountry = hook => sift({ 'address.country': hook.params.country });

  module.exports = { before: {
    find: sifter(selectCountry),
  } };
  ```
  
  ```js
  const sift = require('sift');
  const { sifter } = require('feathers-hooks-common');
  
  const selectCountry = country => () => sift({ address : { country: country } });

  module.exports = { before: {
    find: sifter(selectCountry('Canada')),
  } };  
  ```
  
- **Details**

  All official Feathers database adapters support a common way for querying, sorting, limiting and selecting find method calls. These are limited to what is commonly supported by all the databases.
 
  The `sifter` hook provides an extensive MongoDB-like selection capabilities, and it may be used to more extensively select records.

  `sifter` filters the result of a find call. Therefore more records will be physically read than needed. You can use the Feathers database adapters query to reduce this number.`

{% hooksApiFootnote sifter %}

<!--=============================================================================================-->
<h3 id="softDelete">softDelete( fieldName )</h3>

Marks items as { deleted: true } instead of physically removing them. This is useful when you want to discontinue use of, say, a department, but you have historical information which continues to refer to the discontinued department.
  
{% hooksApi softDelete %}

> Must be used on `all` service call types, i.e. `create`, get`, `update`, `patch`, `remove` and `find`.

- **Arguments**
  - `{String} fieldName`

Argument | Type | Default | Description
---|:---:|---|---
`fieldName` | `String` | `'deleted'` | The name of the field holding the deleted flag.

- **Example**

  ``` js
  const { softDelete } = require('feathers-hooks-common');
  const dept = app.service('departments');
  
  dept.before({
    all: softDelete(),
  });
  
  // will throw if item is marked deleted.
  dept.get(0).then()
  
  // methods can be run avoiding softDelete handling
  dept.get(0, { query: { $disableSoftDelete: true }}).then()
  ```

{% hooksApiFootnote softDelete %}

<!--=============================================================================================-->
<h3 id="some">some( ...predicates )</h3>

{% hooksApi some %}

- **Arguments**
  - `{Array< Function >} predicates`

Argument | Type | Default | Description
---|:---:|---|---
`predicates` | `Array< Function >` | | Functions which take the current hook as a param and return a boolean result.

{% hooksApiReturns some "The logical or of <code>predicates</code>" %}

- **Example**

  ``` js
  const { iff, some } = require('feathers-hooks-common');
  
  module.exports = { before: {
      create: iff(some(hook1, hook2, ...), hookA, hookB, ...)
  } };
  ```

- **Details**

  `some` is a predicate function for use in conditional hooks. The predicate functions are run in parallel, and `true` is returned if any predicate returns a truthy value.
  
{% hooksApiFootnote some %}

<!--=============================================================================================-->
<h3 id="stashbefore">stashBefore( fieldName )</h3>

{% hooksApi stashBefore %}

- **Arguments**
  - `{String} fieldName`

Argument | Type | Default | Description
---|:---:|---|---
`fieldName` |  | `'before'` | The name of the `context.params` property to contain the current record value.

- **Example**

  ``` js
  const { patch } = require('feathers-hooks-common');
  
  module.exports = { before: {
    patch: stashBefore()
  } };
  ```
  
- **Details**

  The hook always performs its own preliminary `get` call. If the original service call is also a `get`, its `context.params` is used for the preliminary `get`.
  
  For any other method the the calling params are formed from the calling context:
  ``` js
  { provider: context.params.provider,
    authenticated: context.params.authenticated,
    user: context.params.user }
  ```

{% hooksApiFootnote stashBefore %}

<!--=============================================================================================-->
<h3 id="traverse">traverse( transformer [, getObject] )</h3>

{% hooksApi traverse %}

- **Arguments**
  - `{Function} transformer`
  - `{Function} [ getObject ]`

Argument | Type | Default | Description
---|:---:|---|---
`transformer` | `Function` |  | Called for every node in every record(s). May change the node in place.
`getObject` | `Function` | `context.data` or `context.result[.data]` | Function with signature `context => {}` which returns the object to traverse.

- **Example**

  ``` js
  const { traverse } = require('feathers-hooks-common');
  
  // Trim strings
  const trimmer = function (node) {
    if (typeof node === 'string') { this.update(node.trim()); }
  };
  
  // REST HTTP request may use the string 'null' in its query string.
  // Replace these strings with the value null.
  const nuller = function (node) {
    if (node === 'null') { this.update(null); }
  };
  
  module.exports = { before: {
    create: traverse(trimmer),
    find: traverse(nuller, context => context.params.query)
  } };
  ```
  
- **Details**

  Traverse and transform objects in place by visiting every node on a recursive walk. Any object in the hook may be traversed, including the query object.
    
  > [substack/js-traverse](https://github.com/substack/js-traverse) documents the extensive methods and context available to the transformer function.

{% hooksApiFootnote traverse %}

<!--=============================================================================================-->
<h3 id="unless">unless( predicate, ...hookFuncs )</h3>

{% hooksApi unless %}

- **Arguments**
  - `{Boolean | Promise | Function} predicate`
  - `{Array< Function >} hookFuncs`

Argument | Type | Default | Description
---|:---:|---|---
`predicate` | `Boolean`, `Promise` or `Function` | | Run `hookFunc` if the `predicate` is false. If a function, `predicate` is called with the `context` as its param. It returns either a boolean or a Promise that evaluates to a boolean.
`hookFuncs` | `Array<` `Function >` | | Sync or async hook functions to run if `true`. They may include other conditional hooks.

- **Example**

  ``` js
  const { isProvider, unless } = require('feathers-hooks-common');
  
  module.exports = { before: {
    create:
      unless(isProvider('server'),
        hookA,
        unless(isProvider('rest'), hook1, hook2, hook3),
        hookB
      )
  } };
  ```

- **Details**

  Resolve the predicate to a boolean. Run the hooks sequentially if the result is falsey.

  The predicate and hook functions will not be called with `this` set to the service, as is normal for hook functions. Use `hook.service` instead.

{% hooksApiFootnote unless %}

<!--=============================================================================================-->
<h3 id="validate">validate( validator )</h3>

> Work in progress.

Call a validation function from a before hook. The function may be sync or return a Promise.
  
{% hooksApi validate %}


- **Arguments**

  - `{Function} validator`

Argument | Type | Default | Description
---|:---:|---|---
`validator` | `Function` |  | Validation function with signature `(formValues, context) => {}`.

- **Example**

  ``` js
  const { callbackToPromise, validate } = require('feathers-hooks-common');
  
  // function myCallbackValidator(values, cb) { ... }
  const myValidator = callbackToPromise(myCallbackValidator, 1); // function requires 1 param
  app.service('users').before({ create: validate(myValidator) });
  ```
  
- **Details**

  Sync functions return either an error object like `{ fieldName1: 'message', ... }` or `null`. Validate will throw on an error object with `throw new errors.BadRequest({ errors: errorObject });`.

  Promise functions should throw on an error or reject with `new errors.BadRequest('Error message', { errors: { fieldName1: 'message', ... } });`. Their `.then` returns either sanitized values to replace `context.data`, or `null`.

  If you have a different signature for the validator then pass a wrapper as the validator e.g. (values) => myValidator(..., values, ...)

  Wrap your validator in callbackToPromise if it uses a callback.

{% hooksApiFootnote validate %}

<!--=============================================================================================-->

<h3 id="validateSchema">validateSchema( schema, ajv, options )</h3>

Validate an object using [JSON-Schema](http://json-schema.org/) through [Ajv](https://github.com/epoberezkin/ajv).
  
{% hooksApi validateSchema %}


- **Arguments**
  - `???`
  
  > Work in progress.

Argument | Type | Default | Description
---|:---:|---|---
`transports` |  |  | 

- **Example**

  ``` js
  const Ajv = require('ajv');
  const createSchema = { /* JSON-Schema */ };
  
  module.before({
    create: validateSchema(createSchema, Ajv)
  });
  ```

  ``` js
  const Ajv = require('ajv');
  const ajv = new Ajv({ allErrors: true, $data: true });
  
  ajv.addFormat('allNumbers', '^\d+$');
  const createSchema = { /* JSON-Schema */ };
  
  module.before({
    create: validateSchema(createSchema, ajv)
  });  
  ```
  
- **Details**

  There are some good [tutorials](https://code.tutsplus.com/tutorials/validating-data-with-json-schema-part-1--cms-25343) on using JSON-Schema with [Ajv](https://github.com/epoberezkin/ajv).

  The hook will throw if the data does not match the JSON-Schema. `error.errors` will, by default, contain an array of error messages.

  You may customize the error message format with a custom formatting function. You could, for example, return `{ name1: message, name2: message }` which could be more suitable for a UI.

  If you need to customize `Ajv` with new keywords, formats or schemas, then instead of passing the `Ajv` constructor, you may pass in an instance of `Ajv` as the second parameter. In this case you need to pass `Ajv` options to the `Ajv` instance when `new`ing, rather than passing them in the third parameter of `validateSchema`. See the second example below.

{% hooksApiFootnote validateSchema %}

<!--=============================================================================================-->
<h3 id="when">when( predicate, ...hookFuncs )</h3>

An alias for [iff](#iff).

{% hooksApiFootnote when %}

<!--=============================================================================================-->
## Utilities

<!--=============================================================================================-->
<h3 id="checkcontext">checkContext( context [, type ] [, methods ] [, label ] )</h3>

{% hooksApi checkContext %}


- **Arguments**
  - `{Object} context`
  - `{String} [ type ]`
  - `{Array< String >} [ methods ]`
  - `{String} [ label ]`

Argument | Type | Default | Description
---|:---:|---|---
`context` | `Object` |  | The hook context.
`type` | `String` | all types | The service type allowed.
`methods` | `Array< String >` | all methods | The service methods allowed.
`label` | `String` | `'anonymous'` | Name of hook to use with `throw`.

`type` - before, after.
`methods` - find, get, update, patch, remove.


- **Example**

  ``` js
  const { checkContext } = require('feathers-hooks-common');
  
  function myHook(context) {
    checkContext(context, 'after', ['create', 'remove']);
    ...
  }
  
  module.exports = { before: {
      create: [ myHook ] // throws
  } };
  
  // checkContext(hook, 'before', ['update', 'patch'], 'hookName');
  // checkContext(hook, null, ['update', 'patch']);
  // checkContext(hook, 'before', null, 'hookName');
  // checkContext(hook, 'before');
  ```
  
- **Details**

  Its important to ensure the hook is being used as intended. `checkContext` let's you restrict the hook to a hook type and a set of service methods.

{% hooksApiFootnote checkContext %}

<!--=============================================================================================-->
<h3 id="combine">combine( ...hookFuncs )</h3>
 
{% hooksApi combine %}

- **Arguments**
  - `{Array< Function >} hookFuncs`

Argument | Type | Default | Description
---|:---:|---|---
`hookFuncs` | `Array<Function >` | | Hooks, used the same way as when you register them.

- **Example**

  ``` js
  const { combine, createdAt, updatedAt } = require('feathers-hooks-common');
  
  async function myCustomHook(context) {
    const newContext = await combine(setNow('createdAt'), setNow('updatedAt')).call(this, context);
    return newContext;
  }
  ```
  
- **Details**

  `combine` has the signature of a hook, but is primarily intended to be used within your custom hooks, not when registering hooks.
  
 The following is a better technique to use when registering hooks.
  
  ``` js
  const workflow = [createdAt(), updatedAt(), ...];
  
  module.exports = { before: {
    update: [...workflow],
    patch: [...workflow],
  } };
  ```
  
{% hooksApiFootnote combine %}

<!--=============================================================================================-->
<h3 id="deletebyDot">deleteByDot( obj, path )</h3>

{% hooksApi deleteByDot %}

- **Arguments**
  - `{Object} obj`
  - `{String} path`

Argument | Type | Default | Description
---|:---:|---|---
`obj` | `Object` |  | The object.
`path` | `String` | | The path to the property, e.g. `address.city`. 

- **Example**

  ``` js
  import { deleteByDot } from 'feathers-hooks-common';
  
  const discardPasscode = () => context => {
    deleteByDot(context.data, 'security.passcode');
  }
  
   module.exports = { before: {
     find: discardPasscode()
   } };
  ```
  
- **Details**

  You can use `phones.home.0.main` to handle arrays.

{% hooksApiFootnote deleteByDot %}

<!--=============================================================================================-->
<h3 id="existsbydot">existsByDot( obj, path )</h3>

{% hooksApi existsByDot %}

- **Arguments**
  - `{Object} obj`
  - `{String} path`

Argument | Type | Default | Description
---|:---:|---|---
`obj` | `Object` |  | The object.
`path` | `String` | | The path to the property, e.g. `address.city`.

{% hooksApiReturns getItems "If a property exists at <code>path</code>." %}

- **Example**

  ``` js
  const { discard, existsByDot, iff } = require('feathers-hooks-common');
  
  const discardBadge = () => iff(!existsByDot('security.passcode'), discard('security.badge'));

  module.exports = { before: {
    find: discardBadge()
  } };
  ```
  
- **Details**

  You can use `phones.home.0.main` to handle arrays. Properties with a value of `undefined` are considered to exist.

{% hooksApiFootnote existsByDot %}

<!--=============================================================================================-->
<h3 id="getbydot">getByDot( obj, path )</h3>

{% hooksApi getByDot %}

- **Arguments**
  - `{Object} obj`
  - `{String} path`

Argument | Type | Default | Description
---|:---:|---|---
`obj` | `Object` |  | The object.
`path` | `String` | | The path to the property, e.g. `address.city`.

{% hooksApiReturns getItems "The property value." "result" "any" %}

- **Example**

  ``` js
  const { getByDot, setByDot } = require('feathers-hooks-common');
  
  const setHomeCity = () => context => {
    const city = getByDot(context.data, 'person.address.city');
    setByDot(context, 'data.person.home.city', city);
  }

  module.exports = { before: {
    create: setHomeCity()
  } };
  ```
  
- **Details**

  `getByDot` does not differentiate between non-existent paths and a value of `undefined`.
  
{% hooksApiFootnote getByDot %}

<!--=============================================================================================-->
<h3 id="setbyDot">setByDot( obj, path, value )</h3>

{% hooksApi setByDot %}

- **Arguments**
  - `{Object} obj`
  - `{String} path`
  - `{any} value` 

Argument | Type | Default | Description
---|:---:|---|---
`obj` | `Object` |  | The object.
`path` | `String` | | The path to the property, e.g. `address.city`.
`value` | `any` | | The value to set the property to.

- **Example**

  ``` js
  const { getByDot, setByDot } = require('feathers-hooks-common');
  
  const setHomeCity = () => context => {
    const city = getByDot(context.data, 'person.address.city');
    setByDot(context, 'data.person.home.city', city);
  }

  module.exports = { before: {
    create: setHomeCity()
  } };
  ```
  
{% hooksApiFootnote setByDot %}

<!--=============================================================================================-->
<h3 id="getitems">getItems( context )</h3>

{% hooksApi getItems %}

- **Arguments**
  - `{Object} context`

Argument | Type | Default | Description
---|:---:|---|---
`context` | `Object` |  | The hook context.

{% hooksApiReturns getItems "The records.", 'records', 'Array< Object > | Object | undefined' %}

- **Example**

  ``` js
  const { getItems, replaceItems } = require(('feathers-hooks-common');
  
  const insertCode = code => context {
    const items = getItems(context);
    !Array.isArray(items) ? items.code = code : (items.forEach(item => { item.code = code; }));
    replaceItems(context, items);
  };
  
  module.exports = { before: {
    create: insertCode('a')
  } };
  ```
  
- **Details**

  `getItems` gets the records from the hook context: `context.data` (before hook) or `context.result[.data]` (after hook).
  
{% hooksApiFootnote getItems %}

<!--=============================================================================================-->
<h3 id="replaceitems">replaceItems( context, records )</h3>

{% hooksApi replaceItems %}

- **Arguments**

  - `{Object} context`
  - `{Array< Object > | Object} records`

Argument | Type | Default | Description
---|:---:|---|---
`context` | `Object` |  | The hook context.
`records` | `Array< Object >` `Object` | | The new records.

- **Example**

  ``` js
  const { getItems, replaceItems } = require(('feathers-hooks-common');
    
  const insertCode = code => context {
    const items = getItems(context);
    !Array.isArray(items) ? items.code = code : (items.forEach(item => { item.code = code; }));
    replaceItems(context, items);
  };
    
  module.exports = { before: {
    create: insertCode('a')
  } };
  ```
  
- **Details**

  `replaceItems` replaces the records in the hook context: `context.data` (before hook) or `context.result[.data]` (after hook).
 
{% hooksApiFootnote replaceItems %}

<!--=============================================================================================-->
<h3 id="makecallingparams">makeCallingParams( context, query, include, inject )</h3>


{% hooksApi makeCallingParams %}


- **Arguments**
  - `{Object} context`
  - `{Object} [ query ]`
  - `{Array< String > | String} [ include ]`
  - `{Object} [ inject ]`
  
Argument | Type | Default | Description
---|:---:|---|---
`context` | `Object`  |  | The existing hook context.
`query` | `Object`  |  | The `context.params.query` for the new context.
`include` | `Object`  |  | The names of the props in `context` to include in the new context.
`inject` | `Object`  |  | Additional props to add to the new context.
`newContext` | `Object`  |  | The new context created
  
- **Returns**

  - `{Object} newContext`

Variable | Type | Default | Description
---|:---:|---|---
`newContext` | `Object`  |  | The new context created.

- **Example**

  ``` js
  const { makeCallingParams } = require('feathers-hooks-common');
  
  async function myCustomHook(context) {
    // ...
    const result = await service.find(makeCallingParams(
      context, { id: { $in: [1, 2, 3] } }, 'user',
      { _populate: false, mongoose: ... }
    ));
    // ...
  }
  ```
  
- **Details**

  When calling another service within a hook, [consideration must be given](https://docs.feathersjs.com/guides/step-by-step/basic-feathers/writing-hooks.html#calling-a-service) to what the `context.params` should be for the called service. For example, should the called service see that a client is making the call, or the server? What authentication and authorization information should be provided? You can use this convenience function to help create that `context.params`.
   
  The value `context.params._populate: 'skip'` is automatically added to skip any `fastJoin` or `populate` hooks registered on the called service. Set it to `false`, like in the example above, to make those hooks run.

{% hooksApiFootnote makeCallingParams %}

<!--=============================================================================================-->
<h3 id="paramsforserver">paramsForServer( params [, ... whitelist] )</h3>

{% hooksApi paramsForServer %}

- **Arguments**
  - `{Object} params`
  - `{Array< String >} [ whitelist ]`

Argument | Type | Default | Description
---|:---:|---|---
`params` | `Object` |  | The `context.params` to use for the service call, including any query object.
`whitelist` | dot notation | all props in `context.params` | Names of the props in `context.params` to transfer to the server. This is a security feature. All props are transferred if no `whitelist` is provided.

- **Example**

  ``` js
  // client
  const { paramsForServer } = require('feathers-hooks-common');
  
  service.update(id, data, paramsForServer({
    query: { dept: 'a' }, populate: 'po-1', serialize: 'po-mgr'
  }));
  
  // server
  const { paramsFromClient } = require('feathers-hooks-common');
  
  module.exports = { before: {
      all: [
        paramsFromClient('populate', 'serialize', 'otherProp'),
        myHook
      ]
  } };
  
  // myHook's `context.params` will now be
  // { query: { dept: 'a' }, populate: 'po-1', serialize: 'po-mgr' } }
  ```
  
- **Details**

  By default, only the `context.params.query` object is transferred from a Feathers client to the server, for security among other reasons. However you can explicitly transfer other `context.params` props with the client utility function `paramsForServer` in conjunction with the `paramsFromClient` hook on the server.

  This technique also works for service calls made on the server.

{% hooksApiFootnote paramsForServer %}

<!--=============================================================================================-->
<h3 id="thenifyhook">service.get( ... ).then(thenifyHook( options )( hookFunc ))</h3>

{% hooksApi thenifyHook %}


- **Arguments**
  - `???`

Argument | Type | Default | Description
---|:---:|---|---
`transports` |  |  | 

- **Example**

  ``` js
  const { ??? } = require('feathers-hooks-common');
  
  module.exports = { before: {
      
  } };
  ```

{% hooksApiFootnote thenifyHook %}

<!--=============================================================================================-->

<!--=============================================================================================-->

<!--=============================================================================================-->
<h3 id="???">???</h3>

{% hooksApi ??? %}


- **Arguments**
  - `???`

Argument | Type | Default | Description
---|:---:|---|---
`transports` |  |  | 

- **Example**

  ``` js
  const { ??? } = require('feathers-hooks-common');
  
  module.exports = { before: {
      
  } };
  ```
  
- **Details**

{% hooksApiFootnote ??? %}

<!--=============================================================================================-->

<!--=============================================================================================-->
<h2 id="whats-new">What's New</h2>

  - <a href="https://github.com/feathers-plus/feathers-hooks-common/blob/master/CHANGELOG.md">Changelog.</a>
