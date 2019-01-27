<template>
	<router-link class="button-card" v-bind:to="to">
		<h1 v-if="icon === '+'">
			{{ icon }}
		</h1>
		<h2 v-else>
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
	props: ['icon', 'text', 'to']
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
	margin: 0 30px;
}

.button-card:hover {
	border: 3px solid var(--yellow);
}

h1 {
	margin-bottom: 5px;
}

h2 {
	margin: 10px 0;
}
</style>