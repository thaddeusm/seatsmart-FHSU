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
				<div class="activity-button-area" v-for="(activity, index) in activities" >
					<ButtonCard 
						:text="activity.name" 
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
		</main>
		<transition name="fade">
            <Modal v-if="modalOpen" v-on:trigger-close="modalOpen = false" :dismissable="false" size="large">
                <template slot="content">
                    <ActivityAdapter 
                    	:activity="launchedActivity"
                    	:allowAnonymous="true"
                    	v-on:trigger-modal-close="modalOpen = false"
                    />
                </template>
            </Modal>
        </transition>
		<transition name="fade">
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
        </transition>
		<TouchBar 
			:bar="[
				{type: 'spacer', size: 'flexible'},
                {type: 'button', label: 'New Activity', method: function() {$router.push('/activity/new')}},
                {type: 'spacer', size: 'flexible'}
			]"
			:show="true" 
            :escapeItem="{type: 'button', label: 'back', method: function() {routeBack()}}"
        />
	</div>
</template>

<script>
import db from '@/db.js'

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
			}
		}
	},
	methods: {
        routeBack() {
            let lastView = this.$store.state.lastView

            this.$router.push(lastView)
        },
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
        	this.modalOpen = true
        }
	},
	mounted() {
		this.getActivities()
	}
}
</script>

<style scoped>
#container {
    background: var(--black);
    width: 100%;
    height: 100%;
	z-index: 1;
}

header {
	display: grid;
	grid-template-rows: 20% 20% 1fr;
    grid-template-columns: 5% 18% 1fr 18% 5%;
    grid-template-areas: 
        ". . . . ."
        ". back . . ."
        "icon icon icon icon icon";
	height: 250px;
	align-items: center;
    justify-content: center;
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
    margin-top: 94px;
    margin-bottom: 100px;
}

#existingActivities {
	margin: 50px 0 20px 0;
}

.activity-button-area {
    display: inline-block;
    margin: 20px 0;
}

.activity-button-area > * {
    margin: 0 40px;
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

.fade-enter-active, .fade-leave-active {
    transition: opacity .2s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
    opacity: 0;
}
</style>
