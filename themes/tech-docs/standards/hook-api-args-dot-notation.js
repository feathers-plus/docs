
/*
{% hooksApiFieldNames setNow "The fields that you want to add or set to the current date-time." %}
*/

hexo.extend.tag.register('hooksApiFieldNames', ([name, desc, fieldNames = 'fieldNames', type = 'dot notation']) => {
  // console.log('hooksApiFieldNames', name, desc, fieldNames, type);
  const hook = hooks[name];
  if (!hook) return `?????????? hook ${name} not defined.`;

  return `
  <ul><li>
    <strong>Arguments</strong>
    <ul><li>
      <code>{Array < String >} ${fieldNames}</code>
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
    <td style="text-align:left"><code>${fieldNames}</code></td>
    <td style="text-align:center">${type}</td>
    <td style="text-align:left">${desc}</td>
  </tr>
  </tbody>
  </table>`;
})
