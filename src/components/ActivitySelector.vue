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

import ButtonCard from '@/components/ButtonCard.vue'

export default {
	name: 'ActivitySelector',
	components: {
		ButtonCard
	},
	data() {
		return {
			activities: [],
			activityChoice: null
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

                })
        },
        setActivityChoice(activityIndex) {
        	this.activityChoice = this.activities[activityIndex]
        	console.log(this.activityChoice)
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

#footer {
	text-align: center;
}

.selected {
	border: 3px solid var(--yellow);
}
</style>
