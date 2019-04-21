<template>
  <div id="app">
  	<WindowFrame />
  	<!-- force components to rerender with fresh data -->
    <router-view :key="$route.fullPath" />
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
