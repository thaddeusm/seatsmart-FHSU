<template>
	<div id="noteFormContainer" :class="[type !== 'single' ? 'contain-self' : '']">
		<section id="noteFormHeader">
			<h1 v-if="type === 'single'">New Note about {{student.firstName}}</h1>
			<h1 v-else>New Bulk Note</h1>
		</section>
		<section id="noteFormBody">
			<section id="noteStepOne" v-if="step == 1">
				<div class="behaviors">
					<button class="positive" v-for="(behavior, index) in positiveBehaviors" :key="index" @click="setBehavior('positive', index)" :class="[note.behavior.Description === behavior.Description ? 'selected' : '']">{{ behavior.Description }}</button>
				</div>
				<div class="behaviors">
					<button class="negative" v-for="(behavior, index) in negativeBehaviors" :key="index" @click="setBehavior('negative', index)" :class="[note.behavior.Description === behavior.Description ? 'selected' : '']">{{ behavior.Description }}</button>
				</div>
			</section>
			<section id="noteStepTwo" v-if="step == 2">
				<AbbreviationCircle size="large" :color="note.type === 'positive' ? 'yellow' : 'red'" :behavior="note.behavior" />
				<textarea v-model="note.comment" placeholder="Your note (optional)..."></textarea>
			</section>
		</section>
		<section id="noteFormFooter">
			<button class="footer-button white" v-if="type == 'single'" @click="$emit('trigger-modal-close')">Cancel</button>
			<router-link class="footer-button white" v-else :to="to">Cancel</router-link>
			<button v-if="step == 1" @click="step = 2" class="footer-button positive" ref="nextButton" :disabled="note.behavior.Abbreviation == null">Next</button>
			<button v-else-if="step == 2 && type !== 'single'" @click="saveNote" class="footer-button positive" :disabled="type !== 'single' && students.length == 0">Save</button>
			<button v-else-if="step == 2 && type == 'single'" @click="saveNote" class="footer-button positive">Save</button>
		</section>
	</div>
</template>

<script>
import db from '@/db.js'
import moment from 'moment'

import AbbreviationCircle from '@/components/AbbreviationCircle.vue'

export default {
	name: 'NoteForm',
	props: ['type', 'student', 'students', 'to'],
	components: {
		AbbreviationCircle
	},
	data() {
		return {
			note: {
				behavior: {
					Abbreviation: null,
					Description: null,
					Weight: null
				},
				student: null,
				dateNoted: {},
				comment: null,
				type: null,
				comment: null
			},
			step: 1
		}
	},
	computed: {
		positiveBehaviors() {
			return this.$store.state.preferences.positiveBehaviors
		},
		negativeBehaviors() {
			return this.$store.state.preferences.negativeBehaviors
		}
	},
	watch: {
		students: function() {
			// if (this.students.length > 0) {
			// 	this.$refs.saveButton.disabled = false
			// }
		}
	},
	methods: {
		setBehavior(type, index) {
			this.note.behavior = this[`${type}Behaviors`][index]
			this.note.type = type
		},
		saveNote() {
			this.note.dateNoted = moment()

			if (this.type == 'single') {
				if (this.note.type === 'negative' && this.note.behavior.Abbreviation === 'A') {
					if (moment(this.note.dateNoted._d).dayOfYear() === moment().dayOfYear()) {
						this.$emit('absence', this.note.student)
					}
				}

				db.createSomething('notes', this.note)
					.then(() => {
						this.$store.dispatch('setLastUpdatedStudent', this.student._id)
						this.$emit('trigger-modal-close')
					})
			} else {
				let studentIndex = 0

				for (let i=0; i<this.students.length; i++) {
					this.note.student = this.students[studentIndex]

					if (this.note.type === 'negative' && this.note.behavior.Abbreviation === 'A') {
						if (moment(this.note.dateNoted._d).dayOfYear() === moment().dayOfYear()) {
							this.$emit('absence', this.note.student)
						}
					}

					db.createSomething('notes', this.note)
						.then(() => {
							this.$store.dispatch('setLastUpdatedStudent', this.students[studentIndex])
						})
					studentIndex++
				}

				this.$router.push(this.to)
			}
		}
	},
	mounted() {
		if (this.type == 'single') {
			this.note.student = this.student._id
		}
	}
}
</script>

<style scoped>
#noteFormContainer {
	display: grid;
	width: 100%;
	height: 100%;
	grid-template-rows: 15% 1fr 15%;
	grid-template-columns: 1fr;
	grid-template-areas:
		"header"
		"body"
		"footer";
	align-items: center;
	text-align: center;
}

.contain-self {
	background: var(--light-gray);
	border-radius: 10px;
	padding-bottom: 3%;
	height: 600px!important;
	margin: 0 auto;
}

#noteFormHeader {
	grid-area: header;
	border-bottom: 1px solid var(--black);
}

#noteFormHeader > h1 {
	margin: 3% 0;
}

#noteFormBody {
	grid-area: body;
	overflow: auto;
}

#noteStepOne {
	height: 420px;
	overflow: auto;
}

.behaviors {
	display: inline-block;
	width: 50%;
	height: 100%;
	text-align: center;
	vertical-align: top;
}

.behaviors > button {
	box-shadow: 0px 0px 2px var(--black);
	width: 300px;
	display: block;
	font-size: 1.4em;
	padding: 10px;
	outline: none;
	cursor: pointer;
	border-radius: 10px;
	margin: 10% auto;
}

.positive {
	background: var(--yellow);
}

.negative {
	background: var(--red);
	color: var(--white);
}

.selected {
	border: 1px solid var(--black);
}

#noteStepTwo {

}

#noteFormFooter {
	grid-area: footer;
}

.footer-button {
	padding: 5px 10px;
	font-size: 18px;
	border-radius: 5px;
	cursor: pointer;
	border: 1px solid var(--gray);
	margin-top: 20px;
  	margin-left: 10px;
  	margin-right: 10px;
  	outline: none;
}

.footer-button:disabled {
	background: var(--light-gray);
	opacity: .6;
	cursor: not-allowed;
}

.white {
	background: var(--white);
}

textarea {
	width: 500px;
	height: 200px;
	margin-top: 35px;
	border-radius: 10px;
	border: 1px solid var(--gray);
	padding: 15px;
	font-size: 1.3em;
	outline: none;
}

a {
	text-decoration: none;
	color: var(--black);
}
</style>
