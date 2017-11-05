---
title: Guide
type: guide
order: 1
dropdown: extensions
repo: feathers-dataloader
---

## What is Vue.js?

Vue (pronounced /vjuː/, like **view**) is a **progressive framework** for building user interfaces. Unlike other monolithic frameworks, Vue is designed from the ground up to be incrementally adoptable. The core library is focused on the view layer only, and is easy to pick up and integrate with other libraries or existing projects. On the other hand, Vue is also perfectly capable of powering sophisticated Single-Page Applications when used in combination with [modern tooling](single-file-components.html) and [supporting libraries](https://github.com/vuejs/awesome-vue#components--libraries).

If you are an experienced frontend developer and want to know how Vue compares to other libraries/frameworks, check out the [Comparison with Other Frameworks](comparison.html).

## Getting Started

<p class="tip">The official guide assumes intermediate level knowledge of HTML, CSS, and JavaScript. If you are totally new to frontend development, it might not be the best idea to jump right into a framework as your first step - grasp the basics then come back! Prior experience with other frameworks helps, but is not required.</p>

The easiest way to try out Vue.js is using the [JSFiddle Hello World example](https://jsfiddle.net/chrisvfritz/50wL7mdz/). Feel free to open it in another tab and follow along as we go through some basic examples. Or, you can <a href="https://gist.githubusercontent.com/chrisvfritz/7f8d7d63000b48493c336e48b3db3e52/raw/ed60c4e5d5c6fec48b0921edaed0cb60be30e87c/index.html" target="_blank" download="index.html">create an <code>index.html</code> file</a> and include Vue with:

``` html
<script src="https://unpkg.com/vue"></script>
```

The [Installation](installation.html) page provides more options of installing Vue. Note: We **do not** recommend that beginners start with `vue-cli`, especially if you are not yet familiar with Node.js-based build tools.

## Declarative Rendering

At the core of Vue.js is a system that enables us to declaratively render data to the DOM using straightforward template syntax:

``` html
<div id="app">
  {{ message }}
</div>
```
``` js
var app = new Vue({
  el: '#app',
  data: {
    message: 'Hello Vue!'
  }
})
```
{% raw %}
<div id="app" class="demo">
  {{ message }}
</div>
<script>

document.getElementById('app').innerHTML = JSON.stringify(Object.keys(feathers));
</script>
{% endraw %}
