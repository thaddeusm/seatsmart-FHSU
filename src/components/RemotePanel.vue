<template>
	<section id="panelContainer">
		<div id="initContainer" v-if="phase == 'init'">
			<header>
				<h3>
					Configure Remote | <span class="attention">{{ instructions }}</span>
				</h3>
			</header>
			<section v-if="progress == 1">
				<input ref="passphraseInput" v-model="passphrase" @keyup.enter="setPassphrase" type="text" placeholder="passphrase" maxlength="15"/>
				<button @click="setPassphrase">Set</button>
			</section>
			<section id="qrContainer" v-if="progress == 2">
				<qriously value="Hello World!" :size="150" :padding="10"/>
			</section>
			<section v-if="progress == 3">
				<img src="@/assets/remoteconnectillustration.svg" alt="remote connection icon">
			</section>
			<ProgressNodes :steps="3" :progress="progress" />
		</div>
		<div id="statusContainer" v-else>
			<header>
				<h3></h3>
			</header>
			<section>
				
			</section>
		</div>
	</section>
</template>

<script>
import ProgressNodes from '@/components/ProgressNodes.vue'

export default {
	name: 'RemotePanel',
	components: {
		ProgressNodes
	},
	data() {
		return {
			passphrase: '',
			instructions: 'Set a Passphrase',
			progress: 1,
			phase: 'init'
		}
	},
	sockets: {
		roomEstablished(roomId) {
			console.log(roomId)
		},
		remoteConnected(roomInfo) {
			this.progress++
			this.instructions = 'Connected!'
			this.$emit('remote-connected', roomInfo)
			let scope = this
			setTimeout(function() {scope.$emit('trigger-close')}, 3000)
		}
	},
	methods: {
		setPassphrase() {
			this.$emit('set-passphrase', this.passphrase)
			this.$socket.emit('establishRoom', this.passphrase)
			this.progress++
			this.instructions = 'Connect Your Device'
		}
	},
	mounted() {
		this.$refs.passphraseInput.focus()
	}
}
</script>

<style scoped>
#panelContainer {
	background: var(--black);
	width: 100%;
	height: 100%;
}

#initContainer {
	width: 100%;
	height: 100%;
	display: grid;
	grid-template-rows: 20% 55% 25%;
	text-align: center;
	align-items: center;
}

#statusContainer {
	width: 100%;
	height: 100%;
	display: grid;
	grid-template-rows: 20% 55% 25%;
	text-align: center;
	align-items: center;
}

h3 {
	color: var(--white);
}

h5 {
	color: var(--white);
	margin-bottom: 20px;
}

.attention {
	color: var(--yellow);
}

input {
	border-radius: 4px;
	font-size: 19px;
	padding: 7px 10px 9px 10px;
	margin: 10px 2px 10px 10px;
	width: 160px;
	color: var(--black);
	border: 1px solid var(--light-gray);
	outline: none;
}

button {
    background: var(--yellow);
    font-size: 19px;
    padding: 7px 10px 9px 10px;
    margin: 10px 10px 10px 2px;
    border-radius: 4px;
    border: 1px solid var(--yellow);
    color: var(--black);
    outline: none;
    border: none;
    cursor: pointer;
}

img {
	width: 100px;
}

#qrContainer {
	background: var(--light-gray);
	width: 160px;
	margin: 0 auto;
	border-radius: 4px;
	padding-top: 5px;
}
</style>