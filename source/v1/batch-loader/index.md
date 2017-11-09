---
title: API
type: guide
order: 2
dropdown: extensions
repo: batch-loader
---

<!--- Usage ------------------------------------------------------------------------------------ -->
<h2 id="Usage">Usage</h2>

``` js
npm install --save @feathers-plus/batch-loader

// JS
const BatchLoader = require('@feathers-plus/batch-loader');
const { getResultsByKey, getUniqueKeys } = BatchLoader;

const usersLoader = new BatchLoader(async (keys, context) => {
    const usersRecords = await users.find({ query: { id: { $in: getUniqueKeys(keys) } } });
    return getResultsByKey(keys, usersRecords, user => user.id, '')
  },
  { context: {} }
);

const user = await usersLoader.load(key);
```

> May be used on the client.

<!--- class BatchLoader ------------------------------------------------------------------------ -->
<h2 id="class-batchloader">class BatchLoader( batchLoadFunc [, options] )</h2>

- **Arguments:**
  - `{Function} batchLoadFunc`
  - `{Object} [ options ]`
    - `{Boolean} batch` Default: true
    - `{Boolean} cache` Default: true
    - `{Function} cacheKeyFn`
    - `{Object} cacheMap`
    - `{Object} context`
    - `{Number} maxBatchSize` Default: Infinity
    
- **Returns:** `{Object} batch-loader instance`

- **Usage:** Create a new batch-loader given a batch loading function and options.

- **Example**

  ``` js
  const BatchLoader = require('@feathers-plus/batch-loader');
  const { getResultsByKey, getUniqueKeys } = BatchLoader;

  const usersLoader = new BatchLoader(async (keys, context) => {
      const data = await users.find({ query: { id: { $in: getUniqueKeys(keys) } } });
      return getResultsByKey(keys, data, user => user.id, '')
    },
    { context: {}, batch: true, cache: true }
  );
  ```
  
