<template>
	<div id="container">
		<header>

		</header>
		<main>
		</main>
		<footer>
		</footer>
		<!-- <TouchBar :show="true" :bar="[
	      {type: 'button', label: 'Settings', method: openModal}
	    ]"/> -->
	</div>
</template>

<script>
import db from '@/db.js'

import TitleBar from '@/components/TitleBar.vue'
import ActionBar from '@/components/ActionBar.vue'
import Modal from '@/components/Modal.vue'
import TouchBar from '@/components/TouchBar.vue'

export default {
	name: 'RearrangeSeats',
	props: ['id'],
	components: {
		TitleBar,
		ActionBar,
		Modal,
		TouchBar
	}
}
</script>

<style scoped>

</style>
