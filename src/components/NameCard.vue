<template>
	<div id="cardContainer">
		<section class="card-header"></section>
		<section class="card-body">
			<!-- <h3 v-if="name !== ''">{{ name.split('(')[1].split(')')[0] }}</h3> -->
			<h3 v-if="student.firstName !== ''">{{ student.firstName }}</h3>
		</section>
		<section class="card-footer"></section>
	</div>
</template>

<script>
import db from '@/db.js'

export default {
	name: 'NameCard',
	props: ['type', 'column', 'row', 'classId'],
	data() {
		return {
			student: {
				firstName: '',
				lastName: '',
				class: '',
				_id: '',
				seat: {
					row: null,
					column: null
				}
			}
		}
	},
	mounted() {
		db.readSomething('students', {seat: {row: this.row, column: this.column}, class: this.classId})
			.then((result) => {
				if (result.length !== 0) {
					this.student = result[0]
				}
			})
	}
}
</script>

<style scoped>
#cardContainer {
	display: inline-block;
	width: 100%;
	height: 100%;
	background: var(--light-gray);
	border-radius: 10px;
}
</style>