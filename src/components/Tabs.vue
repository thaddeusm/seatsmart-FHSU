<template>
	<div id="tabsWrapper">
		<section class="tabs">
			<button v-for="section in sections" :class="['tab-button', section.color]" @click="changeTab(section.label)">{{section.label}}</button>
		</section>
		<section class="content" v-for="section in sections" v-bind:ref="section.label" v-if="visible == section.label" :class="[section.color]">
			<slot :name="section.label"></slot>
		</section>
	</div>
</template>

<script>
// sections = [{label: '', color: ''}]

export default {
	name: 'Tabs',
	props: ['sections'],
	data() {
		return {
			visible: null
		}
	},
	methods: {
		changeTab(tab) {
			this.visible = tab
		}
	},
	mounted() {
		this.visible = this.sections[0].label
	}
}
</script>

<style scoped>
#tabsWrapper {
	box-shadow: 0px 0px 2px var(--black);
	border-radius: 10px;
}

.tabs {
	width: 100%;
	background: var(--white);
	border-top-left-radius: 10px;
	border-top-right-radius: 10px;
}

.content {
	padding: 25px 15px;
	border-bottom-left-radius: 10px;
	border-bottom-right-radius: 10px;
}

.tab-button {
	width: 33%;
	padding: 10px 0;
	font-family: 'ArchivoNarrow';
	font-size: 20px;
	margin: 0;
	outline: none;
	border: none;
	cursor: pointer;
}

.tab-button:first-child {
	border-top-left-radius: 10px;
}

.red {
	background: var(--red);
	color: var(--white);
}

.yellow {
	background: var(--yellow);
}

.gray {
	background: var(--light-gray);
}
</style>