<template>
	<div id="sessionContainer">
        <transition name="fade">
            <aside id="leftPanel">
                <h1>
                	{{ session.activity.name }}
                </h1>
                <TitleBar v-if="session.chart !== 'anonymous' && loaded && chartExists" :classID="session.chart" :compact="true" :link="true" />
                <div id="illustrationArea" v-if="loaded">
                	<img v-if="session.activity.activityType == 'survey'" src="@/assets/survey-illustration.svg" alt="survey illustration">
                	<img v-else-if="session.activity.activityType == 'response pool'" src="@/assets/response-pool-illustration.svg" alt="response pool illustration">
                    <img v-else src="@/assets/information-gap-illustration.svg" alt="information gap illustration">
                </div>
                <h5>
                	{{ makePrettyDate(session.date._d) }}
                </h5>
                <h6 id="responses" v-if="session.responses.length > 1">
                	{{ session.responses.length }} responses
                </h6>
                <button 
                    v-if="loaded && session.chart !== 'anonymous' && session.activity.activityType == 'response pool' && !displayRespondents"
                    class="options-button"
                    @click="toggleRespondentsDisplay" 
                >
                    show respondents
                </button>
                <button 
                    v-if="loaded && session.chart !== 'anonymous' && session.activity.activityType == 'response pool' && displayRespondents"
                    class="options-button"
                    @click="toggleRespondentsDisplay" 
                >
                    hide respondents
                </button>
                <button 
                    v-if="loaded && session.activity.activityType == 'response pool'"
                  class="options-button"
                    @click="startExport" 
                    :disabled="exporting"
                >
                    export responses
                </button>
                <button id="deleteSessionButton" @click="alertModalOpen = true">
                    <img src="@/assets/delete.svg" alt="delete icon">
                </button>
            </aside>
        </transition>
        <main>
            <header>
                <section id="backArea">
        			<button class="back-button" @click="routeBack"><img class="back-arrow" src="@/assets/backarrow.svg" alt="back arrow"> back</button>
        		</section>
            </header>
            <section v-if="loaded && session.activity.activityType == 'response pool' && !responsesMissing" class="response-pool">
                <h3 class="prompt">
                    {{ session.activity.content.prompt }}
                </h3>
                <h2>Responses</h2>
                <ul v-if="session.responses.length > 0" id="responsePoolList">
                    <li v-for="(response, index) in session.responses" v-if="response.response.text" :key="`response${index}`">
                        <h4>{{ response.response.text }}</h4>
                        <h5 v-if="response.respondent !== 'anonymous' && displayRespondents"><router-link :to="`/student/${response.respondent.id}`">
                            {{ response.respondent.firstName }} 
                            {{ response.respondent.lastName }}
                        </router-link></h5>
                    </li>
                </ul>
            </section>
            <section v-else-if="responsesMissing" class="response-pool">
                <img src="@/assets/database-bug.svg" alt="error icon" id="errorIcon">
                <div class="personal-note">
                    <img class="profile-image" src="@/assets/thaddeus.png" alt="sketched image of Thaddeus">
                    <div class="text-bubble">
                        <p>
                            Due to a bug at the beginning of the Fall 2019 semester, some activity records were not correctly stored in the database.  Otherwise, you might have ended an activity before responses were received.
                        </p>
                        <p>
                            If you think you have found a different problem, please <button class="email-link" @click="openEmail">contact me</button>.
                        </p>
                    </div>
                </div>
            </section>
            <section v-else-if="loaded && session.activity.activityType == 'survey'">
                <div class="survey" v-if="session.responses.length > 0">
                    <vc-donut
                        background="black" foreground="black"
                        :size="250" unit="px" :thickness="20"
                        has-legend legend-placement="bottom"
                        :sections="donutSections" :total="session.responses.length"
                    >
                        <h5 v-if="session.responses.length == 1">1 response</h5>
                        <h5 v-else>{{ session.responses.length }} responses</h5>
                    </vc-donut>
                </div>
                <div id="responseArea">
                    <h2>
                        Individual Responses
                    </h2>
                    <sequential-entrance fromTop delay="20">
                        <div 
                            v-for="(response, index) in session.responses" 
                            :key="`response${index}`"
                            class="response-card"
                        >
                            <section 
                                class="response-header"
                            >
                                <div 
                                    class="circle" 
                                    v-if="response.response.choice"
                                    :style="{background: findSpectrumColor(response.response.choice)}"
                                >
                                </div>
                                <div 
                                    v-else
                                    class="circle" 
                                    :style="{background: '#000000'}"
                                >
                                </div>
                            </section>
                            <section class="response-body">
                                <h5><router-link :to="`/student/${response.respondent.id}`">
                                    {{ response.respondent.firstName }} 
                                    {{ response.respondent.lastName }}
                                </router-link></h5>
                                <p v-if="response.response.choice">
                                    {{ response.response.choice }}
                                </p>
                                <p v-else>
                                    (did not complete)
                                </p>
                            </section>
                        </div>
                    </sequential-entrance>
                </div>
            </section>
            <section v-else-if="loaded && session.activity.activityType == 'information gap'">
                <div class="survey" v-if="session.responses.length > 0">
                    <vc-donut
                        background="black" foreground="black"
                        :size="250" unit="px" :thickness="20"
                        :sections="assignmentDonutSections" :total="session.responses.length"
                    >
                        <h5 v-if="session.responses.length == 1">1 item assigned</h5>
                        <h5 v-else>{{ session.responses.length }} items assigned</h5>
                    </vc-donut>
                </div>
                <div id="responseArea">
                    <h2>
                        Content Assignments
                    </h2>
                    <sequential-entrance fromTop delay="20">
                        <div 
                            v-for="(response, index) in session.responses" 
                            :key="`response${index}`"
                            class="response-card"
                        >
                            <section 
                                class="response-header"
                            >
                                <div 
                                    class="circle"
                                    v-if="response.response.hasOwnProperty('assignment')" 
                                    :style="{background: findSpectrumColor(response.response.assignment)}">
                                </div>
                                <div 
                                    v-else
                                    class="circle" 
                                    :style="{background: '#000000'}"
                                >
                                </div>
                            </section>
                            <section class="response-body">
                                <h5><router-link :to="`/student/${response.respondent.id}`">
                                    {{ response.respondent.firstName }} 
                                    {{ response.respondent.lastName }}
                                </router-link></h5>
                                <p v-if="session.activity.content.assignments[parseInt(response.response.assignment)] && session.activity.content.assignments[parseInt(response.response.assignment)].resourceType == 'text'">
                                    {{ session.activity.content.assignments[parseInt(response.response.assignment)].resourceData }}
                                </p>
                                <p v-else-if="session.activity.content.assignments[parseInt(response.response.assignment)]">
                                    <button 
                                        @click="openExternal(session.activity.content.assignments[parseInt(response.response.assignment)].resourceData)"
                                    >
                                        link
                                    </button>
                                </p>
                            </section>
                        </div>
                    </sequential-entrance>
                </div>
            </section>
        </main>
        <Modal v-if="alertModalOpen" v-on:trigger-close="alertModalOpen = false" :dismissable="true" size="small">
            <template slot="content">
                <img src="@/assets/alert.svg" alt="alert icon" class="alert-icon-large">
                <div class="modal-body">
                    <h4>Are you sure you want to permanently delete the records from this activity session?</h4>
                </div>
                <div class="modal-footer">
                    <button class="modal-footer-button" @click="alertModalOpen = false">Cancel</button>
                    <button class="modal-footer-button red" @click="deleteSession">Delete Session</button>
                </div>
            </template>
        </Modal>
        <TouchBar :show="true" :bar="[
                {type: 'spacer', size: 'flexible'},
                {type: 'button', label: 'Delete Session', method: function() {alertModalOpen = true}},
                {type: 'spacer', size: 'flexible'},
        ]" 
           :escapeItem="{type: 'button', label: 'Back', method: function() {routeBack()}}"
        />
    </div>
