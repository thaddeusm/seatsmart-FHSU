<template>
  <div id="container">
    <header>
      <section id="searchArea">
        <SearchBox />
      </section>
      <section id="logoArea">
        <img id="logo" src="@/assets/logo.svg" alt="seatsmart logo">
      </section>
    </header>
    <main>
      <div class="class-button-area" v-for="(classToDisplay, index) in classesToDisplay">
        <ButtonCard :button="false" :icon="classToDisplay.name" :text="classToDisplay.semester + ' ' + classToDisplay.year" :to="`/chart/${classToDisplay._id}`" :key="index"/>
        <div class="modify-button-area">
          <button @click="editClass(classToDisplay._id)" class="modify-class-button"><img src="@/assets/edit.svg" alt="edit icon"></button>
          <button @click="promptDeleteClass(classToDisplay._id, classToDisplay.name)" class="modify-class-button"><img src="@/assets/delete.svg" alt="delete icon"></button>
        </div>
      </div>
      <br><br><br><br>
      <ButtonCard icon="+" text="seating chart" to="/charts/new"/>
    </main>
    <footer>
      <ActionBar background="var(--black)" :hamburger="false">
        <template slot="left">
          <h4>v.0.1</h4>
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
    <transition name="fade">
      <Modal v-if="alertModalOpen" v-on:trigger-close="alertModalOpen = false" :dismissable="true" size="small">
        <template slot="content">
          <div class="modal-body">
            <h2>Are you sure you want to permanently delete {{ alertModalClass }}?</h2>
          </div>
          <div class="modal-footer">
            <button class="modal-footer-button yellow" @click="deleteClass(alertModalClassID)">Yes</button>
            <button class="modal-footer-button" @click="alertModalOpen = false">cancel</button>
          </div>
        </template>
      </Modal>
    </transition>
    <TouchBar :show="!modalOpen" :bar="[
      {type: 'spacer', size: 'flexible'},
      {type: 'button', label: 'Settings', method: openModal}
    ]"/>
  </div>
</template>

<script>
import db from '@/db'
import SearchBox from '@/components/SearchBox.vue'
import ButtonCard from '@/components/ButtonCard.vue'
import ActionBar from '@/components/ActionBar.vue'
import Modal from '@/components/Modal.vue'
import Settings from '@/components/Settings.vue'
import TouchBar from '@/components/TouchBar.vue'
import moment from 'moment'

const { app } = require('electron').remote;

export default {
  name: 'home',
  components: {
    SearchBox,
    ButtonCard,
    ActionBar,
    Modal,
    Settings,
    TouchBar
  },
  data() {
  	return {
  		modalOpen: false,
      alertModalOpen: false,
      alertModalClass: '',
      alertModalClassID: '',
      classesToDisplay: [
        {
          name: 'V??',
          semester: null,
          year: null,
          _id: null,
          columns: null,
          rows: null
        }
      ]
  	}
  },
  methods: {
  	openModal() {
      this.modalOpen = true
    },
    editClass(id) {
      this.$store.dispatch('setLastView', '/')
      this.$router.push(`/chart/edit/${id}`)
    },
    promptDeleteClass(id, name) {
      this.alertModalClass = name
      this.alertModalOpen = true
      this.alertModalClassID = id
    },
    deleteClass(id) {
      db.deleteSomething('classes', {_id: id})
        .then((num) => {
          console.log(num)

          this.alertModalOpen = false
          this.alertModalClass = ''
          this.alertModalClassID = ''

          this.populateClasses()
        })
    },
    populateClasses() {
      db.readSomething('classes', {})
        .then((d) => {
          let unordered = d
          let firstPriority = []
          let secondPriority = []
          let remainder = []
          let thisSemester
          let lastSemester
          let thisYear = moment().year()
          let thisMonth = moment().month()

          // find current semester
          switch (thisMonth) {
            case 0:
              thisSemester = 'Spring'
              break
            case 1:
              thisSemester = 'Spring'
              break
            case 2:
              thisSemester = 'Spring'
              break
            case 3:
              thisSemester = 'Spring'
              break
            case 4:
              thisSemester = 'Spring'
              break
            case 5:
              thisSemester = 'Spring'
              break
            case 6:
              thisSemester = 'Summer'
              break
            case 7:
              thisSemester = 'Summer'
              break
            case 8:
              thisSemester = 'Fall'
              break
            case 9:
              thisSemester = 'Fall'
              break
            case 10:
              thisSemester = 'Fall'
              break
            case 11:
              thisSemester = 'fall'
              break
          }

          // find last semester
          switch (thisSemester) {
            case 'Spring':
              lastSemester = 'Fall'
              break
            case 'Summer':
              lastSemester = 'Spring'
              break
            case 'Fall':
              lastSemester = 'Summer'
              break
          }

          for (let i=0; i<unordered.length; i++) {
            if (unordered[i].year == thisYear && unordered[i].semester == thisSemester) {
              firstPriority.push(unordered[i])
            } else if (unordered[i].semester == lastSemester) {
              secondPriority.push(unordered[i])
            } else {
              remainder.push(unordered[i])
            }
          }

          this.classesToDisplay = firstPriority.concat(secondPriority, remainder)

        })
    }
  },
  created() {
    this.$store.dispatch('getPreferences')
  },
  mounted() {
    this.populateClasses()

    let scope = this

    setTimeout(function() {
      if (scope.$store.state.preferences.progress.length === 0) {
        scope.modalOpen = true
      }
    }, 3000, scope)
  }
}
</script>

<style scoped>
#container {
  background: var(--black);
  width: 100vw;
  min-height: 100vh;
  height: 100%;
  z-index: 1;
}

#searchArea {
  text-align: right;
}

#logoArea {
  text-align: center;
  margin-top: 30px;
  margin-bottom: 50px;
}

#logo {
  width: 120px;
}

main {
  text-align: center;
  width: 100%;
}

button {
  background: none;
  outline: none;
  border: none;
  cursor: pointer;
}

footer {
  position: fixed;
  bottom: 0;
}

.class-button-area {
  display: inline-block;
}

.class-button-area > * {
    margin: 0 30px;
}

.modal-button {
  background: none;
  outline: none;
  color: var(--red);
  border: none;
  cursor: pointer;
  font-family: 'ArchivoNarrow';
  vertical-align: text-top;
  font-size: 16px;
}

.modal-body {
  height: 180px;
  padding-top: 120px;
  text-align: center;
}

.modal-footer {
  background: var(--gray);
  text-align: center;
  height: 75px;
}

.modal-footer-button {
  padding: 5px 10px;
  background: var(--light-gray);
  color: var(--black);
  font-family: 'ArchivoNarrow';
  font-size: 18px;
  border-radius: 5px;
  cursor: pointer;
  outline: none;
  margin-top: 25px;
  margin-left: 10px;
  margin-right: 10px;
}

.yellow {
  background: var(--yellow);
}

.modify-class-button {
  color: var(--red);
  margin: 10px 40px;
}

.modify-class-button > img {
  width: 20px;
}

.modify-class-button:first-child {
  color: var(--yellow);
}

.fade-enter-active, .fade-leave-active {
  transition: opacity .2s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
</style>
