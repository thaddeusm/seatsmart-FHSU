<template>
    <div id="searchContainer">
        <header id="searchHeader">
            <section id="backArea">
                <button id="backButton" @click="$router.push('/')"><img src="@/assets/backarrowwhite.svg" alt="back arrow"> <img src="@/assets/home.svg" alt="home icon"></button>
            </section>
            <section id="toggleArea">
                <button @click="toggleCardStyle"><img src="@/assets/changecard.svg" alt="card toggle icon"></button>
            </section>
            <section id="searchArea">
                <SearchBox
                    :placeholder="placeholder"
                    v-on:start-search="search"
                />
            </section>
        </header>
        <main>
            <div class="result" v-for="(classChart, index) in results" v-if="classChart.length > 0" :key="index">
                <sequential-entrance fromTop delay="20">
                    <TitleBar v-if="classChart.length > 0" :classID="allClasses[index]" :link="true" />  
                    <div class="name-card-wrapper" v-for="(student, subIndex) in classChart">
                        <NameCard
                            :key="`${student}${subIndex}`"
                            :type="cardStyle"
                            :studentID="student"
                            v-on:open-note-modal="openNoteModal"
                            class="name-card"
                        />
                    </div>
                </sequential-entrance>
            </div>
            <div v-if="noResults" id="noResults">
                <img id="searchSplash" src="@/assets/searchimage.svg" alt="search illustration">
                <h2>No students were found.</h2>
                <h4>Be sure to search using students' "English" names.</h4>
            </div>
        </main>
  		<Modal v-if="noteModalOpen" v-on:trigger-close="closeNoteModal" :dismissable="true" size="large">
    		<template slot="content">
      			<NoteForm
					type="single"
					:student="newNoteStudent"
					v-on:trigger-modal-close="closeNoteModal"
				/>
    		</template>
  		</Modal>
        <TouchBar :show="!noteModalOpen" :bar="[
            {type: 'spacer', size: 'flexible'},
            {type: 'button', label: '🎫', method: function() {toggleCardStyle()}},
	       ]" 
           :escapeItem="{type: 'button', label: '🏠', method: routeHome}"
        />
    </div>
</template>

<script>
import db from '@/db'
const { remote } = require('electron')

import SearchBox from '@/components/SearchBox.vue'
import TitleBar from '@/components/TitleBar.vue'
import NameCard from '@/components/NameCard.vue'
import Modal from '@/components/Modal.vue'
import NoteForm from '@/components/NoteForm.vue'
import TouchBar from '@/components/TouchBar.vue'

export default {
    name: 'Search',
    props: ['term'],
    components: {
        SearchBox,
        TitleBar,
        NameCard,
        Modal,
        NoteForm,
        TouchBar
    },
    data() {
        return {
            results: [],
            noteModalOpen: false,
            newNoteStudent: '',
            loaded: false,
            placeholder: '',
            noResults: false,
            cardStyle: 'simple'
        }
    },
    computed: {
        allClasses() {
            return Object.keys(this.$store.state.allClasses)
        },
        allStudents() {
            return this.$store.state.allStudents
        }
    },
    methods: {
        search(term) {
            document.body.scrollTop = document.documentElement.scrollTop = 0;
            this.placeholder = term
            this.results = []
            this.allClasses.forEach(id => {
                this.results.push([])
            })

            for (let i=0; i<this.allStudents.length; i++) {
                if (this.allStudents[i].firstName) {
                    let firstName = this.allStudents[i].firstName.toLowerCase()

                    // reduce to simple (English) first name
                    if (firstName.indexOf('(') !== -1) {
                        firstName = firstName.split('(')[1].split(')')[0].split(' ')[0]
                    } else {
                        firstName = firstName.split(' ')[0]
                    }

                    if (firstName.includes(term)) {
                        for (let j=0; j<this.results.length; j++) {
                            if (this.allStudents[i].class == this.allClasses[j]) {
                                this.results[j].push(this.allStudents[i]._id)
                            }
                        }
                    }
                }
            }


            this.checkForNoResults()

            // update last page record in $store
            this.$store.dispatch('setLastView', `/search/${term}`)

        },
        checkForNoResults() {
            let test = 0

            for (let i=0; i<this.results.length; i++) {
                if (this.results[i].length === 0) {
                    test++
                }
            }

            if (test === this.allClasses.length) {
                this.noResults = true
            } else {
                this.noResults = false
            }
        },
        openNoteModal(studentID) {
            this.newNoteStudent = studentID

            document.body.scrollTop = document.documentElement.scrollTop = 0;
            document.body.style.overflow = 'hidden'

            this.noteModalOpen = true
        },
        closeNoteModal() {
            document.body.style.overflow = 'auto'
            this.noteModalOpen = false
        },
        routeHome() {
            this.$router.push('/')
        },
        toggleCardStyle() {
            if (this.cardStyle == 'simple') {
                this.cardStyle = 'complex'
            } else {
                this.cardStyle = 'simple'
            }
        }
    },
    mounted() {
        // start search on load for smooth transtiion from home view
        this.search(this.term)
    }
}
</script>

<style scoped>
#searchContainer {
    width: 100%;
    height: 100%;
}

#searchHeader {
    position: fixed;
    top: 0;
    height: 150px;
    width: 100%;
    display: grid;
    z-index: 10;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 13px 1fr 30%;
    grid-template-areas:
        ". ."
        "back search"
        ". toggle";
    align-items: center;
    background: var(--black);
}

#backArea {
    grid-area: back;
    margin-left: 30px;
    margin-top: 10px;
}

button > img {
    vertical-align: middle;
    margin: 0 5px;
}

#toggleArea {
    grid-area: toggle;
    text-align: right;
    margin-right: 45px;
    align-self: flex-start;
}

#searchArea {
    grid-area: search;
    text-align: right;
    margin-right: 26px;
}

main {
    color: var(--white);
    text-align: center;
    margin-top: 200px;
}

.result {
    margin-bottom: 10%;
}

.name-card-wrapper {
    display: inline-block;
    vertical-align: middle;
	transition: all .3s ease;
    color: var(--black);
    margin: 10px;
    text-align: center;
}

.name-card {
    width: 145.8px!important;
    height: 94.5px!important;
    display: inline-block;
}

#searchSplash {
    height: 200px;
    width: 200px;
    margin-bottom: 50px;
}

#noResults > h2 {
    margin-bottom: 10px;
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
