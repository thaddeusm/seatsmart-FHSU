<template>
	<div>
		<input v-model="term" type="text">
		<img src="@/assets/search.svg" alt="search icon">
	</div>
</template>

<script>
export default {
	name: 'SearchBox',
	data() {
		return {
			term: ''
		}
	}
}
</script>

<style scoped>
div {
	padding-top: 10px;
	margin-right: 30px;
}

input {
	margin: 15px;
	border-radius: 10px;
	padding: 7px 12px;
	font-size: 1.2em;
	font-family: 'ArchivoNarrow';
	background: var(--light-gray);
	border: 2px solid var(--gray);
}

::selection {
	background: var(--yellow);
}

input:focus {
	outline: none;
}

img {
	margin-left: -50px;
	vertical-align: middle;
	margin-top: -5px;
}
</style>