<template>
    <div id="studentContainer" :class="[modalOpen ? 'no-overflow' : '']">
        <aside id="leftPanel">
            <h1>{{ student.firstName }} {{ student.lastName }}</h1>
            <div id="tigerArea">
                <img src="@/assets/tiger.png" id="tigerLogo" alt="FHSU tiger logo">
                <h5>{{ student.tigerID }}</h5>
            </div>
            <TitleBar v-if="loaded" :title="classInfo.name" :compact="true" />
            <SeatingDiagram :compact="true" :inverted="true" :rows="classInfo.rows" :columns="classInfo.columns" :selected="`${this.student.seat.row},${this.student.seat.column}`" />
        </aside>
        <main>
            <header>
                <section id="backArea">
        			<button class="back-button" @click="routeBack"><img class="back-arrow" src="@/assets/backarrow.svg" alt="back arrow"> back</button>
        		</section>
                <trend
                    v-if="loaded"
                    :data="trendScope === 'all' ? trend : monthTrend"
                    :gradient="['var(--red)', 'orange', 'var(--yellow)']"
                    class="trend"
                    :auto-draw="true"
                    :autoDrawDuration="3000"
                    :smooth="true"
                    :key="trendScope"
                >
                </trend>
                <section id="trendAdjustArea">
                    <button :class="[trendScope === 'all' ? 'selected' : '', 'trend-adjust']" @click="toggleTrendScope">all time</button>
                    <button v-if="monthTrend.length > 1" :class="[trendScope === 'month' ? 'selected' : '', 'trend-adjust']" @click="toggleTrendScope">this month</button>
                </section>
            </header>
            <section id="noteArea" v-if="loaded">
                <h2 v-if="this.notes.length == 0">Add a Note</h2>
                <h2 v-else>Notes</h2>
                <div id="addNoteArea">
                    <button @click="openModal('note')" id="addNoteButton">+</button>
                </div>
                <div v-for="(note, index) in invertedNotes" :key="`note${index}`" :class="[note.type === 'positive' ? 'yellow-card' : 'red-card', 'note-card']">
                    <section class="note-header">
                        <AbbreviationCircle :behavior="note.behavior" size="medium" :color="note.type === 'positive' ? 'yellow' : 'red'"/>
                    </section>
                    <section class="note-body">
                        <h5>{{ note.behavior.Description }}</h5>
                        <span class="date-text">on {{ note.dateNoted.formatted }}</span>
                        <p v-if="note.comment == '' || note.comment == null" class="center">- no comment -</p>
                        <p v-else>{{ note.comment }}</p>
                        <button @click="promptDelete(note._id)" class="delete-button"><img src="@/assets/delete.svg" alt="delete icon"></button>
                    </section>
                </div>
            </section>
        </main>
        <transition name="fade">
      		<Modal v-if="modalOpen" v-on:trigger-close="closeModal('note')" :dismissable="true" size="large">
        		<template slot="content">
          			<NoteForm
						type="single"
						:student="student"
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
                        <button class="modal-footer-button yellow" @click="deleteNote">Yes</button>
                        <button class="modal-footer-button" @click="stopDeletion">Cancel</button>
                    </div>
                </template>
            </Modal>
        </transition>
        <TouchBar :show="!modalOpen && !alertModalOpen" :bar="[
            {type: 'button', label: 'Back', method: function() {$router.push(`/chart/${classInfo._id}`)}},
            {type: 'spacer', size: 'flexible'},
			{type: 'button', label: 'Toggle Trends', method: function() {toggleTrendScope()}},
            {type: 'spacer', size: 'flexible'},
			{type: 'button', label: '➕', method: function() {modalOpen = true}}
	    ]"/>
    </div>
</template>

