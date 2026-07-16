<script setup>
import Header from './components/layout/Header.vue'
import HeroSection from './components/hero/HeroSection.vue'
import CommunitySection from './components/community/CommunitySection.vue'
import BusanMapSection from './components/place/BusanMapSection.vue'
import Chatbot from './components/chatbot/ChatBot.vue'
</script>

<template>
  <main class="app-shell">
    <Header />
    <HeroSection />
    <CommunitySection />
    <BusanMapSection />
    <Chatbot />
  </main>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
  background: #ffffff;
  display: grid;
  gap: 3rem;
 
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