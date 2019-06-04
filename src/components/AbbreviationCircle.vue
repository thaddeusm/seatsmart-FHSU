<template>
	<transition name="fade">
		<div v-if="loaded" id="abbreviation" :class="[size, color]">
			<span>{{ behavior.Abbreviation }}</span>
		</div>
	</transition>
</template>

<script>
export default {
	name: 'AbbreviationCircle',
	props: {
		behavior: Object, 
		size: String, 
		color: String
	},
	data() {
		return {
			loaded: false
		}
	},
	mounted() {
		// create more subtle loading effect on name cards
		if (this.size == 'small') {
			let scope = this
			setTimeout(function() {
				scope.loaded = true
			}, 500, scope)
		} else {
			this.loaded = true
		}
	}
}
</script>

<style scoped>
.extra-small {
	display: inline-grid;
	justify-content: center;
	align-items: center;
	width: 11px;
	height: 11px;
	font-size: 8px;
	line-height: 8px;
	border-radius: 11px;
	margin: 0 3%;
}

.small {
	display: inline-grid;
	justify-content: center;
	align-items: center;
	width: 16px;
	height: 16px;
	font-size: 12px;
	line-height: 12px;
	border-radius: 16px;
	margin: 0 3%;
}

.medium {
	display: inline-grid;
	justify-content: center;
	align-items: center;
	width: 35px;
	height: 35px;
	font-size: 22px;
	line-height: 22px;
	border-radius: 35px;
	margin: 0 3%;
}

.large {
	display: grid;
	justify-content: center;
	align-items: center;
	width: 60px;
	height: 60px;
	font-size: 36px;
	line-height: 36px;
	border-radius: 60px;
	margin: 0 auto;
	border: 1px solid var(--gray);
}

.yellow {
	background: var(--yellow);
}

.red {
	background: var(--red);
	color: var(--white);
}

.fade-enter-active, .fade-leave-active {
	transition: opacity .4s;
}

.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
	opacity: 0;
}
</style>
