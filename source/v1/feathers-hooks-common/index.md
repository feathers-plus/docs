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
## Search by Tags

{% hooksByTags %}

<!--=============================================================================================-->
## Hooks

<!--=============================================================================================-->
<h3 id="combine">combine( ...hookFuncs )</h3>

  Sequentially execute multiple hooks within a custom hook function. The hooks may be sync or async.
  
{% hooksApi combine %}

- **Arguments:**
  - `{Array< Function >} hookFuncs`

Argument | Type | Default | Description
---|:---:|---|---
`hookFuncs` | `Array<Function >` | | Hooks, used the same way as when you register them.

- **Example**

  ``` js
  const { combine, createdAt, updatedAt } = require('feathers-hooks-common');
  
  async function myCustomHook(context) {
    const newContext = await combine(createdAt(), updatedAt()).call(this, context);
    return newContext;
  }
  ```
  
- **Details**

  `combine` is primarily intended to be used within your custom hooks, not when registering hooks. Its more convenient to use the following when registering hooks:
  ``` js
  const workflow = [createdAt(), updatedAt(), ...];
  
  app.service('users').hooks({
    before: {
      update: [...workflow],
      patch: [...workflow],
    },
  });
  ```
  
- **See also**: {% hooksApiSee combine %}

<!--=============================================================================================-->
<h3 id="debug">debug( label )</h3>

  Display current info about the hook context to the console.
  
{% hooksApi debug %}


- **Arguments:** 
  - `{String} label`

Argument | Type | Default | Description
---|:---:|---|---
`label` | `String` | `''` | Label to identify the logged information.

- **Example**

  ``` js
  const { debug } = require('feathers-hooks-common');
  
  module.exports = { before: {
      all: [ debug('step 1'), updatedAt(), debug(' step 2') ],
  } };
  
  debug('step 1')
  // Result
  * step 1
  type: before, method: create
  data: { name: 'Joe Doe' }
  query: { sex: 'm' }
  result: { assigned: true }
  * step 1
  type: before, method: create
  data: { name: 'Joe Doe', createdAt: 1510518511547 }
  query: { sex: 'm' }
  result: { assigned: true }
  ```
  
> `debug` is great for debugging issues with hooks. Log the hook context before and after a hook to see what the hook changed.

- **See also**: {% hooksApiSee debug %}

<!--=============================================================================================-->
<h3 id="depopulate">dePopulate( )</h3>

  Removes joined records, computed properties, and profile information created by [`populate`](#populate). Populated and serialized items may, after dePopulate, be used in `service.patch(id, items)` calls.
  
{% hooksApi dePopulate %}

- **Example**

  ``` js
  const { dePopulate } = require('feathers-hooks-common');
  
  module.exports = { before: {
      all: [ depopulate() ],
  } };
  ```
  
- **See also**: {% hooksApiSee dePopulate %}

<!--=============================================================================================-->
<h3 id="disallow">disallow( ...providers )</h3>

  Disallows access to a service method completely or for specific providers. All providers (REST, Socket.io and Primus) set the `context.params.provider` property, and `disallow` checks this.
  
{% hooksApi disallow %}s)


- **Arguments:**
  - `{Array< String >} providers`

Argument | Type | Default / allowed value | Description
---|:---:|---|---
`providers` | `Array<` `String >` | all transports | The transports that you want to disallow this service method for.
 | | `socketio` | will disallow the method for the Socket.IO provider
 | | `primus` | will disallow the method for the Primus provider
 | | `rest` | will disallow the method for the REST provider
 | | `external` | will disallow access from all providers other than the server.
 | | `server` | will disallow access for the server
 
- **Example**

  ``` js
  const { disallow, when } = require('feathers-hooks-common');
  
  module.exports = { before: {
      // Users can not be created by external access
      create: disallow('external'),
      // A user can not be deleted through the REST provider
      remove: disallow('rest'),
      // disallow calling `update` completely (e.g. to allow only `patch`)
      update: disallow(),
      // disallow the remove hook if the user is not an admin
      remove: when(context => !context.params.user.isAdmin, disallow())
  } };
  ```
  
