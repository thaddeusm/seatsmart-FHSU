import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'
import ChartCreation from './views/ChartCreation.vue'
import Chart from './views/Chart.vue'
import BulkNote from './views/BulkNote.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
    	path: '/',
    	component: Home
    },
    {
    	path: '/charts/new',
    	component: ChartCreation
    },
    {
        path: '/chart/:id',
        props: true,
        component: Chart
    },
    {
        path: '/chart/edit/:id',
        props: true,
        component: ChartCreation
    },
    {
        path: '/chart/bulknote/:id',
        props: true,
        component: BulkNote
    }
  ]
})
