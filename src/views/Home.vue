<template>
    <div id="container" ref="container">
        <header>
            <section id="activitiesArea">
                <button @click="routeToActivities" id="activitiesButton">
                    <img id="activitiesLogo" src="@/assets/activities-circle.svg" alt="activities logo"> activites
                </button>
            </section>
            <section id="searchArea">
                <SearchBox v-on:start-search="search" placeholder="student name/ID" />
            </section>
            <section id="logoArea">
                <img id="logo" src="@/assets/logo.svg" alt="seatsmart logo">
            </section>
        </header>
        <main>
            <div class="class-button-area" v-for="(classToDisplay, index) in classesToDisplay">
                <ButtonCard :button="false" :icon="classToDisplay.name" :text="classToDisplay.semester + ' ' + classToDisplay.year" :to="`/chart/${classToDisplay._id}`" :key="index" v-if="classToDisplay.archived !== true"/>
                <div class="modify-button-area" v-if="classToDisplay.archived !== true">
                    <button @click="editClass(classToDisplay._id)" class="modify-class-button"><img src="@/assets/edit.svg" alt="edit icon"></button>
                    <button @click="archiveClass(classToDisplay._id)" class="archive-class-button"><img src="@/assets/archive.svg" alt="archive icon"></button>
                    <button @click="promptDeleteClass(classToDisplay._id, classToDisplay.name)" class="modify-class-button"><img src="@/assets/delete.svg" alt="delete icon"></button>
                </div>
            </div>
            <br><br><br><br>
            <ButtonCard icon="+" text="seating chart" to="/charts/new"/>
            <br>
            <div class="class-button-area archived" v-for="(classToDisplay, index) in classesToDisplay">
                <ButtonCard :button="false" :icon="classToDisplay.name" :text="classToDisplay.semester + ' ' + classToDisplay.year" :to="`/chart/${classToDisplay._id}`" :key="index" v-if="classToDisplay.archived == true"/>
                <div class="modify-button-area" v-if="classToDisplay.archived == true">
                    <button @click="editClass(classToDisplay._id)" class="modify-class-button"><img src="@/assets/edit.svg" alt="edit icon"></button>
                    <button @click="unarchiveClass(classToDisplay._id)" class="archive-class-button"><img src="@/assets/unarchive.svg" alt="archive icon"></button>
                    <button @click="promptDeleteClass(classToDisplay._id, classToDisplay.name)" class="modify-class-button"><img src="@/assets/delete.svg" alt="delete icon"></button>
                </div>
            </div>
        </main>
        <footer>
            <ActionBar background="var(--black)" :hamburger="false">
                <template slot="left">
                    <h6>v {{ version }}</h6>
                </template>
                <template slot="right">
                    <button @click="openModal"><img src="@/assets/cog.svg" alt="settings icon"></button>
                </template>
            </ActionBar>
        </footer>
        <Modal v-if="modalOpen" v-on:trigger-close="closeModal" :dismissable="false" size="large">
            <template slot="content">
                <Settings v-on:trigger-modal-close="closeModal"/>
            </template>
        </Modal>
        <Modal v-if="alertModalOpen" v-on:trigger-close="alertModalOpen = false" :dismissable="true" size="small">
            <template slot="content">
                <img src="@/assets/alert.svg" alt="alert icon" class="alert-icon-large">
                <div class="modal-body">
                    <h4>Are you sure you want to permanently delete {{ alertModalClass }}?</h4>
                </div>
                <div class="modal-footer">
                    <button class="modal-footer-button" @click="alertModalOpen = false">Cancel</button>
                    <button class="modal-footer-button red" @click="deleteClass(alertModalClassID)">Delete {{ alertModalClass }}</button>
                </div>
            </template>
        </Modal>
        <TouchBar :show="!modalOpen && !alertModalOpen" :bar="[
                {type: 'spacer', size: 'flexible'},
                {type: 'button', label: 'New Chart', method: function() {$router.push('/charts/new')}},
                {type: 'spacer', size: 'flexible'},
                {type: 'button', label: 'Settings', method: openModal}
            ]" 
            :escapeItem="{type: 'button', label: 'Activities', method: function() {routeToActivities()}}"
        />
    </div>
</template>

<script>
import db from '@/db'
import moment from 'moment'
const { remote } = require('electron')

import SearchBox from '@/components/SearchBox.vue'
import ButtonCard from '@/components/ButtonCard.vue'
import ActionBar from '@/components/ActionBar.vue'
import Modal from '@/components/Modal.vue'
import Settings from '@/components/Settings.vue'
import TouchBar from '@/components/TouchBar.vue'

const { app } = require('electron').remote;

