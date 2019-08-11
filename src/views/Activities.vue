<template>
	<div id="container">
		<header>
			<div id="backArea">
				<button @click="routeBack">
					<img src="@/assets/backarrowwhite.svg" alt="back arrow" id="backArrow">
				</button>
			</div>
			<div id="iconArea">
				<img src="@/assets/activities-circle.svg" alt="activities icon" id="icon">
			</div>
		</header>
		<main>
			<ButtonCard icon="+" text="activity" to="/activity/new"/>
		</main>
	</div>
</template>

<script>
import ButtonCard from '@/components/ButtonCard.vue'

export default {
	name: 'Activities',
	components: {
		ButtonCard
	},
	methods: {
        routeBack() {
            let lastView = this.$store.state.lastView

            this.$router.push(lastView)
        }
	}
}
</script>

<style scoped>
#container {
    background: var(--black);
    width: 100%;
    height: 100%;
	z-index: 1;
}

header {
	display: grid;
	grid-template-rows: 60% 1fr;
    grid-template-columns: 5% 18% 1fr 18% 5%;
    grid-template-areas: 
        ". back . . ."
        "icon icon icon icon icon";
	height: 250px;
	align-items: center;
    justify-content: center;
}

#backArea {
	grid-area: back;
	font-size: 14px;
}

#iconArea {
	grid-area: icon;
	text-align: center;
}

#icon {
	width: 105px;
}

main {
    text-align: center;
    width: 100%;
    margin-top: 94px;
    margin-bottom: 100px;
}

button {
    background: none;
    outline: none;
    border: none;
    cursor: pointer;
}
</style>
