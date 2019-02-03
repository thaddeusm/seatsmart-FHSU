<template>
	<section id="actionBarContainer">
		<button v-if="hamburger" class="hamburger-button" @click="toggleDisplay"><img src="@/assets/hamburger.svg" alt="open navigation icon"></button>
		<transition name="slide">
			<div :style="{background: background}" v-if="display">
				<section class="left-button">
					<slot name="left"></slot>
				</section>
				<section class="center-buttons">
					<slot name="center"></slot>
				</section>
				<section class="right-button">
					<slot name="right"></slot>
				</section>
			</div>
		</transition>
	</section>
</template>

<script>
export default {
	name: 'ActionBar',
	props: ['background', 'hamburger', 'collapsed'],
	data() {
		return {
			display: true
		}
	},
	watch: {
		collapsed() {
			if (this.collapsed !== null) {
				if (this.collapsed == true) {
					this.toggleDisplay()
				}
			}
		}
	},
	methods: {
		toggleDisplay() {
			this.display = !this.display
			if (this.display) {
				this.$emit('contract')
			} else {
				this.$emit('expand')
			}
		}
	},
	mounted() {
		if (this.collapsed !== null) {
			if (this.collapsed == true) {
				this.toggleDisplay()
			}
		}
	}
}
</script>

<style scoped>
div {
	color: var(--yellow);
	height: 100%;
	min-width: 100vw;
	width: 100%;
	min-height: 70px;
	display: grid;
	grid-template-columns: 5% 1fr 5%;
	grid-template-areas: "left center right";
	justify-content: center;
	align-items: center;
}

section {
	display: inline-block;
}

.left-button {
	text-align: center;
	grid-area: "left";
}

.center-buttons {
	grid-area: "center";
	text-align: center;
}

.right-button {
	text-align: center;
	grid-area: "right";
}

img {
	width: 30px;
	vertical-align: middle;
}

button {
	background: none;
	outline: none;
	border: none;
	cursor: pointer;
}

.hamburger-button {
	background: var(--yellow);
	padding: 2px 7px;
}

.hamburger-button > img {
	width: 20px;
}

.slide-enter-active {
	animation: slide .3s ease;
}
.slide-leave-active {
	animation: slide .1s ease-out reverse;
}

@keyframes slide {
	0% {
		transform: translateY(50px);
		position: absolute;
		margin-top: -15px;
	}
	100% {
		transform: translateY(0px);
		margin-top: 0;
	}
}
</style>
