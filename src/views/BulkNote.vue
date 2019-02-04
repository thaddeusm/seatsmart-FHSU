<template>
    <div id="bulkNoteContainer">
        <header id="bulkNoteHeader">
            <TitleBar :title="classChart.name" />
        </header>
        <main id="bulkNoteBody">
            <section id="formArea">
                <NoteForm :students="studentIDs" type="multiple" :to="`/chart/${id}`" />
            </section>
            <section id="buttonCardArea" v-if="loaded">
                <div class="row" v-for="(row, index) in grid" :key="`row${index}`">
                    <div v-for="(student, subIndex) in row" class="card-wrapper">
                        <ButtonCard
                            v-if="student._id !== 'blank'"
                            :button="true"
                            :key="`column${subIndex}`"
                            :text="student.firstName"
                            :onClick="addStudent"
                            :param="student._id"
                            :selected="studentIDs.indexOf(student._id) !== -1"
                        />
                        <button class="blank-card" v-else disabled></button>
                    </div>
                </div>
            </section>
        </main>
        <TouchBar :show="true" :bar="[
			{type: 'spacer', size: 'flexible'},
			{type: 'button', label: 'Cancel', method: function() {$router.push(`/chart/${id}`)}},
			{type: 'spacer', size: 'flexible'},
	    ]"/>
    </div>
</template>

<script>
import db from '@/db.js'

import TitleBar from '@/components/TitleBar.vue'
import NoteForm from '@/components/NoteForm.vue'
import ButtonCard from '@/components/ButtonCard.vue'
import TouchBar from '@/components/TouchBar.vue'

export default {
	name: 'BulkNote',
	props: ['id'],
	components: {
        TitleBar,
        NoteForm,
        ButtonCard,
        TouchBar
	},
	data() {
		return {
            classChart: {
                name: null,
                columns: null,
                rows: null,
                _id: null,
                semester: null,
                year: null
            },
            studentIDs: [],
            grid: [[{
                _id: 'blank',
                firstName: '',
                lastName: '',
                class: '',
                selected: '',
                seat: {
                    row: 0,
                    column: 0
                }
            }]],
            loaded: false
        }
	},
	methods: {
        addStudent(id) {
            this.studentIDs.push(id)
        }
	},
    created() {
        db.readSomething('classes', {_id: this.id})
            .then((results) => {
                this.classChart = results[0]
                this.grid.splice(0, 1)
                for (let i=0; i<this.classChart.rows; i++) {
					this.grid.push([])

					for (let k=0; k<this.classChart.columns; k++) {
						this.grid[i].push({
                            _id: 'blank',
                            firstName: '',
                            lastName: '',
                            class: '',
                            selected: '',
                            seat: {
                                row: 0,
                                column: 0
                            }
                        })
					}
				}

                db.readSomething('students', {class: this.id})
                    .then((results) => {

                        for (let i=0; i<results.length; i++) {
                            let thisStudent = results[i]
                            let thisRow = thisStudent.seat.row
                            let thisColumn = thisStudent.seat.column

                            this.grid[thisRow - 1][thisColumn - 1] = thisStudent
                        }

                        this.loaded = true
                    })
            })
    }
}
</script>

<style scoped>
#bulkNoteContainer {
    width: 100%;
    height: 100%;
    min-width: 100vw;
    min-height: 100vh;
    background: var(--black);
}

#formArea {
    width: 70%;
    height: 100%;
    min-width: 700px;
    margin: 0 auto;
}

#buttonCardArea {
    margin: 5% auto;
    text-align: center;
}

.row {
    display: block;
    margin: 0 auto;
    text-align: center;
}

.row > * {
    margin: 15px 10px;
}

.card-wrapper {
    display: inline-block;
}

.blank-card {
	background: var(--gray);
	padding: 7px 20px 17px 20px;
	color: var(--black);
	border-radius: 10px;
	outline: none;
	border: 3px solid var(--gray);
	cursor: not-allowed;
	display: inline-block;
	text-decoration: none;
	transition: .05s border ease;
	height: 70px;
	width: 125px;
	vertical-align: middle;
}
</style>
