<template>
	<div>
		<h1>Help</h1>
		<!-- Show intro help about setting behaviors and calculation -->
		<section v-if="progress.length == 0">
			<h4>Getting Started</h4>
			<p>
				Seatsmart helps track student participation throughout the semester.
			</p>
			<p>
				You record notes about each student.
				The application uses these notes to help you calculate participation
				grades and even helps students themselves understand how they
				can contribute to the learning environment.
			</p>
			<p>
				Learn more about the
				ideas that inform Seatsmart in the
				<button class="inner-link" @click="$emit('change-content', 'about')">About</button> section.
			</p>
			<p>
				To begin, add the positive and negative behaviors you wish to track in the
				<button class="inner-link" @click="$emit('change-content', 'behaviors')">
				Behaviors</button> section.  Then, consider how you would like
				Seatsmart to display student participation trends in the
				<button class="inner-link" @click="$emit('change-content', 'calculation')">
				Calculation</button> section.
			</p>
			<p>
				After reviewing these initial settings, you can save your preferences and create your first
				class chart.  Return to edit these settings at any time.
			</p>
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

<style scoped>
h1 {
	margin-bottom: 25px;
}

p {
	margin: 10px 0;
}

button {
	background: none;
	border: none;
	outline: none;
	cursor: pointer;
}

.inner-link {
	font-size: 20px;
	border-bottom: 2px solid var(--yellow);
}
</style>
