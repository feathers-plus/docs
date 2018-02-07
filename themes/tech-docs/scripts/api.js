
hexo.extend.tag.register('apiReturns', ([name, desc, result = 'result', type = 'Boolean']) => {
  // console.log('ApiReturns', name, desc, result, type);

  // handle a bug
  if (desc.substr(-1) === ',') desc = desc.substr(0, desc.length - 1);
  if (result.substr(-1) === ',') result = result.substr(0, result.length - 1);
  if (type.substr(-1) === ',') type = type.substr(0, type.length - 1);

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


hexo.extend.tag.register('apiFootnote', options => {
  // console.log('apiFootnote', options);
  const name = options[0];
  const repo = options[1];

  return `
  <ul>
    <li><strong>Is anything wrong, unclear, missing?</strong>: <a href="https://github.com/feathers-plus/docs/issues/new?title=Comment%20-%20${repo}%20-%20${name}&body=Comment%20-%20${repo}%20-%20${name}" target=""_blank">Leave a comment.</a></li>
  </ul>`;
});
