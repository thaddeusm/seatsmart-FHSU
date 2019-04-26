<template>
	<div>
		<button v-if="!enabled && !connected" @click="$emit('open-remote-panel')">
			<img src="@/assets/remote.svg" alt="remote icon">
		</button>
	</div>
</template>

<script>
import sjcl from 'sjcl'

export default {
	name: 'RemoteController',
	props: {
		passphrase: String
	},
	data() {
		return {
			enabled: false,
			connected: false
		}
	},
	methods: {
		encrypt(data) {
			return sjcl.encrypt(this.passphrase, data)
		},
		decrypt(data) {
			return sjcl.decrypt(this.passphrase, data) 
		}
	}
}
</script>

<style scoped>
div {
	display: inline-block;
	float: right;
	margin-top: -45px;
	margin-right: 50px;
}

button {
    background: none;
    outline: none;
    border: none;
    cursor: pointer;
}

img {
	width: 25px;
}
</style>