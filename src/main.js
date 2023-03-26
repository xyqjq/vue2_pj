import Vue from 'vue'
import App from './App.vue'
import Antd from 'ant-design-vue';
import less from 'less'
import 'ant-design-vue/dist/antd.css';
Vue.config.productionTip = false

Vue.use(Antd);
Vue.use(less);

new Vue({
  render: h => h(App),
}).$mount('#app')
