<script setup>
import BoardRow from './BoardRow.vue'

defineProps({
  posts: {
    type: Array,
    default: () => []
  },
  selectedPostId: {
    type: [Number, String, null],
    default: null
  }
})

const emit = defineEmits(['select-post'])
</script>

<template>
  <section class="board-table">
    <div class="table-header">
      <span>제목</span>
      <span>작성자</span>
      <span>등록일</span>
      <span>조회수</span>
    </div>

    <div v-if="posts.length" class="rows">
      <BoardRow
        v-for="post in posts"
        :key="post.id"
        :post="post"
        :selected="post.id === selectedPostId"
        @select="emit('select-post', $event)"
      />
    </div>

    <p v-else class="empty">검색 결과가 없습니다.</p>
  </section>
</template>

<style scoped>
.board-table {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  background: #fff;
}

.table-header {
  display: grid;
  grid-template-columns: 2.2fr 0.9fr 0.8fr 0.7fr;
  gap: 1rem;
  padding: 1rem;
  background: #f8fafc;
  color: #475569;
  font-size: 0.9rem;
  font-weight: 700;
}

.rows {
  display: flex;
  flex-direction: column;
}

.empty {
  padding: 1.5rem;
  color: #64748b;
}
</style>
