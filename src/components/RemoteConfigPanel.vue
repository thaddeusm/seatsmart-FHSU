<template>
	<section id="panelContainer">
		<section class="panel" v-if="remoteConnected">
			<h3 class="panel-header">
				Remote | <span>Scan to Connect</span>
			</h3>
			<section>
				<qriously 
					id="qr"
					:value="`http://localhost:8080/?room=${roomID}`" 
					:size="200" 
				/>
			</section>
		</section>
		<section v-else class="panel">
			<h3 class="panel-header">
				Disconnected
			</h3>
			<section class="panel-body">
				<section class="left-panel">
					<h4>
						Please check your Internet connection.
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
		remoteClientConnected(newValue, oldValue) {
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
		}
	},
	methods: {
		
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

.panel-footer {
	grid-area: panelFooter;
	text-align: center;
}

.left-panel {
	grid-area: left;
	padding: 10px;
}

.right-panel {
	grid-area: right;
}

.illustration {
	width: 150px;
}

#qr {
	background: var(--white);
	width: 200px;
	height: 200px;
	margin: 30px auto;
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
</style>