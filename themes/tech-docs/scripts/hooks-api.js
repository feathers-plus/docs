
const { inspect } = require('util');

const hooksRaw = {
  // label: 'fastjoin',
  // fileName: 'fast-join',
  // src: 'https://github.com/feathers-plus/feathers-hooks-common/blob/master/lib/services/fast-join.js',

  combine: { tags: ['code', 'multiNa', 'cond'], desc: 'Sequentially execute multiple sync or async hooks.'},
  debug: { tags: 'code', desc: 'Display the current hook <code>context</code> for debugging.' },
  'de-populate': { tags: 'relation', desc: 'Remove records and properties created by the <code>populate</code> hook.' },
  disallow: { tags: 'methods', desc: 'Prevents access to a service method completely or for specific transports.'},
  'disable-multi-item-change': { tags: ['methods', 'notAfter', 'update', 'patch', 'remove'], desc: 'Prevents <code>null</code> from being used as an id in patch and remove service methods.' },
  discard: { tags: 'data', desc: 'Delete certain fields from the record(s).' },
  'discard-query': { tags: ['query', 'notAfter'], desc: 'Delete certain fields from the query object.' },
  'common/every': { name: 'every', tags: ['cond', 'pred'], desc: 'Return the <code>and</code> of a series of sync or async predicate functions.' },
  'fast-join': { guide: 'fastJoin', tags: ['relation'], desc: 'Join related records. It\'s very fast.' },
  'common/iff': { name: 'iff', tags: 'cond', desc: 'Execute one or another series of hooks depending on a sync or async predicate.' },
  'common/iff-else': { name: 'iffElse', tags: 'cond', desc: 'Execute one array of hooks or another based on a sync or async predicate.' },
  'common/is-not': { name: 'isNot', tags: ['cond', 'pred'], desc: 'Negate a sync or async predicate function.' },
  'is-provider': { tags: ['cond', 'pred', 'services', 'trans'], desc: 'Check which transport provided the service call.' },
  keep: { tags: 'data', desc: 'Keep certain fields in the record(s), deleting the rest.' },
  'keep-query' : { tags: ['query', 'notAfter'], desc: 'Keep certain fields in the query object, deleting the rest.' },
  'lower-case': { tags: 'data', desc: 'Convert certain field values to lower case.' },
  'params-from-client': { tags: ['code', 'client', 'trans', 'notAfter'], desc: 'Pass <code>context.params</code> from client to server. Server hook.' },
  populate: { guide: 'populate', tags: 'relation', desc: 'Join related records.' },
  'prevent-changes': { tags: ['data', 'methods', 'notAfter'], desc: 'Prevent <code>patch</code> service calls from changing certain fields.' },
  serialize: { tags: 'relation', desc: 'Prune values from related records. Calculate new values.' },
  'set-now': { tags: 'data', desc: 'Create/update certain fields to the current date-time.' },
  'set-slug': { tags: 'trans', desc: 'Fix slugs in URL, e.g. <code>/stores/:storeId</code>.' },
  sifter: { tags: ['data', 'methods', 'relation', 'services', 'find'], desc: 'Filter data or result records using a MongoDB-like selection syntax.' },
  'soft-delete': { tags: 'services', desc: 'Flag records as logically deleted instead of physically removing them.' },
  'common/some': { name: 'some', tags: ['cond', 'pred'], desc: 'Return the <code>or</code> of a series of sync or async predicate functions.' },
  'stash-before': { tags: ['data', 'services', 'notAfter'], desc: 'Stash current value of record, usually before mutating it. Performs a <code>get</code> call.' },
  traverse: { tags: ['data', 'query'], desc: 'Transform fields & objects in place in the record(s) using a recursive walk. Powerful.' },
  'common/unless': { name: 'unless', tags: 'cond', desc: 'Execute a series of hooks if a sync or async predicate is falsey.' },
  validate: { tags: ['notAfter', 'data', 'services'], desc: 'Validate data using a validation function.' },
  'validate-schema': { tags: ['notAfter', 'data', 'services'], desc: 'Validate data using JSON-Schema.' },
  when: { name: 'when', fileName: 'common/iff', tags: 'cond', desc: 'An alias for <code>iff</code>.' },

  'check-context': { tags: ['code', 'services', 'func'], desc: 'Restrict a hook to run for certain methods and method types.' },
  'common/delete-by-dot': { name: 'deleteByDot', tags: ['code', 'dot', 'func'], desc: 'Deletes a property from an object using dot notation, e.g. <code>address.city</code>.' },
  'common/exists-by-dot': { name: 'existsByDot', tags: ['code', 'dot', 'func'], desc: 'Check if a property exists in an object by using dot notation, e.g. <code>address.city</code>.' },
  'common/get-by-dot': { name: 'getByDot', tags: ['code', 'dot', 'func'], desc: 'Return a property value from an object using dot notation, e.g. <code>address.city</code>.' },
  'get-items': { tags: ['code', 'data', 'func'], desc: 'Get the records in <code>context.data</code> or <code>context.result[.data]</code>.' },
  'make-calling-params': { tags: ['code', 'services', 'func'], desc: 'Build <code>context.params</code> for service calls.' },
  'params-for-server': { tags: ['code', 'client', 'trans', 'func'], desc: 'Pass an explicit <code>context.params</code> from client to server. Client-side.' },
  'replace-items': { tags: ['code', 'data', 'func'], desc: 'Replace the records in <code>context.data</code> or <code>context.result[.data]</code>.' },
  'common/set-by-dot': { name: 'setByDot', tags: ['code', 'dot', 'func'], desc: 'Set a property value in an object using dot notation, e.g. <code>address.city</code>.' },
  'thenify-hook': { tags: ['code', 'services', 'func'], desc: 'Let\'s you call a hook right after the service call.' },
};