- **See also**: {% hooksApiSee disallow %}

<!--=============================================================================================-->
<h3 id="disableMultiItemChange">disableMultiItemChange( )</h3>

  Disables update, patch and remove methods from using null as an id, e.g. `remove(null)`. A `null` id affects all the items in the DB, so accidentally using it may have undesirable results.
  
{% hooksApi disableMultiItemChange %}

- **Example**

  ``` js
  const { disableMultiItemChange } = require('feathers-hooks-common');
  
  module.exports = { before: {
      patch: disableMultiItemChange(),
      remove: disableMultiItemChange() 
  } };
  ```

- **See also**: {% hooksApiSee disableMultiItemChange %}

<!--=============================================================================================-->
<h3 id="discard">discard( ...fieldNames )</h3>

  Delete the given fields either from the data submitted or from the result. If the data is an array or a paginated find result the hook will `delete` the field(s) for every item.
  
{% hooksApi discard %}


- **Arguments:**
  - `{Array < String >} fieldNames`

Argument | Type | Default | Description
---|:---:|---|---
`fieldNames` | dot notation | | One or more fields you want to remove from the record(s).

- **Example**

  ``` js
  const { discard , iff, isProvider } = require('feathers-hooks-common');
  
  module.exports = { after: {
      all: iff(isProvider('external'), discard('password', 'address.city'))
  } };
  ```

- **See also**: {% hooksApiSee discard %}

<!--=============================================================================================-->
<h3 id="else">else: iff(...).else(...hookFuncs)</h3>

`iff().else()` is similar to `iff` and `iffElse`. Its syntax is more suitable for writing nested conditional hooks. If the predicate in the `iff()` is falsey, run the hooks in `else()` sequentially.
  
{% hooksApi iff.else %}


- **Arguments:**
  - `{Array< Function >} hookFuncs`

Argument | Type | Default | Description
---|:---:|---|---
`hookFuncs` | `Array<Function >` | | Zero or more hook functions. They may include other conditional hooks. Or you can use an array of hook functions as the second parameter. 

- **Example**

  ``` js
  const { iff, isProvider } = require('feathers-hooks-common');
  
  module.exports = { before: {
    create:
      iff(isProvider('server'),
        hookA,
        iff(isProvider('rest'), hook1, hook2, hook3)
          .else(hook4, hook5),
        hookB
      )
        .else(
          iff(hook => hook.path === 'users', hook6, hook7)
        )    
    },
    update:
      iff(isServer, [
        hookA,
        iff(isProvider('rest'), [hook1, hook2, hook3])
          .else([hook4, hook5]),
        hookB
      ])
        .else([
          iff(hook => hook.path === 'users', [hook6, hook7])
        ])
  };
  ```
  
- **Details**

The predicate and hook functions in the `if`, `else` and `iffElse` hooks will not be called with `this` set to the service, as is normal for hook functions. Use `hook.service` instead.

- **See also**: {% hooksApiSee if.else %}

<!--=============================================================================================-->
<h3 id="every">every(... hookFuncs)</h3>

Run hook functions in parallel. Return `true` if every hook function returned a truthy value.
  
{% hooksApi every %}


- **Arguments:**
  - `{Array< Function >} hookFuncs`

Argument | Type | Default | Description
---|:---:|---|---
`hookFuncs` | `Array<Function >` | | Functions which take the current hook as a param and return a boolean result.

- **Example**

  ``` js
  const { every, iff } = require('feathers-hooks-common');
  
  module.exports = { before: {
      create: iff(every(hook1, hook2, ...), hookA, hookB, ...)
  } };
  ```
  
- **See also**: {% hooksApiSee every %}

<!--=============================================================================================-->
<h3 id="fastjoin">fastJoin( schema [, query] )</h3>

We often want to combine rows from two or more tables based on a relationship between them. The fastJoin hook will select records that have matching values in both tables. It can batch service calls and cache records, thereby needing roughly an order of magnitude fewer database calls than the `populate` hook, e.g. *2* calls instead of *20*. It uses a GraphQL-like imperative API.
  
