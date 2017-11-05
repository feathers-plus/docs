;(function(root, factory) {
  // https://github.com/umdjs/umd/blob/master/returnExports.js
  if (typeof exports == 'object') {
    // For Node.js.
    module.exports = factory(root);
  } else if (typeof define == 'function' && define.amd) {
    // For AMD. Register as an anonymous module.
    define([], factory.bind(root, root));
  } else {
    // For browser globals (not exposing the function separately).
    factory(root);
  }
}(
  typeof global != 'undefined' ? global : this,
  function(root) {
    // Only works in Node
    console.log('inject-feathers-plus.js');
    root.feathers = root.feathers || {};

    root.feathers.feathersBatchLoader = 'a';

    console.log('x', Object.keys(feathers));
  }));
