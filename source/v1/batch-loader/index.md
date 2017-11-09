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

<!--- class BatchLoader ------------------------------------------------------------------------ -->
<h2 id="class-batchloader">class BatchLoader( batchLoadFunc [, options] )</h2>

- **Arguments:**
  - `{Function} batchLoadFunc`
  - `{Object} options`

- **Usage:**

  Create a new batch-loader given a batch loading function and options.

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

- **Details:**
  - `batchLoadFunc` See [Batch Function](guide.html#batch-function).
  - `options` An optional object of options:

Property | Type | Default | Description
---|---|---|---
context | Object | null | A context object to pass into batchLoadFunc as its second argument.
batch | Boolean | true | Set to false to disable batching, invoking batchLoadFunc with a single load key.
maxBatchSize | Number | Infinity | Limits the number of items that get passed in to the batchLoadFunc.
cache | Boolean | true | Set to false to disable memorization caching, creating a new Promise and new key in the batchLoadFunc for every load of the same key.
cacheKeyFn | Function | key => key | Produces cache key for a given load key. Useful when keys are objects and two objects should be considered equivalent.
cacheMap | Object | new Map() | Instance of Map (or an object with a similar API) to be used as cache.

- **See also:** [Guide](./guide.html)

<!--- getUniqueKeys ---------------------------------------------------------------------------- -->
<h2 id="get-unique-keys">static BatchLoader.getUniqueKeys( keys )</h2>

- **Arguments:**
  - `{Array<String|Number|Object>} keys`

- **Returns:** `{Array<String|Number|Object>}` the array with unique elements

- **Usage:**

  Returns the unique elements in an array.

  ``` js
  const usersLoader = new BatchLoader(async keys =>
    const data = users.find({ query: { id: { $in: getUniqueKeys(keys) } } })
    ...
  );
  ```

  > The array of keys may contain duplicates when the batch-loader's memorization cache is disabled.

<!--- getResultsByKey -------------------------------------------------------------------------- -->
<h2 id="get-results-by-key">static BatchLoader.getResultsByKey( keys, records, getRecordKeyFunc, type [, options] )</h2>

- **Arguments:**
  - `{Array<String|Number|Object>} keys`
  - `{Array<Object>} records`
  - `{Function} getRecordKeyFunc`
  - `{String} type`
  - `{Object} options`

- **Returns:** `{Array}` the reorganized results

- **Usage:**

  Reorganizes the records from the service call into the result expected from the batch function.

  ``` js
    const usersLoader = new BatchLoader(async keys => {
      const data = users.find({ query: { id: { $in: getUniqueKeys(keys) } } })
      return getResultsByKey(keys, data, user => user.id, '', { defaultElem: [] })
    });
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
  - `{String|Number|Object} key`

- **Returns:** `{Promise}`

- **Usage:**

  Loads a key, returning a Promise for the value represented by that key.

  ``` js
  const batchLoader = new BatchLoader( ... );
  const user = await batchLoader.load(key);
  ```

<!--- loadMany --------------------------------------------------------------------------------- -->
<h2 id="loadmany">batchLoader.loadMany( keys )</h2>

- **Arguments:**
  - `{Array<String|Number|Object>} keys`

- **Returns:** `{Promise}`

- **Usage:**

  Loads multiple keys, promising an array of values:

  ``` js
  const usersLoader = new BatchLoader( ... );
  const users = await usersLoader.loadMany([ key1, key2 ]);
  ```

- **Details:**

  This is a convenience method. `usersLoader.loadMany([ key1, key2 ]);` is equivalent to the more verbose:
  ``` js
  Promise.all([
    usersLoader.load(key1),
    usersLoader.load(key2)
  ]);
  ```

<!--- clear ------------------------------------------------------------------------------------ -->
<h2 id="clear">batchLoader.clear( key )</h2>

- **Arguments:**
  - `{String|Number|Object} key`

- **Returns:** `{BatchLoader}`

- **Usage:**

  Clears the value at key from the cache, if it exists. Returns itself for method chaining.

<!--- clearAll --------------------------------------------------------------------------------- -->
<h2 id="clearall">batchLoader.clearAll()</h2>

- **Returns:** `{BatchLoader}`

- **Usage:**

  Clears the entire cache. To be used when some event results in unknown invalidations across this particular batch-loader. Returns itself for method chaining.

<!--- prime ------------------------------------------------------------------------------------ -->
<h2 id="prime">batchLoader.prime( key, value )</h2>

- **Arguments:**
  - `{String|Number|Object} key`
  - `{Object} value`

- **Returns:** `{BatchLoader}`

- **Usage:**

  Primes the cache with the provided key and value. If the key already exists, no change is made. (To forcefully prime the cache, clear the key first with loader.clear(key).prime(key, value).) Returns itself for method chaining.

<!--- Common attributes ------------------------------------------------------------------------ -->

## Common arguments

### key { String | Number | Object }

  The value the batch loader function will use to find the records requested. Its usually a String or Number. An Object may also be used though that would require a more complex batch loader function than described here.

### keys { Array&lt;key> }

  An array of `key` elements.
