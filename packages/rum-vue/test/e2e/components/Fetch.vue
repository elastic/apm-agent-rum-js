<template>
  <div class="fetch">
    <div v-if="loading">Loading...</div>
    <div v-if="error">
      {{ error }}
    </div>
    <div v-if="data" id="content">
      <h2>{{ data.msg }}</h2>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      loading: false,
      data: null,
      error: null
    }
  },
  created() {
    this.fetchData()
  },
  watch: {
    $route: 'fetchData'
  },
  methods: {
    fetchData() {
      const url = '/test/e2e/data.json'
      this.error = this.data = null
      this.loading = true

      fetch(url)
        .then(resp => {
          this.loading = false
          return resp.json()
        })
        .then(data => {
          this.data = data
        })
        .catch(err => {
          this.error = err
        })
    }
  }
}
</script>
