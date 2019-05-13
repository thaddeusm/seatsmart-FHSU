<template>
	<section id="panelContainer">
		<section class="panel">
			<h3 class="panel-header" v-if="remoteConnected">
				Remote Connected
			</h3>
			<h3 class="panel-header" v-else>
				Reconnecting...
			</h3>
			<section class="panel-body">
				<section class="left-panel">
					<div class="status" v-if="remoteConnected">
						<img src="@/assets/remoteconnect.svg" class="illustration">
					</div>
					<div class="status" v-else>
						<img src="@/assets/remotedisconnect.svg" class="illustration">
					</div>					
					<qriously 
						v-if="showQR"
						id="qr"
						:value="`https://seatsmart-remote.now.sh/?room=${roomID}`" 
						:size="100" 
					/>
					<div id="qrGhost" v-else></div>
					<button class="qr-toggle" v-if="showQR" @click="showQR = false">hide</button>
					<button class="qr-toggle" v-else @click="showQR = true">show QR</button>
				</section>
				<section class="right-panel">
					<h4>
						Activity
					</h4>
					<ul>
						<li v-for="(item, index) in flippedLog" :key="index">
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
	computed: {
		flippedLog() {
			return this.log.reverse()
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
	width: 65px;
	margin-bottom: 40px;
}

#qr {
	background: var(--white);
	width: 100px;
	height: 100px;
	margin: 5px auto;
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

#qrGhost {
	background: var(--light-gray);
	width: 100px;
	height: 100px;
	margin: 5px auto;
	border-radius: 5px;
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

ul {
	background: var(--yellow);
	height: 255px;
	margin: 10px auto 0 auto;
	overflow: auto;
	width: 320px;
}

li {
	padding: 15px;
	background: var(--light-gray);
	margin: 15px 20px;
	box-shadow: 1px 1px 2px var(--black);
	list-style: none;
}
</style>
