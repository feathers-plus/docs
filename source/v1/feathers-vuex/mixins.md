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

1. You can do lots of them together. Handle multiple queries against multiple services at the same time.  The Renderless Data Components aren't capable of handling more than one query without doing ugly nesting.
2. They bring the data directly into the component's actual viewModel.  The Renderless Data Components only pull the data into the template scope, so the only clean way to get access to the data was by passing it to a component as props.  This is a great solution until you run into number 1, above.

Here's an example of how to use a mixin.

```html
<template>
  <div class="test-mixin">
    {{todos}}
  </div>
</template>

<script>
import { makeFindMixin } from 'feathers-vuex'

export default {
  name: 'test-mixins',
  mixins: [
    makeFindMixin({ service: 'todos', query: 'todosQuery' })
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

Notice in the above example that using the mixin automatically makes the `todos` available in the template.  The mixins automatically setup a few properties in the viewModel based on the camelCased name of the service.  You can also provide a `name` attribute.

## Options

### for `makeFindMixin` and `makeGetMixin`

The `makeFindMixin` and `makeGetMixin` utilities share the following options in common. Unique options are found further down.

- **service {String}** - **required** the service path. This must match a service that has already been registered with FeathersVuex.
- **name {String}** - The name to use in all of the dynamically-generated property names. See below he

- **query {String|Function}** - One of two possible query params.  (The other is `fetchQuery`)  When only `query` is used, it will be used for both the `find` getter and the `find` action.  When using server-side pagination, use `fetchQuery` for server communciation and the `query` prop for pulling data from the local store. If the query is `null` or `undefined`, the query against both the API and store will be skipped. The find getter will return an empty array. **Default {String}: `${camelCasedService}Query`** (So, by default, it will attempt to use the property on the component called serviceName + "Query")
  - **{String}** - The name of the attribute in the current component which holds or returns the query object.
  - **{Function}** - A provided function will become a computed property in the current component.

- **watch {String|Array}** - specifies the attributes of the `query` or `fetchQuery` to watch.  When a watched prop changes, a new request will be made to the API server. Pass 'query' to watch the entire query object.  Pass 'query.name' to watch the 'name' property of the query. Watch is turned off by default, meaning only one initial request is made. **Default {String}: `${camelCasedService}Query`**

- **fetchQuery {String|Function}** - when provided, the `fetchQuery` serves as the query for the API server. The `query` param will be used against the service's local Vuex store. **Default: undefined**
  - **{String}** - The name of the attribute in the current component which holds or returns the query object.
  - **{Function}** - A provided function will become a computed property in the current component.

- **queryWhen {Boolean|String|Function}** - the query to the server will only be made when this evaluates to true.  **Default: true**
  - **{Boolean}** - As a boolean, the value provided determines whether this is on or off.
  - **{String}** - The name of the component's prop to use as the value.
  - **{Function}** - Any provided function will become a method in the component and will receive the current query object as an argument.

- **local {Boolean|String|Function}** - when true, will only use the `query` prop to pull data from the local Vuex store. It will disable queries to the API server. The value of `local` will override `queryWhen`. **Default:false**
  - **{Boolean}** - As a boolean, the value provided determines whether this is on or off.
  - **{String}** - The name of the component's prop to use as the value.
  - **{Function}** - Any provided function will become a computed property in the component and will be used to determine its value.

### Options for only `makeFindMixin`

The `makeFindMixin` has these unique options:

- **qid {String}** - The query identifier used for storing pagination data in the Vuex store. See the service module docs to see what you'll find inside.  The `qid` and its accompanying pagination data from the store will eventually be used for cacheing and preventing duplicate queries to the API.

### Options for only `makeGetMixin`

The `makeGetMixin` has these unique options:

- **id {String|Function}** - when performing a `get` request, serves as the id for the request. This is automatically watched, so if the `id` changes, an API request will be made and the data will be updated.  If `undefined` or `null`, no request will be made.  **Default: undefined**
  - **{String}** - The name of the component's prop to use as the value.
  - **{Function}** - Any provided function will become a computed property in the component and will be used to determine its value.

## Dynamically Generated Props

Based on what options you provide to each mixin, some dynamically-generated props will be added to the current component.

```js
makeFindMixin({ service: 'videos' }) = {
  data: () => ({
    isFindVideosPending: false,
    videosLocal: false,
    videosQid: 'default',
    videosQueryWhen: true,
    videosWatch: []
  }),
  // Only showing the return values, not the actual functions
  computed: {
    // pulled from the store using the find getter
    videos: [ /* results */ ],

    // The pagination data with matching qid from the store
    videosPaginationData: {
      queriedAt: 1539682100148, // the timestamp of the last query
      query: {}, // The last query used with this qid
      ids: [], // The ids of the records returned in the response
      limit: 20, // based on the response from the server
      skip: 0, // The value of the $skip param in the query
      total: 1 // The total as reported by the server.
    },

    // The mixin will expect to find this. This won't be created automatically.
    videosQuery () {}
  }
}
```

If you were to handle two queries from the same service, you would use the `name` attribute to rename one of them.  The results would be named accordingly.

```js
makeFindMixin({ service: 'videos', name: 'myVideos' }) = {
  data: () => ({
    isFindMyVideosPending: false,
    myVideosLocal: false,
    myVideosQid: 'default',
    myVideosQueryWhen: true,
    myVideosWatch: []
  }),
  // Only showing the return values, not the actual functions
  computed: {
    // pulled from the store using the find getter
    myVideos: [ /* results */ ],

    // The pagination data with matching qid from the store
    myVideosPaginationData: {
      queriedAt: 1539682100148, // the timestamp of the last query
      query: {}, // The last query used with this qid
      ids: [], // The ids of the records returned in the response
      limit: 20, // based on the response from the server
      skip: 0, // The value of the $skip param in the query
      total: 1 // The total as reported by the server.
    },

    // The mixin will expect to find this. This won't be created automatically.
    myVideosQuery () {}
  }
}
```

## Using `makeFindMixin`

Using the `makeFindMixin`

```
<script>
import { makeFindMixin } from 'feathers-vuex'

export default {
  name: 'test-mixins',
  mixins: [
    makeFindMixin({ service: 'todos', query: 'todosQuery' })
  ],
  computed: {
    todosQuery () {
      return {}
    }
  }
}
</script>
```