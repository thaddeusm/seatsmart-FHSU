import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import VueDragDrop from 'vue-drag-drop'
Vue.use(VueDragDrop)

import Trend from 'vuetrend'
Vue.use(Trend)

import SequentialEntrance from 'vue-sequential-entrance'
import 'vue-sequential-entrance/vue-sequential-entrance.css'
Vue.use(SequentialEntrance)

import Donut from 'vue-css-donut-chart'
import 'vue-css-donut-chart/dist/vcdonut.css'

Vue.use(Donut)

import SocketIO from 'socket.io-client'
import VueSocketIO from 'vue-socket.io'

Vue.use(new VueSocketIO({
    debug: true,
    connection: SocketIO('https://seatsmart-remote-server.onrender.com')
}))

import VueQriously from 'vue-qriously'
Vue.use(VueQriously)

Vue.config.productionTip = false

window.EventBus = new Vue()

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
