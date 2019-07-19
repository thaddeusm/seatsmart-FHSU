import Vue from 'vue'
import Vuex from 'vuex'
import api from '@/preferences.js'
import db from '@/db.js'

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        preferences: null,
        lastStudentUpdated: null,
        lastView: null,
        earliestDatesNoted: {},
        allStudents: null,
        allClasses: null,
        version: null,
        initalized: false
    },
    mutations: {
        getPreferences(state, preferences) {
            state.preferences = preferences
        },
        setPreferences(state, newPreferences) {
            state.preferences = newPreferences
            api.setPreferences(newPreferences)
        },
        setLastStudentUpdated(state, studentID) {
            state.lastStudentUpdated = studentID
        },
        setLastView(state, lastView) {
            state.lastView = lastView
        },
        setEarliestDatesNoted(state, payload) {
            state.earliestDatesNoted[payload.class] = payload.earliestDateNoted
        },
        setAllStudents(state, allStudents) {
            state.allStudents = allStudents
        },
        setAllClasses(state, allClasses) {
            state.allClasses = allClasses
        },
        setVersion(state, version) {
            state.version = version
        },
        setInit(state) {
            state.initalized = true
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
            let currentPreferences = context.state.preferences

            // set new values dynamically
            let keys = Object.keys(newPreferences)
            let vals = Object.values(newPreferences)

            for (let i=0; i<keys.length; i++) {
                currentPreferences[keys[i]] = vals[i]
            }

            context.commit('setPreferences', currentPreferences)
        },
        setLastStudentUpdated(context, studentID) {
            context.commit('setLastStudentUpdated', studentID)
        },
        setLastView(context, lastView) {
            context.commit('setLastView', lastView)
        },
        getEarliestDatesNoted(context, payload) {
            context.commit('setEarliestDatesNoted', payload)
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
                        obj[allClasses[i]._id] = {
                            name: allClasses[i].name,
                            semester: allClasses[i].semester,
                            year: allClasses[i].year,
                            archived: allClasses[i].archived,
                            rows: allClasses[i].rows,
                            columns: allClasses[i].columns
                        }
                    }

                    context.commit('setAllClasses', obj)
                })
        },
        setVersion(context, version) {
            context.commit('setVersion', version)
        },
        setInit(context) {
            context.commit('setInit')
        }
    }
})
