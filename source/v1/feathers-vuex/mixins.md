---
title: Mixins
type: guide
order: 8
dropdown: frameworks
repo: feathers-vuex
---

> This feature is currently in pre-release. The API is subject to change.  It's documented here for those who would like to participate in testing it out and potentially feeling out a better API.
> Built in pagination support will likely be added before final release.

FeathersVuex mixins provide quick and easy best practices directly inside a component's viewModel.  They are similar to [Renderless Data Components](./components.html), but are more powerful for two reasons.

1. You can pair them up to handle more than one query at a time.  The Renderless Data Components aren't capable of handling more than one query without doing ugly nesting.
2. You can access their data directly inside your component's viewModel.  The Renderless Data Components pull the data into the template scope, so the only clean way to get access to the data was by passing it to a component as props.  This is a great solution until you run into number 1, above.

Here's an example of how to use a mixin.  Notice that using the mixin automatically makes the `todos` available in the template:
```html
<template>
  <div class="test-mixin">
    {{todos}}
  </div>
</template>

<script>
import { makeFindMixin, makeGetMixin } from 'feathers-vuex'

export default {
  name: 'test-mixins',
  mixins: [
    makeFindMixin({ service: 'todos', query: 'todosQuery' }),
    makeGetMixin({ service: 'todos', id: 'todoId' })
  ],
  computed: {
    todosQuery () {
      return {}
    }
  }
}
</script>

<style lang="scss">
</style>
```