export default {
    name: 'home',
    components: {
        SearchBox,
        ButtonCard,
        ActionBar,
        Modal,
        Settings,
        TouchBar
    },
    data() {
        return {
            modalOpen: false,
            alertModalOpen: false,
            alertModalClass: '',
            alertModalClassID: '',
            classesToDisplay: [
                {
                    name: 'V??',
                    semester: null,
                    year: null,
                    _id: null,
                    columns: null,
                    rows: null,
                    archived: false
                }
            ],
            updateAvailable: false,
            newestVersion: null
        }
    },
    computed: {
        version() {
            return this.$store.state.version
        },
        initalized() {
            return this.$store.state.initalized
        }
    },
    methods: {
        openModal() {
            this.modalOpen = true
        },
        closeModal() {
            this.modalOpen = false

            this.populateClasses()
        },
        editClass(id) {
            this.$store.dispatch('setLastView', '/')
            this.$router.push(`/chart/edit/${id}`)
        },
        archiveClass(id) {
            db.updateSomething('classes', {_id: id}, {
                $set: {
                    "archived": true 
                }
            }).then(() => {
                this.populateClasses()
            })
        },
        unarchiveClass(id) {
            db.updateSomething('classes', {_id: id}, {
                $set: {
                    "archived": false 
                }
            }).then(() => {
                this.populateClasses()
            })
        },
        promptDeleteClass(id, name) {
            this.alertModalClass = name
            this.alertModalOpen = true
            this.alertModalClassID = id
        },
        deleteClass(id) {
            // delete class and its associated records (students and their notes)
            db.deleteSomething('classes', {_id: id})
                .then((num) => {
                    this.$store.dispatch('getAllClasses')

                    db.readSomething('activitySessions', {chart: id})
                        .then(sessions => {
                            for (let i=0; i<sessions.length; i++) {
                                db.deleteSomething('activitySessions', {_id: sessions[i]._id})
                            }
                        })

                    db.readSomething('students', {class: id})
                        .then(classStudents => {
                            for (let i=0; i<classStudents.length; i++) {
                                db.deleteSomething('students', {_id: classStudents[i]._id})
                                    .then(() => {
                                        db.deleteSomething('notes', {student: classStudents[i]._id})
                                    })
                            }
                        })


                    this.alertModalOpen = false
                    this.alertModalClass = ''
                    this.alertModalClassID = ''

                    this.populateClasses()
                })
        },
        populateClasses() {
            // retrieve classes and organize, prioritizing current semester
            db.readSomething('classes', {})
            .then((d) => {
                let unordered = d
                let firstPriority = []
                let secondPriority = []
                let remainder = []
                let thisSemester
                let lastSemester
                let thisYear = moment().year()
                let thisMonth = moment().month()

                // find current semester
                switch (thisMonth) {
                    case 0:
                    thisSemester = 'Spring'
                    break
                    case 1:
                    thisSemester = 'Spring'
                    break
                    case 2:
                    thisSemester = 'Spring'
                    break
                    case 3:
                    thisSemester = 'Spring'
                    break
                    case 4:
                    thisSemester = 'Spring'
                    break
                    case 5:
                    thisSemester = 'Spring'
                    break
                    case 6:
                    thisSemester = 'Summer'
                    break
                    case 7:
                    thisSemester = 'Summer'
                    break
                    case 8:
                    thisSemester = 'Fall'
                    break
                    case 9:
                    thisSemester = 'Fall'
                    break
                    case 10:
                    thisSemester = 'Fall'
                    break
                    case 11:
                    thisSemester = 'Fall'
                    break
                }

                console.log('This semester is ', thisSemester)

                // find last semester
                switch (thisSemester) {
                    case 'Spring':
                    lastSemester = 'Fall'
                    break
                    case 'Summer':
                    lastSemester = 'Spring'
                    break
                    case 'Fall':
                    lastSemester = 'Summer'
                    break
                }

                console.log('Last semester was ', lastSemester)

                for (let i=0; i<unordered.length; i++) {
                    if (unordered[i].year == thisYear && unordered[i].semester == thisSemester) {
                        firstPriority.push(unordered[i])
                    } else if (unordered[i].semester == lastSemester && unordered[i].year == thisYear - 1) {
                        secondPriority.push(unordered[i])
                    } else {
                        remainder.push(unordered[i])
                    }
                }

                this.classesToDisplay = firstPriority.concat(secondPriority, remainder)

                if (!this.initalized) {
                    let scope = this
                    setTimeout(function() {
                        scope.$refs.container.style.opacity = "1"
                        scope.$store.dispatch('setInit')
                    }, 700, scope)
                } else {
                    this.$refs.container.style.opacity = "1"
                }

                this.$store.dispatch('getAllClasses')
            })
        },
        search(term) {
            // ensure a search term is provided before changing views
            if (term !== '') {
                this.$router.push(`/search/${term}`)
            }
        },
        routeToActivities() {
            this.$store.dispatch('setLastView', '/')
            this.$router.push('/activities')
        }
    },
    created() {
        this.$store.dispatch('getPreferences')
        this.$store.dispatch('getAllStudents')
        this.$store.dispatch('setVersion', remote.getGlobal('version'))

        this.populateClasses()
    },
    mounted() {
        window.scrollTo(0, 0)

        this.$store.dispatch('setLastView', '/')

        let scope = this

        setTimeout(function() {
            let progress = scope.$store.state.preferences.progress

            if (progress.indexOf('created class') == -1) {
                scope.modalOpen = true
            } else if (progress.indexOf('read remote features info') == -1) {
                scope.modalOpen = true

                // update onboarding progress
                scope.$store.dispatch('setPreferences', {
                    progress: ['created class', 'rearranged seats', 'viewed class chart', 'viewed a student page', 'read remote features info']
                })
            }

            // check to ensure behaviorToTally is set
            if (!scope.$store.state.preferences.hasOwnProperty('behaviorToTally')) {
                scope.$store.dispatch('setPreferences', {
                    behaviorToTally: '(-) Absent'
                })

                scope.$store.dispatch('getPreferences')
    		}

            // check to ensure calculationInterval is set
            if (!scope.$store.state.preferences.hasOwnProperty('calculationInterval')) {
                scope.$store.dispatch('setPreferences', {
                    calculationInterval: 'weekly'
                })

                scope.$store.dispatch('getPreferences')
            }

            // check to ensure weightValues is set
            if (!scope.$store.state.preferences.hasOwnProperty('weightValues')) {
                scope.$store.dispatch('setPreferences', {
                    weightValues: {
                        low: 2,
                        medium: 4,
                        strong: 8
                    }
                })

                scope.$store.dispatch('getPreferences')
            }

        }, 3000, scope)
    }
}
</script>

