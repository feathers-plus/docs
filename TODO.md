- hexo-multiple-codeblock

====================================

console.log("**Deprecated** The ??? will be removed next FeathersJS version. Use ??? instead.");

====================================

`providers`:
  
Type | Value | Description
---|---|---
 | `socketio` | allow calls by Socket.IO transport
 | `primus` | allow calls by Primus transport
 | `rest` | allow calls by REST transport
 | `external` | allow calls other than from server
 | `server` | allow calls from server

====================================

- **Returns**

  - `{Object} newContext`

Variable | Type | Description
---|:---:|---|---
`newContext` | `Object`  |  The new context created.
 
====================================

- predicates
 every.js
 is-provider.js
 is-not.js
 some.js

 
- conditionals
 else.iff
 iff.js
 iff-else.js
 unless.js
 when
 
- data hooks
 discard.js
 keep.js
 lower-case.js
 set-now.js
 traverse.js

- data utilities
 get-items.js
 replace-items.js
 
- query object
 discard-query.js (remove-query.js)
 keep-query.js (pluck-query.js)
 
- client/server
 params-for-server.js
 params-from-client.js 

- dot notation
 delete-by-dot.js
 exists-by-dot.js
 get-by-dot.js
 set-by-dot.js
 
- service methods
 disable-multi-item-change.js
 disallow.js
 prevent-changes.js
 sifter.js
 
- misc
 stash-before.js
  
====================================
 




 de-populate.js

 populate.js

 serialize.js

 set-slug.js

 soft-delete.js

 thenify-hook.js
 
 validate.js
 validate-schema.js
