<template>
    <div id="searchContainer">
        <header id="searchHeader">
            <section id="backArea">
                <button id="backButton" @click="$router.push('/')"><img src="@/assets/backarrowwhite.svg" alt="back arrow"> <img src="@/assets/home.svg" alt="home icon"></button>
            </section>
            <section id="toggleArea">
                <button @click="toggleIncludeArchived">
                    <img v-if="includeArchived" class="archive-icon" src="@/assets/archivewhitedisabled.svg" alt="disable archive icon">
                    <img v-else class="archive-icon" src="@/assets/archivewhite.svg" alt="enable archive icon">
                </button>
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
            <div class="result" v-for="(classChart, index) in Object.values(results)" v-if="classChart.length > 0" :key="index">
                <sequential-entrance fromTop delay="20">
                    <TitleBar v-if="classChart.length > 0" :classID="Object.keys(results)[index]" :link="true" />  
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
                <h4 v-if="!includeArchived">
                    Also, you can click the 
                    <img class="archive-icon" src="@/assets/archivewhite.svg" alt="enable archive icon"> icon above to include students from archived classes.
                </h4>
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
            {type: 'button', label: '📦', method: function() {toggleIncludeArchived()}},
            {type: 'button', label: '🎫', method: function() {toggleCardStyle()}}
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
            cardStyle: 'simple',
            includeArchived: false
        }
    },
    computed: {
        allClasses() {
            return Object.keys(this.$store.state.allClasses)
        },
        unarchivedClasses() {
            let allClassesObj = this.$store.state.allClasses
            let unarchived = []

            let keys = Object.keys(allClassesObj)
            let values = Object.values(allClassesObj)

            for (let i=0; i<keys.length; i++) {
                if (!allClassesObj[keys[i]].archived) {
                    unarchived.push(keys[i])
                }
            }

            return unarchived
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

            if (this.includeArchived) {
                this.allClasses.forEach(id => {
                    this.results[id] = []
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
                            this.results[this.allStudents[i].class].push(this.allStudents[i]._id)
                        }
                    }
                }
            } else {
                this.unarchivedClasses.forEach(id => {
                    this.results[id] = []
                })

                for (let i=0; i<this.allStudents.length; i++) {
                    if (this.unarchivedClasses.includes(this.allStudents[i].class)) {
                        if (this.allStudents[i].firstName) {
                            let firstName = this.allStudents[i].firstName.toLowerCase()

                            // reduce to simple (English) first name
                            if (firstName.indexOf('(') !== -1) {
                                firstName = firstName.split('(')[1].split(')')[0].split(' ')[0]
                            } else {
                                firstName = firstName.split(' ')[0]
                            }

                            if (firstName.includes(term)) {
                                this.results[this.allStudents[i].class].push(this.allStudents[i]._id)
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

            let keys = Object.keys(this.results)

            for (let i=0; i<keys.length; i++) {
                if (this.results[keys[i]].length == 0) {
                    test++
                }
            }

            if (keys.length == test) {
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
        },
        toggleIncludeArchived() {
            this.includeArchived = !this.includeArchived
            this.search(this.placeholder)
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
    height: 250px;
    width: 100%;
    display: grid;
    z-index: 10;
    grid-template-columns: 5% 18% 1fr 18% 5%;
    grid-template-rows: 20% 20% 1fr;
    grid-template-areas:
        ". . . . ."
        ". back . search ."
        ". . . toggle .";
    align-items: center;
    background: var(--black);
}

#backArea {
    grid-area: back;
    align-self: center;
}

button > img {
    vertical-align: middle;
    width: 25px;
    margin: 0 10px;
}

.archive-icon {
    width: 23px;
    vertical-align: middle;
}

#toggleArea {
    grid-area: toggle;
    text-align: right;
    margin-top: 15px;
    align-self: flex-start;
}

#searchArea {
    grid-area: search;
    text-align: right;
    align-self: center;
}

main {
    color: var(--white);
    text-align: center;
    margin-top: 250px;
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
    margin: 10px 0 40px 0;
}

#noResults > h4 {
    margin: 20px 0;
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
