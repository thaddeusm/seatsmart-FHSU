<template>
	<div id="diagramContainer">
		<section class="chair-row" v-for="(row, index) in rows" :key="index">
			<div class="chair-column" v-for="(column, imgIndex) in columns">
				<img v-if="`${index + 1},${imgIndex + 1}` == selected" :class="[rows > 5 || columns > 6 ? 'small' : 'large', 'chair']" :key="imgIndex" alt="chair icon" src="@/assets/redchair.svg">
				<img v-else :class="[rows > 5 || columns > 6 ? 'small' : 'large', 'chair']"  :key="imgIndex" alt="chair icon" src="@/assets/blackchair.svg">
			</div>
		</section>
	</div>
</template>

<script>

export default {
	name: 'SeatingDiagram',
	props: ['columns', 'rows', 'selected']
}
</script>

<style scoped>
#diagramContainer {
	display: grid;
	grid-gap: 10px;
	height: 100%;
  	/*align-items: center;
	justify-content: center;*/
}

.chair-row {
	text-align: center;
	justify-self: center;
	align-self: center;
}

.chair-column {
	display: inline-block;
}

.chair {
	margin: 0 10px;
}

.large {
	height: 60px;
}

.small {
	height: 35px;
}
</style>