</template>

<script>
const shell = require('electron').shell
const { dialog } = require('electron').remote

import fs from 'fs'

import db from '@/db.js'
import moment from 'moment'

moment.updateLocale("en", { week: {
  dow: 1, // First day of week is Monday
  doy: 6  // First week of year must contain 1 January (7 + 0 - 1)
}})

import TitleBar from '@/components/TitleBar.vue'
import TouchBar from '@/components/TouchBar.vue'
import Modal from '@/components/Modal.vue'

export default {
	name: 'SessionExplorer',
	props: {
		id: String
	},
	components: {
		TitleBar,
		TouchBar,
        Modal
	},
	data() {
		return {
			session: {
                date: {},
                activity: {},
                responses: [{
                    respondent: '',
                    response: ''
                }],
                chart: ''
            },
     		loaded: false,
            donutSectionColorSpectrum: [
                '#FCBB04',
                '#E5E5E5',
                '#D2360A',
                '#6C6C6C',
                '#B28402',
                '#FFFFFF',
                '#832206',
                '#FDCD48',
                '#F66239'
            ],
            exporting: false,
            displayRespondents: false,
            alertModalOpen: false
		}
	},
	computed: {
		chartExists() {
            let chart = this.allCharts[this.session.chart]

            if (chart !== undefined) {
                return true
            } else {
                return false
            }
        },
        allCharts() {
            return this.$store.state.allClasses
        },
        responsesMissing() {
            if (this.session.activity.activityType == 'response pool') {
                let missing = true

                for (let i=0; i<this.session.responses.length; i++) {
                    if (this.session.responses[i].response.text !== undefined) {
                        missing = false
                        break
                    }
                }

                return missing
            }

            return false
        },
        donutSections() {
            let responses = this.session.responses

            let sections = []

            // format survey choices into sections per donut chart API
            if (this.session.activity.activityType == 'survey') {
                for (let i=0; i<this.session.activity.content.choices.length; i++) {
                    let obj = {
                        value: 0,
                        label: this.session.activity.content.choices[i],
                        color: this.donutSectionColorSpectrum[i]
                    }

                    sections.push(obj)
                }

                // increment section values based upon participant responses
                for (let j=0; j<responses.length; j++) {
                    for (let k=0; k<sections.length; k++) {
                        if (sections[k].label == responses[j].response.choice) {
                            sections[k].value++
                            break
                        }
                    }
                }
            }

            return sections
        },
        assignmentDonutSections() {
            let responses = this.session.responses
            let sections = []

            let spectrumIndex = 0

            // format survey choices into sections per donut chart API
            if (this.session.activity.activityType == 'information gap') {
                for (let i=0; i<this.session.activity.content.assignments.length; i++) {
                    if (spectrumIndex == this.donutSectionColorSpectrum.length) {
                        spectrumIndex = 0
                    }

                    let obj = {
                        value: 0,
                        label: `${this.session.activity.content.assignments[i].resourceData}`,
                        color: this.donutSectionColorSpectrum[spectrumIndex]
                    }

                    sections.push(obj)

                    spectrumIndex++
                }

                // increment section values based upon participant responses
                for (let j=0; j<responses.length; j++) {
                    for (let k=0; k<sections.length; k++) {

                        if (this.session.activity.content.assignments[parseInt(responses[j].response.assignment)]) {
                            if (sections[k].label == `${this.session.activity.content.assignments[parseInt(responses[j].response.assignment)].resourceData}`) {
                                sections[k].value++
                                break
                            }
                        }
                    }
                }
            }

            return sections
        }
	},
	methods: {
		getSessionInfo() {
			db.readSomething('activitySessions', {_id: this.id})
                .then((results) => {
                    this.session = results[0]
                    this.loaded = true

                    console.log(this.session)
                })
		},
		routeBack() {
            this.$router.go(-1)
        },
        makePrettyDate(dateObj) {
            return moment(dateObj).format('dddd, MMM D')
        },
        findSpectrumColor(choice) {
            let index

            if (this.session.activity.activityType == 'survey') {
                index = this.session.activity.content.choices.indexOf(choice)
            } else {
                if (choice > this.donutSectionColorSpectrum.length) {
                    index = choice % 9
                } else {
                    index = choice
                    console.log(choice)
                }
            }
            return this.donutSectionColorSpectrum[index]
        },
        openEmail() {
            shell.openExternal('mailto:tbmccleary@fhsu.edu?subject=Seatsmart')
        },
        startExport() {
            this.exporting = true
            let responseString = ''

            for (let i=0; i<this.session.responses.length; i++) {
                let text = this.session.responses[i].response.text.split('\n').join()

                responseString += `${text.trimEnd()} \n`
            }

            let defaultFilename = this.session.activity.name

            // once ready, use native save dialog
            let options = {
                title: "Save Exported Responses",
                defaultPath: defaultFilename,
                buttonLabel: "Save",
                filters :[
                    {name: 'txt', extensions: ['txt']}
                ]
            }

            this.exportMessage = `${defaultFilename} is ready for export.`

            dialog.showSaveDialog(options, (filename) => {
                this.fileSavePath = filename

                // handle cancelation
                if (filename !== undefined) {
                    fs.writeFileSync(filename, responseString, 'utf-8', this.resetExport())
                } else {
                    this.resetExport()
                }
            })
        },
        resetExport() {
            this.exporting = false
        },
        deleteSession() {
            db.deleteSomething('activitySessions', {_id: this.id})
                .then(() => {
                    this.$router.go(-1)
                })
        },
        openExternal(url) {
            shell.openExternal(url)
        },
        toggleRespondentsDisplay() {
            this.displayRespondents = !this.displayRespondents
        }
	},
	mounted() {
		this.getSessionInfo()
	}
}
</script>

