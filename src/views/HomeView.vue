<template>
  <div class="home-page">
    <Header />
    <HeroSection />
    <CommunitySection />
    <BusanMapSection />
  </div>
</template>

<script setup>
import Header from '@/components/layout/Header.vue'
import HeroSection from '@/components/hero/HeroSection.vue'
import BusanMapSection from '@/components/place/BusanMapSection.vue'
import CommunitySection from '@/components/community/CommunitySection.vue'
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f8fbff 0%, #f5f7fb 100%);
}
</style>