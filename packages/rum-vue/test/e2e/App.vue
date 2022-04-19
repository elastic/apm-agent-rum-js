<template>
  <div id="app">
    <h1>Vue E2E Test with Lazy loaded routes</h1>
    <ul>
      <li><router-link to="/">Home</router-link></li>
      <li><router-link to="/lazy">Lazy</router-link></li>
      <li><router-link id="fetch" to="/fetch">Fetch</router-link></li>
      <li><router-link to="/lazy/b/c">Lazy with params</router-link></li>
      <li><router-link id="syntax" to="/syntax">Script setup syntax support</router-link></li>
    </ul>
    <router-view class="view"></router-view>
  </div>
</template>
