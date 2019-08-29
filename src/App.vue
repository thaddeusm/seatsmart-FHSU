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
* {
    margin: 0;
    padding: 0;
    font-weight: lighter;
    -webkit-font-smoothing: antialiased;
}

/* inspired by FHSU colors */
:root {
    --yellow: #FCBB04;
    --red: #D2360A;
    --black: #000000;
    --dark-gray: #040404;
    --gray: #6C6C6C;
    --light-gray: #E5E5E5;
    --white: #FFFFFF;
}

/* custom text highlight color */
::selection {
    background: var(--yellow);
}

@font-face {
    font-family: "ArchivoNarrow";
    src: url('/ArchivoNarrow.ttf');
}

html, body {
    width: 100%;
    background: var(--black);
}

h1 {
    font-family: "ArchivoNarrow";
    -webkit-user-select: none;
    font-weight: lighter;
    font-size: 32px;
}

h2 {
    font-family: "ArchivoNarrow";
    font-weight: lighter;
    -webkit-user-select: none;
    font-size: 28px;
}

h3 {
    font-family: "ArchivoNarrow";
    font-weight: lighter;
    -webkit-user-select: none;
    font-size: 26px;
}

h4 {
    font-family: "ArchivoNarrow";
    font-weight: lighter;
    -webkit-user-select: none;
    font-size: 22px;
}

h5 {
    font-family: "ArchivoNarrow";
    font-weight: lighter;
    -webkit-user-select: none;
    font-size: 16px;
}

h6 {
    font-family: "ArchivoNarrow";
    font-weight: lighter;
    -webkit-user-select: none;
    font-size: 14px;
}

p {
    -webkit-user-select: none;
    font-family: "ArchivoNarrow";
    font-size: 18px;
    line-height: 1.5;
}

span {
    -webkit-user-select: none;
    font-family: "ArchivoNarrow";
}

li {
    -webkit-user-select: none;
    font-family: "ArchivoNarrow";
}

button {
    -webkit-user-select: none;
    font-family: "ArchivoNarrow";
}

a {
    -webkit-user-select: none;
    font-family: "ArchivoNarrow";
}

img {
    -webkit-user-select: none;
}

input {
    font-family: "ArchivoNarrow";
}

textarea {
    font-family: "ArchivoNarrow";
}

body {
    font-family: "ArchivoNarrow";
}
</style>