<script>
import db from '@/db'
import moment from 'moment'

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
                firstName: '',
                lastName: '',
                selected: false,
                class: '',
                seat: {
                    row: 0,
                    column: 0
                }
            },
            classInfo: {
				name: null,
				_id: null,
				semester: null,
				year: null,
				columns: null,
				rows: null
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
            trendScope: 'all',
            loaded: false,
            modalOpen: false,
            alertModalOpen: false,
            noteToDelete: null
        }
    },
    computed: {
        earliestDateNoted() {
            return this.$store.state.earliestDateNoted
        },
        calculationPreference() {
            return this.$store.state.preferences.calculation
        },
        trend() {
            // start with average participation score
            let trendArr = [70]

            if (this.calculationPreference === 'balanced') {
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
                        trendArr.push(lastValue + 4)
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

            if (this.calculationPreference === 'balanced') {
                // construct trend arr
                for (let i=0; i<notesThisMonth.length; i++) {
                    let start = trendArr[i]

                    trendArr.push(this.findNextTrendValue(start, notesThisMonth[i]))
                }
            } else {
                // find start and end weeks
                let earliestWeek = moment(this.earliestDateNoted._d).week()
                let firstWeekOfMonth = moment(moment().startOf('month')).week()
                let endWeek = moment().week() + 1

                // determine ideal starting week
                let startWeek
                if (earliestWeek < firstWeekOfMonth) {
                    startWeek = firstWeekOfMonth
                } else if (earliestWeek == firstWeekOfMonth) {
                    startWeek = firstWeekOfMonth
                } else {
                    startWeek = earliestWeek
                }

                // loop through weeks
                for (let i=startWeek; i<endWeek; i++) {
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
                        trendArr.push(lastValue + 4)
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
        invertedNotes() {
            let arr = []

            for (let i=this.notes.length - 1; i > -1; i--) {
                arr.push(this.notes[i])
            }

            return arr
        }
    },
    methods: {
        openModal(type) {
            document.body.scrollTop = document.documentElement.scrollTop = 0;

            if (type == 'note') {
                this.modalOpen = true
            } else {
                this.alertModalOpen = true
            }

            document.body.style.overflow = 'hidden'
        },
        closeModal(type) {
            if (type == 'note') {
                this.modalOpen = false
            } else {
                this.alertModalOpen = false
            }
            document.body.style.overflow = 'auto'
            let scope = this
            setTimeout(function() {
                scope.getNotes()
            }, 700, scope)
        },
        findNextTrendValue(start, note) {
            let adjustment
            if (note.type == 'positive') {
                switch (note.behavior.Weight) {
                    case ('low'):
                        adjustment = 2
                        break
                    case ('medium'):
                        adjustment = 4
                        break
                    case  ('strong'):
                        adjustment = 8
                        break
                }
            } else {
                switch (note.behavior.Weight) {
                    case ('low'):
                        adjustment = -2
                        break
                    case ('medium'):
                        adjustment = -4
                        break
                    case  ('strong'):
                        adjustment = -8
                        break
                }
            }

            return start + adjustment
        },
        toggleTrendScope() {
            if (this.trendScope === 'all') {
                this.trendScope = 'month'
            } else {
                this.trendScope = 'all'
            }
            this.$forceUpdate()
        },
        getNotes() {
            db.readSomething('notes', {student: this.id})
                .then((results) => {
                    this.notes = results.sort((a, b) => {
                        let dateA = a.dateNoted._d
                        let dateB = b.dateNoted._d

                        return dateA < dateB ? -1 : 1
                    })

                    for (let i=0; i<this.notes.length; i++) {
                        let thisDate = this.notes[i].dateNoted._d

                        let newDate = moment(thisDate).format('dddd, MMM D')

                        this.notes[i].dateNoted.formatted = newDate
                    }

                    this.loaded = true
                })
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
            let lastView = this.$store.state.lastView

            this.$router.push(lastView)
        }
    },
    mounted() {
        if (this.$store.state.preferences.progress.indexOf('viewed a student page') === -1) {
            this.$store.dispatch('setPreferences', {
                progress: ['created class', 'rearranged seats', 'viewed class chart', 'viewed a student page'],
                calculation: this.$store.state.preferences.calculation,
                positiveBehaviors: this.$store.state.preferences.positiveBehaviors,
                negativeBehaviors: this.$store.state.preferences.negativeBehaviors
            })
        }
    },
    created() {
        db.readSomething('students', {_id: this.id})
            .then((results) => {
                this.student = results[0]

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
#studentContainer {
    background: var(--black);
    width: 100%;
    height: 100%;
    display: grid;
    grid-template-columns: 25% 1fr;
    grid-template-rows: auto;
    grid-template-areas: "leftPanel main";
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

#addNoteArea {
    margin: 10px 0 30px 0;
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
    height: 180px;
    margin: 40px 5%;
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
    border-radius: 5px;
    height: 50px;
    overflow: auto;
    margin: 10px 0 7px 0;
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

.alert-icon-large {
	vertical-align: middle;
	width: 50px;
	margin-top: 30px;
	display: block;
	margin-left: auto;
	margin-right: auto;
}

.fade-enter-active, .fade-leave-active {
	transition: opacity .2s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
	opacity: 0;
}
</style>
