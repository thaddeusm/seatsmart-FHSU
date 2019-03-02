<template>
	<button v-if="button && display" class="button-card" @click="onClick(param)">
		<h5>
			{{ name }}
		</h5>
		<div id="checkmarkArea">
			<img v-if="selected" src="@/assets/checkhexagon.svg" alt="checkmark" class="checkmark">
		</div>
	</button>
	<router-link v-else-if="!button" class="button-card" v-bind:to="to">
		<h1 v-if="icon === '+'">
			{{ icon }}
		</h1>
		<h4 v-else-if="icon !== undefined">
			{{ icon.length > 10 ? `${icon.slice(0, 6)}...` : icon }}
		</h4>
		<h6>
			{{ text }}
		</h6>
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
	padding: 10px 20px;
	color: var(--black);
	border-radius: 10px;
	outline: none;
	border: 3px solid var(--light-gray);
	cursor: pointer;
	display: inline-grid;
	text-decoration: none;
	transition: .05s border ease;
	height: 65px;
	width: 95px;
	vertical-align: middle;
	justify-self: center;
	align-self: center;
}

.button-card:hover {
	border: 3px solid var(--yellow);
}

#checkmarkArea {
	align-self: flex-end;
	height: 16px;
}

.checkmark {
	height: 16px;
}

h1 {
	/* margin-bottom: 5px; */
	align-self: flex-start;
}

h4 {
	/* margin-bottom: 3px; */
	align-self: center;
}

h6 {
	/* margin: 10px 0; */
	align-self: center;
}

h5 {
	align-self: center;
	margin-bottom: 2px;
}
</style>
