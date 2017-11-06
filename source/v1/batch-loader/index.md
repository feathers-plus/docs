---
title: API
type: guide
order: 2
dropdown: extensions
repo: batch-loader
---

<h3 id="Usage">Usage</h3>

``` js
// command line
npm install --save @feathers-plus/batch-loader

// JS
const BatchLoader = require('@feathers-plus/batch-loader');
const { getResultsByKey, getUniqueKeys } = BatchLoader;

const usersLoader = new BatchLoader(keys =>
  users.find({ query: { id: { $in: getUniqueKeys(keys) } } })
    .then(users => getResultsByKey(keys, users, user => user.id '')),
  options
);

usersLoader.load(key).then(data => ...);
```

<h3 id="new-batchloader">new BatchLoader( batchLoaderFunc, options )</h3>

- **Arguments:**
  - `{Function} batchLoaderFunc`
  - `{Object} options`
  
- **Usage:**

  Instantiate a batch-loader.

<!---
## Global API
-->

<h3 id="Vue-delete">Vue.delete( target, key )</h3>

- **Arguments:**
  - `{Object | Array} target`
  - `{string | number} key/index`

  > Only in 2.2.0+: Also works with Array + index.

- **Usage:**

  Delete a property on an object. If the object is reactive, ensure the deletion triggers view updates. This is primarily used to get around the limitation that Vue cannot detect property deletions, but you should rarely need to use it.

  <p class="tip">The target object cannot be a Vue instance, or the root data object of a Vue instance.</p>


  ``` html
  <div id="mount-point"></div>
  ```

  ``` js
  // create constructor
  var Profile = Vue.extend({
    template: '<p>{{firstName}} {{lastName}} aka {{alias}}</p>',
    data: function () {
      return {
        firstName: 'Walter',
        lastName: 'White',
        alias: 'Heisenberg'
      }
    }
  })
  // create an instance of Profile and mount it on an element
  new Profile().$mount('#mount-point')
  ```

  Will result in:

  ``` html
  <p>Walter White aka Heisenberg</p>
  ```
  
- **See also:** [Reactivity in Depth](../guide/reactivity.html)
