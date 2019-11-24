<template>
    <div id="studentContainer" :class="[modalOpen ? 'no-overflow' : '']">
        <transition name="fade">
            <aside id="leftPanel">
                <h1>{{ student.firstName }} {{ student.lastName }}</h1>
                <div id="tigerArea" v-if="student.tigerID !== null && student.tigerID !== ''">
                    <img src="@/assets/tiger.png" id="tigerLogo" alt="FHSU tiger logo">
                    <h5>{{ student.tigerID }}</h5>
                </div>
                <transition name="fade">
                    <TitleBar v-if="loaded" :classID="classInfo._id" :compact="true" :link="true" />
                </transition>
                <transition name="fade">
                    <SeatingDiagram 
                        :compact="true" 
                        :inverted="true" 
                        :rows="classInfo.rows" 
                        :columns="classInfo.columns" 
                        :selected="`${this.student.seat.row},${this.student.seat.column}`" 
                        :classID="classInfo._id" 
                        :title="classInfo.name"
                        v-on:change-route="changeStudents"
                    />
                </transition>
                <div v-if="student.highlight && student.highlight !== ''" id="highlightArea">
                    <h6>highlight:</h6>
                    <div :style="{background: student.highlight}"></div>
                </div>
                <div id="selectArea">
                    <button @click="toggleSelected" v-if="selected"><img src="@/assets/yellowstar.svg" alt="select icon"></button>
                    <button @click="toggleSelected" v-else><img src="@/assets/graystar.svg" alt="select icon"></button>
                </div>
                <section id="switchArea" v-if="activitiesLoaded">
                    <p>
                        <span class="switch-label">notes</span> 
                        <button :class="[showActivities ? 'on' : 'off' ,'switch']" @click="toggleRecordsDisplay">
                            <img src="@/assets/switch-circle.svg" alt="switch circle">
                        </button> 
                         <span class="switch-label">activities</span>
                    </p>
                </section>
            </aside>
        </transition>
        <main>
            <header>
                <section id="backArea">
        			<button class="back-button" @click="routeBack"><img class="back-arrow" src="@/assets/backarrow.svg" alt="back arrow"> back</button>
        		</section>
                <trend
                    v-if="trendLoaded"
                    :data="trendScope === 'all' ? trend : monthTrend"
                    :gradient="['var(--red)', 'orange', 'var(--yellow)']"
                    class="trend"
                    :auto-draw="true"
                    :autoDrawDuration="3000"
                    :smooth="true"
                    gradientDirection="bottom"
                    :key="trendScope"
                >
                </trend>
                <section id="trendLoading" v-else></section>
                <section id="trendAdjustArea" v-if="trendLoaded">
                    <button :class="[trendScope === 'all' ? 'selected' : '', 'trend-adjust']" @click="toggleTrendScope">all time</button>
                    <button v-if="monthTrend.length > 1" :class="[trendScope === 'month' ? 'selected' : '', 'trend-adjust']" @click="toggleTrendScope">this month</button>
                </section>
            </header>
            <section id="noteArea" v-if="loaded && !showActivities">
                <h2 v-if="this.notes.length == 0">Add a Note</h2>
                <h2 v-else>Notes</h2>
                <div id="addNoteArea">
                    <transition name="fade">
                        <button @click="openModal('note')" id="addNoteButton" v-if="trendLoaded">+</button>
                    </transition>
                </div>
                <sequential-entrance fromTop delay="20">
                    <div v-for="(note, index) in notes" :key="`note${index}`" :class="[note.type === 'positive' ? 'yellow-card' : 'red-card', 'note-card']">
                        <section class="note-header">
                            <AbbreviationCircle :behavior="note.behavior" size="medium" :color="note.type === 'positive' ? 'yellow' : 'red'"/>
                        </section>
                        <section class="note-body">
                            <h5>{{ note.behavior.Description }}</h5>
                            <span class="date-text">on {{ makePrettyDate(note.dateNoted._d) }}</span>
                            <p v-if="note.comment == '' || note.comment == null" class="center">- no comment -</p>
                            <p v-else>{{ note.comment }}</p>
                            <transition name="fade">
                                <button @click="startEdit(note)" class="edit-button" v-if="trendLoaded"><img src="@/assets/edit.svg" alt="edit icon"></button>
                            </transition>
                            <transition name="fade">
                                <button @click="promptDelete(note._id)" class="delete-button" v-if="trendLoaded"><img src="@/assets/delete.svg" alt="delete icon"></button>
                            </transition>
                        </section>
                    </div>
                </sequential-entrance>
            </section>
            <section id="activityArea" v-if="loaded && showActivities">
                <sequential-entrance fromTop delay="20">
                    <div v-for="(session, index) in activitySessions" :key="`session${index}`" :class="[session.activity.activityType.split(' ').join('-'), 'activity-card']">
                        <section class="activity-body">
                            <h5>{{ session.activity.name }}</h5>
                            <span class="date-text">on {{ makePrettyDate(session.date._d) }}</span>
                            <p class="response-text" v-if="session.responses.response.text">
                                {{ session.responses.response.text }}
                            </p>
                            <p class="response-text" v-else-if="session.responses.response.choice">
                                {{ session.responses.response.choice }}
                            </p>
                            <p class="response-text" v-else-if="session.activity.content.assignments[parseInt(session.responses.response.assignment)] == undefined">
                                (Click the button below to review more information.)
                            </p>
                            <p class="response-text" v-else-if="session.responses.response.assignment !== undefined && session.activity.content.assignments[parseInt(session.responses.response.assignment)].resourceType == 'text'">
                                {{ session.activity.content.assignments[parseInt(session.responses.response.assignment)].resourceData }}
                            </p>
                            <p class="response-text" v-else-if="session.responses.response.assignment !== undefined">
                                <button @click="openExternal(session.activity.content.assignments[parseInt(session.responses.response.assignment)].resourceData)">
                                    link
                                </button>
                            </p>
                            <p class="response-text" v-else>
                                (Click the button below to review more information.)
                            </p>
                            <button @click="routeToActivitySession(session._id)">view session</button>
                        </section>
                    </div>
                </sequential-entrance>
            </section>
        </main>
        <transition name="fade">
      		<Modal v-if="modalOpen" v-on:trigger-close="closeModal('note')" :dismissable="true" size="large">
        		<template slot="content">
          			<NoteForm
						type="single"
						:student="student"
                        :noteToEdit="noteToEdit"
                        v-on:cancel-edit="closeModal('note')"
						v-on:trigger-modal-close="closeModal('note')"
					/>
        		</template>
      		</Modal>
    	</transition>
        <transition name="fade">
            <Modal v-if="alertModalOpen" v-on:trigger-close="stopDeletion" :dismissable="true" size="small">
                <template slot="content">
                    <img src="@/assets/alert.svg" alt="alert icon" class="alert-icon-large">
                    <div class="modal-body">
                        <h4>Are you sure you want to permanently delete this note?</h4>
                    </div>
                    <div class="modal-footer">
                        <button class="modal-footer-button" @click="stopDeletion">Cancel</button>
                        <button class="modal-footer-button red" @click="deleteNote">Delete Note</button>
                    </div>
                </template>
            </Modal>
        </transition>
        <TouchBar :show="!modalOpen && !alertModalOpen" :bar="[
            {type: 'spacer', size: 'flexible'},
            {type: 'button', label: '⭐️', method: function() {toggleSelected()}},
            {type: 'spacer', size: 'flexible'},
			{type: 'button', label: 'Toggle Trends', method: function() {toggleTrendScope()}},
            {type: 'button', label: 'Toggle Notes/Activities', method: function() {toggleRecordsDisplay()}},
            {type: 'spacer', size: 'flexible'},
			{type: 'button', label: '📝', method: function() {openModal('note')}}
	       ]" 
           :escapeItem="{type: 'button', label: 'Back', method: function() {routeBack()}}"
        />
    </div>
