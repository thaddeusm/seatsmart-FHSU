<template>
	<div>
		<h1>
			{{ icon }}
		</h1>
		<h3>
			{{ text }}
		</h3>
	</div>
</template>

<script>
export default {
	name: 'ButtonCard',
	props: ['icon', 'text']
}
</script>

<style scoped>
div {
	background: var(--light-gray);
	display: inline-block;
	padding: 7px 20px 17px 20px;
	color: var(--black);
	border-radius: 10px;
}

h1 {
	margin-bottom: 5px;
}
</style>