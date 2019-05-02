<template>
	<section id="panelContainer">
		<section id="configPanel">
			<h3 class="configHeader">
				Configure Remote | <span>{{ instructions }}</span>
			</h3>
			<section class="panel-body" id="configBody">
				<section class="left-panel">
					<div v-if="configProgress == 1">
						<input ref="passphraseInput" v-model="passphrase" @keyup.enter="setPassphrase" type="text" placeholder="type a passphrase" maxlength="15" />
						<button @click="setPassphrase">set</button>
					</div>
					<div v-else-if="configProgress == 2">
						<h4>
							passphrase: <span>{{ passphrase }}</span>
						</h4>
					</div>
					<div v-else-if="configProgress == 3">
						<h4>
							Connected!
						</h4>
					</div>
				</section>
				<section class="right-panel">
					<qriously 
						id="qr" 
						v-if="configProgress == 2" 
						:value="`http://localhost:8081/?room=${roomID}`" 
						:size="200" 
					/>
					<img v-else src="@/assets/remote.svg" id="illustration">
					
				</section>
			</section>
			<ProgressNodes :steps="3" :progress="configProgress" id="configFooter" />
		</section>
	</section>
</template>

<script>
import ProgressNodes from '@/components/ProgressNodes.vue'

export default {
	name: 'RemoteConfigPanel',
	components: {
		ProgressNodes
	},
	props: {
		roomID: String,
		remoteConnected: Boolean
	},
	watch: {
		remoteConnected(newValue, oldValue) {
			if (newValue == true) {
				this.configProgress = 3

				let scope = this
				setTimeout(function() {
					scope.$emit('end-config')
					scope.$emit('trigger-modal-close')
				}, 3000)
			}
		}
	},
	data() {
		return {
			instructions: 'set a passphrase',
			configProgress: 1,
			passphrase: '',
			passphraseSet: false
		}
	},
	methods: {
		setPassphrase() {
			if (this.passphrase !== '') {
				this.$emit('set-passphrase', this.passphrase)

				this.instructions = 'connect your device'
				this.passphraseSet = true
				this.configProgress++
			} else {
				this.$refs.passphraseInput.style.border = "1px solid var(--red)"
			}
		}
	}
}
</script>

<style scoped>
#panelContainer {
	background: var(--black);
	width: 100%;
	height: 100%;
}

#configPanel {
	width: 100%;
	height: 100%;
	display: grid;
	grid-template-rows: 20% 55% 25%;
	grid-template-areas: 
		"configHeader"
		"configBody"
		"configFooter";
}

#configHeader {
	grid-area: configHeader;
}

#configBody {
	grid-area: configBody;
	height: 100%;
	display: grid;
	grid-template-columns: 1fr 1fr;
	grid-template-areas: "left right";
	align-items: center;
}

#configFooter {
	grid-area: configFooter;
	text-align: center;
}
.left-panel {
	grid-area: left;
	text-align: center;
}

.right-panel {
	grid-area: right;
	text-align: center;
}

#illustration {
	width: 150px;
}

#qr {
	background: var(--white);
	width: 200px;
	height: 200px;
	margin: 0 auto;
	border-radius: 5px;
	vertical-align: middle;
}

h3 {
	padding: 20px 0;
	text-align: center;
	color: var(--white);
}

h3 > span {
	color: var(--yellow);
}

h4 {
	text-align: center;
	color: var(--white);
}

h4 > span {
	color: var(--yellow);
}

input {
	border-radius: 4px;
	font-size: 19px;
	padding: 7px 10px 9px 10px;
	margin: 10px 5px 10px 10px;
	width: 140px;
	color: var(--black);
	border: 1px solid var(--light-gray);
	outline: none;
	vertical-align: middle;
}

button {
	font-size: 19px;
	padding: 8px 12px;
	border-radius: 5px;
	cursor: pointer;
	box-shadow: 0px 0px 5px var(--light-gray);
	outline: none;
	background: var(--yellow);
	vertical-align: middle;
}
</style>