</template>

<script>
const shell = require('electron').shell

import db from '@/db'
import moment from 'moment'

moment.updateLocale("en", { week: {
  dow: 1, // First day of week is Monday
  doy: 6  // First week of year must contain 1 January (7 + 0 - 1)
}})

import TitleBar from '@/components/TitleBar.vue'
import SeatingDiagram from '@/components/SeatingDiagram.vue'
import AbbreviationCircle from '@/components/AbbreviationCircle.vue'
import Modal from '@/components/Modal.vue'
import NoteForm from '@/components/NoteForm.vue'
import TouchBar from '@/components/TouchBar.vue'

export default {
    name: 'Student',
    props: ['id'],
    components: {
        TitleBar,
        SeatingDiagram,
        AbbreviationCircle,
        Modal,
        NoteForm,
        TouchBar
    },
    data() {
        return {
            student: {
                _id: '',
                firstName: 'Student',
                lastName: 'T.',
                selected: false,
                highlight: '#ffffff',
                class: '',
                seat: {
                    row: 1,
                    column: 1
                }
            },
            classInfo: {
				name: 'Class',
				_id: null,
				semester: null,
				year: null,
				columns: null,
				rows: null,
                archived: null
			},
            notes: [
                {
					behavior: {
						Abbreviation: null,
						Description: null,
						Weight: null
					},
					student: null,
					type: null,
					dateNoted: {},
                    _id: '',
                    comment: null
				}
            ],
            activitySessions: [
                {
                    date: {},
                    activity: {},
                    responses: [{
                        respondent: null,
                        response: null
                    }],
                    chart: null,
                    _id: ''
                }
            ],
            trendScope: 'all',
            loaded: false,
            trendLoaded: false,
            modalOpen: false,
            alertModalOpen: false,
            noteToDelete: null,
            noteToEdit: undefined,
            selected: false,
            showActivities: false,
            activitiesLoaded: false
        }
    },
    computed: {
        earliestDateNoted() {
            if (this.$store.state.earliestDatesNoted[this.student.class] !== undefined) {
                return this.$store.state.earliestDatesNoted[this.student.class]
            } else {
                return ''
            }
        },
        calculationPreference() {
            return this.$store.state.preferences.calculation
        },
        weightValues() {
            return this.$store.state.preferences.weightValues
        },
        trend() {
            // start with average participation score
            let trendArr = [70]

            if (this.calculationPreference === 'balanced' || this.classInfo.archived == true) {
                // construct trend arr
                for (let i=0; i<this.notes.length; i++) {
                    let start = trendArr[i]

                    trendArr.push(this.findNextTrendValue(start, this.notes[i]))
                }

                // provide default trend line if no notes (requires two values)
                if (trendArr.length === 1) {
                    trendArr.push(70)
                }
            } else {
                // find start and end weeks
                let week = moment(this.earliestDateNoted._d).week()
                let endWeek = moment().week() + 1

                // loop through weeks
                for (let i=week; i<endWeek; i++) {
                    // search for notes in a given week
                    let notesThisWeek = []
                    for (let j=0; j<this.notes.length; j++) {
                        if (moment(this.notes[j].dateNoted._d).week() == i) {
                            notesThisWeek.push(this.notes[j])
                        }
                    }

                    let lastValue
                    if (notesThisWeek.length === 0) {
                        lastValue = trendArr[trendArr.length - 1]
                        // if 'no news', add 4 to participation score
                        trendArr.push(lastValue + parseInt(this.weightValues.medium))
                    } else {
                        for (let k=0; k<notesThisWeek.length; k++) {
                            lastValue = trendArr[trendArr.length - 1]
                            trendArr.push(this.findNextTrendValue(lastValue, notesThisWeek[k]))
                        }
                    }

                }

            }
            
            return trendArr
        },
        monthTrend() {
            // grab current month
            let thisMonth = moment().month()

            // filter out notes not created this month
            let notesThisMonth = []
            for (let i=0; i<this.notes.length; i++) {
                if (this.notes.length !== 0) {
                    if (moment(this.notes[i].dateNoted._d).month() === thisMonth) {
                        notesThisMonth.push(this.notes[i])
                    }
                }
            }

            // start with average participation score
            let trendArr = [70]

            // construct trend arr
            for (let i=0; i<notesThisMonth.length; i++) {
                let start = trendArr[i]

                trendArr.push(this.findNextTrendValue(start, notesThisMonth[i]))
            }

            return trendArr
        },
        originRoute() {
            // get the readable name of previous route to specify what 'back' means
            let previousRoute = this.$store.state.lastView

            let routeParts = previousRoute.split('/')

            return routeParts[1]
        }
    },
    methods: {
        openModal(type) {
            if (type == 'note') {
                this.modalOpen = true
            } else {
                this.alertModalOpen = true
            }
        },
        closeModal(type) {
            if (type == 'note') {
                this.modalOpen = false
                this.noteToEdit = undefined
            } else {
                this.alertModalOpen = false
            }

            let scope = this
            setTimeout(function() {
                scope.getNotes()
            }, 700, scope)
        },
        findNextTrendValue(start, note) {
            let adjustment
            if (note.type == 'positive') {
                switch (this.determineBehaviorWeight('positive', note.behavior.Description, note.behavior.Weight)) {
                    case ('low'):
                        adjustment = parseInt(this.weightValues.low)
                        break
                    case ('medium'):
                        adjustment = parseInt(this.weightValues.medium)
                        break
                    case  ('strong'):
                        adjustment = parseInt(this.weightValues.strong)
                        break
                }
            } else {
                switch (this.determineBehaviorWeight('negative', note.behavior.Description, note.behavior.Weight)) {
                    case ('low'):
                        adjustment = -Math.abs(parseInt(this.weightValues.low))
                        break
                    case ('medium'):
                        adjustment = -Math.abs(parseInt(this.weightValues.medium))
                        break
                    case  ('strong'):
                        adjustment = -Math.abs(parseInt(this.weightValues.strong))
                        break
                }
            }

            return start + adjustment
        },
        toggleTrendScope() {
            this.trendLoaded = false

            if (this.trendScope === 'all' && this.monthTrend.length > 1) {
                this.trendScope = 'month'
            } else {
                this.trendScope = 'all'
            }

            this.trendLoaded = true
            // ensure trend line is redrawn on toggle
            this.$forceUpdate()
        },
        getNotes() {
            db.sortThings('notes', {student: this.id}, {'dateNoted._d': -1})
                .then((results) => {
                    this.notes = results

                    this.loaded = true

                    // show page after all student data loaded
                    this.getEarliestDateNoted()

                    let scope = this
                    setTimeout(function() {
                        scope.getActivityRecords()
                    }, 1500, scope)
                })
        },
        getActivityRecords() {
            db.sortThings('activitySessions', {chart: this.student.class}, {'date._d': -1})
                .then((results) => {

                    if (results.length > 0) {
                        let studentResults = []

                        // filter out activity records that did not include the student
                        for (let i=0; i<results.length; i++) {
                            let result = results[i]


                            for (let j=0; j<result.responses.length; j++) {
                                let respondent = result.responses[j].respondent.id
                                
                                if (respondent == this.student._id) {
                                    let record = {...result}
                                    record.responses = result.responses[j]
                                    studentResults.push(record)
                                }
                            }
                        }

                        this.activitySessions = studentResults

                        this.activitiesLoaded = true
                    } 
                })
        },
        startEdit(note) {
            this.noteToEdit = note

            this.openModal('note')
        },
        promptDelete(noteID) {
            this.openModal('alert')

            this.noteToDelete = noteID
        },
        deleteNote() {
            db.deleteSomething('notes', {_id: this.noteToDelete})
                .then(() => {
                    this.closeModal('alert')
                })
        },
        stopDeletion() {
            this.noteToDelete = null

            this.closeModal('alert')
        },
        routeBack() {
            this.$router.go(-1)
        },
        toggleSelected() {
            db.updateSomething('students', {_id: this.id}, {
                $set: {
                    "selected": !this.student.selected
                }
            }).then(() => {
                this.selected = !this.selected
            })
        },
        makePrettyDate(dateObj) {
            return moment(dateObj).format('dddd, MMM D')
        },
        getEarliestDateNoted() {
            // find and set earliest date noted for the class if unavailable in store
            if (this.$store.state.earliestDatesNoted[this.student.class] == undefined && this.calculationPreference === 'nonews') {
                let earliestDateNoted = {}

                // get all notes from student's class and sort
                let classStudents = []
                let classNotes = []

                db.readSomething('students', {class: this.student.class})
                    .then(foundStudents => {
                        classStudents = foundStudents

                        // grab DB query promises
                        let promises = []

                        for (let i=0; i<classStudents.length; i++) {
                            promises.push(db.readSomething('notes', {student: classStudents[i]._id})
                                .then(foundNotes => {
                                    for (let k=0; k<foundNotes.length; k++) {
                                        classNotes.push(foundNotes[k])
                                    }

                                }))
                        }

                        // ensure promises are complete before determining earliest note for class
                        Promise.all(promises).then(() => {
                            let sortedNotes = classNotes.sort((a, b) => {
                                let dateA = a.dateNoted._d
                                let dateB = b.dateNoted._d

                                return dateA < dateB ? -1 : 1
                            })

                            if (sortedNotes.length > 0) {
                                earliestDateNoted = sortedNotes[0].dateNoted
                                this.$store.dispatch('getEarliestDatesNoted', {earliestDateNoted: earliestDateNoted, class: this.student.class})
                            }

                            // once found and set, show trend line
                            this.trendLoaded = true
                        })
                    })

            } else {
                this.trendLoaded = true
            }

        },
        changeStudents(nextStudent) {
            // redirect to next student
            this.$router.push(nextStudent)
        },
        determineBehaviorWeight(behaviorType, behaviorDescription, storedWeight) {
            // get latest behavior weight preference
            let weight = undefined
            let behaviors

            if (behaviorType == 'positive') {
                behaviors = this.$store.state.preferences.positiveBehaviors
            } else {
                behaviors = this.$store.state.preferences.negativeBehaviors
            }

            for (let i=0; i<behaviors.length; i++) {
                if (behaviors[i].Description == behaviorDescription) {
                    weight = behaviors[i].Weight
                    break
                }
            }

            // if the behavior does not exist in the system, used stored info
            if (weight == undefined) {
                return storedWeight
            } else {
                return weight
            }
        },
        toggleRecordsDisplay() {
            this.showActivities = !this.showActivities
        },
        routeToActivitySession(sessionId) {
            this.$router.push(`/session/${sessionId}`)
        },
        openExternal(url) {
            shell.openExternal(url)
        }
    },
    mounted() {
        if (this.$store.state.preferences.progress.indexOf('viewed a student page') === -1) {
            this.$store.dispatch('setPreferences', {
                progress: ['created class', 'rearranged seats', 'viewed class chart', 'viewed a student page']
            })
        }
    },
    created() {
        // grab student information from DB
        db.readSomething('students', {_id: this.id})
            .then((results) => {
                this.student = results[0]
                this.selected = results[0].selected
                // check for English name to display
                if (this.student.firstName.indexOf('(') !== -1) {
                    this.student.firstName = this.student.firstName.split('(')[1].split(')')[0].split(' ')[0]
                } else {
                    this.student.firstName = this.student.firstName.split(' ')[0]
                }

                db.readSomething('classes', {_id: this.student.class})
                    .then((results) => {
                        this.classInfo = results[0]

                        this.getNotes()
                    })

            })
    }
}
</script>

