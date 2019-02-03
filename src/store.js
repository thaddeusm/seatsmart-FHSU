import Vue from 'vue'
import Vuex from 'vuex'
import api from '@/preferences.js'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
  	preferences: null,
    lastUpdatedStudent: null,
    lastView: null
  },
  mutations: {
  	getPreferences(state, preferences) {
      state.preferences = preferences
  	},
  	setPreferences(state, newPreferences) {
  		state.preferences = newPreferences
  	},
    setLastUpdatedStudent(state, studentID) {
      state.lastUpdatedStudent = studentID
    },
    setLastView(state, lastView) {
      state.lastView = lastView
    }
  },
  actions: {
  	getPreferences(context) {
  		api.getPreferences()
        .then((preferences) => {
          context.commit('getPreferences', preferences)
        })
  	},
  	setPreferences(context, newPreferences) {
  		api.setPreferences(newPreferences)
        .then((newPreferences) => {
          context.commit('setPreferences', newPreferences)
        })
  	},
    setLastUpdatedStudent(context, studentID) {
      context.commit('setLastUpdatedStudent', studentID)
    },
    setLastView(context, lastView) {
      context.commit('setLastView', lastView)
    }
  }
})
