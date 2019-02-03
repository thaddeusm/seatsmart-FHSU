<template>
	<button v-if="button && display" class="button-card" @click="onClick(param)">
		<h2>
			{{ name }}
		</h2>
		<img v-if="selected" src="@/assets/checkhexagon.svg" alt="checkmark" class="checkmark">
	</button>
	<router-link v-else-if="!button" class="button-card" v-bind:to="to">
		<h1 v-if="icon === '+'">
			{{ icon }}
		</h1>
		<h2 v-else-if="icon !== undefined">
			{{ icon.length > 10 ? `${icon.slice(0, 10)}...` : icon }}
		</h2>
		<h3>
			{{ text }}
		</h3>
	</router-link>
</template>

<script>
export default {
	name: 'ButtonCard',
	props: ['icon', 'text', 'to', 'button', 'onClick', 'param', 'selected'],
	data() {
		return {
			display: false
		}
	},
	computed: {
		name() {
			if (this.text == undefined) {
				return ''
			} else {
				if (this.text.indexOf('(') !== -1) {
					let nameOnly = this.text.split('(')[1].split(')')[0]
					return nameOnly.split(' ')[0]
				} else {
					return this.text
				}
			}
		}
	},
	mounted() {
		if (this.button && this.text !== undefined) {
			this.display = true
		}
	}
}
</script>

<style scoped>
.button-card {
	background: var(--light-gray);
	padding: 7px 20px 17px 20px;
	color: var(--black);
	border-radius: 10px;
	outline: none;
	border: 3px solid var(--light-gray);
	cursor: pointer;
	display: inline-block;
	text-decoration: none;
	transition: .05s border ease;
	height: 70px;
	width: 125px;
	vertical-align: middle;
}

.button-card:hover {
	border: 3px solid var(--yellow);
}

.checkmark {
	height: 18px;
}

h1 {
	margin-bottom: 5px;
}

h2 {
	margin: 10px 0;
}
</style>
