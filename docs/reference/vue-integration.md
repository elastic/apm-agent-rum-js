---
mapped_pages:
  - https://www.elastic.co/guide/en/apm/agent/rum-js/current/vue-integration.html
applies_to:
  stack:
  serverless: unavailable
  product:
    apm_agent_rum: ga
products:

  - id: observability
  - id: apm
---

# Vue integration [vue-integration]

This document covers how to use Real User Monitoring JavaScript agent with Vue applications.

## Supported versions [vue-supported-versions]

This integration supports Vue.js versions ≥ 3.0

::::{note}
If you are using an Vuejs version < 3.0, use @elastic/apm-rum-vue 1.x to instrument your application. Details are available in a [prior release](https://www.elastic.co/guide/en/apm/agent/rum-js/4.x/vue-integration.html).
::::



## Installing Elastic APM Vue package [installing-vue-integration]

Install the `@elastic/apm-rum-vue` package as a dependency to your application:

```bash
npm install --save @elastic/apm-rum-vue
```


### Using APM Plugin [_using_apm_plugin]

```js
app.use(ApmVuePlugin, options)
```

### Options [_options]

* `config` (required) - RUM agent [configuration options](/reference/configuration.md).
* `router` (optional) - Instance of Vue Router. If provided, will start capturing both page load and SPA navigation events as transactions with path of the route as its name.
* `captureErrors` (optional) - If enabled, will install a global Vue error handler to capture render errors inside the components. Defaults to `true`. The plugin captures the component name, lifecycle hook and file name (if it’s available) as part of the error context.


### Instrumenting your Vue application [_instrumenting_your_vue_application]

The package exposes `ApmVuePlugin` which is a Vue Plugin and can be installed in your application using `Vue.use` method.

```js
import { createApp, defineComponent, h } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import { ApmVuePlugin } from '@elastic/apm-rum-vue'
import App from './App.vue'

const Home = defineComponent({
  render: () => h("div", {}, "home")
})

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', component: Home }
  ]
})

createApp(App)
  .use(router)
  .use(ApmVuePlugin, {
    router,
    config: {
      serviceName: 'app-name',
      // agent configuration
    }
  })
  // app specific code
  .mount('#app')
```


### Accessing agent instance inside components [_accessing_agent_instance_inside_components]

Instance of the agent can be accessed inside all the components using `this.$apm`

```html
<template>
  <div>Component timings as span</div>
</template>

<script>
export default {
  data() {
    return {
      span: null
    }
  },
  created() {
    this.span = this.$apm.startSpan('create-mount-duration', 'custom')
  },
  mounted() {
    this.span && this.span.end()
  }
}
</script>
```

In case of both SFC and Composition API usage via the recommended `<script setup>` syntax the access of the instance is supported by the vue [plugin injection](https://vuejs.org/guide/components/provide-inject.html#inject)

```html
<template>
  <div>Component timings as span</div>
</template>

<script setup>
import { inject, onMounted, onUnmounted, ref } from 'vue'

const $apm = inject('$apm')
const span = ref(null)

onMounted(() =>
  span.value = $apm.startSpan('mount-unmount-duration', 'custom')
)

onUnmounted(() =>
  span.value.end()
)
</script>
```

`ApmVuePlugin` expects the router option to be an instance of VueRouter since it uses the [navigation guards](https://next.router.vuejs.org/guide/advanced/navigation-guards.html) functionality.

Once the plugin is initialized, both page load and SPA navigation events will be captured as transactions with the `path` of the route as its name and `page-load` or `route-change` as type.



