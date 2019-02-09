<template>
	<div id="diagramContainer" :class="[compact ? 'small-container' : 'large-container']">
		<section class="chair-row" v-for="(row, index) in rows" :key="index">
			<div class="chair-column" v-for="(column, imgIndex) in columns">
				<img v-if="`${index + 1},${imgIndex + 1}` == selected" :class="[rows > 5 || columns > 5 ? 'small' : 'large', 'chair']" :key="imgIndex" alt="chair icon" src="@/assets/redchair.svg">
				<img v-else-if="inverted" :class="[rows > 5 || columns > 5 ? 'small' : 'large', 'chair']"  :key="imgIndex" alt="chair icon" src="@/assets/whitechair.svg">
				<img v-else-if="!inverted" :class="[rows > 5 || columns > 5 ? 'small' : 'large', 'chair']"  :key="imgIndex" alt="chair icon" src="@/assets/blackchair.svg">
			</div>
		</section>
	</div>
</template>

<script>

export default {
	name: 'SeatingDiagram',
	props: ['columns', 'rows', 'selected', 'inverted', 'compact']
}
</script>

<style scoped>
#diagramContainer {
	display: grid;
  	/*align-items: center;
	justify-content: center;*/
}

.large-container {
	grid-gap: 10px;
	height: 100%;
}

.small-container {
	grid-gap: 5px;
}

.chair-row {
	text-align: center;
	justify-self: center;
	align-self: center;
}

.chair-column {
	display: inline-block;
}

.large {
	height: 60px;
	margin: 0 10px;
}

.small {
	height: 20px;
	margin: 0 5px;
}
</style>
