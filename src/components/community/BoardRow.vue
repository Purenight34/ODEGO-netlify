<script setup>
defineProps({
  post: {
    type: Object,
    required: true
  },
  postNumber: {
    type: [Number, String],
    default: ''
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
    <div class="col-number">{{ postNumber }}</div>
    <div class="col-title">
      <div class="title-stack">
        <h3>
          <span v-if="post.isNew" class="new-badge">NEW</span>
          {{ post.title }}
        </h3>
        <p>{{ post.summary }}</p>
      </div>
    </div>
    <div class="col-category">
      <span class="category-badge">{{ post.category }}</span>
    </div>
    <div class="col-views">{{ post.views }}</div>
    <div class="col-likes">
      <span class="heart">♡</span>
      <span>{{ post.likes }}</span>
    </div>
  </button>
</template>

<style scoped>
.board-row {
  display: grid;
  grid-template-columns: 60px minmax(0, 1fr) 90px 70px 70px;
  gap: 0.75rem;
  align-items: center;
  width: 100%;
  padding: 0.9rem 0.3rem;
  border: 1px solid #f1f5f9;
  border-radius: 16px;
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

.col-number,
.col-views,
.col-likes {
  color: #64748b;
  font-size: 0.9rem;
  text-align: center;
}

.col-title {
  min-width: 0;
}

.col-category {
  text-align: center;
}

.col-likes {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  color: #dc2626;
  font-weight: 600;
}

.heart {
  font-size: 0.95rem;
}

.title-stack {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

h3 {
  margin: 0;
  color: #0f172a;
  font-size: 0.97rem;
  font-weight: 700;
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
  font-size: 0.88rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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

@media (max-width: 768px) {
  .board-row {
    grid-template-columns: 1fr;
    gap: 0.35rem;
    padding: 0.95rem 0.2rem;
  }

  .col-number,
  .col-category,
  .col-views,
  .col-likes {
    display: none;
  }
}
</style>
