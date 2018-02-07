---
title: Guide
type: guide
order: 1
dropdown: adapters
repo: mongoose-advanced
---

This mongoose adapter has the same interface as the feathers-ecosystem mongooose adapter. The main difference between the two is how bulk creates are handled.

## Bulk Creates

When doing bulk creates this adapter will add any validation/write errors onto the params object and will not throw an error. This is to allow the errors and successful inserts to be handled within an after hook.

```js
// Schema == { name: { type: String, required: true } }
const data = [
  { name: 'dave' },
  { foo: 'bar' },
  { name: 'bob' },
  { jane: 'doe' }
]
```

This would result in the response from the create method to have the two data objects with the name property and the other two which would have failed on validation errors would be placed on the hook under the following path by default: `hook.params.errors`.

The create method checks for an array of items and will utilize this built in `_insertMany` method of mongoose, this is opposed to using the default `create` method which will call a `.save` on each array item.

## Errors

When accessing the errors on the params object they should have an `error.type` of either `ValidionError` or `WriteError` depending on which failed.

Access the errors:

```js
app.service('todos').hooks({
  after: {
    create: [
      context => {
        if (context.params.errors && context.params.errors.length) {
          context.params.errors.forEach(item => {
            // This will show the type of error and the data that failed
            console.log(item.error.type, item.data)
          })
        }
      }
    ]
  }
})
```

The data which failed should be available on the error object.
