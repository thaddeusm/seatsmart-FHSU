<template>
    <div id="container">
        <aside id="leftPanel">
            <h1>{{ student.firstName }}</h1>
            <TitleBar v-if="loaded" :title="classInfo.name" :compact="true" />
            <SeatingDiagram :compact="true" :inverted="true" :rows="classInfo.rows" :columns="classInfo.columns" :selected="`${this.student.seat.row},${this.student.seat.column}`" />
        </aside>
        <main>
            <header>
                <section id="backArea">
        			<button class="back-button" @click="$router.push(`/chart/${classInfo._id}`)"><img class="back-arrow" src="@/assets/backarrow.svg" alt="back arrow"> back</button>
        		</section>
                <trend
                  :data="[0, 2, 5, 9, 5, 10, 3, 5, 0, 0, 1, 8, 2, 9, 0]"
                  :gradient="['var(--red)', 'orange', 'var(--yellow)']"
                  class="trend"
                  auto-draw
                  smooth>
                </trend>
                <section id="trendAdjustArea">
                    <button class="trend-adjust">all time</button>
                    <button class="trend-adjust">this month</button>
                </section>
            </header>
            <section id="noteArea">
                <Polar :data="values">
                    <Pie show-label label-prop="name" prop="pv"></Pie>
                </Polar>
            </section>
        </main>
    </div>
</template>

<script>
import db from '@/db'
import { Polar, Pie } from 'laue'
import TitleBar from '@/components/TitleBar.vue'
import SeatingDiagram from '@/components/SeatingDiagram.vue'

export default {
    name: 'Student',
    props: ['id'],
    components: {
        TitleBar,
        SeatingDiagram,
        Polar,
        Pie
    },
    data() {
        return {
            student: {
                _id: '',
                firstName: '',
                lastName: '',
                selected: false,
                class: '',
                seat: {
                    row: 0,
                    column: 0
                }
            },
            classInfo: {
				name: null,
				_id: null,
				semester: null,
				year: null,
				columns: null,
				rows: null
			},
            notes: [
                {
					behavior: {
						Abbreviation: null,
						Description: null,
						Weight: null
					},
					student: null,
					type: null,
					dateNoted: {},
                    _id: ''
				}
            ],
            values: [
                { name: 'Page A', pv: 2400 },
                { name: 'Page B', pv: 1398 },
                { name: 'Page C', pv: 9800 },
                { name: 'Page D', pv: 3908 },
                { name: 'Page E', pv: 4800 },
                { name: 'Page F', pv: 3800 },
                { name: 'Page G', pv: 4300 }
            ],
            loaded: false
        }
    },
    methods: {

    },
    created() {
        db.readSomething('students', {_id: this.id})
            .then((results) => {
                this.student = results[0]

                if (this.student.firstName.indexOf('(') !== -1) {
                    this.student.firstName = this.student.firstName.split('(')[1].split(')')[0].split(' ')[0]
                } else {
                    this.student.firstName = this.student.firstName.split(' ')[0]
                }

                db.readSomething('classes', {_id: this.student.class})
                    .then((results) => {
                        this.classInfo = results[0]

                        db.readSomething('notes', {student: this.id})
                            .then((results) => {
                                this.notes = results

                                this.loaded = true
                            })
                    })

            })
    }
}
</script>

<style scoped>
#container {
    background: var(--black);
    width: 100vw;
    min-height: 100vh;
    height: 100%;
    display: grid;
    grid-template-columns: 25% 1fr;
    grid-template-areas: "leftPanel main";
}

button {
  background: none;
  outline: none;
  border: none;
  cursor: pointer;
}

.back-button {
	font-family: "ArchivoNarrow";
	color: var(--black);
	font-size: 14px;
}

.back-button > img {
	vertical-align: middle;
	padding-bottom: 2px;
}

#leftPanel {
    grid-area: leftPanel;
}

main {
    grid-area: main;
    background: var(--light-gray);
    padding: 6.5% 10%;
}

.trend {
    padding-bottom: 10px;
    border-bottom: 2px solid var(--black);
}

.trend-adjust {
    width: 50%;
    font-size: 1em;
}

.trend-adjust:first-child {
    text-align: left;
}

.trend-adjust:nth-child(2) {
    text-align: right;
}

aside {
    padding: 20% 0;
}

aside > h1 {
    color: var(--white);
    text-align: center;
}
</style>
