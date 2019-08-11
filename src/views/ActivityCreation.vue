<template>
	<div id="container">
		<header>
			<h1 ref="pageHeader" v-if="id == undefined">New Activity</h1>
			<h1 ref="pageHeader" v-else>Edit Activity (...)</h1>
		</header>
		<section id="activityChoice">
			<button class="activity-button" @click="chooseActivity('survey')" :class="[activityChoice == 'survey' ? 'selected' : '']">
				<img src="@/assets/survey-illustration.svg" alt="survey illustration">
				 <h5>survey</h5>
			</button>
		</section>
		<section id="border"></section>
		<section id="activityForm">
			<section id="errorArea">
				<h6><img v-if="alertMessage.length > 0" src="@/assets/alert.svg" alt="alert icon" class="alert-icon-small"> {{ alertMessage }}</h6>
			</section>
			<section id="formOne" v-if="progress == 1">
				<div class="form-container">
					<h3>Options</h3>
					<div class="input-wrapper">
						
					</div>
				</div>
				<section class="progress-button-area">
					<button class="progress-button" @click="routeBack"><img class="back-icon" src="@/assets/backarrowwhite.svg" alt="back icon"></button>
					<button class="progress-button" @click="changeProgress(2)">add class info</button>
				</section>
			</section>
		</section>
		<section id="progressNodes">
			<ProgressNodes :steps="steps" :progress="progress" />
		</section>
	</div>
</template>

<script>
import ProgressNodes from '@/components/ProgressNodes.vue'

export default {
	name: 'ActivityCreation',
	components: {
		ProgressNodes
	},
	props: ['id'],
	data() {
		return {
			mode: 'new',
			progress: 1,
			steps: 3,
			alertMessage: 'Testing errors',
			activityChoice: 'survey'
		}
	},
	methods: {
		chooseActivity(activity) {
			this.activityChoice = activity
		},
		routeBack() {

		},
		changeProgress(step) {

		}
	}
}
</script>

<style scoped>
#container {
	background: var(--light-gray);
	width: 100%;
	height: 100%;
	display: grid;
	grid-template-rows: 20vh 65vh 15vh;
	grid-template-columns: 50% auto 50%;
	grid-template-areas:
	'head head head'
	'activityChoice border activityForm'
	'. . .';
	align-items: center;
}

header {
	grid-area: head;
	text-align: center;
	/*align-self: center;*/
	margin-top: 70px;
	margin-bottom: 40px;
}

h1 {
	margin-bottom: 15px;
}

button {
	background: none;
    outline: none;
    border: none;
    cursor: pointer;
}

#border {
	height: 100%;
	width: 2px;
	background: var(--dark-gray);
	grid-area: border;
}

#activityChoice {
	grid-area: activityChoice;
	text-align: center;
}

.activity-button {
	padding: 5px 15px;
	border-radius: 5px;
	box-shadow: 1px 2px 1px 2px var(--gray);
}

.activity-button:active {
	box-shadow: none;
}

.activity-button > img {
	width: 150px;
	margin-bottom: 5px;
}

#activityForm {
	grid-area: activityForm;
	justify-self: center;
	align-self: center;
	margin: 0 auto;
	text-align: center;
}

#formOne {
	width: 350px;
	margin-left: auto;
	margin-right: auto;
}

.progress-button-area {
	text-align: center;
	padding: 20px 0 0 0;
}

.progress-button {
	padding: 10px 15px;
	background: var(--gray);
	color: var(--white);
	font-size: 20px;
	border-radius: 10px;
	cursor: pointer;
	outline: none;
}

.progress-button:nth-child(2) {
	margin-left: 10px;
}

.back-icon {
	width: 15px;
}

#progressNodes {
	position: fixed;
	bottom: 0;
	width: 100%;
	background: var(--light-gray);
}

.selected {
	border: 2px solid var(--black);
}

#errorArea {
	height: 15px;
	text-align: center;
	margin-bottom: 15px;
}

#errorArea > h6 {
	color: var(--red);
	display: inline-block;
}

.alert-icon-small {
	vertical-align: middle;
	width: 20px;
	margin-bottom: 3px;
	margin-right: 5px;
}
</style>
