<template>
	<div id="sessionContainer">
        <transition name="fade">
            <aside id="leftPanel">
                <h1>
                	{{ session.activity.name }}
                </h1>
                <TitleBar v-if="session.chart !== 'anonymous' && loaded" :classID="session.chart" :compact="true" :link="true" />
                <div id="illustrationArea" v-if="loaded">
                	<img v-if="session.activity.activityType == 'survey'" src="@/assets/survey-illustration.svg" alt="survey illustration">
                	<img v-else src="@/assets/response-pool-illustration.svg" alt="response pool illustration">
                </div>
                <h5>
                	{{ makePrettyDate(session.date._d) }}
                </h5>
                <h6 id="responses" v-if="session.responses.length > 1">
                	{{ session.responses.length }} responses
                </h6>
            </aside>
        </transition>
        <main>
            <header>
                <section id="backArea">
        			<button class="back-button" @click="routeBack"><img class="back-arrow" src="@/assets/backarrow.svg" alt="back arrow"> back</button>
        		</section>
                <!-- aggregate -->
            </header>
            <section v-if="loaded">
                <sequential-entrance fromTop delay="20">
                    <!-- responses -->
                </sequential-entrance>
            </section>
        </main>
        <!-- <TouchBar :show="!modalOpen && !alertModalOpen" :bar="[
            {type: 'spacer', size: 'flexible'},
            {type: 'button', label: '⭐️', method: function() {toggleSelected()}},
            {type: 'spacer', size: 'flexible'},
			{type: 'button', label: 'Toggle Trends', method: function() {toggleTrendScope()}},
            {type: 'spacer', size: 'flexible'},
			{type: 'button', label: '📝', method: function() {openModal('note')}}
	       ]" 
           :escapeItem="{type: 'button', label: 'Back', method: function() {routeBack()}}"
        /> -->
    </div>
</template>

<script>
import db from '@/db.js'
import moment from 'moment'

moment.updateLocale("en", { week: {
  dow: 1, // First day of week is Monday
  doy: 6  // First week of year must contain 1 January (7 + 0 - 1)
}})

import TitleBar from '@/components/TitleBar.vue'
import TouchBar from '@/components/TouchBar.vue'

export default {
	name: 'SessionExplorer',
	props: {
		id: String
	},
	components: {
		TitleBar,
		TouchBar
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
     		loaded: false
		}
	},
	computed: {
		
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

#responses {
	color: var(--yellow);
}

main {
    grid-area: main;
    background: var(--light-gray);
    padding: 0 10%;
    min-height: 100vh;
    height: 100%;
}

button {
    background: none;
    outline: none;
    border: none;
    cursor: pointer;
}

.fade-enter-active, .fade-leave-active {
	transition: opacity .2s;
}

.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
	opacity: 0;
}
</style>
