<template>
    <div id="container" ref="container">
        <header>
            <section id="searchArea">
                <SearchBox v-on:start-search="search" placeholder="student name" />
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
        <transition name="fade">
            <Modal v-if="modalOpen" v-on:trigger-close="modalOpen = false" :dismissable="false" size="large">
                <template slot="content">
                    <Settings v-on:trigger-modal-close="modalOpen = false"/>
                </template>
            </Modal>
        </transition>
        <transition name="fade">
            <Modal v-if="alertModalOpen" v-on:trigger-close="alertModalOpen = false" :dismissable="true" size="small">
                <template slot="content">
                    <img src="@/assets/alert.svg" alt="alert icon" class="alert-icon-large">
                    <div class="modal-body">
                        <h4>Are you sure you want to permanently delete {{ alertModalClass }}?</h4>
                    </div>
                    <div class="modal-footer">
                        <button class="modal-footer-button red" @click="deleteClass(alertModalClassID)">Delete {{ alertModalClass }}</button>
                        <button class="modal-footer-button" @click="alertModalOpen = false">Cancel</button>
                    </div>
                </template>
            </Modal>
        </transition>
        <transition name="fade">
            <Modal v-if="updateAvailable" v-on:trigger-close="updateAvailable = false" :dismissable="true" size="small">
                <template slot="content">
                    <img src="@/assets/update.svg" alt="update icon" class="update-icon">
                    <div class="modal-body">
                        <h4>A new version of Seatsmart ({{ newestVersion }}) is available.</h4>
                        <h6>**Updating will not affect your class data or settings.</h6>
                    </div>
                    <div class="modal-footer">
                        <button class="modal-footer-button yellow" @click="getUpdate">Review Update</button>
                        <button class="modal-footer-button" @click="updateAvailable = false">Later</button>
                    </div>
                </template>
            </Modal>
        </transition>
        <TouchBar :show="!modalOpen && !alertModalOpen" :bar="[
                {type: 'spacer', size: 'flexible'},
                {type: 'button', label: 'Settings', method: openModal}
            ]" 
            :escapeItem="{type: 'button', label: 'New Chart', method: function() {$router.push('/charts/new')}}"
        />
    </div>
</template>

<script>
import db from '@/db'
import moment from 'moment'
const { remote } = require('electron')
const shell = require('electron').shell
const { autoUpdater } = require("electron-updater")

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
            // delete class and its associated records (studens and their notes)
            db.deleteSomething('classes', {_id: id})
                .then((num) => {
                    this.$store.dispatch('getAllClasses')
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
                    thisSemester = 'fall'
                    break
                }

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

                for (let i=0; i<unordered.length; i++) {
                    if (unordered[i].year == thisYear && unordered[i].semester == thisSemester) {
                        firstPriority.push(unordered[i])
                    } else if (unordered[i].semester == lastSemester) {
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
        getUpdate() {
            // allows default browser to open application homepage
            shell.openExternal('https://seatsmart.now.sh/')
        }
    },
    created() {
        this.$store.dispatch('getPreferences')
        this.$store.dispatch('getAllStudents')
        this.$store.dispatch('setVersion', remote.getGlobal('version'))

        this.populateClasses()
    },
    mounted() {
        this.$store.dispatch('setLastView', '/')

        let scope = this

        setTimeout(function() {
            if (scope.$store.state.preferences.progress.indexOf('created class') === -1) {
                scope.modalOpen = true
            }

            // check to ensure behaviorToTally is set
            if (!scope.$store.state.preferences.hasOwnProperty('behaviorToTally')) {
                scope.$store.dispatch('setPreferences', {
                    behaviorToTally: '(-) Absent'
                })

                scope.$store.dispatch('getPreferences')
    		}

            // check for update
            // let request = new XMLHttpRequest()
            // let url = 'https://seatsmart-updater.now.sh/' + scope.version

            // request.onloadend = function() {
            //     let response = (JSON.parse(request.response))

            //     if (response.updateAvailable) {
            //         scope.updateAvailable = true
            //         scope.newestVersion = response.newestVersion
            //     }
            // }

            // request.open('GET', url)
            // request.send()

            autoUpdater.checkForUpdatesAndNotify()
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

#searchArea {
    text-align: right;
    padding-top: 20px;
    padding-right: 26px;
}

#logoArea {
    text-align: center;
    margin-top: 30px;
    margin-bottom: 50px;
}

#logo {
    width: 120px;
}

main {
    text-align: center;
    width: 100%;
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

.fade-enter-active, .fade-leave-active {
    transition: opacity .2s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
    opacity: 0;
}
</style>
