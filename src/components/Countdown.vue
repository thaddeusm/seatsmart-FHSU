<template>
	<div>
		<h2>{{ remainingTimeInMinutes }}</h2>
	</div>
</template>

<script>
export default {
	name: 'Countdown',
	props: {
		timeLimit: Number,
		countdownRunning: Boolean
	},
	data() {
		return {
			remainingTimeInSeconds: 10,
			countdown: null
		}
	},
	computed: {
		remainingTimeInMinutes() {
			let minutes = this.formatTime(Math.floor(this.remainingTimeInSeconds / 60))
			let seconds = this.formatTime(this.remainingTimeInSeconds % 60)

			return `${minutes}:${seconds}`
		}
	},
	watch: {
		countdownRunning: function(newValue, oldValue) {
			if (newValue == true && this.remainingTimeInSeconds > 0) {
				let scope = this

				this.countdown = setInterval(function() {
					scope.remainingTimeInSeconds--
				}, 1000, scope)
			} else {
				clearInterval(this.countdown)
			}
		},
		remainingTimeInSeconds: function(newValue, oldValue) {
			if (newValue == 0) {
				clearInterval(this.countdown)
				this.$emit('countdown-ended')
			}
		}
	},
	methods: {
		formatTime(time) {
			if (time < 10) {
				return `0${time}`
			} else {
				return time
			}
		}
	},
	mounted() {
		this.remainingTimeInSeconds = this.timeLimit
	}
}
</script>

<style scoped>

</style>
