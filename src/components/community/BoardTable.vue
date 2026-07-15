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
  },
  startNumber: {
    type: Number,
    default: 1
  }
})

const emit = defineEmits(['select-post'])
</script>

<template>
  <section class="board-table">
    <div v-if="posts.length" class="rows">
      <BoardRow
        v-for="(post, index) in posts"
        :key="post.id"
        :post="post"
        :post-number="startNumber + index"
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
}

.rows {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}

.empty {
  padding: 1.25rem 0.25rem;
  color: #64748b;
}
</style>
