<template>
	<div>
		<h1>Help</h1>
		<!-- Show intro help about setting behaviors and calculation -->
		<section v-if="progress.indexOf('created class') === -1">
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
				Learn more about the ideas that inform Seatsmart in the
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
		<section v-if="progress.indexOf('created class') !== -1">
			<h4>
				Using a Chart
			</h4>
			<p>
				A class chart contains rows and columns of Student Cards representing
				seating in the classroom.  Chart Tools at the bottom of the screen provide
				other options.
			</p>
			<br>
			<Tabs :sections="[{label: 'Student Cards', color: 'gray'},  {label: 'Chart Tools', color: 'yellow'}]">
				<template slot="Student Cards">
					<p class="center">
						Hover over the parts of the example name card below to learn more.
					</p>
					<div class="demo-area">
						<NameCard class="demo-card" type="demo" />
					</div>
				</template>
				<template slot="Chart Tools">
					<ul>
						<li>
							<img src="@/assets/editwhite.svg" alt="edit icon">
							<h5>Edit Mode</h5>
							<p>
								You can can add, edit, or delete students directly from the chart.  If you want to
								edit class information (name, rows, columns, etc.), you can click the pencil icon
								that appears on the right side of the class name.
							</p>
						</li>
						<li>
							<img src="@/assets/rearrange.svg" alt="rearrange icon">
							<h5>Rearrange Student Seating</h5>
							<p>
								You can return to this screen any time to change the seating of one or more students.
							</p>
						</li>
						<li>
							<img src="@/assets/highlight.svg" alt="highlight icon">
							<h5>Highlight Students</h5>
							<p>
								Drag and drop a color from 15 options to add another way to distinguish students.
								This is especially useful when organizing teams.
							</p>
						</li>
						<li>
							<img src="@/assets/random.svg" alt="select random student icon">
							<h5>**Random Student Selector</h5>
							<p>
								Well...randomish.  Students are shuffled to prevent a student from being chosen
								consecutively.  Click the button again to select another student.  Double-click to
								make the selection disappear.
							</p>
						</li>
						<li>
							<img src="@/assets/changecard.svg" alt="change card style icon">
							<h5>Toggle Student Card Styles</h5>
							<p>
								By default, student cards show indicators about absences and notes.  You can click
								this button to switch back and forth to a more simple card style that hides these
								records.  This is useful if other students are looking at the screen.
							</p>
						</li>
						<li>
							<img src="@/assets/trendicon.svg" alt="show participation trends icon">
							<h5>Week Participation Trends</h5>
							<p>
								Clicking this button displays each student's participation trend for the current week.
								This is helpful when updating participation grades in Blackboard.  Remember to try out
								both trend calculation strategies to see which works best for you.
							</p>
						</li>
						<li>
							<img src="@/assets/present.svg" alt="present icon">
							<h5>Chart Presentation Mode</h5>
							<p>
								When you would like to show the seating chart to students over a projector, click this
								button to flip the chart orientation and hide participation indicators.  It also hides
								the chart tools to expand screen space.  Click again to disable.
							</p>
						</li>
						<li>
							<img src="@/assets/groupnote.svg" alt="group note icon">
							<h5>Add a Bulk Note</h5>
							<p>
								Apply one participation note to multiple students.  This is helpful, for instance, when
								wanting to quickly note which students are late when the class bell rings.
							</p>
						</li>
					</ul>
				</template>
			</Tabs>
		</section>
	</div>
</template>

<script>
import Tabs from '@/components/Tabs.vue'
import NameCard from '@/components/NameCard.vue'

export default {
	name: 'Help',
	components: {
		Tabs,
		NameCard
	},
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

.center {
	text-align: center;
}

button {
	background: none;
	border: none;
	outline: none;
	cursor: pointer;
}

ul {
	list-style: none;
}

li:first-child {
	margin-top: 0;
}

li {
	margin: 30px 0;
	padding: 20px 15px;
	background: var(--light-gray);
	border-radius: 10px;
}

li > h5 {
	display: inline-block;
}

li > img {
	background: var(--gray);
	padding: 8px;
	border-radius: 5px;
	vertical-align: middle;
	margin-right: 10px;
	margin-bottom: 3px;
}

.inner-link {
	font-size: 20px;
	border-bottom: 2px solid var(--yellow);
}

.demo-area {
    display: block;
    vertical-align: middle;
    color: var(--black);
    margin: 60px auto 10px auto;
    text-align: center;
}

.demo-card {
    width: 146px!important;
    height: 94px!important;
    display: inline-block;
	background: var(--light-gray);
	margin: 0 auto;
	border: 2px solid var(--gray);
}
</style>
