<template>
	<div id="container">
		<header>
			<div id="backArea">
				<button id="backButton" @click="$router.push('/')"><img src="@/assets/backarrowwhite.svg" alt="back arrow"> <img src="@/assets/home.svg" alt="home icon"></button>
			</div>
			<div id="iconArea">
				<img src="@/assets/activities-circle.svg" alt="activities icon" id="icon">
			</div>
		</header>
		<main>
			<ButtonCard icon="+" text="activity" to="/activity/new"/>
			<section id="existingActivities">
				<div class="activity-button-area" v-for="(activity, index) in activities">
					<ButtonCard 
						:text="abbreviatedName(activity.name)" 
						:button="true"
						:display="true"
						:simple="true"
						:key="`activity${index}`" 
						:onClick="launchActivity"
						:index="index"
                        :class="[activity.activityType.split(' ').join('-')]"
					/>
					<div class="modify-button-area">
	                    <button @click="editActivity(activity._id)" class="modify-activity-button"><img src="@/assets/edit.svg" alt="edit icon"></button>
	                    <button @click="promptDeleteActivity(activity._id, activity.name)" class="modify-activity-button"><img src="@/assets/delete.svg" alt="delete icon"></button>
	                </div>
				</div>
			</section>
            <section id="activitySessions">
                <h2>
                    Explore {{ sessionScope }} Activity Sessions
                </h2>
                <div class="loader" v-if="sessionSorting"></div>
                <div v-else-if="activitySessions.length == 0">
                    <h4 id="notFound">
                        No sessions to display.
                    </h4>
                </div>
                <div v-else class="activity-button-area" v-for="(session, index) in activitySessions">
                    <ButtonCard 
                        :text="`${abbreviatedName(session.activity.name)} (${session.responses.length})`" 
                        :button="true"
                        :display="true"
                        :simple="true"
                        :key="`session${index}`" 
                        :onClick="launchActivitySessionExplorer"
                        :index="index"
                        :class="[session.activity.activityType.split(' ').join('-')]"
                        v-if="session.activity !== undefined"
                    />
                    <div class="session-info-area">
                        <h6 v-if="session.chart !== 'anonymous'">
                            {{ abbreviatedName(getChart(session.chart)) }}<br>
                            {{ makePrettyDate(session.date._d) }}
                        </h6>
                        <h6 v-else>
                            (anonymous group)<br>
                            {{ makePrettyDate(session.date._d) }}
                        </h6>
                    </div>
                </div>
                <div id="loadMoreArea" v-if="!allSessionsDisplayed && !sessionSorting">
                    <button v-if="sessionScope !== 'Month'" @click="loadMonthActivitySessions">load sessions this month</button>
                    <button v-else-if="sessionScope !== 'Week'" @click="loadWeekActivitySessions">load sessions this week</button>
                    <button @click="loadAllActivitySessions">load all</button>
                </div>
            </section>
		</main>
         <Modal v-if="modalOpen" v-on:trigger-close="closeModal" :dismissable="false" size="large">
        <template slot="content">
            <ActivityAdapter 
                :activity="launchedActivity"
                :allowAnonymous="true"
                v-on:trigger-modal-close="closeModal"
            />
        </template>
        </Modal>
        <Modal v-if="alertModalOpen" v-on:trigger-close="alertModalOpen = false" :dismissable="true" size="small">
            <template slot="content">
                <img src="@/assets/alert.svg" alt="alert icon" class="alert-icon-large">
                <div class="modal-body">
                    <h4>Are you sure you want to permanently delete {{ alertModalActivity }}?</h4>
                </div>
                <div class="modal-footer">
                    <button class="modal-footer-button" @click="alertModalOpen = false">Cancel</button>
                    <button class="modal-footer-button red" @click="deleteActivity(alertModalActivityID)">Delete Activity</button>
                </div>
            </template>
        </Modal>
        <TouchBar 
            :bar="[
                {type: 'spacer', size: 'flexible'},
                {type: 'button', label: 'New Activity', method: function() {$router.push('/activity/new')}},
                {type: 'spacer', size: 'flexible'},
                {type: 'button', label: 'Load All Sessions', method: function() {loadAllActivitySessions()}}
            ]"
            :show="!modalOpen && !alertModalOpen" 
            :escapeItem="{type: 'button', label: '🏠', method: function() {routeBack()}}"
        />
	</div> 
