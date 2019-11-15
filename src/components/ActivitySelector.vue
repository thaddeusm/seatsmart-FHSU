<template>
	<div class="container">
		<h1 v-if="activities.length > 0">Select an Activity</h1>
		<h1 v-else>Create an Activity</h1>
		<section id="existingActivities">
			<div class="activity-button-area" v-for="(activity, index) in activities" >
				<ButtonCard 
					:text="abbreviatedName(activity.name)" 
					:button="true"
					:display="true"
					:simple="true"
					:key="`activity${index}`" 
					:onClick="setActivityChoice"
					:index="index"
	                :class="[activity.activityType.split(' ').join('-'), activityChoice == activity ? 'selected':'']"
				/>
			</div>
			<div class="activity-button-area">
				<ButtonCard icon="+" text="activity" to="/activity/new"/>
			</div>
			<h2>
				Previous Activity Sessions
			</h2>
			<div class="activity-button-area" v-for="(session, index) in activitySessions" v-if="activitySessions[0].chart">
				<ButtonCard 
	                :text="`${abbreviatedName(session.activity.name)} (${session.responses.length})`" 
	                :button="true"
	                :display="true"
	                :simple="true"
	                :key="`session${index}`" 
	                :onClick="routeToActivitySession"
	                :index="index"
	                :class="[session.activity.activityType.split(' ').join('-')]"
	                v-if="session.activity !== undefined"
	            />
	            <div class="session-info-area">
                    <h6>
                        {{ makePrettyDate(session.date._d) }}
                    </h6>
                </div>
        	</div>
		</section>
		<section id="footer">
			<button 
				class="action-button cancel-button" 
				@click="cancelActivity"
			>
				Cancel
			</button>
			<button 
				class="action-button launch-button"
				@click="launchActivity"
				:disabled="activityChoice == null"
			>
				Launch Activity
			</button>
		</section>
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

export default {
	name: 'ActivitySelector',
	props: {
		chart: String
	},
	components: {
		ButtonCard
	},
	data() {
		return {
			activities: [],
			activityChoice: null,
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
            ]
		}
	},
	methods: {
		getActivities() {
        	db.readSomething('activities', {})
                .then((results) => {
                    this.activities = results.sort((a, b) => {
                        let dateA = a.dateCreated._d
                        let dateB = b.dateCreated._d

                        return dateA < dateB ? -1 : 1
                    })

                    this.getActivitySessions()
                })
        },
        getActivitySessions() {
        	db.readSomething('activitySessions', {chart: this.chart})
                .then((results) => {
                    this.activitySessions = results.sort((a, b) => {
                        let dateA = a.date._d
                        let dateB = b.date._d

                        return dateA < dateB ? 1 : -1
                    })

                    console.log(this.activitySessions)
                })
        },
        setActivityChoice(activityIndex) {
        	this.activityChoice = this.activities[activityIndex]
        },
        launchActivity() {
        	this.$emit('set-activity-choice', this.activityChoice)
        },
        cancelActivity() {
        	this.$emit('cancel-activity')
        },
        abbreviatedName(name) {
            if (name.length > 15) {
                return name.slice(0, 15) + '...'
            } else {
            	return name
            }
        },
        routeToActivitySession(index) {
        	let id = this.activitySessions[index]._id

            this.$router.push(`/session/${id}`)
        },
        makePrettyDate(dateObj) {
            return moment(dateObj).format('dddd, MMM D')
        }
	},
	mounted() {
		this.getActivities()
	}
}
</script>

<style scoped>
.container {
	background: var(--black);
	height: 100%;
	width: 100%;
	display: grid;
	grid-template-rows: 15% auto 15%;
	align-items: center;
	justify-content: center;
}

h1 {
	text-align: center;
	color: var(--light-gray);
}

#existingActivities {
	margin: 20px auto;
	text-align: center;
	overflow: auto;
	max-height: 350px;
}

.activity-button-area {
    display: inline-block;
    margin: 20px 0;
    text-align: center;
}

.activity-button-area > * {
    margin: 0 40px;
}

.actions-wrapper {
	text-align: center;
}

.action-button {
	font-size: 16px;
	padding: 5px 12px;
	border-radius: 5px;
	cursor: pointer;
	box-shadow: 0px 0px 1px var(--black);
	outline: none;
	margin: 0 5px;
}

.action-button:disabled {
	cursor: not-allowed;
}

.launch-button {
	background: var(--yellow);
	color: var(--black);
}

.cancel-button {
	background: var(--light-gray);
	color: var(--black);
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

#footer {
	text-align: center;
}

.selected {
	border: 3px solid var(--yellow);
}

.session-info-area {
    margin: 10px 40px;
}

h6 {
    color: var(--yellow);
}
</style>
