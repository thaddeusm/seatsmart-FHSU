<template>
	<section id="panelContainer">
		<section class="panel">
			<section class="panel-header" v-if="remoteConnected">
				<img src="@/assets/remoteconnect.svg" class="illustration"> 
				<h3>
					Remote Connected
				</h3>
			</section>
			<section class="panel-header" v-else>
				<img src="@/assets/remotedisconnect.svg" class="illustration"> 
				<h3>
					Reconnecting...
				</h3>
			</section>
			<section class="panel-body">
				<section class="left-panel">				
					<qriously 
						v-if="showQR"
						id="qr"
						:value="`https://seatsmart-remote.now.sh/?room=${roomID}`" 
						:size="100" 
					/>
					<div id="qrGhost" v-else>
						<h5>{{ roomID }}</h5>
					</div>
					<button class="qr-toggle" v-if="showQR" @click="showQR = false">hide QR</button>
					<button class="qr-toggle" v-else @click="showQR = true">show QR</button>
					<button class="cancel-button" @click="closeConnection">End Remote Connection</button>
				</section>
				<section class="right-panel">
					<h4>
						Activity
					</h4>
					<ul>
						<li v-for="(item, index) in log" :key="index">
							{{ item }}
						</li>
					</ul>
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
		remoteClientConnected: Boolean,
		log: Array
	},
	data() {
		return {
			showQR: false
		}
	},
	methods: {
		closeConnection() {
			this.$socket.emit('endSession')
			this.$emit('disconnect')
			this.$emit('trigger-modal-close')
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
	text-align: center;
	padding: 15px;
}

.panel-body {
	grid-area: panelBody;
	height: 100%;
	display: grid;
	grid-template-columns: 1fr 1fr;
	grid-template-areas: "left right";
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
	width: 30px;
	vertical-align: middle;
	margin-right: 20px;
}

#qr {
	background: var(--white);
	width: 100px;
	height: 100px;
	margin: 15px auto 5px auto;
	border-radius: 5px;
	vertical-align: middle;
}

.qr-toggle {
	padding: 3px 8px;
	background: var(--light-gray);
	color: var(--black);
	font-size: 15px;
	border-radius: 5px;
	cursor: pointer;
	outline: none;
	margin: 10px;
}

.cancel-button {
	padding: 3px 8px;
	background: var(--red);
	color: var(--white);
	font-size: 15px;
	border-radius: 5px;
	cursor: pointer;
	outline: none;
	margin: 40px auto 20px auto;
	display: block;
}

#qrGhost {
	background: var(--light-gray);
	width: 100px;
	height: 100px;
	margin: 15px auto 5px auto;
	border-radius: 5px;
	display: grid;
	align-items: center;
	color: var(--black);
}

h3 {
	text-align: center;
	color: var(--white);
	vertical-align: middle;
	display: inline-block;
}

h4 {
	text-align: center;
	color: var(--white);
}

h4 > span {
	color: var(--yellow);
}

ul {
	background: var(--yellow);
	height: 255px;
	margin: 10px auto 0 auto;
	overflow: auto;
	width: 320px;
}

li {
	padding: 10px;
	background: var(--light-gray);
	margin: 15px 5px;
	list-style: none;
}
</style>
