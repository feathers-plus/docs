---
title: API
type: guide
order: 2
dropdown: adapters
repo: mongoose-advanced
---

<!--- Usage ------------------------------------------------------------------------------------ -->
<h2 id="Usage">Usage</h2>

``` js
npm install --save @feathers-plus/mongoose-advanced

// JS
const mongoose = require('mongoose');
const MongooseModel = require('./models/mymodel')
const mongooseService = require('@feathers-plus/mongoose-advanced');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/feathers');

// Schema == { name: { type: String, required: true } }
app.use('/todos', mongooseService({
  Model: MongooseModel,
  bulkErrorsKey: 'errors'
}));

app.service('todos').hooks({
  after: {
    create: [
      context => {
        // This should output any errors that occur
        // during bulk creation
        console.log(context.params.errors)
      }
    ]
  }
})

const data = [
  { name: 'dave' },
  { foo: 'bar' },
  { name: 'bob' },
  { jane: 'doe' }
]

app.service('todos').create(data)
  .then(response => {
    // We should only have two data objects
    // { name: 'dave' } & { name: 'bob' }
    console.log(response.data)
  })
```