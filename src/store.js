import Vue from 'vue'
import Vuex from 'vuex'
import api from '@/preferences.js'
import db from '@/db.js'

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        preferences: null,
        lastUpdatedStudent: null,
        lastView: null,
        earliestDateNoted: null,
        allStudents: null,
        allClasses: null,
        version: null
    },
    mutations: {
        getPreferences(state, preferences) {
            state.preferences = preferences
        },
        setPreferences(state, newPreferences) {
            state.preferences = newPreferences
            api.setPreferences(newPreferences)
        },
        setLastUpdatedStudent(state, studentID) {
            state.lastUpdatedStudent = studentID
        },
        setLastView(state, lastView) {
            state.lastView = lastView
        },
        setEarliestDateNoted(state, earliestDateNoted) {
            state.earliestDateNoted = earliestDateNoted
        },
        setAllStudents(state, allStudents) {
            state.allStudents = allStudents
        },
        setAllClasses(state, allClasses) {
            state.allClasses = allClasses
        },
        setVersion(state, version) {
            state.version = version
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
            context.commit('setPreferences', newPreferences)
        },
        setLastUpdatedStudent(context, studentID) {
            context.commit('setLastUpdatedStudent', studentID)
        },
        setLastView(context, lastView) {
            context.commit('setLastView', lastView)
        },
        setEarliestDateNoted(context, earliestDateNoted) {
            context.commit('setEarliestDateNoted', earliestDateNoted)
        },
        getAllStudents(context) {
            db.readSomething('students', {})
                .then(allStudents => {
                    let arr = []

                    for (let i=0; i<allStudents.length; i++) {
                        arr.push(allStudents[i])
                    }

                    context.commit('setAllStudents', arr)
                })
        },
        getAllClasses(context) {
            db.readSomething('classes', {})
                .then(allClasses => {
                    let obj = {}

                    for (let i=0; i<allClasses.length; i++) {
                        obj[allClasses[i]._id] = allClasses[i].name
                    }

                    context.commit('setAllClasses', obj)
                })
        },
        setVersion(context, version) {
            context.commit('setVersion', version)
        }
    }
})
