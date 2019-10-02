import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'
import ChartCreation from './views/ChartCreation.vue'
import Chart from './views/Chart.vue'
import BulkNote from './views/BulkNote.vue'
import RearrangeSeats from './views/RearrangeSeats.vue'
import Highlighter from './views/Highlighter.vue'
import Student from './views/Student.vue'
import Search from './views/Search.vue'
import Activities from './views/Activities.vue'
import ActivityCreation from './views/ActivityCreation.vue'
import SessionExplorer from './views/SessionExplorer.vue'

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
        component: Chart,
        name: 'chart'
    },
    {
        path: '/chart/edit/:id',
        props: true,
        component: ChartCreation
    },
    {
        path: '/activity/edit/:id',
        props: true,
        component: ActivityCreation
    },
    {
        path: '/chart/bulknote/:id',
        props: true,
        component: BulkNote
    },
    {
        path: '/chart/rearrange/:id',
        props: true,
        component: RearrangeSeats
    },
    {
        path: '/chart/highlight/:id',
        props: true,
        component: Highlighter
    },
    {
        path: '/student/:id',
        props: true,
        component: Student
    },
    {
        path:'/search/:term',
        props: true,
        component: Search
    },
    {
        path:'/activities',
        props: true,
        component: Activities,
        props: (route) => ({
          activityToLaunch: route.query.activity
        })
    },
    {
        path: '/activity/new',
        component: ActivityCreation
    },
    {
        path: '/session/:id',
        props: true,
        component: SessionExplorer
    },
  ]
})
