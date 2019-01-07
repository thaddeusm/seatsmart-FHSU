<template>
	<div>
		<section class="left-button">
			<slot name="left"></slot>
		</section>
		<section class="center-buttons">
			<slot name="center"></slot>
		</section>
		<section class="right-button">
			<slot name="right"></slot>
		</section>
	</div>
</template>

<script>
export default {
	name: 'ActionBar'
}
</script>

<style scoped>
div {
	color: var(--yellow);
	height: 70px;
	display: grid;
	grid-template-columns: 8% 84% 8%;
	grid-template-areas: "left center right";
	justify-content: center;
	align-items: center;
}

section {
	display: inline-block;
}

.left-button {
	text-align: center;
	width: 8vw;
	grid-area: "left";
}

.center-buttons {
	width: 84vw;
	grid-area: "center";
}

.right-button {
	text-align: center;
	width: 8vw;
	grid-area: "right";
}

img {
	width: 25px;
	vertical-align: middle;
}
</style>