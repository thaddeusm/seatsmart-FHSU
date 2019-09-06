<template>
	<section id="panelContainer">
		<section class="panel" v-if="remoteConnected && !remoteClientConnected">
			<h3 class="panel-header">
				Remote | 
					<span v-if="showQR">Scan to Connect</span>
					<span v-if="!showQR">Enter the Code</span>
			</h3>
			<section>
				<qriously 
					id="qr"
					v-if="showQR"
					:value="`https://remote.seatsmart.tech/`" 
					:size="200" 
				/>
				<div id="qrGhost" v-else>
					<h1>{{ roomID }}</h1>
				</div>
				<button class="qr-toggle" v-if="showQR" @click="showQR = false">get the code</button>
				<button class="qr-toggle" v-else @click="showQR = true">show QR</button>
			</section>
		</section>
		<section class="panel" v-else-if="remoteConnected && remoteClientConnected">
			<h3 class="panel-header">
				Remote Connected
			</h3>
			<section class="panel-body">
				<section class="left-panel">
					<h4>
						Your device is connected.
					</h4>
				</section>
				<section class="right-panel">
					<img src="@/assets/remoteconnect.svg" class="illustration">
				</section>
			</section>
		</section>
		<section v-else-if="!remoteConnected" class="panel">
			<h3 class="panel-header">
				Disconnected
			</h3>
			<section class="panel-body">
				<section class="left-panel">
					<h4>
						Attempting to connect...
					</h4>
				</section>
				<section class="right-panel">
					<img src="@/assets/remotedisconnect.svg" class="illustration">
				</section>
			</section>
		</section>
	</section>
</template>

<script>
export default {
	name: 'RemoteConfigPanel',
	props: {
		roomID: String,
		remoteConnected: Boolean,
		remoteClientConnected: Boolean
	},
	watch: {
		// close config panel when remote client connects(joins)
		remoteClientConnected(newValue, oldValue) {
			if (newValue == true) {

				let scope = this
				setTimeout(function() {
					scope.$emit('end-config')
					scope.$emit('trigger-modal-close')
				}, 2000)
			}
		}
	},
	data() {
		return {
			showQR: true
		}
	},
	mounted() {
		// update onboarding progress
		this.$store.dispatch('setPreferences', {
            progress: ['created class', 'rearranged seats', 'viewed class chart', 'viewed a student page', 'read remote features info', 'explored remote features']
        })
	}
}
</script>

<style scoped>
#panelContainer {
	background: var(--black);
	width: 100%;
	height: 100%;
}

.panel {
	width: 100%;
	height: 100%;
	display: grid;
	grid-template-rows: 20% 80%;
	grid-template-areas: 
		"panelHeader"
		"panelBody";
}

.panel-header {
	grid-area: panelHeader;
}

.panel-body {
	grid-area: panelBody;
	height: 100%;
	display: grid;
	grid-template-columns: 1fr 1fr;
	grid-template-areas: "left right";
	align-items: center;
	text-align: center;
}

.left-panel {
	grid-area: left;
	padding: 10px 10px 50px 10px;
}

.right-panel {
	grid-area: right;
	padding: 10px 10px 50px 10px;
}

.illustration {
	width: 150px;
}

#qr {
	background: var(--white);
	width: 200px;
	height: 200px;
	margin: 5px auto 25px auto;
	padding: 5px;
	border-radius: 5px;
	vertical-align: middle;
}

#qrGhost {
	background: var(--light-gray);
	width: 200px;
	height: 200px;
	margin: 5px auto 25px auto;
	padding: 5px;
	border-radius: 5px;
	display: grid;
	align-items: center;
	color: var(--black);
	text-align: center;
}

.qr-toggle {
	padding: 3px 8px;
	background: var(--light-gray);
	color: var(--black);
	font-size: 15px;
	border-radius: 5px;
	cursor: pointer;
	outline: none;
	display: block;
	margin: 10px auto;
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
</style>
