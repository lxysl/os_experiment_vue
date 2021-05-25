import Vue from 'vue'
import App from './App.vue'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import axios from 'axios';

Vue.prototype.$axios = axios //全局注册，使用方法为:this.$axios
Vue.config.productionTip = false
Vue.use(ElementUI);
new Vue({
    render: h => h(App),
}).$mount('#app')