<style scoped>
@keyframes spin {
    from {transform: rotate(0);}
    to {transform: rotate(360deg);}
}

#studentContainer {
    background: var(--black);
    width: 100%;
    height: 100%;
    display: grid;
    grid-template-columns: 25% 1fr;
    grid-template-rows: auto;
    grid-template-areas: "leftPanel main";
    -webkit-user-select: none;
    -webkit-app-region: drag;
}

.no-overflow {
    overflow: hidden!important;
}

button {
    background: none;
    outline: none;
    border: none;
    cursor: pointer;
}

#backArea {
    margin-top: 7%;
    margin-bottom: 15px;
}

.back-button {
	font-family: "ArchivoNarrow";
	color: var(--black);
	font-size: 14px;
    margin-left: 5px;
}

.back-button > img {
	vertical-align: middle;
	padding-bottom: 2px;
}

#leftPanel {
    grid-area: leftPanel;
    color: var(--white);
    background: var(--black);
    text-align: center;
    top: 90px;
    height: 100%;
    position: fixed;
    width: 25%;
}

main {
    grid-area: main;
    background: var(--light-gray);
    padding: 0 10%;
    min-height: 100vh;
    height: 100%;
}

.trend {
    padding-bottom: 10px;
    border-bottom: 2px solid var(--black);
    margin: 0 auto;
    display: block;
}

