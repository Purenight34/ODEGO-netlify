<script setup>
defineProps({
  currentPage: {
    type: Number,
    required: true
  },
  totalPages: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['change-page'])

function changePage(page) {
  if (page < 1 || page > totalPages) return
  emit('change-page', page)
}
</script>

<template>
  <nav v-if="totalPages > 1" class="pagination" aria-label="페이지 이동">
    <button type="button" :disabled="currentPage === 1" @click="changePage(currentPage - 1)">
      이전
    </button>
    <button
      v-for="page in totalPages"
      :key="page"
      type="button"
      :class="{ active: page === currentPage }"
      @click="changePage(page)"
    >
      {{ page }}
    </button>
    <button type="button" :disabled="currentPage === totalPages" @click="changePage(currentPage + 1)">
      다음
    </button>
  </nav>
</template>

<style scoped>
.pagination {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

button {
  border: 1px solid #cbd5e1;
  border-radius: 999px;
  padding: 0.45rem 0.75rem;
  background: #fff;
  color: #334155;
  cursor: pointer;
}

button.active {
  background: #2563eb;
  color: #fff;
  border-color: #2563eb;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