const showTagNames = {
  relation: 'Relations',
  methods: 'Service methods',
  services: 'Services',
  data: 'Data and Results',
  cond: 'Conditionals',
  trans: 'Transport',
  query: 'Query object',
  client: 'Client/server',
  dot: 'Dot notation',
  code: 'Coding',
  pred: 'Predicates',
};

const methodNames = ['find', 'create', 'get', 'update', 'patch', 'remove'];
const ignoreTags = [].concat(methodNames, 'notBefore', 'notAfter', 'multiYes', 'multiNo', 'multiNa', 'func');
const multiDisplay = {
  multiYes: 'yes',
  multiNo: 'no',
  multiNa: 'n/a',
};

const hooks = {};
const hooksByTag = {};

Object.keys(hooksRaw).sort().forEach(fileName => {
  const info = hooksRaw[fileName];
  fileName = info.fileName || fileName;

  const name = info.name || toCamelCase(fileName);
  const tags = Array.isArray(info.tags) ? info.tags : [info.tags];
  const showTags = tags.filter(name => ignoreTags.indexOf(name) === -1).map(name => showTagNames[name] || name);
  const tagsHtml = showTags.map(name => `<a href="#tag-${encodeURIComponent(name)}">${name}</a>`).join(', ');

  const multi = Object.keys(multiDisplay).reduce((result, key) => {
    return tags.indexOf(key) !== -1 ? multiDisplay[key] : result;
  }, 'yes');

  hooks[name] = {
    fileName,
    label: encodeURIComponent(info.label || name.toLowerCase()),
    src: `https://github.com/feathers-plus/feathers-hooks-common/blob/master/lib/${fileName.indexOf('/') === -1 ? 'services/' : ''}${fileName}.js`,
    before: setAttr(tags, 'notBefore', 'no', 'yes'),
    after: setAttr(tags, 'notAfter', 'no', 'yes'),
    multi,
    methods: methodNames.filter(name => tags.indexOf(name) !== -1).join(', ') || 'all',
    tags: tagsHtml,
    desc: info.desc,
    guide: info.guide ? `<a href="guide.html#${info.guide}">${info.guide}</a>`: '',
    func: tags.indexOf('func') !== -1,
  };

  showTags.forEach(tag => {
    hooksByTag[tag] = hooksByTag[tag] || [];
    hooksByTag[tag].push(name)
  });
});

