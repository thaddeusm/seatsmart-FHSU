<template>
  <div id="app">
  	<WindowFrame />
    <router-view />
  </div>
</template>

<script>
import WindowFrame from '@/components/WindowFrame.vue'

export default {
	name: 'App',
	components: {
		WindowFrame,
	}
}
</script>

<style>

</style>
