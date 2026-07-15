<script setup>
import Header from './components/layout/Header.vue'
import HeroSection from './components/hero/HeroSection.vue'
import CommunitySection from './components/community/CommunitySection.vue'
import BusanMapSection from './components/place/BusanMapSection.vue'
import ChatbotWidget from './components/chat/ChatbotWidget.vue'
</script>

<template>
  <main class="app-shell">
    <Header />
    <HeroSection />
    <CommunitySection />
    <BusanMapSection />
    <ChatbotWidget />
  </main>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
  background: #ffffff;
  display: grid;
  gap: 3rem;
  padding: 1.5rem 1.25rem 3rem;
}
</style>
