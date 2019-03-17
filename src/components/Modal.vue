<template>
	<div id="modalContainer">
		<div id="overlay" v-if="dismissable" @click="$emit('trigger-close')"></div>
		<div id="overlay" v-else></div>
		<div id="modal" :class="[size === 'large' ? 'large' : 'small']">
			<slot name="content"></slot>
		</div>
	</div>
</template>

<script>
export default {
	name: 'Modal',
	props: {
		dismissable: Boolean, 
		size: String
	}
}
</script>

<style scoped>
#overlay {
	position: fixed;
	z-index: 190;
	top: 0;
	left: 0;
	width: 100vw;
	height: 100vh;
	opacity: .8;
	background: var(--black);
}

#modal {
	background: var(--light-gray);
	position: absolute;
	top: 0;
	left: 0;
	bottom: 0;
	right: 0;
	margin: auto;
	z-index: 200;
	border: 3px solid var(--yellow);
	border-radius: 5px;
}

.large {
	height: 600px;
	width: 950px;
}

.small {
	height: 375px;
	width: 700px;
}
</style>
