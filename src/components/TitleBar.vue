<template>
	<header id="titleBarContainer">
		<div class="line"></div>
		<h2>{{ title }}</h2>
		<div class="line"></div>
	</header>
</template>

<script>
export default {
	name: 'TitleBar',
	props: ['title']
}
</script>

<style scoped>
#titleBarContainer {
	text-align: center;
	padding: 40px 0 20px 0;
}

#titleBarContainer > * {
	display: inline-block;
}

h2 {
	color: var(--white);
}

.line {
	height: 3px;
	background: var(--yellow);
	width: 30%;
	margin: 0 20px 5px 20px;
	vertical-align: middle;
}
</style>