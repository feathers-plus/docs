
const { inspect } = require('util');

const hooksRaw = {
  // label: 'fastjoin',
  // fileName: 'fast-join',
  // src: 'https://github.com/feathers-plus/feathers-hooks-common/blob/master/lib/services/fast-join.js',

  'act-on-default': { tags: ['code', 'cond', 'data'], desc: 'Runs a series of hooks which mutate context.data or content.result (the Feathers default).', srcFile: 'services/act-on-dispatch.js' },
  'act-on-dispatch': { tags: ['code', 'cond', 'data'], desc: 'Runs a series of hooks which mutate context.dispatch.' },
  'alter-items': { tags: ['code', 'cond', 'data', 'pred', 'relation', 'imp'], desc: 'Make changes to data or result items. Very flexible.'},
  'cache': { tags: ['data', 'services', 'perf'], desc: 'Persistent, least-recently-used record cache for services.'},
  'combine': { tags: ['code', 'multiNa', 'cond'], desc: 'Sequentially execute multiple sync or async hooks.'},
  'debug': { tags: 'code', desc: 'Display the current hook <code>context</code> for debugging.' },
  'de-populate': { tags: 'relation', desc: 'Remove records and properties created by the <code>populate</code> hook.' },
  'disallow': { tags: 'methods', desc: 'Prevents access to a service method completely or for specific transports.'},
  'disable-multi-item-create': { tags: ['methods', 'create'], desc: 'Prevents multi-item creates.',
    check: [0, 'before', ['create']] },
  'disable-multi-item-change': { tags: ['methods', 'update', 'patch', 'remove'], desc: 'Prevents <code>null</code> from being used as an id in patch and remove service methods.',
    check: [0, 'before', ['update', 'patch', 'remove']] },
  'disable-pagination': { tags: ['methods', 'data'], desc: 'Disables pagination when <code>query.$limit</code> is -1 or \'-1\'.',
    check: [0, 'before', ['find']] },
  'discard': { tags: 'data', desc: 'Delete certain fields from the record(s).',
    check: [1, 'before', ['create', 'update', 'patch']] },
  'discard-query': { tags: ['query'], desc: 'Delete certain fields from the query object.',
    check: [0, 'before', null] },
  'common/every': { name: 'every', tags: ['cond', 'pred'], desc: 'Return the <code>and</code> of a series of sync or async predicate functions.' },
  'fast-join': { tags: ['relation', 'perf', 'imp'], desc: 'Join related records. It\'s very fast.',
    guide: 'fastJoin' },
  'common/iff': { name: 'iff', tags: 'cond', desc: 'Execute one or another series of hooks depending on a sync or async predicate.' },
  'common/iff-else': { name: 'iffElse', tags: 'cond', desc: 'Execute one array of hooks or another based on a sync or async predicate.' },
  'common/is-not': { name: 'isNot', tags: ['cond', 'pred'], desc: 'Negate a sync or async predicate function.' },
  'is-provider': { tags: ['cond', 'pred', 'services', 'trans'], desc: 'Check which transport provided the service call.' },
  'keep': { tags: 'data', desc: 'Keep certain fields in the record(s), deleting the rest.',
    check: [1, 'before', ['create', 'update', 'patch']] },
  'keep-query' : { tags: ['query'], desc: 'Keep certain fields in the query object, deleting the rest.' },
  'lower-case': { check: [1, 'before', ['create', 'update', 'patch']], tags: 'data', desc: 'Convert certain field values to lower case.' },
  'mongo-keys': { tags: ['mongo', 'data', 'relation'], desc: 'Wrap MongoDB foreign keys in ObjectID.',
    check: [0, 'before', null] },
  'params-from-client': { tags: ['code', 'client', 'trans', 'calls'], desc: 'Pass <code>context.params</code> from client to server. Server hook.' },
  'populate': { tags: 'relation', desc: 'Join related records.',
    guide: 'populate' },
  'prevent-changes': { tags: ['data', 'methods'], desc: 'Prevent <code>patch</code> service calls from changing certain fields.',
    check: [0, 'before', ['patch']] },
  'required': { tags: ['valid', 'data', 'services'], desc: 'Check selected fields exist and are not falsey. Numeric 0 is acceptable.',
    check: [0, 'before', ['create', 'update', 'patch']] },
  'run-parallel': { tags: ['client', 'data', 'perf', 'services'], desc: 'Run a hook in parallel to the other hooks and the service call.' },
  'serialize': { tags: 'relation', desc: 'Prune values from related records. Calculate new values.' },
  'set-now': { tags: 'data', desc: 'Create/update certain fields to the current date-time.' },
  'set-slug': { tags: ['trans', 'rest'], desc: 'Fix slugs in URL, e.g. <code>/stores/:storeId</code>.' },
  'sifter': { tags: ['data', 'methods', 'relation', 'services', 'find'], desc: 'Filter data or result records using a MongoDB-like selection syntax.',
    check: [0, 'after', 'find'] },
  'skip-remaining-hooks': { tags: ['cond', 'data', 'services'], desc: 'Conditionally skip running all remaining hooks.' },
  'soft-delete': { tags: 'services', desc: 'Flag records as logically deleted instead of physically removing them. Deprecated.',
    check: [0, 'before', null] },
  'soft-delete2': { tags: 'services', desc: 'Flag records as logically deleted instead of physically removing them.' },
  'common/some': { name: 'some', tags: ['cond', 'pred'], desc: 'Return the <code>or</code> of a series of sync or async predicate functions.' },
  'stash-before': { tags: ['data', 'services'], desc: 'Stash current value of record, usually before mutating it. Performs a <code>get</code> call.',
    check: [0, 'before', ['get', 'update', 'patch', 'remove']] },
  'traverse': { tags: ['data', 'query', 'imp', 'rest'], desc: 'Transform fields & objects in place in the record(s) using a recursive walk. Powerful.' },
  'common/unless': { name: 'unless', tags: 'cond', desc: 'Execute a series of hooks if a sync or async predicate is falsey.' },
  'validate': { tags: ['valid', 'data', 'services', 'create', 'update', 'patch'], desc: 'Validate data using a validation function.',
    guide: 'validate', check: [0, 'before', ['create', 'update', 'patch']] },
  'validate-schema': { tags: ['valid', 'data', 'services'], desc: 'Validate data using JSON-Schema.' },
  'when': { name: 'when', fileName: 'common/iff', tags: 'cond', desc: 'An alias for <code>iff</code>.' },

  'calling-params': { tags: ['code', 'calls', 'func'], desc: 'Build <code>params</code> for a service call.', },
  'calling-params-defaults': { tags: ['code', 'calls', 'func'], desc: 'Set defaults for building <code>params</code> for service calls with <code>callingParams</code>.', srcFile: 'services/calling-params.js' },
  'check-context': { tags: ['code', 'services', 'func'], desc: 'Restrict a hook to run for certain methods and method types.' },
  'common/delete-by-dot': { name: 'deleteByDot', tags: ['code', 'dot', 'func'], desc: 'Deletes a property from an object using dot notation, e.g. <code>address.city</code>.' },
  'common/exists-by-dot': { name: 'existsByDot', tags: ['code', 'dot', 'func'], desc: 'Check if a property exists in an object by using dot notation, e.g. <code>address.city</code>.' },
  'common/get-by-dot': { name: 'getByDot', tags: ['code', 'dot', 'func'], desc: 'Return a property value from an object using dot notation, e.g. <code>address.city</code>.' },
  'get-items': { tags: ['code', 'data', 'func'], desc: 'Get the records in <code>context.data</code> or <code>context.result[.data]</code>.' },
  'make-calling-params': { tags: ['code', 'calls', 'func'], desc: 'Build <code>context.params</code> for service calls.', srcFile: 'services/calling-params.js' },
  'params-for-server': { tags: ['code', 'client', 'trans', 'func', 'calls'], desc: 'Pass an explicit <code>context.params</code> from client to server. Client-side.' },
  'replace-items': { tags: ['code', 'data', 'func'], desc: 'Replace the records in <code>context.data</code> or <code>context.result[.data]</code>.' },
  'run-hook': { tags: ['code', 'services', 'func'], desc: 'Let\'s you call a hook right after the service call.' },
  'common/set-by-dot': { name: 'setByDot', tags: ['code', 'dot', 'func'], desc: 'Set a property value in an object using dot notation, e.g. <code>address.city</code>.' },
};

