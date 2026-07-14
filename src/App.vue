<script setup>
const message = 'Vibe Coding에서 실행 중인 Vue 앱입니다.'
</script>

<template>
  <main class="app">
    <h1>Vue 앱이 생성되었습니다</h1>
    <p>{{ message }}</p>
    <button @click="alert('Hello from Vue!')">확인</button>
  </main>
</template>

<style scoped>
.app {
  min-height: 100vh;
  display: grid;
  place-items: center;
  text-align: center;
  gap: 0.75rem;
  padding: 2rem;
}

button {
  padding: 0.7rem 1.2rem;
  border: none;
  border-radius: 999px;
  cursor: pointer;
  background: #2563eb;
  color: white;
}
</style>
