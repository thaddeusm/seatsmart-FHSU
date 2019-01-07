<template>
  <div id="container">
    <header>
      <section id="searchArea">
        <SearchBox />
      </section>
      <section id="logoArea">
        <img id="logo" src="@/assets/logo.png" alt="seatsmart logo">
      </section>
    </header>
    <main>
      <ButtonCard icon="+" text="seating chart"/>
    </main>
    <footer>
      <ActionBar>
        <template slot="left">
          <h4>v.0.1</h4>
        </template>
        <template slot="right">
          <button @click="openModal"><img src="@/assets/cog.svg" alt="settings icon"></button>
        </template>
      </ActionBar>
    </footer>
    <transition name="fade">
      <Modal v-if="modalOpen" v-on:trigger-close="modalOpen = false">
        <template slot="content">
          <Settings v-on:trigger-modal-close="modalOpen = false"/>
        </template>
      </Modal>
    </transition>
    <TouchBar v-bind:bar="[ 
      {type: 'button', label: 'Malachi', method: openModal}
    ]"/>
  </div>
</template>

<script>
import api from '@/api'
import SearchBox from '@/components/SearchBox.vue'
import ButtonCard from '@/components/ButtonCard.vue'
import ActionBar from '@/components/ActionBar.vue'
import Modal from '@/components/Modal.vue'
import Settings from '@/components/Settings.vue'
import TouchBar from '@/components/TouchBar.vue'

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
  		modalOpen: false
  	}
  },
  methods: {
  	openModal() {
      this.modalOpen = true;
    }
  }
}
</script>

<style scoped>
#container {
  background: var(--black);
  height: 100vh;
  width: 100vw;
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

.fade-enter-active, .fade-leave-active {
  transition: opacity .3s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
</style>