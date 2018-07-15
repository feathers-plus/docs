---
title: Models & Instances API
type: guide
order: 5
dropdown: frameworks
repo: feathers-vuex
---

Every service now includes a new `FeathersVuexModel` Class and new records are instantiated with that class before getting added to the store.

## Creating instances
The [FeathersVuex plugin for Vue](/v1/feathers-vuex) allow convenient access to all Model constructors. You can create a Model instance by getting a reference to a Model class from the `$FeathersVuex` object:

```js
// In your Vue component
created () {
  const { Todo } = this.$FeathersVuex
  const todo = new Todo({ description: 'Do something!' })
}
```

You can also reference this directly from the Vue module:

```js
import Vue from 'vue'

const { Todo } = Vue
const todo = new Todo({ description: 'Do something!' })
```

The examples above show instantiating a new Model instance without an `id` field. In this case, the record is not added to the Vuex store.  If you instantiate a record **with an `id`** field, it **will** get added to the Vuex store. *Note: This field is customizable using the `idField` option for this service.*

Now that we have Model instances, let's take a look at the functionality they provide. Each instance will include the following methods:

- `.save()`
- `.create()`
- `.patch()`
- `.update()`
- `.clone()`
- `.commit()`
- `.reset()`

*Remember, if a record already has an attribute with any of these method names, it will be overwritten with the method.*

These methods give access to many of the store `actions` and `mutations`.  Using Model instances, you no longer have to use `mapActions` for `create`, `patch`, `update`, or `remove`.  You also no longer have to use `mapMutations` for `createCopy`, `commitCopy`, or `rejectCopy`.

```js
store.dispatch('todos/find', { query: {} })
  .then(response => {
    const { data } = response
    const todo = data[0]

    todo.description = 'Read Nuxt.js docs'
    todo.save() // Calls store.dispatch('todos/patch', [item.id, item, {}])
  })
```

## `instance.save(params)`

The `save` method is a convenience wrapper for the `create/patch` methods, by default. If the records has no `_id`, the `instance.create()` method will be used. The `params` argument will be used in the Feathers client request.  See the [Feathers Service](https://docs.feathersjs.com/api/services.html#service-methods) docs, for reference on where params are used in each method.

```js
// In your Vue component
created () {
  const { Todo } = this.$FeathersVuex
  const todo = new Todo({ description: 'Do something!' })

  todo.save() // --> Creates the todo on the server.
}
```

Once the `create` response returns, the record will have an `_id`.  If you call `instance.save()` again, it will call `instance.patch()`.  Which method is used depends soletly on the data having an id (that matches the `options.idfield` for this service).

As mentioned, `save` performs either `create` or `patch`, but you can use the `preferUpdate` option to change the behavior to `create/update`.

## `instance.create(params)`

The `create` method is a shortcut for calling the `create` action (service method) using the instance data. The `params` argument will be used in the Feathers client request.  See the [Feathers Service](https://docs.feathersjs.com/api/services.html#service-methods) docs, for reference.

You might not ever need to use `.create()`, but can instead use the `.save()` method. Let `feathers-vuex` call `create` or `patch`.

```js
const { Todo } = this.$FeathersVuex
const data = { description: 'Do something!' }
const todo = new Todo(data)

todo.create() // --> Creates the todo on the server using the instance data
```

## `instance.patch(params)`

The `patch` method is a shortcut for calling the `patch` action (service method) using the instance data. The instance's id field is used for the `patch` id.  The `params` argument will be used in the Feathers client request.  See the [Feathers Service](https://docs.feathersjs.com/api/services.html#service-methods) docs, for reference.

Similar to the `.create()` method, you might not ever need to use `.patch()` if you just use `.save()` and let `feathers-vuex` figure out how to handle it.

```js
const { Todo } = this.$FeathersVuex
const todo = new Todo({ id: 1, description: 'Do something!' })

todo.description = 'Do something else'

todo.patch() // --> Sends a `patch` request the with the id and description.
```

*Note: Currently, patch sends all data, not just what has changed. In a future update, it will only send the fields that have changed.*

## `instance.update(params)`

The `update` method is a shortcut for calling the `update` action (service method) using the instance data. The instance's id field is used for the `update` id. The `params` argument will be used in the Feathers client request.  See the [Feathers Service](https://docs.feathersjs.com/api/services.html#service-methods) docs, for reference.

Use `.update()` whenever you want to completely replace the data on the server with the instance data.  You can also set the `preferUpdate` option to `true` to make `.save()` call `.update()` when an id field is present on the instance.

```js
const { Todo } = this.$FeathersVuex
const todo = new Todo({ id: 1, description: 'Do something!' })

todo.description = 'Do something else'

todo.update() // --> Sends a `update` request the with all instance data.
```

## `instance.remove(params)`

The `remove` method is a shortcut for calling the `remove` action (service method) using the instance data. The instance's id field is used for the `remove` id. The `params` argument will be used in the Feathers client request.  See the [Feathers Service](https://docs.feathersjs.com/api/services.html#service-methods) docs, for reference.

```js
const { Todo } = this.$FeathersVuex
const todo = new Todo({ id: 1, description: 'Do something!' })

todo.save()
  .then(todo => {
    todo.remove() // --> Deletes the record from the server
  })
```

## `instance.clone()`

The `.clone()` method creates a deep copy of the record and stores it on `Model.copiesById`. This allows you to make changes to the clone and not update visible data until you commit or save the data.

```js
const { Todo } = this.$FeathersVuex
const todo = new Todo({ id: 1, description: 'Do something!' })
const todoCopy = todo.clone()

todoCopy.description = 'Do something else!'
todoCopy.commit() // --> Update the data in the store.

console.log(todo.description) // --> 'Do something else!'
console.log(todoCopy.description) // --> 'Do something else!'
```

There's another use case for using `.clone()`.  Vuex has a `strict` mode that's really useful in development.  It throws errors if any changes occur in the Vuex store `state` outside of mutations.  Clone really comes in handy here, because you can make changes to the clone without having to write custom Vuex mutations. When you're finished making changes, call `.commit()` to update the store. This gives you `strict` mode compliance with little effort!

Finally, if for some reason you prefer to keep the copies in the Vuex store and use custom mutations for all update, you can set the `keepCopiesInStore` option to `true`.  This will cause the copies to be stored in `state.copiesById`.

## `instance.commit()`

```js
const { Todo } = this.$FeathersVuex
const todo = new Todo({ id: 1, description: 'Do something!' })
const todoCopy = todo.clone()

todoCopy.description = 'Do something else!'
todoCopy.commit() // --> Update the data in the store.

console.log(todo.description) // --> 'Do something else!'
console.log(todoCopy.description) // --> 'Do something else!'
```

## `instance.reset()`

```js
const { Todo } = this.$FeathersVuex
const todo = new Todo({ id: 1, description: 'Do something!' })
const todoCopy = todo.clone()

todoCopy.description = 'Do something else!'
todoCopy.reset() // --> Resets the record to match the one in the store.

console.log(todo.description) // --> 'Do something!'
console.log(todoCopy.description) // --> 'Do something!'
```
