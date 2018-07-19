---
title: Service Module API
type: guide
order: 3
dropdown: frameworks
repo: feathers-vuex
---

The `Service Module` sets up services in the Vuex store.  Each service will have the below default state in its store.

## Service State
Each service comes loaded with the following default state:
```js
{
    ids: [],
    keyedById: {}, // A hash map, keyed by id of each item
    currentId: undefined, // The id of the item marked as current
    copy: undefined, // A deep copy of the current item
    idField: 'id',
    servicePath: 'v1/todos' // The full service path
    autoRemove: false, // Indicates that this service will not automatically remove results missing from subsequent requests.
    replaceItems: false, // When set to true, updates and patches will replace the record in the store instead of merging changes
    paginate: false, // Indicates if pagination is enabled on the Feathers service.

    isFindPending: false,
    isGetPending: false,
    isCreatePending: false,
    isUpdatePending: false,
    isPatchPending: false,
    isRemovePending: false,

    errorOnfind: undefined,
    errorOnGet: undefined,
    errorOnCreate: undefined,
    errorOnUpdate: undefined,
    errorOnPatch: undefined,
    errorOnRemove: undefined
  }
```

The following attributes are available in each service module's state:

- `ids {Array}` - an array of plain ids representing the ids that belong to each object in the `keyedById` map.
- `keyedById {Object}` - a hash map keyed by the id of each item.
- `currentId {Number|String}` - the id of the item marked as current.
- `copy {Object}` - a deep copy of the current item at the moment it was marked as current. You can make changes to the copy without modifying the `current`.  You can then use the `commitCopy` mutation to save the changes as the `current` or `rejectCopy` to revert `copy` to once again match `current`.  You may prefer to use the new [clone API]() for [managing multiple copies with model instances](/v1/feathers-vuex/common-patterns.html#Multiple-Copies).
- `servicePath {String}` - the full service path, even if you alias the namespace to something else.
- `modelName {String}` - the key in the $FeathersVuex plugin where the model will be found.
- `autoRemove {Boolean` - indicates that this service will not automatically remove results missing from subsequent requests.  Only use with feathers-rest. Default is false.
- `replaceItems {Boolean}` - When set to true, updates and patches will replace the record in the store instead of merging changes.  Default is false
- `idField {String}` - the name of the field that holds each item's id. *Default: `'id'`*
- `paginate {Boolean}` - Indicates if the service has pagination turned on.  This changes the response of the `find` action and getter to match the response that Feathers gives.

The following state attributes allow you to bind to the pending state of requests:
- `isFindPending {Boolean}` - `true` if there's a pending `find` request.  `false` if not.
- `isGetPending {Boolean}` - `true` if there's a pending `get` request.  `false` if not.
- `isCreatePending {Boolean}` - `true` if there's a pending `create` request.  `false` if not.
- `isUpdatePending {Boolean}` - `true` if there's a pending `update` request.  `false` if not.
- `isPatchPending {Boolean}` - `true` if there's a pending `patch` request.  `false` if not.
- `isRemovePending {Boolean}` - `true` if there's a pending `remove` request.  `false` if not.

The following state attribute will be populated with any request error, serialized as a plain object:
- `errorOnFind {Error}`
- `errorOnGet {Error}`
- `errorOnCreate {Error}`
- `errorOnUpdate {Error}`
- `errorOnPatch {Error}`
- `errorOnRemo {Error}`

## Service Getters
Service modules include the following getters:
- `list {Array}` - an array of items. The array form of `keyedById`  Read only.
- `find(params) {Function}` - a helper function that allows you to use the [Feathers Adapter Common API](https://docs.feathersjs.com/api/databases/common.html) and [Query API](https://docs.feathersjs.com/api/databases/querying.html) to pull data from the store.  This allows you to treat the store just like a local Feathers database adapter (but without hooks).
  - `params {Object}` - an object with a `query` object and an optional `paginate` boolean property. The `query` is in the FeathersJS query format.  You can set `params.paginate` to `false` to disable pagination for a single request.
- `get(id[, params]) {Function}` - a function that allows you to query the store for a single item, by id.  It works the same way as `get` requests in Feathers database adapters.
  - `id {Number|String}` - the id of the data to be retrieved by id from the store.
  - `params {Object}` - an object containing a Feathers `query` object.
- `current {Object}` - the object representing the `currentId`. It's pulled from the `keyedById` state.
- `getCopy {Object}` - An alias to the `state.copy`.

## Service Mutations
The following mutations are included in each service module.
> **Note:** you would typically not call these directly, but instead with `store.commit('removeItem', 'itemId')`. Using vuex's mapMutations on a Vue component can simplify that to `this.removeItem('itemId')`

### `addItem(state, item)`
Adds a single item to the `keyedById` map.
- `item {Object}` - The item to be added to the store.

### `addItems(state, items)`
Adds an array of items to the `keyedById` map.
- `items {Array}` - the items to be added to the store.

### `updateItem(state, item)`
Updates an item in the store to match the passed in `item`.
- `item {Object}` the item, including `id`, to replace the currently-stored item.

### `updateItems(state, items)`
Updates multiple items in the store to match the passed in array of items.
- `items {Array}` - An array of items.

### `removeItem(state, item)`
Removes a single item.  `item` can be
- `item {Number|String|Object}` - The item or id of the item to be deleted.

### `removeItems(state, items)`
Removes the passed in items or ids from the store.
- `items {Array}` - An array of ids or of objects with ids that will be removed from the data store.

### `setCurrent(state, item)`
- `item {Number|String|Object}` - the object with id to be set as the current item, or the id of the object in the store that should become the `current` item.  Setting the `current` item or id also create the deep-cloned `copy`.

### `commitCopy(state)`
Saves changes from the `copy` to the `current` item.

### `rejectCopy(state)`
Re-copies the data from `current` to `copy`, restoring the original copy.

### `clearCurrent(state)`
Clears the `current` item, which also clears the copy.

### `clearList(state)`
Clears the `list`, excepting the `current` item.

### `clearAll(state)`
Clears all data from `ids`, `keyedById`, and `currentId`

### Mutations for Managing Pending State
The following mutations are called automatically by the service actions, and will rarely, if ever, need to be used manually.
- `setFindPending(state)` - sets `isFindPending` to `true`
- `unsetFindPending(state)` - sets `isFindPending` to `false`
- `setGetPending(state)` - sets `isGetPending` to `true`
- `unsetGetPending(state)` - sets `isGetPending` to `false`
- `setCreatePending(state)` - sets `isCreatePending` to `true`
- `unsetCreatePending(state)` - sets `isCreatePending` to `false`
- `setUpdatePending(state)` - sets `isUpdatePending` to `true`
- `unsetUpdatePending(state)` - sets `isUpdatePending` to `false`
- `setPatchPending(state)` - sets `isPatchPending` to `true`
- `unsetPatchPending(state)` - sets `isPatchPending` to `false`
- `setRemovePending(state)` - sets `isRemovePending` to `true`
- `unsetRemovePending(state)` - sets `isRemovePending` to `false`

### Mutations for Managing Errors
The following mutations are called automatically by the service actions, and will rarely need to be used manually.
- `setFindError(state, error)`
- `clearFindError(state)`
- `setGetError(state, error)`
- `clearGetError(state)`
- `setCreateError(state, error)`
- `clearCreateError(state)`
- `setUpdateError(state, error)`
- `clearUpdateError(state)`
- `setPatchError(state, error)`
- `clearPatchError(state)`
- `setRemoveError(state, error)`
- `clearRemoveError(state)`

## Service Actions
An action is included for each of the Feathers service interface methods.  These actions will affect changes in both the Feathers API server and the Vuex store.

All of the [Feathers Service Methods](https://docs.feathersjs.com/api/databases/common.html#service-methods) are supported.  Because Vuex only supports providing a single argument to actions, there is a slight change in syntax that works well.  If you need to pass multiple arguments to a service method, pass an array to the action with the order of the array elements matching the order of the arguments.  See each method for examples.

> Note: If you use the Feathers service methods, directly, the store will not change. Only the actions will cause store changes.

### `find(params)`
Query an array of records from the server & add to the Vuex store.
- `params {Object}` - An object containing a `query` object and an optional `paginate` boolean.  You can set `params.paginate` to `false` to disable pagination for a single request.

```js
let params = {query: {completed: true}}
store.dispatch('todos/find', params)
```

See the section about pagination, below, for more information that is applicable to the `find` action.

### `get(id)` or `get([id, params])`
Query a single record from the server & add to Vuex store
- `id {Number|String}` - the `id` of the record being requested from the API server.
- `params {Object}` - An object containing a `query` object.

```js
store.dispatch('todos/get', 1)

// Use an array to pass params
let params = {}
store.dispatch('todos/get', [1, params])
```

### `create(data)` or `create([data, params])`
Create one or multiple records.
- `data {Object|Array}` - if an object is provided, a single record will be created. If an array of objects is provided, multiple records will be created.

```js
let newTodo = {description: 'write good tests'}
store.dispatch('todos/create', newTodo)
```


### `update(paramArray)`
Update (overwrite) a record.
- `paramArray {Array}` - array containing the three parameters update takes.
  - `id {Number|String}` - the `id` of the existing record being requested from the API server.
  - `data {Object}` - the data that will overwrite the existing record
  - `params {Object}` - An object containing a `query` object.

```js
let data = {id: 5, description: 'write your tests', completed: true}
let params = {}
// Overwrite item 1 with the above data (FYI: Most databases won't let you change the id.)
store.dispatch('todos/update', [1, data, params])
```

Alternatively in a Vue component
```
import { mapActions } from 'vuex'
export default {
  methods: {
    ...mapActions('todos', [ 'update' ]),
    addTodo () {
      let data = {id: 5, description: 'write your tests', completed: true}
      this.update([1, data, {}])
    }
  }
}
```

### `patch(paramArray)`
Patch (merge in changes) one or more records
- `paramArray {Array}` - array containing the three parameters patch takes.
  - `id {Number|String}` - the `id` of the existing record being requested from the API server.
  - `data {Object}` - the data that will be merged into the existing record
  - `params {Object}` - An object containing a `query` object.

```js
let data = {description: 'write your tests', completed: true}
let params = {}
store.dispatch('todos/patch', [1, data, params])
```


### `remove(id)`
Remove/delete the record with the given `id`.
- `id {Number|String}` - the `id` of the existing record being requested from the API server.

```js
store.dispatch('todos/remove', 1)
```

## Querying with Find & Pagination
Both the `find` action and the `find` getter support pagination.  There are differences in how they work.

### The `find` action

The `find` action queries data from the remote server.  It returns a promise that resolves to the response from the server.  The presence of pagination data will be determined by the server.

`feathers-vuex@1.0.0` can store pagination data on a per-query basis.  The `pagination` store attribute maps queries to their most-recent pagination data.  It's an empty object by default, but after performing a single query (with pagination in the response), it will have a `default` property.  This property stores pagination information for the query.  Here's what it will look like:

**`params = { query: {} }`**
```js
{
  pagination: {
    default: {
      query: {}, // Same as params.query
      ids: [0, 1, 2], // the ids in the store for the records that were returned from the server
      limit: 0, // the response.limit
      skip: 0, // the response.skip
      total: 3 // the response.total
    }
  }
}
```

It's possible that you'll want to store pagination information for more than one query.  This might be for different components making queries against the same service, for example.  You can use the `params.qid` (query identifier) property to assign a name to the query.  If you set a `qid` of `mainListView`, for example, the pagination for this query will show up under `pagination.mainListView`.  The `pagination.default` property will be used any time a `params.qid` is not provided.  Here's an example of what this might look like:

**`params = { query: { $limit: 1 }, qid: 'mainListView' }`**
```js
// Data in the store
{
  pagination: {
    mainListView: {
      query: { $limit: 1 }, // Same as params.query
      ids: [0], // the ids in the store for the records that were returned from the server
      limit: 1, // the response.limit
      skip: 0, // the response.skip
      total: 3 // the response.total
    }
  }
}
```

> Note: The `find` action no longer returns reactive lists.  The list data will still be reactive, but new matches that arrive from the server do NOT get automatically added to lists.  There are two solutions to this:
- Use the `find` action to pull in data from the server.  Use the `find` getter to pull a reactive list from the store.
- Configure the `feathers-reactive` plugin with RxJS on your Feathers Client instance.  [Read the docs for implementation details.](https://github.com/feathers-plus/feathers-reactive)

### The `find` getter

The `find` getter queries data from the local store using the same Feathers query syntax as on the server.  It is synchronous and returns the results of the query with pagination.  Pagination cannot be disabled.  It accepts a params object with a `query` attribute.  It does not use any other special attributes.  The returned object looks just like a paginated result that you would receive from the server:

**`params = { query: {} }`**
```js
// The returned results object
{
  data: [{ _id: 1, ...etc }, ...etc],
  limit: 0,
  skip: 0,
  total: 3
}
```

## Customizing a Service's Default Store

As shown in the first example, the service module allows you to customize its store:

```js
const store = new Vuex.Store({
  plugins: [
    // Add custom state, getters, mutations, or actions, if needed
    service('things', {
      state: {
        test: true
      },
      getters: {
        getSomeData () {
          return 'some data'
        }
      },
      mutations: {
        setTestToFalse (state) {
          state.test = false
        },
        setTestToTrue (state) {
          state.test = true
        }
      },
      actions: {
        asyncStuff ({ commit, dispatch }, args) {
          commit('setTestToTrue')

          return doSomethingAsync(id, params)
            .then(result => {
              commit('setTestToFalse')
              return dispatch('otherAsyncStuff', result)
            })
        },
        otherAsyncStuff ({commit}, args) {
          return new Promise.resolve(result)
        }
      }
    })
  ]
})

assert(store.getters['todos/oneTwoThree'] === 123, 'the custom getter was available')
store.dispatch('todos/trigger')
assert(store.state.todos.isTrue === true, 'the custom action was run')
```
