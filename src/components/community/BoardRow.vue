<script setup>
defineProps({
  post: {
    type: Object,
    required: true
  },
  selected: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['select'])
</script>

<template>
  <button class="board-row" :class="{ active: selected }" @click="emit('select', post.id)">
    <span class="title">{{ post.title }}</span>
    <span class="meta">{{ post.author }}</span>
    <span class="meta">{{ post.date }}</span>
    <span class="meta">{{ post.views }}회</span>
  </button>
</template>

<style scoped>
.board-row {
  display: grid;
  grid-template-columns: 2.2fr 0.9fr 0.8fr 0.7fr;
  gap: 1rem;
  width: 100%;
  padding: 0.9rem 1rem;
  border: none;
  border-bottom: 1px solid #e5e7eb;
  background: #fff;
  text-align: left;
  cursor: pointer;
}

.board-row:hover,
.board-row.active {
  background: #eff6ff;
}

.title {
  font-weight: 700;
  color: #0f172a;
}

.meta {
  color: #64748b;
  font-size: 0.9rem;
}
</style>
