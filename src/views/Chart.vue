<template>
	<div id="chartContainer">
		<header id="chartHeader">
			<TitleBar :title="classInfo.name" />
		</header>
		<main id="chartMain">
			<section v-if="!inverted" class="row" v-for="(row, index) in classInfo.rows" :style="rowMargins" :key="`row${index}`">
				<div v-for="(column, subIndex) in classInfo.columns" class="column" :style="cardStyle">
					<NameCard :type="cardType" :row="index + 1" :column="subIndex + 1" :classId="classInfo._id" v-on:open-note-modal="openNoteModal" :chosen="chosenSeat.row == index + 1 && chosenSeat.column == subIndex + 1" />
				</div>
			</section>
			<section v-if="inverted" class="row" v-for="(row, index) in classInfo.rows" :style="rowMargins" :key="`invertedRow${index}`">
				<div v-for="(column, subIndex) in classInfo.columns" class="column" :style="cardStyle">
					<NameCard :type="cardType" :row="classInfo.rows - index" :column="classInfo.columns - subIndex" :classId="classInfo._id" v-on:open-note-modal="openNoteModal" :chosen="chosenSeat.row == index + 1 && chosenSeat.column == subIndex + 1" />
				</div>
			</section>
		</main>
		<footer id="chartFooter">
			<ActionBar background="var(--gray)" :hamburger="true" v-on:expand="calculateCardSize('large')" v-on:contract="calculateCardSize('small')" :collapsed="inverted">
		        <template slot="left">
		        	<router-link to="/"><img src="@/assets/home.svg" alt="home icon"></router-link>
		        </template>
		        <template slot="center">
		        	<button @click="setLastView(`/chart/${id}`)" class="action-button"><img src="@/assets/editwhite.svg" alt="edit icon"></button>
		        	<router-link :to="`/chart/rearrange/${id}`" class="action-button"><img src="@/assets/rearrange.svg" alt="rearrange icon"></router-link>
		        	<button @dblclick="clearRandom" @click="selectRandom" class="action-button"><img src="@/assets/random.svg" alt="select random student icon"></button>
		        	<button @click="toggleCardStyle" class="action-button"><img src="@/assets/changecard.svg" alt="change card style icon"></button>
		        	<button @click="showTrends" class="action-button">
		        		<img v-if="!showingTrends" src="@/assets/trendicon.svg" alt="show participation trends icon">
		        		<img v-else src="@/assets/trendiconyellow.svg" alt="show participation trends icon">
		        	</button>
					<button @click="invertChart" class="action-button">
						<img src="@/assets/present.svg" alt="present icon" v-if="!inverted">
						<img src="@/assets/presentyellow.svg" alt="present icon" v-else>
					</button>
		        	<router-link :to="`/chart/bulknote/${id}`" class="action-button"><img src="@/assets/groupnote.svg" alt="group note icon"></router-link>
		        </template>
		        <template slot="right">
		        	<button @click="openModal"><img src="@/assets/cog.svg" alt="settings icon"></button>
		    	</template>
		    </ActionBar>
		</footer>
		<transition name="fade">
      		<Modal v-if="noteModalOpen" v-on:trigger-close="noteModalOpen = false" :dismissable="true" size="large">
        		<template slot="content">
          			<NoteForm type="single" :student="newNoteStudent" v-on:trigger-modal-close="noteModalOpen = false" />
        		</template>
      		</Modal>
    	</transition>
		<transition name="fade">
      		<Modal v-if="modalOpen" v-on:trigger-close="modalOpen = false" :dismissable="false" size="large">
        		<template slot="content">
          			<Settings v-on:trigger-modal-close="modalOpen = false"/>
        		</template>
      		</Modal>
    	</transition>
	</div>
</template>

<script>
import db from '@/db.js'
import moment from 'moment'
const { remote } = require('electron')

import TitleBar from '@/components/TitleBar.vue'
import NameCard from '@/components/NameCard.vue'
import ActionBar from '@/components/ActionBar.vue'
import Modal from '@/components/Modal.vue'
import Settings from '@/components/Settings.vue'
import NoteForm from '@/components/NoteForm.vue'

