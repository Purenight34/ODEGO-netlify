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
    <div class="row-main">
      <span class="category-badge">{{ post.category }}</span>
      <div class="title-block">
        <h3>
          <span v-if="post.isNew" class="new-badge">NEW</span>
          {{ post.title }}
        </h3>
        <p>{{ post.summary }}</p>
      </div>
    </div>
    <div class="row-meta">
      <span class="meta-date">{{ post.date }}</span>
      <span class="meta-pill">♡ {{ post.likes }}</span>
      <span class="meta-pill">💬 {{ post.comments?.length || 0 }}</span>
    </div>
  </button>
</template>

<style scoped>
.board-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  width: 100%;
  padding: 1rem 1.1rem;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  background: #fff;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
}

.board-row:hover,
.board-row.active {
  border-color: #93c5fd;
  box-shadow: 0 10px 24px rgba(37, 99, 235, 0.08);
  background: #f8fbff;
}

.row-main {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  min-width: 0;
}

.category-badge {
  padding: 0.35rem 0.65rem;
  border-radius: 999px;
  background: #dbeafe;
  color: #2563eb;
  font-size: 0.75rem;
  font-weight: 700;
  white-space: nowrap;
}

.title-block {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
}

h3 {
  margin: 0;
  color: #0f172a;
  font-size: 1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.new-badge {
  padding: 0.18rem 0.45rem;
  border-radius: 999px;
  background: #2563eb;
  color: white;
  font-size: 0.7rem;
  font-weight: 700;
}

p {
  margin: 0;
  color: #64748b;
  font-size: 0.9rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.row-meta {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: #64748b;
  font-size: 0.9rem;
  white-space: nowrap;
}

.meta-date {
  color: #94a3b8;
}

.meta-pill {
  padding: 0.25rem 0.5rem;
  border-radius: 999px;
  background: #f8fafc;
}

@media (max-width: 768px) {
  .board-row {
    flex-direction: column;
    align-items: start;
  }

  .row-meta {
    width: 100%;
    justify-content: start;
    flex-wrap: wrap;
  }
}
</style>