<style scoped>
@keyframes spin {
    from {transform: rotate(0);}
    to {transform: rotate(360deg);}
}

#sessionContainer {
    background: var(--black);
    width: 100%;
    height: 100%;
    display: grid;
    grid-template-columns: 25% 1fr;
    grid-template-rows: auto;
    grid-template-areas: "leftPanel main";
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

#illustrationArea {
	background: var(--light-gray);
	margin: 20px 0;
}

.options-button {
    padding: 5px 10px;
    background: var(--yellow);
    color: var(--black);
    font-size: 16px;
    border-radius: 5px;
    cursor: pointer;
    outline: none;
    display: block;
    margin: 50px auto 10px auto;
}

.options-button:disabled {
    background: var(--light-gray);
    opacity: .6;
    cursor: not-allowed;
}

#deleteSessionButton {
    display: block;
    margin: 70px auto 10px auto;
}

#deleteSessionButton > img {
    width: 20px;
}

#responses {
	margin: 10px 0;
    color: var(--yellow);
}

main {
    grid-area: main;
    background: var(--light-gray);
    padding: 0 10%;
    min-height: 100vh;
    height: 100%;
}

#responseArea {
    margin: 50px auto 50px auto;
    text-align: center;
}

#responseArea > h2 {
    margin-bottom: 50px;
}

