<template>
	<div>
		<aside>
			<div id="navigationLogo">
				<img src="@/assets/cog.svg" alt="settings icon">
			</div>
			<ul id="navigationList">
				<li class="active">Behaviors</li>
				<li>Calculation</li>
				<li>About</li>
			</ul>
			<div id="navigationFooter">
				<button @click="$emit('trigger-modal-close')">Close</button>
			</div>
		</aside>
		<section>
			
		</section>
	</div>
</template>

<script>
export default {
	name: 'Settings',
	data() {
		return {
			window: 'behaviors'
		}
	}
}
</script>

<style scoped>

</style>