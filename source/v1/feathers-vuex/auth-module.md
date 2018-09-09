---
title: Auth Module API
type: guide
order: 4
dropdown: frameworks
repo: feathers-vuex
---

The Auth module helps setup your app for login / logout.  It includes the following state by default:
```js
{
  accessToken: undefined, // The JWT
  payload: undefined, // The JWT payload

  isAuthenticatePending: false,
  isLogoutPending: false,

  errorOnAuthenticate: undefined,
  errorOnLogout: undefined
}
```

### Actions
The following actions are included in the `auth` module:
- `authenticate`: use instead of `feathersClient.authenticate()`
- `logout`: use instead of `feathersClient.logout()`
The Vuex auth store may not update if you use the feathers client version.

```js
export default {
  // ...
  methods: {
    
    login() {
      this.$store.dispatch('auth/authenticate' {
        email: '...',
        password: '...'
      })
    }
    
    // ...
    
    logout() {
      this.$store.dispatch('auth/logout')
    }
    
  }
  // ...
}

```


### Configuration
You can provide a `userService` in the auth plugin's options to automatically populate the user upon successful login.

```js
import Vuex from 'vuex'
import feathersClient from './feathers-client'
import feathersVuex from 'feathers-vuex'

const { auth } = feathersVuex(feathersClient, { idField: '_id' })

const store = new Vuex.Store({
  plugins: [
    auth({ userService: 'users' }) // if your user service endpoint is named 'users'
  ]
})
```