.response-pool {
    margin-top: 50px;
}

.response-pool > h3 {
    text-align: center;
    margin-bottom: 30px;
}

.survey {
    background: var(--black);
    color: var(--white);
    padding: 40px 0;
    border-radius: 5px;
}

button {
    background: none;
    outline: none;
    border: none;
    cursor: pointer;
}

ul {
    list-style: none;
}

li {
    margin: 50px auto;
}

#responsePoolList > li > h4 {
    background: var(--gray);
    color: var(--white);
    padding: 10px;
}

#responsePoolList > li > h5 {
    text-align: right;
    margin-top: 10px;
}

#individualizedResponses {
    text-align: center;
}

#individualizedResponses > li {
    display: inline-block;
    width: 200px;
    height: 150px;
    display: inline-grid;
    align-items: center;
    justify-content: center;
}

.hide-button {
    background: none;
    cursor: pointer;
    outline: none;
    border: none;
    display: block;
}

.hide-button > img {
    height: 20px;
    vertical-align: middle;
}

.show-all-button {
    display: block;
    font-size: 16px;
    padding: 5px 12px;
    border-radius: 5px;
    cursor: pointer;
    box-shadow: 0px 0px 1px var(--black);
    outline: none;
    background: var(--yellow);
    color: var(--black);
    margin: 10px auto;
}

.response-card {
    display: inline-block;
    width: 320px;
    margin: 40px 5%;
    padding-bottom: 10px;
    border-radius: 10px;
    box-shadow: 1px 2px 1px 2px var(--gray);
}

.response-header {
    margin-top: -25px;
    text-align: center;
}

.circle {
    display: inline-grid;
    justify-content: center;
    align-items: center;
    width: 35px;
    height: 35px;
    font-size: 22px;
    line-height: 22px;
    border-radius: 35px;
    margin: 0 3%;
    box-shadow: 0px 0px 5px var(--gray);
}

.response-body {
    padding: 10px;
}

.response-body > h5 {
    text-align: center;
    margin-bottom: 3px;
}

.response-body > p {
    font-weight: 100;
    background: var(--white);
    padding: 5px 12px;
    border-radius: 3px;
    margin: 15px 0 10px 0;
    text-align: left;
    word-wrap: break-word;
}

.response-body > p > button {
    font-size: 18px;
}

#errorIcon {
    display: block;
    width: 5em;
    margin: 50px auto;
}

p {
    margin: 10px 0;
}

.personal-note {
    display: grid;
    grid-template-rows: auto 1fr;
    grid-template-areas: "profile textBubble";
    margin: 30px 0;
}

.profile-image {
    grid-area: profile;
    width: 100px;
    margin-right: 10px;
    border-radius: 100px;
    background: var(--white);
    box-shadow: 0px 0px 5px var(--black);
}

.text-bubble {
    grid-area: textBubble;
    padding: 5px 15px;
    background: var(--dark-gray);
    color: var(--light-gray);
    border-radius: 5px;
}

.email-link {
    color: var(--yellow);
    font-size: 18px;
}

a {
    text-decoration: none;
    color: var(--black);
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

.red {
    background: var(--red)!important;
    color: var(--white)!important;
}

.prompt {
    background: var(--white);
    padding: 50px;
    margin-bottom: 75px;
}

h2 {
    text-align: center;
}

.fade-enter-active, .fade-leave-active {
	transition: opacity .2s;
}

.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
	opacity: 0;
}
</style>
