<template>
	<div id="diagramContainer" :class="[compact ? 'small-container' : 'large-container']">
		<section class="chair-row" v-for="(row, index) in rows" :key="index">
			<div class="chair-column" v-for="(column, imgIndex) in columns">
				<button @click="changeRoute(row - 1, column -1)">
				<img v-if="`${index + 1},${imgIndex + 1}` == selected" :class="[rows > 5 || columns > 5 ? 'small' : 'large', 'chair']" :key="imgIndex" alt="chair icon" src="@/assets/redchair.svg">
				<img v-else-if="inverted" :class="[rows > 4 || columns > 4 ? 'small' : 'large', 'chair']"  :key="imgIndex" alt="chair icon" src="@/assets/whitechair.svg">
				<img v-else-if="!inverted" :class="[rows > 4 || columns > 4 ? 'small' : 'large', 'chair']"  :key="imgIndex" alt="chair icon" src="@/assets/blackchair.svg">
				</button>
			</div>
		</section>
	</div>
</template>

<script>
import db from '@/db.js'

export default {
	name: 'SeatingDiagram',
	props: {
		columns: Number, 
		rows: Number, 
		selected: String, 
		inverted: Boolean, 
		compact: Boolean,
		classID: String
	},
	data() {
		return {
			grid: [[{_id: ''}]]
		}
	},
	watch: {
		classID: function(newID, oldID) {
			this.buildGrid()
		}
	},
	methods: {
		buildGrid() {
			db.readSomething('classes', {_id: this.classID})
            .then((results) => {
                this.grid.splice(0, 1)
                for (let i=0; i<results[0].rows; i++) {
					this.grid.push([])

					for (let k=0; k<results[0].columns; k++) {
						this.grid[i].push({
                            _id: ''
                        })
					}
				}

                db.readSomething('students', {class: this.classID})
                    .then((studentResults) => {
                        for (let i=0; i<studentResults.length; i++) {
                            let thisStudent = studentResults[i]
                            let thisRow = thisStudent.seat.row
                            let thisColumn = thisStudent.seat.column

                            this.grid[thisRow - 1][thisColumn - 1] = {_id: thisStudent._id}
                        }

                    })
            })
		},
		changeRoute(row, column) {
			// if the clicked seat is occupied, trigger redirection
			if (this.grid.length > 0 && this.grid[row][column]._id !== '') {
				this.$emit('change-route', `/student/${this.grid[row][column]._id}`)
			}
		}
	},
	mounted() {
		this.buildGrid()
	}
}
</script>

<style scoped>
#diagramContainer {
	display: grid;
}

.large-container {
	grid-gap: 10px;
	height: 100%;
}

.small-container {
	grid-gap: 3px;
}

.chair-row {
	text-align: center;
	justify-self: center;
	align-self: center;
}

.chair-column {
	display: inline-block;
}

.chair-container {
	display: inline-block;
}

.large {
	height: 60px;
	margin: 0 10px;
}

.small {
	height: 20px;
	margin: 0 2px;
}

button {
    background: none;
    outline: none;
    border: none;
}
</style>
