---
title: API
type: guide
order: 2
dropdown: extensions
repo: authentication-management
---

<!--- Usage ------------------------------------------------------------------------------------ -->
<h2 id="Usage">Usage</h2>
Initializing the module server side:
``` js
npm install @feathers-plus/authentication-management

// JS
const auth = require('@feathers/authentication');
const authManagement = require('@feathers-plus/authentication-management');

// authentication and user service should be initialized before
// initializing authManagement
app.configure(authManagement());

// allow only signed in users to use passwordChange and identityChange
const isAction = (...args) => hook => args.includes(hook.data.action);

// TODO: Security for passwordChange and identityChange (and more?)

app.service('authManagement').before({
  create: [
    hooks.iff(isAction('passwordChange', 'identityChange'), auth.hooks.authenticate('jwt')),
  ],
});
```

This will add the service `authManagement` to your app. To use the service client side, we provide a module which lets you access methods on the service directly.

Initialize the module client side:

``` js
import AuthManagement from '@feathers-plus/authentication-management/lib/client'

const authManagement = new AuthManagement(app);
```

Now you can call methods like so:

```js
authManagement.checkUnique('user@mail.com')
  .then(res => {
    // user is unique
  }).catch(err => {
    // user is not unique
  })
```

<!--- server side module authManagement ------------------------------------------------------------------------ -->

<h2 id="server-side-module">server side module authManagement ( [options] )</h2>

- **Arguments:**
  - `{Object} options`

- **Usage:**

  Adds authManagement service when initialized with `app.configure(authManagement(options))`.

  ``` js
  const authManagement = require('@feathers-plus/authentication-management');

  app.configure(authManagement(options));
  ```

- **Details:**
  - `options` An optional object of options:

Property |	Type |	Default |	Description
---|---|---|---
service | String | '/users' | Path to user service.
path | String | 'authManagement' | Path for auth management service, see multiple services below.
notifier | Function | `() => Promise.resolve()` | Function which sends notifications to user through email, SMS, etc. Call signature is `(type, user, notifierOptions) => Promise`.
longTokenLen | Integer | 15 | URL-token's length will be twice this.
shortTokenLen | Integer | 6 | Length of SMS tokens.
shortTokenDigits | Boolean | true | If SMS token should be digits only.
resetDelay | Integer | 1000 * 60 * 60 * 2 | Expiration for sign up email verification token in ms.
delay | Integer | 1000 * 60 * 60 * 24 * 5 | Expiration for password reset token in ms.
skipIsVerifiedCheck | Boolean | false | Allow sendResetPwd and resetPwd for unverified users.
identifyUserProps | Array | ['email'] | Property in user-item which uniquely identifies the user, at least one of these props must be provided whenever a short token is used.
sanitizeUserForClient | Function | sanitizeUserForClient | TODO

