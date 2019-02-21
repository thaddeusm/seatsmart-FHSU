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
	props: ['behavior', 'size', 'color'],
	data() {
		return {
			loaded: false
		}
	},
	mounted() {
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
	font-size: 10px;
	display: inline-block;
	width: 12px;
	height: 11.7px;
	padding-top: .3px;
	border-radius: 12px;
	margin: 0 3%;
}

.small {
	font-size: 12px;
	display: inline-block;
	width: 18px;
	height: 16px;
	padding-top: 2px;
	border-radius: 18px;
	margin: 0 3%;
}

.medium {
	font-size: 22px;
	display: inline-block;
	width: 40px;
	height: 31px;
	padding-top: 9px;
	border-radius: 40px;
	margin: 0 3%;
}

.large {
	font-size: 2.5em;
	display: block;
	width: 2.5em;
	height: 1.8em;
	border-radius: 2.5em;
	margin: 0 auto;
	padding-top: .7em;
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