</template>

<script>
import db from '@/db.js'
import moment from 'moment'

moment.updateLocale("en", { week: {
  dow: 1, // First day of week is Monday
  doy: 6  // First week of year must contain 1 January (7 + 0 - 1)
}})

import ButtonCard from '@/components/ButtonCard.vue'
import Modal from '@/components/Modal.vue'
import ActivityAdapter from '@/components/ActivityAdapter.vue'
import TouchBar from '@/components/TouchBar.vue'

export default {
	name: 'Activities',
	components: {
		ButtonCard,
		Modal,
		ActivityAdapter,
		TouchBar
	},
	data() {
		return {
			activities: [{
				name: '',
				activityType: '',
				dateCreated: {_d: ''},
				content: {},
				options: {}
			}],
            activitySessions: [{
                date: {},
                activity: {},
                responses: [{
                    respondent: '',
                    response: ''
                }],
                chart: ''
            }],
			modalOpen: false,
            alertModalOpen: false,
            alertModalActivity: '',
            alertModalActivityID: '',
            launchedActivity: {
				name: '',
				activityType: '',
				dateCreated: {_d: ''},
				content: {},
				options: {}
			},
            sessionSorting: true,
            sessionScope: 'Week',
            allSessionsDisplayed: false
		}
	},
    computed: {
        allCharts() {
            return this.$store.state.allClasses
        }
    },
	methods: {
        openModal() {
            this.modalOpen = true
        },
        closeModal() {
            this.modalOpen = false
            this.reloadActivitySessions()
        },
        routeBack() {
            let lastView = this.$store.state.lastView

            this.$router.push(lastView)
        },
        loadAllActivitySessions() {
            this.sessionSorting = true
            this.activitySessions = [{
                date: {},
                activity: {},
                responses: [{
                    respondent: '',
                    response: ''
                }],
                chart: ''
            }]

            db.sortThings('activitySessions', {}, {'date._d': -1})
                .then((results) => {
                    this.activitySessions = results

                    this.sessionSorting = false
                    this.allSessionsDisplayed = true
                    this.sessionScope = 'All'
                    window.scrollTo(0, 0)
                })
        },
        loadMonthActivitySessions() {
            this.sessionSorting = true
            this.activitySessions = [{
                date: {},
                activity: {},
                responses: [{
                    respondent: '',
                    response: ''
                }],
                chart: ''
            }]

            let thisMonth = moment().month()

            db.sortThings('activitySessions', {}, {'date._d': -1})
                .then((results) => {
                    this.activitySessions = results.filter((session) => {
                        if (moment(session.date._d).month() == thisMonth) {
                            return session
                        }
                    })

                    this.sessionSorting = false
                    this.sessionScope = 'Month'
                    window.scrollTo(0, 0)
                })
        },
        loadWeekActivitySessions() {
            this.sessionSorting = true
            this.activitySessions = [{
                date: {},
                activity: {},
                responses: [{
                    respondent: '',
                    response: ''
                }],
                chart: ''
            }]

            let thisWeek = moment().week()

            db.sortThings('activitySessions', {}, {'date._d': -1})
                .then((results) => {
                    this.activitySessions = results.filter((session) => {
                        if (moment(session.date._d).week() == thisWeek) {
                            return session
                        }
                    })

                    this.sessionSorting = false
                    this.sessionScope = 'Week'
                    window.scrollTo(0, 0)
                })
        },
        reloadActivitySessions() {
            this.allSessionsDisplayed = false
            this.loadWeekActivitySessions()
        },
        getActivities() {
        	db.readSomething('activities', {}, {'dateCreated._d': -1})
                .then((results) => {
                    this.activities = results
                })
        },
        editActivity(id) {
            this.$router.push(`/activity/edit/${id}`)
        },
        promptDeleteActivity(id, name) {
        	document.body.scrollTop = document.documentElement.scrollTop = 0;

            this.alertModalActivity = name
            this.alertModalOpen = true
            this.alertModalActivityID = id
        },
        deleteActivity(id) {
        	db.deleteSomething('activities', {_id: id})
                .then((num) => {
                    this.alertModalOpen = false
                    this.alertModalClass = ''
                    this.alertModalClassID = ''

                    this.getActivities()
                })
        },
        launchActivity(index) {
        	this.launchedActivity = this.activities[index]
        	this.openModal()
        },
        launchActivitySessionExplorer(index) {
            this.$router.push(`/session/${this.activitySessions[index]._id}`)
        },
        makePrettyDate(dateObj) {
            return moment(dateObj).format('dddd, MMM D')
        },
        abbreviatedName(name) {
            if (name.length > 15) {
                return name.slice(0, 15) + '...'
            } else {
                return name
            }
        },
        getChart(id) {
            let chart = this.allCharts[id]

            if (chart !== undefined) {
                return chart.name
            } else {
                return '(unknown group)'
            }
        }
	},
	mounted() {
		window.scrollTo(0, 0)

        this.getActivities()
	},
    created() {
        let scope = this
        setTimeout(function() {
            scope.loadWeekActivitySessions()
        }, 1500, scope)
    }
}
</script>

