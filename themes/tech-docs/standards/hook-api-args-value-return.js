
/*

- **Arguments**
  - `{Array< String >} transports`

Name | Type | Default | Description
---|:---:|---|---
`transports` | `Array< String >` | | The transports you want to allow.

`transports` | Value | Description
---|:---:|---
 | `socketio` | Allow calls by Socket.IO transport.
 | `primus` | Allow calls by Primus transport.
 | `rest` | Allow calls by REST transport.
 | `external` | Allow calls other than from server.
 | `server` | Allow calls from server.

{% hooksApiReturns isProvider "If the call was made by one of the <code>transports</code>." %}

===or===

{% apiReturns isProvider "If the call was made by one of the <code>transports</code>." %}
 */

hexo.extend.tag.register('hooksApiReturns', ([name, desc, result = 'result', type = 'Boolean']) => {
  //console.log('hooksApiReturns', name, desc, result, type);

  // handle a bug
  if (desc.substr(-1) === ',') desc = desc.substr(0, desc.length - 1);
  if (result.substr(-1) === ',') result = result.substr(0, result.length - 1);
  if (type.substr(-1) === ',') type = type.substr(0, type.length - 1);

  const hook = hooks[name];
  if (!hook) return `?????????? hook ${name} not defined.`;

  return `
  <ul><li>
    <strong>Returns</strong>
    <ul><li>
      <code>{${type}} ${result}</code>
    </li></ul>
  </li></ul>
  
  <table>
  <thead>
  <tr>
    <th style="text-align:left">Name</th>
    <th style="text-align:center">Type</th>
    <th style="text-align:left">Description</th>
  </tr>
  </thead>
  <tbody>
  <tr>
    <td style="text-align:left"><code>${result}</code></td>
    <td style="text-align:center"><code>${type}</code></td>
    <td style="text-align:left">${desc}</td>
  </tr>
  </tbody>
  </table>`;
});
