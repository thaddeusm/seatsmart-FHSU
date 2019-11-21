<template>
	<div>
		<input ref="input" v-model="term" :placeholder="placeholder" type="text" @keyup.enter="$emit('start-search', term.toLowerCase())">
		<button @click="$emit('start-search', term.toLowerCase())"><img src="@/assets/search.svg" alt="search icon"></button>
	</div>
</template>

<script>
export default {
	name: 'SearchBox',
	props: {
		placeholder: String, 
		startTerm: String
	},
	data() {
		return {
			term: ''
		}
	},
	mounted() {
		// place focus on search input on start
		this.$refs.input.focus()
	}
}
</script>

<style scoped>
div {
	display: grid;
	background: var(--light-gray);
	border: 2px solid var(--gray);
	border-radius: 10px;
	grid-template-columns: 85% 15%;
	grid-template-areas: "input button";
	padding: 7px 12px;
}

input {
	font-size: 1.2em;
	grid-area: input;
	background: none;
	border: none;
}

button {
    background: none;
    outline: none;
    border: none;
    cursor: pointer;
    grid-area: button;
    margin-bottom: -5px;
}

input:focus {
	outline: none;
}

img {
	vertical-align: middle;
	padding-bottom: 5px;
}
</style>
