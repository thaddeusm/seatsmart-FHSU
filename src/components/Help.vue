<template>
	<div>
		<h2>Help</h2>
		<!-- Show intro help about setting behaviors and calculation -->
		<section v-if="progress.length == 0">
			<p>Progress is 0.</p>
		</section>
		<!-- Show help about chart UI -->
		<section v-if="progress.length == 1">
			<p>Progress is 1.</p>
		</section>
		<!-- Show help about student info -->
		<section v-if="progress.length == 2">
			<p>Progress is 2.</p>
		</section>
		<!-- Show abbreviated help about the whole app -->
		<section v-if="progress.length == 3">
			<p>Progress is 3.</p>
		</section>
	</div>
</template>

<script>
export default {
	name: 'Help',
	computed: {
		progress() {
			return this.$store.state.preferences.progress;
		}
	}
}
</script>

<style scope>
p {
	margin: 10px 0;
	line-height: 1.8;
}
</style>