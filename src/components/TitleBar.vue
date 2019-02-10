<template>
	<header id="titleBarContainer">
		<div :class="[compact ? 'small-line' : 'line']"></div>
		<h3 v-if="classID !== undefined">{{ returnedTitle }}</h3>
		<h6 v-else-if="compact && title.length > 15">{{ title.slice(0, 11) + '...' }}</h6>
		<h6 v-else-if="compact">{{ title }}</h6>
		<h2 v-else-if="!compact">{{ title }}</h2>
		<div :class="[compact ? 'small-line' : 'line']"></div>
	</header>
</template>

<script>
import db from '@/db'

export default {
	name: 'TitleBar',
	props: ['title', 'compact', 'classID'],
	computed: {
		returnedTitle() {
			return this.$store.state.allClasses[this.classID]
		}
	}
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

h4 {
	color: var(--white);
}

.line {
	height: 3px;
	background: var(--yellow);
	width: 30%;
	margin: 0 20px 5px 20px;
	vertical-align: middle;
}

.small-line {
	height: 2px;
	background: var(--yellow);
	width: 25%;
	margin: 0 15px 2px 15px;
	vertical-align: middle;
}
</style>