#trendLoading {
    height: 245px;
    width: 245px;
    margin: 0 auto;
    border-radius: 245px;
    border-top: 5px solid var(--yellow);
    border-right: 5px solid var(--light-gray);
    border-bottom: 5px solid var(--light-gray);
    border-left: 5px solid var(--light-gray);
    animation-name: spin;
    animation-duration: 1s;
    animation-iteration-count: infinite;
    animation-timing-function: ease-in-out;
}

#trendAdjustArea {
    margin: 10px auto;
}

.trend-adjust {
    width: 50%;
    font-size: 1em;
}

.selected {
    color: var(--red);
    cursor: auto;
}

.trend-adjust:first-child {
    text-align: left;
}

.trend-adjust:nth-child(2) {
    text-align: right;
}

#tigerArea {
    margin-top: 15px;
}

#tigerArea > h5 {
    display: inline-block;
    color: var(--yellow);
    font-size: 18px;
}

#tigerLogo {
    width: 24px;
    vertical-align: middle;
    margin-right: 10px;
}

#highlightArea {
    margin-top: 50px;
}

#highlightArea > h6 {
    display: inline-block;
    margin-right: 10px;
}

#highlightArea > div {
    width: 17px;
    height: 17px;
    display: inline-block;
    vertical-align: middle;
}

