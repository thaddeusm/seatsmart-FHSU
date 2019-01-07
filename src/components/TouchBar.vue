<template>
	
</template>

<script>
const remote = require('electron').remote
const { TouchBar } = require('electron').remote
const {TouchBarLabel, TouchBarButton, TouchBarSpacer} = TouchBar

export default {
	name: 'TouchBar',
	props: ['bar'],
	methods: {
		buildItem(item) {
			switch(item.type) {
				case 'button':
					let button = new TouchBarButton({label: item.label, click: item.method});
					return button;
					break;
				case 'spacer':
					let spacer = new TouchBarSpacer({size: item.size});
					return spacer;
					break;
			}
		}
	},
	mounted() {
		// bar = [{type: 'button', label: '', method: ''}, {type: 'spacer', size: 'flexible'}]
		let touchbarItems = [];

		this.bar.forEach((item) => {
			touchbarItems.push(this.buildItem(item));
		});
		let touchbar = new TouchBar(touchbarItems);

		let window = remote.getCurrentWindow();
		window.setTouchBar(touchbar);
	}
}
</script>