<style scoped>
#container {
    background: var(--black);
    width: 100%;
    height: 100%;
	z-index: -1;
}

header {
	display: grid;
    z-index: 10;
	grid-template-rows: 20% 20% 1fr;
    grid-template-columns: 5% 18% 1fr 18% 5%;
    grid-template-areas: 
        ". . . . ."
        ". back . . ."
        "icon icon icon icon icon";
	height: 250px;
    width: 100%;
	align-items: center;
    justify-content: center;
    position: fixed;
    top: 0;
    background: var(--black);
}

h2 {
    color: var(--light-gray);
    margin-bottom: 20px;
}

#notFound {
    color: var(--light-gray);
}

h6 {
    color: var(--yellow);
}

#backArea {
	grid-area: back;
	font-size: 14px;
	align-self: center;
}

#backButton > img {
	width: 25px;
    margin: 0 10px;
    vertical-align: middle;
}

#iconArea {
	grid-area: icon;
	text-align: center;
}

#icon {
	width: 105px;
}

main {
    text-align: center;
    width: 100%;
    margin-top: 300px;
    margin-bottom: 100px;
}

#existingActivities {
	margin: 50px 0 20px 0;
}

#activitySessions {
    background: var(--black);
    padding: 20px 0;
    margin-top: 100px;
}

.activity-button-area {
    display: inline-block;
    margin: 20px 40px;
}

.session-info-area {
    margin: 10px 40px;
    width: 120px;
}

.modify-activity-button {
    color: var(--red);
    margin: 10px 40px;
}

.modify-activity-button > img {
    width: 20px;
}

button {
    background: none;
    outline: none;
    border: none;
    cursor: pointer;
}

#loadMoreArea {
    margin: 50px 0;
}

#loadMoreArea > button {
    padding: 5px 10px;
    background: var(--yellow);
    color: var(--black);
    font-size: 20px;
    border-radius: 5px;
    cursor: pointer;
    outline: none;
    display: block;
    margin: 30px auto;
}

.alert-icon-large {
	vertical-align: middle;
	width: 50px;
	margin-top: 30px;
	display: block;
	margin-left: auto;
	margin-right: auto;
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

.red {
    background: var(--red)!important;
    color: var(--white)!important;
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

.loader {
    height: 100px;
    width: 100px;
    margin: 20px auto;
    border-radius: 100px;
    border-top: 3px solid var(--light-gray);
    border-right: 3px solid var(--yellow);
    border-bottom: 3px solid var(--yellow);
    border-left: 3px solid var(--yellow);
    animation-name: spin;
    animation-duration: 1s;
    animation-iteration-count: infinite;
    animation-timing-function: ease-in-out;
}

@keyframes spin {
    from {transform: rotate(0);}
    to {transform: rotate(360deg);}
}
</style>
