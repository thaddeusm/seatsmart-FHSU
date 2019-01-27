<template>
	<div id="nodeContainer">
		<div v-for="(step, index) in steps" :class="[index + 1 == progress ? 'yellow' : 'gray','node']"></div>
	</div>
</template>

<script>
export default {
	name: 'ProgressNodes',
	props: ['steps', 'progress']
}
</script>

<style scoped>
#nodeContainer {
	text-align: center;
}

.node {
	display: inline-block;
	width: 30px;
	height: 30px;
	border-radius: 50px;
	margin: 70px 10px;
	box-shadow: 0px 0px 2px var(--dark-gray);
}

.gray {
	background: var(--gray);
}

.yellow {
	background: var(--yellow);
}
</style>