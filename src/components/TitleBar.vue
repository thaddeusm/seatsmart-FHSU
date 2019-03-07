<template>
	<header id="titleBarContainer">
		<div :class="[compact ? 'small-line' : 'line']"></div>
		<h3 v-if="classID !== undefined && !link">{{ returnedTitle }}</h3>
		<h6 v-else-if="compact && !link">{{ shortenedTitle }}</h6>
		<h2 v-else-if="!compact && !link">{{ shortenedTitle }}</h2>
		<router-link v-else-if="link && !compact" class="large-link" :to="`/chart/${classID}`">{{ returnedTitle }}</router-link>
		<router-link v-else-if="link && compact" class="small-link" :to="`/chart/${classID}`">{{ returnedTitle }}</router-link>
		<button v-if="edit" @click="$emit('edit-info')"><img src="@/assets/edit.svg" alt="edit icon"></button>
		<div :class="[compact ? 'small-line' : 'line']"></div>
	</header>
</template>

<script>
import db from '@/db'

export default {
	name: 'TitleBar',
	props: ['title', 'compact', 'classID', 'edit', 'link'],
	computed: {
		returnedTitle() {
			return this.$store.state.allClasses[this.classID]
		},
		shortenedTitle() {
			if (this.title && this.title.length > 15) {
				return this.title.slice(0, 11) + '...'
			} else {
				return this.title
			}
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

a {
	color: var(--white);
	text-decoration: none;
}

.large-link {
	font-weight: 500;
	font-size: 26px;
}

.small-link {
	font-weight: 400;
	font-size: 14px;
}

button {
	background: none;
	outline: none;
	border: none;
	cursor: pointer;
	margin-left: 10px;
}

img {
	width: 15px;
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