hexo.extend.tag.register('hooksByTags', () => {
  // console.log('hooksByTags');
  let html = '';

  Object.keys(hooksByTag).sort().forEach(tag => {
    html += `<h3 id="tag-${encodeURIComponent(tag)}">${tag}</h3><ul>`;

    hooksByTag[tag].sort().forEach(name => {
      const hook = hooks[name];
      html += `\n<li><a href="#${hook.label}">${name}</a> - ${hook.desc}${hook.func ? ` Utility function.` : ''}</li>`
    });

    html += '</ul>';
    return html;
  });

  return html;
});

hexo.extend.tag.register('hooksApi', name => {
  // console.log('hooksApi', name);
  const hook = hooks[name[0]];
  if (!hook) return `?????????? hook ${name} not defined.`;

  if (hook.func) {
    return `${hook.desc}${hook.func ? ' (Utility function.)' : ''}<br/>
    <table>
    <thead>
    <tr>
      <th style="text-align:center">guide</th>
      <th style="text-align:center">details</th>
      <th style="text-align:center">tags</th>
    </tr>
    </thead>
    <tbody>
    <tr>
      <td style="text-align:center">${hook.guide}</td>
    <td style="text-align:center"><a href="${hook.src}" target="_blank" rel="external">source</a></td>
    <td style="text-align:center">${hook.tags}</td>
  </tr>
  </tbody>
  </table>`;
  }

  return `${hook.desc}<br/>
  <table>
  <thead>
  <tr>
  <th style="text-align:center">before</th>
    <th style="text-align:center">after</th>
    <th style="text-align:center">multi recs</th>
    <th style="text-align:center">methods</th>
    <th style="text-align:center">guide</th>
    <th style="text-align:center">details</th>
    <th style="text-align:center">tags</th>
  </tr>
  </thead>
  <tbody>
  <tr>
    <td style="text-align:center">${hook.before}</td>
    <td style="text-align:center">${hook.after}</td>
    <td style="text-align:center">${hook.multi}</td>
    <td style="text-align:center">${hook.methods}</td>
    <td style="text-align:center">${hook.guide}</td>
    <td style="text-align:center"><a href="${hook.src}" target="_blank" rel="external">source</a></td>
    <td style="text-align:center">${hook.tags}</td>
  </tr>
  </tbody>
  </table>`;
});

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

hexo.extend.tag.register('hooksApiFootnote', name => {
  // console.log('hooksApiFootnote', name);
  const hook = hooks[name[0]];
  if (!hook) return `?????????? hook ${name} not defined.`;

  return `
  <ul>
    <li><strong>See source</strong>: <a href="${hooks[name[0]].src}" target="_blank" rel="external">${name}</a></li>
  </ul>
  <ul>
    <li><strong>See also</strong>: ${hook.guide ? `Guide ${hook.guide} and tags ` : ''}${hooks[name].tags}</li>
  </ul>`;
  //   return hooks[name] ? hooks[name].tags : '';
});

function setAttr(tags, tag, yes = 'yes', no = 'no') {
  return tags.indexOf(tag) === -1 ? no : yes;
}

function toCamelCase(str) {
  // Lower cases the string
  return str.toLowerCase()
  // Replaces any - or _ characters with a space
    .replace( /[-_]+/g, ' ')
    // Removes any non alphanumeric characters
    .replace( /[^\w\s]/g, '')
    // Uppercases the first character in each group immediately following a space
    // (delimited by spaces)
    .replace( / (.)/g, function($1) { return $1.toUpperCase(); })
    // Removes spaces
    .replace( / /g, '' );
}

function inspector(desc, obj, depth = 5) {
  console.log(desc);
  console.log(inspect(obj, { colors: true, depth }));
}