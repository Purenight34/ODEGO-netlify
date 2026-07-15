<script setup>
import CommunitySection from './components/community/CommunitySection.vue'
</script>

<template>
  <main class="app-shell">
    <CommunitySection />
  </main>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
  padding: 2rem 1rem 3rem;
  background: linear-gradient(135deg, #f8fbff 0%, #eef4ff 100%);
}
</style>