- **batchLoadFunc**. See [Batch Function](guide.html#batch-function).

- **Option: batch**. A context object to pass into batchLoadFunc as its second argument.
  
- **Option: cache**

  Set to false to disable memoization caching, creating a new Promise and new key in the batchLoadFunc for every load of the same key.
    
- **Option: cacheKeyFn**

  Produces cache key for a given load key. Useful when keys are objects and two objects should be considered equivalent.
    
- **Option: cacheMap**

  Instance of Map (or an object with a similar API) to be used as cache.
  
  The default cache will grow without limit, which is reasonable for short lived batch-loaders which are rebuilt on every request. The number of records cached can be limited with a  *least-recently-used* cache:
  
  ``` js
  const BatchLoader = require('@feathers-plus/batch-loader');
  const cache = require('@feathers-plus/cache');
  
  const usersLoader = new BatchLoader(
    keys => { ... },
    { cacheMap: cache({ max: 100 })
  );
  ```
    
  > You can consider using npm's `lru` on the browser.
  
- **Option: context**. A context object to pass into batchLoadFunc as its second argument.
    
- **Option: maxBatchSize**

  Limits the number of items that get passed in to the batchLoadFunc.

- **Details:**
  - `batchLoadFunc` See [Batch Function](guide.html#batch-function).
  - `options` An optional object of options:

Property | Type | Default | Description
---|---|---|---
context | Object | null | A context object to pass into batchLoadFunc as its second argument.
batch | Boolean | true | Set to false to disable batching, invoking batchLoadFunc with a single load key.
maxBatchSize | Number | Infinity | Limits the number of items that get passed in to the batchLoadFunc.
cache | Boolean | true | Set to false to disable memoization caching, creating a new Promise and new key in the batchLoadFunc for every load of the same key.
cacheKeyFn | Function | key => key | Produces cache key for a given load key. Useful when keys are objects and two objects should be considered equivalent.
cacheMap | Object | new Map() | Instance of Map (or an object with a similar API) to be used as cache.

- **See also:** [Guide](./guide.html)

<!--- getUniqueKeys ---------------------------------------------------------------------------- -->
<h2 id="get-unique-keys">static BatchLoader.getUniqueKeys( keys )</h2>

- **Arguments:**
  - `{Array<String | Number>} keys`

- **Returns:** `{Array<String | Number>}` the array with unique elements.

- **Usage:** Returns the unique elements in an array.

  > The array of keys may contain duplicates when the batch-loader's memoization cache is disabled.
    
  <p class="tip">Function does not handle keys of type Object nor Array.</p>
  
- **Example:**

  ``` js
  const usersLoader = new BatchLoader(async keys =>
    const data = users.find({ query: { id: { $in: getUniqueKeys(keys) } } })
    ...
  );
  ```

<!--- getResultsByKey -------------------------------------------------------------------------- -->
<h2 id="get-results-by-key">static BatchLoader.getResultsByKey( keys, records, getRecordKeyFunc, type [, options] )</h2>

- **Arguments:**
  - `{Array<String | Number>} keys`
  - `{Array<Object>} records`
  - `{Function} getRecordKeyFunc`
  - `{String} type`
  - `{Object} [ options ]`
    - `{null | []} defaultElem` Default: null
    - `{Function} onError` Default: () => {}

- **Returns:** `{Array<Object>}` the reorganized results.

- **Usage:**  Reorganizes the records from the service call into the result expected from the batch function.

  <p class="tip">Function does not handle keys of type Object nor Array.</p>
  
- **Example**

  ``` js
    const usersLoader = new BatchLoader(async keys => {
      const data = users.find({ query: { id: { $in: getUniqueKeys(keys) } } })
      return getResultsByKey(keys, data, user => user.id, '', { defaultElem: [] })
    });
  ```
  
- **keys**

  An array of `key` elements, which the value the batch loader function will use to find the records requested.
   
- **records** An array of records which, in total, resolve all the `keys`.
  
- **getRecordKeyFunc**

  A function which, given a record, returns the key it satisfies, e.g.
  ``` js
  user => user.id
  ```
  
- **type**

  The type of value the batch loader must return for each key:
  
type | Description
-----| ---
`''` | An optional single record.
`'!'` | A required single record.
`'[]'` | A required array including 0, 1 or more records.
  
- **Option: defaultElem** The value to return for a `key` having no record(s).
  
- **Option: onError**

  Handler for detected errors, e.g.
  
  ``` js
  onError: (i, msg) => { throw new Error(`${msg} on element ${i}`); }
  ```

- **Details:**

  - `keys` An array of `key` elements, which the value the batch loader function will use to find the records requested.
  - `records` An array of records which, in total, resolve all the `keys`.
  - `getRecordKeyFunc` A function which, given a record, returns the key it satisfies, e.g.
    ``` js
    user => user.id
    ```
  - `type` The type of value the batch loader must return for each key:

type | Description
-----| ---
`''` | An optional single record.
`'!'` | A required single record.
`'[]'` | A required array including 0, 1 or more records.

  - `options` An optional object of options:

Property | Type | Default | Description
---|---|---|---
defaultElem | `null`, `[]` | `null` | The value to return for a `key` having no record(s).
onError | Function | (i, msg) => {} | Handler for detected errors.

- **See also:** [Batch-Function](./guide.html#Batch-Function)

<!--- load ------------------------------------------------------------------------------------- -->
<h2 id="load">batchLoader.load( key )</h2>

- **Arguments:**
  - `{String | Number | Object | Array} key`

- **Returns:** `{Promise<Object>} record`

- **Usage:** Loads a key, returning a Promise for the value represented by that key.

- **Example:**

  ``` js
  const batchLoader = new BatchLoader( ... );
  const user = await batchLoader.load(key);
  ```

<!--- loadMany --------------------------------------------------------------------------------- -->
<h2 id="loadmany">batchLoader.loadMany( keys )</h2>

- **Arguments:**
  - `{Array<String | Number | Object | Array>} keys`

- **Returns:** `{Promise< Array<Object> >} array of records`

- **Usage:**
 
  Loads multiple keys, promising an array of values. This is a convenience method. `usersLoader.loadMany([ key1, key2 ])` is equivalent to the more verbose:
  ``` js
  Promise.all([
    usersLoader.load(key1),
    usersLoader.load(key2)
  ]);
  ```

- **Example:**

  ``` js
  const usersLoader = new BatchLoader( ... );
  const users = await usersLoader.loadMany([ key1, key2 ]);
  ```

<!--- clear ------------------------------------------------------------------------------------ -->
<h2 id="clear">batchLoader.clear( key )</h2>

- **Arguments:**
  - `{String | Number | Object | Array} key`

- **Returns:** `{Object} batchLoader instance`

- **Usage:** Clears the value at key from the cache, if it exists. Returns itself for method chaining.

<!--- clearAll --------------------------------------------------------------------------------- -->
<h2 id="clearall">batchLoader.clearAll()</h2>

- **Returns:** `{Object} batchLoader instance`

- **Usage:**

  Clears the entire cache. To be used when some event results in unknown invalidations across this particular batch-loader. Returns itself for method chaining.

<!--- prime ------------------------------------------------------------------------------------ -->
<h2 id="prime">batchLoader.prime( key, value )</h2>

- **Arguments:**
  - `{String | Number | Object | Array} key`
  - `{Object} value`

- **Returns:** `{Object} batchLoader instance`

- **Usage:**

  Primes the cache with the provided key and value. If the key already exists, no change is made. To forcefully prime the cache, clear the key first with `batchloader.clear(key).prime(key, value`). Returns itself for method chaining.
