---
title: API
type: guide
order: 2
dropdown: adapters
repo: postmark
---

<!--- Usage ------------------------------------------------------------------------------------ -->
<h2 id="Usage">Usage</h2>

``` js
npm install --save @feathers-plus/batch-loader

// JS
const BatchLoader = require('@feathers-plus/batch-loader');
const { getResultsByKey, getUniqueKeys } = BatchLoader;

const usersLoader = new BatchLoader(async (keys, context) =>
    const usersRecords = await users.find({ query: { id: { $in: getUniqueKeys(keys) } } });
    return getResultsByKey(keys, usersRecords, user => user.id, '')
  ),
  { context: {} }
);

const user = await usersLoader.load(key);
```

<!--- class BatchLoader ------------------------------------------------------------------------ -->
<h2 id="class-batchloader">class BatchLoader( batchLoadFunc [, options] )</h2>