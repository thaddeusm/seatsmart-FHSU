import Vue from 'vue'
import Vuex from 'vuex'
import api from '@/preferences.js'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
  	preferences: null
  },
  mutations: {
  	getPreferences(state, preferences) {
      state.preferences = preferences
  	},
  	setPreferences(state, newPreferences) {
  		state.preferences = newPreferences
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
  	}
  }
})
