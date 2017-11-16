
const { inspect } = require('util');

const hooksRaw = {
  // label: 'fastjoin',
  // fileName: 'fast-join',
  // src: 'https://github.com/feathers-plus/feathers-hooks-common/blob/master/lib/services/fast-join.js',

  combine: { tags: ['code', 'multiNa', 'cond'], desc: 'Sequentially execute multiple sync or async hooks.'},
  debug: { tags: 'code', desc: 'Display the current hook <code>context</code> for debugging.' },
  'de-populate': { tags: 'relation', desc: 'Remove records and properties created by the <code>populate</code> hook.' },
  disallow: { tags: 'methods', desc: 'Disallows access to a service method completely or for specific providers.'},
  'disable-multi-item-change': { tags: 'methods', desc: 'Disables update, patch and remove methods from using <code>null</code> as an id.' },
  discard: { tags: 'data', desc: 'Delete field values.' },
  'discard-query': { tags: 'query', desc: 'Delete field values.' },
  'common/every': { name: 'every', tags: 'cond', desc: 'Predicate returns Boolean <code>and</code> of a series of functions.' },
  'common/iff-1': { name: 'iff.else', fileName: 'common/iff', tags: 'cond', desc: 'Execute one series of hooks or another based on a predicate.' },
  'fast-join': { guide: 'fastJoin', tags: ['relation'], desc: 'Join related records. It\'s very fast.' },
  'common/iff': { name: 'iff', tags: 'cond', desc: 'Execute a series of hooks based on a sync or async predicate.' },
  'common/iff-else': { name: 'iffElse', tags: 'cond', desc: 'Execute one array of hooks or another based on a sync or async predicate.' },
  'common/is-not': { name: 'isNot', tags: 'cond', desc: 'Negate a sync or async predicate.' },
  'is-provider': { tags: ['cond', 'services', 'trans'], desc: 'Check which transport called the service method.' },
  keep: { tags: 'data', desc: 'Retain certain field values, deleting the rest.' },
  'keep-query' : { tags: 'query', desc: 'Retain certain field values, deleting the rest.' },
  'lower-case': { tags: 'data', desc: 'Convert field values to lower case.' },
  'params-from-client': { tags: ['code', 'client', 'trans'], desc: 'Pass <code>context.params</code> from client to server. Server hook.' },
  'pluck-query' : { tags: 'query', desc: 'Retain certain field values, deleting the rest. {Deprecated)' },
  populate: { tags: 'relation', desc: 'Join related records. (<code>fastJoin</code> is preferred.) ' },
  'prevent-changes': { tags: ['data', 'methods'], desc: 'Prevent <code>patch</code> from changing certain fields.' },
  'remove-query': { tags: 'query', desc: 'Delete field values. (Deprecated)' },
  serialize: { tags: 'relation', desc: 'Prune values from related records. Calculate new values.' },
  'set-now': { tags: 'data', desc: 'Create fields initialized to the current date-time.' },
  'set-slug': { tags: 'trans', desc: 'Fix slugs in URL, e.g. <code>/stores/:storeId</code>.' },
  sifter: { tags: ['data', 'methods', 'relation'], desc: 'Filter results using MongoDB-like selection syntax.' },
  'soft-delete': { tags: 'services', desc: 'Flag records as logically deleted instead of physically removing them.' },
  'common/some': { name: 'some', tags: 'cond', desc: 'Predicate returns Boolean <code>or</code> of a series of functions.' },
  'stash-before': { tags: ['data', 'services'], desc: 'Stash current value of record, usually before mutating it.' },
  traverse: { tags: ['data', 'query'], desc: 'Transform fields & objects in place using a recursive walk. Powerful.' },
  'common/unless': { name: 'unless', tags: 'cond', desc: 'Execute a series of hooks if a sync or async predicate is falsey.' },
  validate: { tags: ['notAfter', 'data', 'services'], desc: 'Validate data using a validation function.' },
  'validate-schema': { tags: ['notAfter', 'data', 'services'], desc: 'Validate data using JSON-Schema.' },
  when: { name: 'when', fileName: 'common/iff', tags: 'cond', desc: 'Aliad for <code>iff</code>.' },

  'callback-to-promise': { tags: ['code', 'func'], desc: 'Wrap a function calling a callback into one that returns a Promise.' },
  'check-context': { tags: ['code', 'services', 'func'], desc: 'Restrict a hook to run for certain methods and method types.' },
  'common/delete-by-dot': { name: 'deleteByDot', tags: ['code', 'dot', 'func'], desc: 'Deletes a property using dot notation, e.g. <code>address.city</code>.' },
  'common/exists-by-dot': { name: 'existsByDot', tags: ['code', 'dot', 'func'], desc: 'Check if a property using dot notation, e.g. <code>address.city</code>.' },
  'common/get-by-dot': { name: 'getByDot', tags: ['code', 'dot', 'func'], desc: 'Return a value using dot notation, e.g. <code>address.city</code>.' },
  'get-items': { tags: ['code', 'data', 'data', 'func'], desc: 'Get the records in <code>context.data</code> or <code>context.result</code>.' },
  'make-calling-params': { tags: ['code', 'services', 'func'], desc: 'Build <code>context.params</code> for service calls.' },
  'params-for-server': { tags: ['code', 'client', 'trans', 'func'], desc: 'Pass <code>context.params</code> from client to server. Client-side.' },
  'replace-items': { tags: ['code', 'data', 'data', 'func'], desc: 'Replace the records in <code>context.data</code> or <code>context.result</code>.' },
  'common/set-by-dot': { name: 'setByDot', tags: ['code', 'dot', 'func'], desc: 'Set a value using dot notation, e.g. <code>address.city</code>.' },
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

hexo.extend.tag.register('hooksApiFootnote', name => {
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