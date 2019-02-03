<template>
    <div id="bulkNoteContainer">
        <header id="bulkNoteHeader">
            <TitleBar :title="classChart.name" />
        </header>
        <main id="bulkNoteBody">
            <section id="formArea">
                <NoteForm :students="studentIDs" type="multiple" :to="`/chart/${id}`" />
            </section>
            <section id="buttonCardArea">
                <div class="row" v-for="(row, index) in classStudents" :key="`row${index}`">
                    <ButtonCard
                        v-for="(student, subIndex) in row"
                        :button="true"
                        :key="`column${subIndex}`"
                        :text="student.firstName"
                        :onClick="addStudent"
                        :param="student._id"
                        :selected="studentIDs.indexOf(student._id) !== -1"
                    />
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
            classStudents: [
                [
                    {
                        _id: 'blank',
                        firstName: 'blank',
                        lastName: 'blank',
                        selected: false,
                        class: 'blank',
                        seat: {
                            column: 0,
                            row: 0
                        }
                    }
                ]
            ]
		}
	},
	methods: {
        addStudent(id) {
            this.studentIDs.push(id)
        }
	},
    mounted() {
        db.readSomething('classes', {_id: this.id})
            .then((results) => {
                this.classChart = results[0]

                db.readSomething('students', {class: this.id})
                    .then((results) => {
                        let sortedStudents = results.sort((a,b) => {
                            if (a.seat.row === b.seat.row) {
                                return a.seat.column - b.seat.column
                            } else {
                                return a.seat.row - b.seat.row
                            }
                        })

                        for (let i=1; i<this.classChart.rows; i++) {
                            this.classStudents.push([])
                            for (let k=1; k<this.classChart.columns; k++) {
                                this.classStudents[i].push({})
                            }
                        }

                        for (let i=0; i<sortedStudents.length; i++) {
                            this.classStudents[sortedStudents[i].seat.row - 1][sortedStudents[i].seat.column - 1] = sortedStudents[i]
                        }


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
</style>
