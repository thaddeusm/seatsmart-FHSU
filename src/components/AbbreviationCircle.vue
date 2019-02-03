<template>
	<transition name="fade">
		<div v-if="loaded" id="abbreviation" :class="[size === 'large' ? 'large' : 'small', color]">
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
#abbreviation {
	
}

span {
	font-family: 'ArchivoNarrow';
}

.small {
	font-size: .8em;
	display: inline-block;
	width: 1.6em;
	height: 1.5em;
	padding-top: .1em;
	border-radius: 1.6em;
	margin: 0 3%;
}

.large {
	font-size: 2.5em;
	display: block;
	width: 2.5em;
	height: 1.9em;
	border-radius: 2.5em;
	margin: 0 auto;
	padding-top: .6em;
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