const showTagNames = {
  calls: 'Calling services',
  client: 'Client/server',
  code: 'Coding',
  cond: 'Conditionals',
  data: 'Data and Results',
  dot: 'Dot notation',
  imp: 'Imperative API',
  methods: 'Service methods',
  mongo: 'MongoDB specific',
  perf: 'Performance',
  pred: 'Predicates',
  query: 'Query object',
  relation: 'Relations',
  rest: 'REST',
  services: 'Services',
  trans: 'Transport',
  valid: 'Validation',
};

const all = 'all';
const yes = 'yes';
const no = 'no';

const methodNames = ['find', 'create', 'get', 'update', 'patch', 'remove'];
const ignoreTags = [].concat(methodNames, 'multiYes', 'multiNo', 'multiNa', 'func', 'check');
const multiDisplay = {
  multiYes: 'yes',
  multiNo: 'no',
  multiNa: 'n/a',
};

const check1 = {
  before: [yes, no],
  after: [no, yes],
  null: [yes, yes],
  undefined: [yes, yes],
};

const check2 = {
  before: ['', yes],
  after: [yes, ''],
  null: [null, null],
  undefined: [null, null],
};

const hooks = {};
const hooksByTag = {};

Object.keys(hooksRaw).sort().forEach(fileName => {
  const info = hooksRaw[fileName];
  fileName = info.fileName || fileName;

  const name = info.name || toCamelCase(fileName);
  const tags = Array.isArray(info.tags) ? info.tags : [info.tags];
  const showTags = tags.filter(name => ignoreTags.indexOf(name) === -1).map(name => showTagNames[name] || name).sort();
  const tagsHtml = showTags.map(name => `<a href="#tag-${encodeURIComponent(name)}">${name}</a>`).join(', ');

  const multi = Object.keys(multiDisplay).reduce((result, key) => {
    return tags.indexOf(key) !== -1 ? multiDisplay[key] : result;
  }, 'yes');

  let before1 = yes;
  let after1 = yes;
  let methods1 = all;
  let before2 = null;
  let after2 = null;
  let methods2 = null;

  const check = info.check;
  if (check) {
    const checkMethods = check[2] ? (Array.isArray(check[2]) ? check[2] : [check[2]]) : ['all'];
    [ before1, after1 ] = check1[check[1]];
    methods1 = checkMethods.join(', ');

    if (check[0]) {
      before1 = before1 === no ? ' ' : before1;
      after1 = after1 === no ? '' : after1;
      [ before2, after2 ] = check2[check[1]];
      methods2 = all;
    }
  }

  // console.log(name, before1, after1, methods1, before2, after2, methods2);

  const srcFileName = info.srcFile || `${fileName.indexOf('/') === -1 ? 'services/' : ''}${fileName}.js`;

  hooks[name] = {
    fileName,
    label: encodeURIComponent(info.label || name.toLowerCase()),
    src: `https://github.com/feathers-plus/feathers-hooks-common/blob/master/lib/${srcFileName}`,
    multi,
    before1,
    after1,
    methods1,
    before2,
    after2,
    methods2,
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

  let html = `${hook.desc}<br/>
  <table>
  <thead>
  <tr>
  <th style="text-align:center">before</th>
    <th style="text-align:center">after</th>
    <th style="text-align:center">methods</th>
    <th style="text-align:center">multi recs</th>
    <th style="text-align:center">guide</th>
    <th style="text-align:center">details</th>
    <th style="text-align:center">tags</th>
  </tr>
  </thead>
  <tbody>
  <tr>
    <td style="text-align:center">${hook.before1}</td>
    <td style="text-align:center">${hook.after1}</td>
    <td style="text-align:center">${hook.methods1}</td>
    <td style="text-align:center">${hook.multi}</td>
    <td style="text-align:center">${hook.guide}</td>
    <td style="text-align:center"><a href="${hook.src}" target="_blank" rel="external">source</a></td>
    <td style="text-align:center">${hook.tags}</td>
  </tr>`;

  if (hook.before2 || hook.after2 || hook.methods2) {
    html += `
    <tr>
      <td style="text-align:center">${hook.before2}</td>
      <td style="text-align:center">${hook.after2}</td>
      <td style="text-align:center">${hook.methods2}</td>
    </tr>`;
  }

  html += `
  </tbody>
  </table>`;

  return html;
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
  </ul>
  <ul>
    <li><strong>Is anything wrong, unclear, missing?</strong>: <a href="https://github.com/feathers-plus/docs/issues/new?title=Comment%20-%20Hooks%20-%20${name}&body=Comment%20-%20Hooks%20-%20${name}" target=""_blank">Leave a comment.</a></li>
  </ul>`;
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