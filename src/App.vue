<script setup>
import BusanVisualMap from './components/place/BusanMapSection.vue'
</script>

<template>
	<main>
		<BusanVisualMap />
	</main>
</template>

<style>
* {
	box-sizing: border-box;
}

html,
body,
#app {
	min-height: 100%;
	margin: 0;
}

body {
	background: #f1f5f9;
	font-family:
		Pretendard,
		-apple-system,
		BlinkMacSystemFont,
		'Segoe UI',
		sans-serif;
}
</style>