#selectArea {
    margin-top: 40px;
}

#selectArea > button > img {
    width: 30px;
}

#addNoteArea {
    height: 80px;
}

#addNoteButton {
    font-family: "ArchivoNarrow";
    font-size: 3em;
}

#noteArea {
    margin: 50px auto 50px auto;
    text-align: center;
}

.note-card {
    display: inline-block;
    width: 320px;
    height: 200px;
    margin: 40px 5%;
    padding-bottom: 10px;
    border-radius: 10px;
    box-shadow: 1px 2px 1px 2px var(--gray);
}

.note-header {
    margin-top: -25px;
}

.note-body {
    padding: 10px;
}

.note-body > h5 {
    text-align: center;
    margin-bottom: 3px;
}

.note-body > p {
    font-weight: 100;
    background: var(--white);
    padding: 5px 12px;
    border-radius: 3px;
    height: 70px;
    overflow: auto;
    margin: 15px 0 10px 0;
    text-align: left;
}

.delete-button {
    float: right;
    margin-right: 10px;
    margin-top: 2px;
}

.delete-button > img {
    height: 19px;
    vertical-align: middle;
}

.edit-button {
    float: left;
    margin-left: 10px;
    margin-top: 2px;
    filter: drop-shadow(1px 1px 0px var(--gray));
}

