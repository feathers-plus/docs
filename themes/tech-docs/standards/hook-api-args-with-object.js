
/*

- **Arguments**
  - `{Object | Function} schema`
    - `{Array< String> | String} only`
    - `{Array< String> | String} exclude`
    - `[fieldName]: {Object} schema`
    - `{Object} computed`
      - `[fieldName]: {Function} computeFunc`

Argument | Type | Default | Description
---|:---:|---|---
`schema` | `Object` `Function` | `context` `=> schema` | How to serialize the items.

`schema` | Argument | Type | Default | Description
---|---|:---:|---|---
 | `only` | `Array<` `String>` or `String` | | The names of the fields to keep in each item. The names for included sets of items plus `_include` and `_elapsed` are not removed by `only`.
 | `exclude` | `Array<` `String>` or `String` | | The names of fields to drop in each item. You may drop, at your own risk, names of included sets of items, `_include` and `_elapsed`.
 | `computed` | `Object` | | The new names you want added and how to compute their values.

`schema` `.computed` | Argument | Type | Default | Description
---|---|:---:|---|---
 | `fieldName` | `String` | | The name of the field to add to the records.
 | `computeFunnc` | `Function` | `(record,` `context)` `=> value` | Function to calculate the computed value. `item`: The item with all its initial values, plus all of its included items. The function can still reference values which will be later removed by only and exclude. `context`: The context passed to `serialize`.

 */