export default {
	name: 'Chart',
	props: ['id'],
	components: {
		TitleBar,
		NameCard,
		ActionBar,
		Modal,
		Settings,
		NoteForm
	},
	data() {
		return {
			classInfo: {
				name: null,
				_id: null,
				semester: null,
				year: null,
				columns: null,
				rows: null
			},
			cardStyle: {
				width: '',
				height: '',
				marginLeft: '',
				marginRight: ''
			},
			rowMargins: {
				marginTop: '',
				marginBottom: ''
			},
			modalOpen: false,
			noteModalOpen: false,
			newNoteStudent: {
				firstName: null,
				lastName: null,
				tigerID: null,
				_id: null,
				class: null,
				selected: null,
				seat: {
					row: null,
					column: null
				}
			},
			randomStudent: 0,
			chosenSeat: {
				column: null,
				row: null
			},
			students: [
				{
					_id: null,
					seat: {
						row: null,
						column: null
					},
					class: null,
					selected: null,
					tigerID: null,
					firstName: null,
					lastName: null
				}
			],
			cardType: 'complex',
			showingTrends: false,
			inverted: false
		}
	},
	methods: {
		calculateCardSize(size) {
			// determine ideal card dimensions
			let totalWidth = remote.getGlobal('screenWidth')
			let totalHeight = remote.getGlobal('screenHeight')
			let heightAdjusted

			if (size == 'small') {
				heightAdjusted = totalHeight * .78
			} else {
				heightAdjusted = totalHeight * .88
			}

			let totalCardWidth = totalWidth / this.classInfo.columns
			let totalCardHeight = heightAdjusted / this.classInfo.rows

			let ratio = totalCardWidth / totalCardHeight
			// enforce consistent dimensions
			if (ratio > 1.2) {
				totalCardWidth = totalCardHeight * 1.2
			} else if (ratio < 1.2) {
				totalCardHeight = totalCardWidth * .835
			}


			let totalPossibleVerticalSpace = totalCardHeight * this.classInfo.rows
			let totalUsedVerticalSpace = totalPossibleVerticalSpace * .7
			let remainingVerticalSpace = heightAdjusted - totalUsedVerticalSpace
			let gaps = this.classInfo.rows + 2
			let verticalMargin = remainingVerticalSpace / gaps
			this.cardStyle.width = `${totalCardWidth * .9}px`
			this.cardStyle.marginRight = `${totalCardWidth * .05}px`
			this.cardStyle.marginLeft = `${totalCardWidth * .05}px`
			this.cardStyle.height = `${totalCardHeight * .7}px`
			this.rowMargins.marginTop = `${verticalMargin}px`
			this.rowMargins.marginBottom = `${verticalMargin}px`
		},
		openModal() {
      		this.modalOpen = true
    	},
    	openNoteModal(student) {
    		this.noteModalOpen = true
    		this.newNoteStudent = student
    	},
    	setLastView(lastView) {
    		this.$store.dispatch('setLastView', lastView)
    		this.$router.push(`/chart/edit/${this.id}`)
    	},
    	selectRandom() {
    		let student = this.students[this.randomStudent]
    		this.chosenSeat.row = student.seat.row
    		this.chosenSeat.column = student.seat.column
    		this.randomStudent++
    		if (this.randomStudent == this.students.length) {
    			this.randomStudent = 0
    		}
    	},
    	clearRandom() {
    		this.chosenSeat.row = null
    		this.chosenSeat.column = null
    	},
    	toggleCardStyle() {
    		if (this.cardType === 'complex') {
    			this.cardType = 'simple'
    		} else {
    			this.cardType = 'complex'
    		}
    	},
    	showTrends() {
    		this.showingTrends = !this.showingTrends

    		if (this.showingTrends) {
    			this.cardType = 'trends'
    		} else {
    			this.cardType = 'complex'
    		}
    	},
		invertChart() {
			this.inverted = !this.inverted
			if (this.inverted) {
				this.cardType = 'simple'
			} else {
				this.cardType = 'complex'
			}

		},
    	shuffle(arr) {
    		var j, x, i;
		    for (i = arr.length - 1; i > 0; i--) {
		        j = Math.floor(Math.random() * (i + 1));
		        x = arr[i];
		        arr[i] = arr[j];
		        arr[j] = x;
		    }

		    return arr
    	}
	},
	created() {
		db.readSomething('classes', {_id: this.id})
			.then((classInfo) => {
				this.classInfo = classInfo[0]

				this.calculateCardSize('small')

				db.readSomething('students', {class: this.id})
					.then((students) => {
						this.students = this.shuffle(students)
					})
			})
	}
}
</script>

<style scoped>
#chartContainer {
	background: var(--black);
	width: 100vw;
	min-height: 100vh;
	height: 100%;
	display: grid;
	grid-template-rows: auto 1fr auto;
	grid-template-areas:
		"header"
		"main"
		"footer";
}

#chartHeader {
	grid-area: "header";
}

#chartMain {
	grid-area: "main";
	overflow: auto;
}

#chartFooter {
	grid-area: "footer";
}

.row {
	text-align: center;
	transition: all .3s ease;
}

.column {
	display: inline-block;
	vertical-align: middle;
}

button {
  background: none;
  outline: none;
  border: none;
  cursor: pointer;
}

.action-button {
	margin: 0 5%;
}

.fade-enter-active, .fade-leave-active {
	transition: opacity .2s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
	opacity: 0;
}
</style>
