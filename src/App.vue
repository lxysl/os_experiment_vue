<template>
  <div id="app">
    <!--    <img alt="Vue logo" src="./assets/logo.png">-->
    <os msg="操作系统课程设计"></os>
  </div>
</template>

<script>
// import HelloWorld from './components/HelloWorld.vue'
import os from './components/os.vue'

export default {
  name: 'App',
  props: {
    msg: String
  },
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