<style scoped>
#container {
    background: var(--black);
    width: 100%;
    height: 100%;
    z-index: 1;
    opacity: 0;
}

header {
    display: grid;
    grid-template-rows: 20% 20% 1fr;
    grid-template-columns: 5% 18% 1fr 18% 5%;
    grid-template-areas: 
        ". . . . ."
        ". activities . search ."
        "logo logo logo logo logo";
    height: 250px;
    width: 100%;
    background: var(--black);
    position: fixed;
    top: 0;
    z-index: 10;
    align-items: center;
    justify-content: center;
}

#searchArea {
    grid-area: search;
    text-align: right;
    align-self: center;
}

#logoArea {
    grid-area: logo;
    text-align: center;
}

#logo {
    width: 120px;
}

#activitiesArea {
    grid-area: activities;
    align-self: center;
}

#activitiesLogo {
    width: 25px;
    vertical-align: middle;
    margin-right: 10px;
}

#activitiesButton {
    color: var(--yellow);
    font-size: 16px;
}

main {
    text-align: center;
    width: 100%;
    margin-top: 300px;
    margin-bottom: 100px;
}

button {
    background: none;
    outline: none;
    border: none;
    cursor: pointer;
}

footer {
    position: fixed;
    bottom: 0;
}

.class-button-area {
    display: inline-block;
    margin: 20px 0;
}

.class-button-area > * {
    margin: 0 30px;
}

.archived {
    margin-top: 70px;
    opacity: .7;
}

.modal-button {
    background: none;
    outline: none;
    color: var(--red);
    border: none;
    cursor: pointer;
    vertical-align: text-top;
    font-size: 16px;
}

.modal-body {
    height: 150px;
    padding-top: 70px;
    text-align: center;
}

.modal-footer {
    background: var(--gray);
    text-align: center;
    height: 75px;
}

.modal-footer-button {
    padding: 5px 10px;
    background: var(--light-gray);
    color: var(--black);
    font-size: 18px;
    border-radius: 5px;
    cursor: pointer;
    outline: none;
    margin-top: 25px;
    margin-left: 10px;
    margin-right: 10px;
}

.alert-icon-large {
	vertical-align: middle;
	width: 50px;
	margin-top: 30px;
	display: block;
	margin-left: auto;
	margin-right: auto;
}

.update-icon {
    vertical-align: middle;
	width: 50px;
	margin-top: 30px;
	display: block;
	margin-left: auto;
	margin-right: auto;
}

h6 {
    margin-top: 15px;
}

.yellow {
    background: var(--yellow);
}

.red {
    background: var(--red)!important;
    color: var(--white)!important;
}

.modify-class-button {
    color: var(--red);
    margin: 10px 40px;
}

.modify-class-button > img {
    width: 20px;
}

.modify-class-button:first-child {
    color: var(--yellow);
}

.archive-class-button > img {
    width: 20px;
}
</style>
