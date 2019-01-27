<template>
	<!-- Electron JS module requires no markup or CSS styling -->
</template>

<script>
const remote = require('electron').remote
const { TouchBar } = require('electron').remote
const {TouchBarLabel, TouchBarButton, TouchBarSpacer} = TouchBar

export default {
	name: 'TouchBar',
	props: ['bar', 'show'],
	watch: {
		show: function() {
			let window = remote.getCurrentWindow()
			if (this.show) {
				let touchbarItems = []

				this.bar.forEach((item) => {
					touchbarItems.push(this.buildItem(item))
				})

				// passes array into a new touchbar
				let touchbar = new TouchBar(touchbarItems)

				// display touchbar
				
				window.setTouchBar(touchbar)
			} else {
				window.setTouchBar(null)
			}
		}
	},
	methods: {
		buildItem(item) {
			// supports building simple touchbar buttons and spacers
			switch(item.type) {
				case 'button':
					let button = new TouchBarButton({label: item.label, click: item.method})
					return button;
					break;
				case 'spacer':
					let spacer = new TouchBarSpacer({size: item.size})
					return spacer;
					break;
			}
		}
	},
	mounted() {
		/*
		
		API example:
		bar = [{type: 'button', label: '', method: ''}, {type: 'spacer', size: 'flexible'}]

		*/
		let window = remote.getCurrentWindow()
		
		// clear previous
		window.setTouchBar()
		// built touchbar elements stored in an array
		let touchbarItems = []

		this.bar.forEach((item) => {
			touchbarItems.push(this.buildItem(item))
		})

		// passes array into a new touchbar
		let touchbar = new TouchBar(touchbarItems)

		// display touchbar
		window.setTouchBar(touchbar)
	}
}
</script>