`fastJoin` is not restricted to using data from Feathers services. Resources for which there are no Feathers adapters can [also be used.](../batch-loader/common-patterns.html#Using-non-Feathers-services)

{% hooksApi fastJoin %}

- **Arguments:**
  - `{Object | Function} resolvers`
    - `{Function} [ before ]`
    - `{Function} [ after ]`
    - `{Object} joins`
    
  - `{Object | Function} [ query ]`

Argument | Type | Description
---|---|---
`resolvers` | `Object` or `context => Object` |  The group of operations to perform on the data.
`before` | `context => { }` | Processing performed before the operations are started. Batch-loaders are usually created here.
`after` | `context => { }` | Processing performed after all other operations are completed.
`joins` | `Object` | Resolver functions provide a mapping between a portion of a operation and actual backend code responsible for handling it.
`query` | `Object` | You can customise the current operations with the optional query.

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

- **See also**: {% hooksApiSee fastJoin %}

<!--=============================================================================================-->
<h3 id="iff">iff(predicate, ...hookFuncs)</h3>

Resolve the predicate to a boolean. Run the hooks sequentially if the result is truthy.
  
{% hooksApi iff %}


- **Arguments:**
  - `{Boolean | Promise | Function} predicate`
  - `{Array< Function >} hookFuncs`

Argument | Type | Default | Description
---|:---:|---|---
`predicate` | `Boolean`, `Promise` or `Function` | | Determines if hookFuncs should be run or not. If a function, `predicate` is called with the `context` as its param. It returns either a boolean or a Promise that evaluates to a boolean.
`hookFuncs` | `Array<` `Function >` | | Zero or more hook functions. They may include other conditional hooks. Or you can use an array of hook functions as the second parameter.


- **Example**

  ``` js
  const { iff, populate, remove } = require('feathers-hooks-common');
  const isNotAdmin = adminRole => context => context.params.user.roles.indexOf(adminRole || 'admin') === -1;
  
  module.exports = { before: {
      create: iff(
        () => new Promise((resolve, reject) => { ... }),
        populate('user', { field: 'authorisedByUserId', service: 'users' })
      ),
      find: [ iff(isNotAdmin(), remove('budget')) ]
  } };
  ```

- **Details**

The predicate and hook functions in the `if`, `else` and `iffElse` hooks will not be called with `this` set to the service, as is normal for hook functions. Use `hook.service` instead.


- **See also:** [iffElse](#iffelse), [when](#when), [unless](#unless), [isNot](isnot), [isProvider](isprovider), [every](#every), [some](#some).

<!--=============================================================================================-->
<h3 id="iffelse">iffElse(predicate, trueHooks, falseHooks)</h3>

Resolve the predicate to a boolean. Run the first set of hooks sequentially if the result is truthy, the second set otherwise.
  
{% hooksApi iffElse %}


- **Arguments:**
  - `{Function} predicate`
  - `{Array< Functions >} trueHooks`
  - `{Array< Functions >} falseHooks` 

Argument | Type | Default | Description
---|:---:|---|---
`predicate` | Function |  | Determines if hookFuncs should be run or not. If a function, predicate is called with the hook as its param. It returns either a boolean or a Promise that evaluates to a boolean.
`trueHooks` | `Array<` `Functions >` |  | Zero or more hook functions run when predicate is truthy.
`falseHooks` | `Array<` `Functions >` |  | Zero or more hook functions run when predicate is false.

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

The predicate and hook functions in the `if`, `else` and `iffElse` hooks will not be called with `this` set to the service, as is normal for hook functions. Use `hook.service` instead.

- **See also**: {% hooksApiSee iff %}

<!--=============================================================================================-->
<h3 id="isnot">isNot(predicate)</h3>

Negate the predicate.
  
{% hooksApi isNot %}


- **Arguments:**
  - `{Function} predicate`

Argument | Type | Default | Description
---|:---:|---|---
`providers` |  |  | A function which returns either a boolean or a Promise that resolves to a boolean.

- **Example**

  ``` js
  const { iff, isNot, isProvider, remove } = require('feathers-hooks-common');
  const isRequestor = () => hook => new Promise(resolve, reject) => ... );
  
  module.exports = { after: {
      create: iff(isNot(isRequestor()), discard('password'))
  } };
  ```
  
- **See also**: {% hooksApiSee isNot %}

<!--=============================================================================================-->
<h3 id="isprovider">isProvider(...providers)</h3>

Check which transport called the service method. All providers (REST, Socket.io and Primus) set the params.provider property which is what isProvider checks for. Used as a predicate function with conditional hooks.
  
- **See also**: {% hooksApiSee isProvider %}


- **Arguments:**
  - `{Array< String >} providers`

Argument | Type | Default / allowed value | Description
---|:---:|---|---
`providers` | `Array<` `String >` | all transports | The transports that you want this hook to run for. 
 | | `socketio` | will disallow the method for the Socket.IO provider
 | | `primus` | will disallow the method for the Primus provider
 | | `rest` | will disallow the method for the REST provider
 | | `external` | will disallow access from all providers other than the server.
 | | `server` | will disallow access for the server

- **Example**

  ``` js
  const { iff, isProvider, remove } = require('feathers-hooks-common');
  
  module.exports = { after: {
      create: iff(isProvider('external'), discard('password'))
  } };
  ```
  
- **Details**

- **See also**: {% hooksApiSee isProvider %}

<!--=============================================================================================-->
<h3 id="keep">keep(...fieldNames)</h3>

Keeps the given fields either in the data submitted or in the result.
  
{% hooksApi keep %}

<p class="tip">The keep hook will remove any fields not specified even if the service is called from the server.</p>

- **Arguments:**
  - `{Array< String > | String} fieldNames`

Argument | Type | Default | Description
---|:---:|---|---
`fieldNames` | dot notation | | One or more fields you want from the record(s).

- **Example**

  ``` js
    const { keep } = require('feathers-hooks-common');
    
    
    module.exports = { before: {
        // Only retain the hashed `password` and `salt` field after all method calls
        all: keep('password', 'salt'),
        // Only keep the _id for `create`, `update` and `patch`
        create: keep('_id'),
        update: keep('_id'),
        patch: keep('_id')
    } };;
  ```

- **See also**: {% hooksApiSee keep %}

<!--=============================================================================================-->
<h3 id="lowercase">lowerCase(... fieldNames)</h3>

Convert the given fields to lower case.
  
{% hooksApi lowerCase %}


- **Arguments:**
  - `{Array< String > | String} fieldNames`

Argument | Type | Default | Description
---|:---:|---|---
`fieldNames` | dot notation | | One or more fields you want to convert to lower case.

- **Example**

  ``` js
  const { lowerCase } = require('feathers-hooks-common');
  
  module.exports = { before: {
      create: lowerCase('email', 'username')
  } };
  ```
  
- **Details**

- **See also**: {% hooksApiSee lowerCase %}

<!--=============================================================================================-->
<h3 id="paramsFromClient">paramsFromClient(...whitelist)</h3>

A hook, on the server, for passing params from the client to the server.
  
{% hooksApi paramsFromClient %}

> Companion to the utility function `paramsForServer`.

- **Arguments:**
  - `{Array< String > | String} whitelist`

Argument | Type | Default | Description
---|:---:|---|---
`whitelist` | dot notation | | Names of the permitted props; other props are ignored. This is a security feature.

- **Example**

  ``` js
  // client
  import { paramsForServer } from 'feathers-hooks-common';
  
  service.patch(null, data, paramsForServer({
    query: { dept: 'a' }, populate: 'po-1', serialize: 'po-mgr'
  }));
  
  // server
  const { paramsFromClient } = require('feathers-hooks-common');
  
  service.before({ all: [
    paramsFromClient('populate', 'serialize', 'otherProp'), myHook
  ]});
  
  // context.params will now be
  // { query: { dept: 'a' }, populate: 'po-1', serialize: 'po-mgr' } }
  ```
  
- **Details**

By default, only the hook.params.query object is transferred to the server from a Feathers client, for security among other reasons. However you can explicitly transfer other params props with the client utility function paramsForServer in conjunction with the hook function paramsFromClient on the server.

You can use the same technique for service calls made on the server.

- **See also**: {% hooksApiSee paramsFromClient %}

<!--=============================================================================================-->
<h3 id="pluckquery">pluckQuery(...fieldNames)</h3>

Discard all other fields except for the given fields from the query params.
  
{% hooksApi pluckQuery %}


- **Arguments:**
  - `{Array< String > | String} fieldNames`

Argument | Type | Default | Description
---|:---:|---|---
`whitelist` | dot notation | | The fields that you want to retain from the query object. All other fields will be discarded.

- **Example**

  ``` js
  const { ??? } = require('feathers-hooks-common');
  
  module.exports = { before: {
      // Discard all other fields except for _id from the query
      all: pluckQuery('_id')
  } };
  ```
  
- **Details**

This hook will only fire when params.provider has a value, i.e. when it is an external request over REST or Sockets.

- **See also**: {% hooksApiSee pluckQuery %}

<!--=============================================================================================-->
<h3 id="populate">populate(options)</h3>

> Work in progress.

Populates items recursively to any depth. Supports 1:1, 1:n and n:1 relationships.
  
{% hooksApi populate %}


- **Arguments:**
  - `???`

Argument | Type | Default | Description
---|:---:|---|---
`providers` |  |  | 

- **Example**

  ``` js
  const { ??? } = require('feathers-hooks-common');
  
  module.exports = { before: {
      
  } };
  ```
  
- **Details**

- **See also**: {% hooksApiSee populate %}

<!--=============================================================================================-->
<h3 id="preventchanges">preventChanges(...fieldNames)</h3>

Prevents the specified fields from being patched.
  
{% hooksApi preventChanges %}


- **Arguments:**
  - `{Array< String > | String} fieldNames`

Argument | Type | Default | Description
---|:---:|---|---
`fieldNames` | dot notation |  | One or more fields which may not be patched.

- **Example**

  ``` js
  const { preventChanges } = require('feathers-hooks-common');
  
  module.exports = { before: {
      patch: preventChanges('security.badge')
  } };
  ```
  
- **Details**

Consider using validateSchema if you would rather specify which fields are allowed to change.

- **See also**: {% hooksApiSee preventChanges %}

<!--=============================================================================================-->
<h3 id="removeQuery">removeQuery(...fieldNames)</h3>

Remove the given fields from the query params.
  
{% hooksApi removeQuery %}


- **Arguments:**
  - `{Array< String > | String} fieldNames`

Argument | Type | Default | Description
---|:---:|---|---
`fieldNames` | dot notation |  | The fields that you want to remove from the query object.

- **Example**

  ``` js
  const { removeQuery } = require('feathers-hooks-common');
  
  module.exports = { before: {
      all: removeQuery('_id')
  } };
  ```
  
- **Details**

This hook will only fire when params.provider has a value, i.e. when it is an external request over REST or Sockets.

- **See also**: {% hooksApiSee removeQuery %}

<!--=============================================================================================-->
<h3 id="serialize">serialize(options)</h3>

> Work in progress.

Remove selected information from populated items. Add new computed information. Intended for use with the populate hook.
  
{% hooksApi serialize %}


- **Arguments:**
  - `???`

Argument | Type | Default / allowed value | Description
---|:---:|---|---
`providers` |  |  | 

- **Example**

  ``` js
  const { ??? } = require('feathers-hooks-common');
  
  module.exports = { before: {
      
  } };
  ```
  
- **Details**

- **See also**: {% hooksApiSee serialize %}

<!--=============================================================================================-->
<h3 id="setNow">setNow(...fieldNames)</h3>

Add the fields with the current date-time.
  
{% hooksApi setNow %}

> Change code to not allow in after

- **Arguments:**
  - `{Array< String > | String} fieldNames`

Argument | Type | Default | Description
---|:---:|---|---
`fieldNames` | dot notation |  | The fields that you want to add with the current date-time to the retrieved object(s). At least one name is required.

- **Example**

  ``` js
  const { setNow } = require('feathers-hooks-common');
  
  module.exports = { before: {
      create: setNow('createdAt', 'updatedAt')
  } };
  ```

- **See also**: {% hooksApiSee setNow %}

<!--=============================================================================================-->
<h3 id="setSlug">setSlug(slug, fieldName</h3>

> Work in Progress
  
{% hooksApi setSlug %}


- **Arguments:**
  - `???`

Argument | Type | Default / allowed value | Description
---|:---:|---|---
`providers` |  |  | 

- **Example**

  ``` js
  const { ??? } = require('feathers-hooks-common');
  
  module.exports = { before: {
      
  } };
  ```
  
- **Details**

- **See also**: {% hooksApiSee setSlug %}

<!--=============================================================================================-->
<h3 id="sifter">sifter(options)</h3>

All official Feathers database adapters support a common way for querying, sorting, limiting and selecting find method calls. These are limited to what is commonly supported by all the databases.
 
The sifter hook provides an extensive MongoDB-like selection capabilities, and it may be used to more extensively select records.
  
{% hooksApi sifter %}


- **Arguments:**
  - `{Object} options`
    - `{Function} mongoQueryFunc`

Argument | Type | Default | Description
---|:---:|---|---
`mongoQueryFunc` | Function |  | Information about the mongoQueryObj syntax is available at [sift](https://github.com/crcn/sift.js).

- **Example**

  ``` js
  const { ??? } = require('feathers-hooks-common');
  
  module.exports = { before: {
      
  } };
  ```
  
- **Details**

`sifter` filters the result of a find call. Therefore more records will be physically read than needed. You can use the Feathers database adapters query to reduce this number.`

- **See also**: {% hooksApiSee sifter %}

<!--=============================================================================================-->
<h3 id="softDelete">softDelete(fieldName)</h3>

Marks items as { deleted: true } instead of physically removing them. This is useful when you want to discontinue use of, say, a department, but you have historical information which continues to refer to the discontinued department.
  
{% hooksApi softDelete %}

> Must be used on `all` service call types, i.e. `create`, get`, `update`, `patch`, `remove` and `find`.

- **Arguments:**
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
  
- **Details**

<!--=============================================================================================-->
<h3 id="some">some(...hookFuncs)</h3>

Run hook functions in parallel. Return `true` if any hook function returned a truthy value.
  
{% hooksApi some %}


- **Arguments:**
  - `{Array< Function >} hookFuncs`

Argument | Type | Default | Description
---|:---:|---|---
`hookFuncs` | `Array<Function >` | | Functions which take the current hook as a param and return a boolean result.

- **Example**

  ``` js
  const { iff, some } = require('feathers-hooks-common');
  
  module.exports = { before: {
      create: iff(some(hook1, hook2, ...), hookA, hookB, ...)
  } };
  ```
  
- **See also**: {% hooksApiSee softDelete %}

<!--=============================================================================================-->
<h3 id="stashbefore">stashBefore(fieldName)</h3>

Stash current value of record before mutating it.
  
{% hooksApi stashBefore %}


- **Arguments:**
  - `???`

Argument | Type | Default | Description
---|:---:|---|---
`fieldName` |  | `'before'` | The name of the params property to contain the current record value.

- **Example**

  ``` js
  const { patch } = require('feathers-hooks-common');
  
  module.exports = { before: {
      patch: stashBefore()
  } };
  ```
  
- **Details**

This hook makes a `get` service call.

<!--=============================================================================================-->
<h3 id="traverse">traverse(transformer [, getObject])</h3>

Traverse and transform objects in place by visiting every node on a recursive walk. Any object in the hook may be traversed, including the query object.
  
{% hooksApi traverse %}


- **Arguments:**
  - `???`

Argument | Type | Default | Description
---|:---:|---|---
`transformer` | `Function` |  | Called for every node. May change the node in place.
`getObject` | `Function` | `hook.data` or `hook.result` | Function with signature `context => {}` which returns the object to traverse.

- **Example**

  ``` js
  // Trim strings
  const trimmer = function (node) {
    if (typeof node === 'string') { this.update(node.trim()); }
  };
  service.before({ create: traverse(trimmer) });
  
  // REST HTTP request may use the string 'null' in its query string.
  // Replace these strings with the value null.
  const nuller = function (node) {
    if (node === 'null') { this.update(null); }
  };
  
  service.before({ find: traverse(nuller, hook => hook.params.query) });
  ```
  
- **Details**

[substack/js-traverse](https://github.com/substack/js-traverse) documents the extensive methods and context available to the transformer function.`

- **See also**: {% hooksApiSee stashBefore %}

<!--=============================================================================================-->
<h3 id="unless">unless(predicate, ...hookFuncs)</h3>

Resolve the predicate to a boolean. Run the hooks sequentially if the result is falsey.
  
{% hooksApi unless %}


- **Arguments:**
  - `{Boolean | Promise | Function} predicate`
  - `{Array< Function >} hookFuncs`

Argument | Type | Default | Description
---|:---:|---|---
`predicate` | `Boolean`, `Promise` or `Function` | | Determines if hookFuncs should be run or not. If a function, `predicate` is called with the `context` as its param. It returns either a boolean or a Promise that evaluates to a boolean.
`hookFuncs` | `Array<` `Function >` | | Zero or more hook functions. They may include other conditional hooks. Or you can use an array of hook functions as the second parameter.


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

The predicate and hook functions in the `if`, `else` and `iffElse` hooks will not be called with `this` set to the service, as is normal for hook functions. Use `hook.service` instead.

- **See also**: {% hooksApiSee unless %}

<!--=============================================================================================-->
<h3 id="validate">validate(validator)</h3>

> Work in progress.

Call a validation function from a before hook. The function may be sync or return a Promise.
  
{% hooksApi validate %})


- **Arguments:**
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

<!--=============================================================================================-->

<h3 id="validateSchema">validateSchema(schema, ajv, options)</h3>

Validate an object using [JSON-Schema](http://json-schema.org/) through [Ajv](https://github.com/epoberezkin/ajv).
  
{% hooksApi validateSchema %}


- **Arguments:**
  - `???`
  
  > Work in progress.

Argument | Type | Default / allowed value | Description
---|:---:|---|---
`providers` |  |  | 

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

- **See also**: {% hooksApiSee validate %}

<!--=============================================================================================-->
<h3 id="when">when(predicate, ...hookFuncs)</h3>

An alias for [iff](#iff).

- **See also**: {% hooksApiSee when %}

<!--=============================================================================================-->
## Utilities

<!--=============================================================================================-->
<h3 id="makecalliningparams">makeCallingParams(context, query, include, inject)</h3>

When calling another service within a hook, [consideration must be given](https://docs.feathersjs.com/guides/step-by-step/basic-feathers/writing-hooks.html#calling-a-service) to what the `context.params` should be for the called service. For example, should the called service see that a client is making the call, or the server? What authentication and authorization information should be provided? You can use this convenience **utility function** to help create that `context.params`.
  
{% hooksApi makeCallingParams %}


- **Arguments:**
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

  `context.params._populate: 'skip'` is automatically added to skip any `fastJoin` or `populate` hooks registered on the called service. Set it to `false`, like in the example above, to make those hooks run.

- **See also**: {% hooksApiSee makeCallingParams %}

<!--=============================================================================================-->

<!--=============================================================================================-->

<!--=============================================================================================-->
<h3 id="???">???</h3>

  ???
  
before | after | multi recs | methods | details
:---:|:---:|:---:|:---:|:---:
yes | yes | | all | [source](https://github.com/feathersjs/feathers-hooks-common/blob/master/lib/services/???.js)


- **Arguments:**
  - `???`

Argument | Type | Default / allowed value | Description
---|:---:|---|---
`providers` |  |  | 

- **Example**

  ``` js
  const { ??? } = require('feathers-hooks-common');
  
  module.exports = { before: {
      
  } };
  ```
  
- **Details**

- **See also:** 
- **See also:** [iff](#iff), [iffElse](#iffelse), [when](#when), [unless](#unless), [isNot](isnot), [isProvider](isprovider), [every](#every), [some](#some).

<!--=============================================================================================-->

<!--=============================================================================================-->
<h2 id="whats-new">What's New</h2>

  - <a href="https://github.com/feathers-plus/feathers-hooks-common/blob/master/CHANGELOG.md">Changelog.</a>
