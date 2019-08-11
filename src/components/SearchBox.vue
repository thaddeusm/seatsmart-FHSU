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
	
}

input {
	border-radius: 10px;
	padding: 7px 12px;
	font-size: 1.2em;
	background: var(--light-gray);
	border: 2px solid var(--gray);
}

button {
    background: none;
    outline: none;
    border: none;
    cursor: pointer;
	margin-left: -35px;
}

input:focus {
	outline: none;
}

img {
	vertical-align: middle;
	padding-bottom: 5px;
}
</style>