.edit-button > img {
    height: 19px;
    vertical-align: middle;
}

.center {
    text-align: center!important;
}

.yellow-card {
    border: 3px solid var(--yellow);
}

.red-card {
    border: 3px solid var(--red);
}

.note-header {
    text-align: center;
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

.yellow {
    background: var(--yellow);
}

.red {
    background: var(--red)!important;
    color: var(--white)!important;
}

.alert-icon-large {
	vertical-align: middle;
	width: 50px;
	margin-top: 30px;
	display: block;
	margin-left: auto;
	margin-right: auto;
}

#switchArea {
    text-align: center;
    margin: 75px auto;
}

.switch {
    height: 27px;
    width: 55px;
    border-radius: 27px;
    text-align: left;
    border: 1px solid var(--black);
    transition: all .1s ease-in;
    margin: 0 15px;
    vertical-align: middle;
}

.switch > img {
    height: 25px;
    vertical-align: middle;
}

.off {
    background: var(--gray);
    padding-left: 0;
}

.on {
    background: var(--yellow);
    padding-left: 30px;
}

.survey {
    background-image: linear-gradient(rgba(255, 255, 255, .9)), url('~@/assets/survey-illustration.svg');
    background-repeat: no-repeat;
    background-size: cover;
    background-position: left;
}

.response-pool {
    background-image: linear-gradient(rgba(255, 255, 255, .7)), url('~@/assets/response-pool-illustration.svg');
    background-repeat: no-repeat;
    background-size: cover;
    background-position: left;
}

.information-gap {
    background-image: linear-gradient(rgba(255, 255, 255, .7)), url('~@/assets/information-gap-illustration.svg');
    background-repeat: no-repeat;
    background-size: cover;
    background-position: left;
}

#activityArea {
    margin: 50px auto 50px auto;
    text-align: center;
}

.activity-card {
    display: inline-grid;
    width: 320px;
    height: 200px;
    margin: 40px 5%;
    border-radius: 10px;
    box-shadow: 1px 2px 1px 2px var(--gray);
    align-items: center;
    padding: 10px;
}

.activity-body > h5 {
    text-align: center;
    margin: 5px auto;
}

.activity-body > button {
    display: block;
    padding: 5px 10px;
    background: var(--yellow);
    box-shadow: 1px 1px 5px 1px var(--gray);
    color: var(--black);
    font-size: 18px;
    border-radius: 5px;
    cursor: pointer;
    outline: none;
    margin: 25px auto;
}

.activity-body > p {
    font-weight: 100;
    background: var(--white);
    padding: 5px 12px;
    border-radius: 3px;
    height: 60px;
    overflow: auto;
    margin: 15px 0 10px 0;
    text-align: left;
    box-shadow: 1px 1px 5px 1px var(--light-gray);
}

.response-text > button {
    font-size: 18px;
}

.fade-enter-active, .fade-leave-active {
	transition: opacity .2s;
}

.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
	opacity: 0;
}
</style>
