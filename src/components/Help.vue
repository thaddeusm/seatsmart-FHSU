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
		<section v-if="progress.length == 2">
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
					<p class="center">{{ caption }}</p>
					<div class="demo-area">
						<NameCard 
							class="demo-card" 
							type="demo" 
							v-on:show-caption="showCaption"
						/>
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
								Change the seating of one or more students anytime.
							</p>
						</li>
						<li>
							<img src="@/assets/highlight.svg" alt="highlight icon">
							<h5>Highlight Students</h5>
							<p>
								Drag and drop a color from 15 options to add another way to distinguish students.
								This is especially useful when organizing teams.  You can even have Seatsmart randomly sort students into teams.
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
							<h5>Recent Participation Trends</h5>
							<p>
								Clicking this button displays each student's recent participation trend.
								This is helpful when updating participation grades in Blackboard.  You can change the interval being considered in this calculation in the <button class="inner-link" @click="$emit('change-content', 'calculation')">Calculation</button> settings.
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
						<li>
							<img src="@/assets/star-deselect.svg" alt="deselect students icon">
							<h5>Deselect All Students</h5>
							<p>
								Get rid of all of the stars in one click!  That sounds a little depressing, but 
								it really is convenient sometimes.
							</p>
						</li>
					</ul>
				</template>
			</Tabs>
		</section>
		<!-- Feature discovery for Remote and Activities -->
		<section v-if="progress.length > 2 && progress.length < 6">
			<h4>
				Connecting Remote Devices
			</h4>
			<p>
				Seatsmart is and always will be an offline-first application.  All features essential to managing classroom participation records do not require an Internet connection and all data is stored on your computer (check for the "Seatsmart" folder in your computer's My Documents / Documents area).
			</p>
			<p>
				Features such as Remote and Activities are completely optional and are only meant to add convenience or opportunities for students to participate.
			</p>
			<br><br>
			<h4>
				Remote
			</h4>
			<p>
				When viewing a class chart, you may have noticed the <img class="embedded-icon" src="@/assets/remote.svg" alt="remote icon"> icon at the upper-right corner of the screen.  Clicking this icon (if you are connected to the Internet) will reveal a QR code that you can scan with your mobile device.  This will set up a secure connection to allow you control basic features of Seatsmart remotely.
			</p>
			<p><i>Why would you use this?</i></p>
			<p>
				Using Seatsmart actively in class would otherwise require you to be near your computer (at the front of the room) and to switch between other programs you may be running (Powerpoint).  Using a mobile device as a remote instead allows you to move around the classroom, interacting with students and recording participation notes as they occur without needing to go back to the computer.
			</p>
			<div class="personal-note">
				<img class="profile-image" src="@/assets/thaddeus.png" alt="sketched image of Thaddeus">
				<div class="text-bubble">
					<p>
						My favorite way to use the Remote is to stand toward the back of the classroom with the Seatsmart chart in presentation mode, projected at the front of the classroom.  I use my iPad to have Seatsmart choose a random student <img class="embedded-icon-inverted" src="@/assets/randomblack.svg" alt="dice icon">, which the students can see illuminated in yellow/gold on the screen in front of them.
					</p>
					<p>
						Then, I may ask a pop quiz question or for an example that contributes to the lesson.  Then, I tap the <img class="embedded-icon-inverted" src="@/assets/note.svg" alt="note icon">  button to give the student participation points before moving on.
					</p>
				</div>
			</div>
			<h4>
				Connecting with Students' Devices (Activities)
			</h4>
			<p>
				You can find the Activities icon (<img class="embedded-icon-plain" src="@/assets/activities-circle.svg" alt="activities icon">) at the upper-left corner of the screen both when you first open Seatsmart and when you are viewing a class chart.  When clicking this icon from the starting screen, you can create new realtime activities for your classes in advance and manage existing ones.  From a class chart, this icon acts as a launch window to help you initiate the activity during class.
			</p>
			<p>
				Launching an activity allows students to securely connect their devices with your computer via a QR code for a short but engaging event (such as a survey).  After you end the activity session, you will be prompted to choose whether or not to immediately add participation records for all active participants.
			</p>
			<div class="personal-note">
				<img class="profile-image" src="@/assets/thaddeus.png" alt="sketched image of Thaddeus">
				<div class="text-bubble">
					<p>
						This is a very new feature in Seatsmart that I look forward to exploring in my classes this fall.  I hope you find it convenient that it integrates with your other classroom records and does not require logging into anything, which cannot be said of Kahoot, Socrative, or other popular education apps.
					</p>
					<p>
						For example, before beginning a Composition class about ways to structure writing, I might launch a survey that asks students how long a typical paragraph should be.  The idea is not to look for a "correct answer", but instead to get a baseline of what students have heard/guessed before starting the lesson.  Students themselves may be interested in watching the screen as results are tabulated in realtime.
					</p>
					<p>
						Then, I can quickly add participation points when prompted after I end the survey.  Behind the scenes, Seatsmart determines which students were "genuine" participants by ensuring that only students who selected an option during the time allowed receive credit.
					</p>
				</div>
			</div>
			<p>
				Tip: Take advantage of the preview feature when creating an activity to get a sense of a student's experience.  Activities should feel more like a game than a quiz.  Also, keep in mind language barriers (keep wording concise or define beforehand).
			</p>
		</section>
		<!-- Final help docs / onboarding complete -->
		<section v-if="progress.length == 6">
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
					<p class="center">{{ caption }}</p>
					<div class="demo-area">
						<NameCard 
							class="demo-card" 
							type="demo" 
							v-on:show-caption="showCaption"
						/>
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
								Change the seating of one or more students anytime.
							</p>
						</li>
						<li>
							<img src="@/assets/highlight.svg" alt="highlight icon">
							<h5>Highlight Students</h5>
							<p>
								Drag and drop a color from 15 options to add another way to distinguish students.
								This is especially useful when organizing teams.  You can even have Seatsmart randomly sort students into teams.
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
							<h5>Recent Participation Trends</h5>
							<p>
								Clicking this button displays each student's recent participation trend.
								This is helpful when updating participation grades in Blackboard.  You can change the interval being considered in this calculation in the <button class="inner-link" @click="$emit('change-content', 'calculation')">Calculation</button> settings.
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
						<li>
							<img src="@/assets/star-deselect.svg" alt="deselect students icon">
							<h5>Deselect All Students</h5>
							<p>
								Get rid of all of the stars in one click!  That sounds a little depressing, but 
								it really is convenient sometimes.
							</p>
						</li>
					</ul>
				</template>
			</Tabs>
			<br>
			<br>
			<h4>
				Remote
			</h4>
			<p>
				Seatsmart Remote is an optional feature that allows you to take advantage of basic functions without being tied to a computer.  Actions currently supported include selecting a random student, adding a new note about a student/students, and controlling Activities (see next section).  This feature requires Internet access on both the computer and the mobile device (with or without a VPN).  
			</p>
			<p>
				Realtime communication occurs over a secure server with data encrypted in transport (the server cannot decode the information).  The server does not store this information anywhere.  <strong>The QR code used to connect your remote device should be kept hidden from students</strong>.  You can begin and end a remote connection by clicking <img class="embedded-icon" src="@/assets/remote.svg" alt="remote icon"> at the top right corner of the chart.  This icon will turn yellow when the connection is active and red when it is attempting to restore a connection.
			</p>
			<p>
				The remote connection is automatically broken when you leave the chart.  This helps to shorten the remote session, which decreases the likelihood of any security or device performance issues.
			</p>
			<br>
			<br>
			<h4>
				Activities
			</h4>
			<p>
				Like Remote, Seatsmart Activites is an optional feature that requires access to the Internet.  Further, it requires that students have access to Internet-connected devices (smartphones).  Activites are meant to engage students while providing you simple, in-class assessment tools.  
			</p>
			<p>
				The activities you launch through Seatsmart should not make students feel like they are taking a quiz.  Ideally, the process will be somewhat gamified and encourage willing participation.  Since students will be using their own devices to connect, it is important to communicate the short duration and specific purpose of your activities.  Be sure to state beforehand whether or not you would expect students to switch to other applications during or after your activity.
			</p>
			<p>
				This feature will be under active development throughout the 2019-2020 academic year.  Bug reports, feature suggestions, and other comments about Activities are appreciated (see the <button class="inner-link" @click="$emit('change-content', 'about')">About</button> section for contact links).
			</p>
		</section>
	</div>
</template>

<script>
const shell = require('electron').shell

import Tabs from '@/components/Tabs.vue'
import NameCard from '@/components/NameCard.vue'

export default {
	name: 'Help',
	components: {
		Tabs,
		NameCard
	},
	data() {
		return {
			caption: 'Hover over parts of the example name card below to learn more.'
		}
	},
	computed: {
		progress() {
			return this.$store.state.preferences.progress
		}
	},
	methods: {
		showCaption(caption) {
			this.caption = caption
		},
		openWebPage(page) {
			if (page == 'video') {	
				shell.openExternal('https://mailfhsu-my.sharepoint.com/:v:/g/personal/tbmccleary_fhsu_edu/ERWcdtM1yBJPhffl5rvttiwBP8JNyhQA9_RoBg-kEkw4Pw?e=iyrKnZ')
			} else {
				shell.openExternal('https://seatsmart.tech/')
			}
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
	font-size: 18px;
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

.embedded-icon {
	padding: 3px;
	background: var(--black);
	height: 20px;
	vertical-align: middle;
	border-radius: 3px;
}

.embedded-icon-inverted {
	padding: 3px;
	background: var(--white);
	height: 20px;
	vertical-align: middle;
	border-radius: 3px;
}

.embedded-icon-plain {
	padding: 3px;
	background: transparent;
	height: 20px;
	vertical-align: middle;
	border-radius: 3px;
}

.personal-note {
	display: grid;
	grid-template-columns: auto 1fr;
	grid-template-areas: "profile textBubble";
	margin: 30px 0;
}

.profile-image {
	grid-area: profile;
	width: 100px;
	margin-right: 10px;
	border-radius: 100px;
	background: var(--white);
	box-shadow: 0px 0px 5px var(--black);
}

.text-bubble {
	grid-area: textBubble;
	padding: 5px 15px;
	background: var(--dark-gray);
	color: var(--light-gray);
	border-radius: 5px;
}

.inner-link {
	background: none;
	border: none;
	outline: none;
	cursor: pointer;
	font-size: 18px;
	border-bottom: 2px solid var(--yellow);
}
</style>
