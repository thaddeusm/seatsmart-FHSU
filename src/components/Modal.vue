<template>
	<div>
		<div id="overlay" @click="$emit('trigger-close')"></div>
		<div id="modal">
			<slot name="content"></slot>
		</div>
	</div>
</template>

<script>
export default {
	name: 'Modal'
}
</script>

<style scoped>
#overlay {
	position: fixed;
	z-index: 150;
	top: 0;
	width: 100vw;
	height: 100vh;
	opacity: .8;
	background: var(--black);
}

#modal {
	height: 80vh;
	width: 80vw;
	background: var(--light-gray);
	position: absolute;
	top: 50%;
	left: 50%;
	margin-top: -40vh;
	margin-left: -40vw;
	z-index: 200;
}
</style>