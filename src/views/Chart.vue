<template>
	<div id="chartContainer">
		<header id="chartHeader">
			<TitleBar :title="classInfo.name" />
		</header>
		<main id="chartMain">
			<section class="row" v-for="(row, index) in classInfo.rows" :style="rowMargins">
				<div v-for="(column, subIndex) in classInfo.columns" class="column" :style="cardStyle">
					<NameCard type="simple" :row="index + 1" :column="subIndex + 1" :classId="classInfo._id" />
				</div>
			</section>
		</main>
		<footer id="chartFooter">
			<ActionBar background="var(--gray)" :hamburger="true" v-on:expand="calculateCardSize('large')" v-on:contract="calculateCardSize('small')">
		        <template slot="left">
		        	<router-link to="/"><img src="@/assets/home.svg" alt="home icon"></router-link>
		        </template>
		        <template slot="center">
		        	
		        </template>
		        <template slot="right">
		        	<button @click="openModal"><img src="@/assets/cog.svg" alt="settings icon"></button>
		    	</template>
		    </ActionBar>
		</footer>
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

export default {
	name: 'Chart',
	props: ['id'],
	components: {
		TitleBar,
		NameCard,
		ActionBar,
		Modal,
		Settings
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
			students: [
				{
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
					// notes: []
				}
			],
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
			modalOpen: false
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
			if (ratio > 1.5) {
				totalCardWidth = totalCardHeight * 1.5
			} else if (ratio < 1.5) {
				totalCardHeight = totalCardWidth * .67
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
    	}
	},
	created() {
		db.readSomething('classes', {_id: this.id})
			.then((classInfo) => {
				this.classInfo = classInfo[0]

				this.calculateCardSize('small')
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

.fade-enter-active, .fade-leave-active {
  transition: opacity .3s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
</style>