<template>
  <div id="app">
    <os msg="操作系统课程设计"></os>
  </div>
</template>

<script>
import os from './components/os.vue'

export default {
  name: 'App',
  components: {
    // HelloWorld,
    os
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
