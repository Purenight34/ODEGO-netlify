<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import SearchBar from './SearchBar.vue'
import BoardTable from './BoardTable.vue'
import BoardDetail from './BoardDetail.vue'
import Pagination from './Pagination.vue'
import CreatePostForm from './CreatePostForm.vue'
import postsData from '../../data/community-posts.json'
import {
  addComment,
  createPostEntry,
  deletePostEntry,
  filterPosts,
  incrementViewCount,
  loadPosts,
  savePosts,
  toggleLike,
  updatePostEntry
} from './communityUtils'

const posts = ref([])
const searchTerm = ref('')
const selectedPostId = ref(null)
const currentPage = ref(1)
const pageSize = 4
const searchField = ref('all')
const showCreateForm = ref(false)
const editingPostId = ref(null)
const passwordInput = ref('')
const passwordError = ref('')
const commentText = ref('')

onMounted(() => {
  const loaded = loadPosts(postsData)
  posts.value = loaded
  if (loaded.length) {
    selectedPostId.value = loaded[0].id
  }
})

const filteredPosts = computed(() => filterPosts(posts.value, searchTerm.value, searchField.value))
const totalPages = computed(() => Math.max(1, Math.ceil(filteredPosts.value.length / pageSize)))

const pagedPosts = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredPosts.value.slice(start, start + pageSize)
})

const selectedPost = computed(() => {
  return posts.value.find((post) => post.id === selectedPostId.value) ?? null
})

function selectPost(postId) {
  selectedPostId.value = postId
  passwordError.value = ''
  passwordInput.value = ''
  commentText.value = ''
  if (!posts.value.find((post) => post.id === postId)?.views) {
    // no-op
  }

  const updated = incrementViewCount(posts.value, postId)
  posts.value = updated
  savePosts(posts.value)
}

function changePage(page) {
  currentPage.value = page
}

function handleCreatePost(payload) {
  const newPost = createPostEntry(payload)
  posts.value = [newPost, ...posts.value]
  savePosts(posts.value)
  selectedPostId.value = newPost.id
  showCreateForm.value = false
  editingPostId.value = null
}

function toggleCreateForm() {
  showCreateForm.value = !showCreateForm.value
  editingPostId.value = null
  passwordError.value = ''
}

function openEditMode() {
  editingPostId.value = selectedPost.value?.id ?? null
}

function submitEdit(payload) {
  if (!selectedPost.value) return
  posts.value = updatePostEntry(posts.value, selectedPost.value.id, payload)
  savePosts(posts.value)
  editingPostId.value = null
}

function deletePost(postId) {
  const target = posts.value.find((post) => post.id === postId)
  if (!target) return

  const confirmed = window.confirm('정말로 이 글을 삭제하시겠습니까?')
  if (!confirmed) return

  posts.value = deletePostEntry(posts.value, postId)
  savePosts(posts.value)
  if (selectedPostId.value === postId) {
    selectedPostId.value = posts.value[0]?.id ?? null
  }
}

function likePost(postId) {
  posts.value = toggleLike(posts.value, postId)
  savePosts(posts.value)
}

function addCommentToPost() {
  if (!selectedPost.value || !commentText.value.trim()) return
  posts.value = addComment(posts.value, selectedPost.value.id, { content: commentText.value.trim() })
  savePosts(posts.value)
  commentText.value = ''
}

function verifyPassword(postId) {
  const target = posts.value.find((post) => post.id === postId)
  if (!target) return

  if (passwordInput.value !== target.password) {
    passwordError.value = '비밀번호가 일치하지 않습니다.'
    return
  }

  passwordError.value = ''
  deletePost(postId)
}

watch(searchTerm, () => {
  currentPage.value = 1
})
</script>

<template>
  <section class="community-section">
    <div class="section-header">
      <div>
        <p class="eyebrow">Community</p>
        <h2>부산 여행 커뮤니티</h2>
      </div>
      <p class="description">익명으로 자유롭게 이야기하고, 여행 이야기를 나눠보세요.</p>
    </div>

    <div class="toolbar">
      <div class="search-controls">
        <SearchBar v-model="searchTerm" placeholder="검색어를 입력하세요" />
        <select v-model="searchField" class="search-select">
          <option value="all">전체</option>
          <option value="title">제목</option>
          <option value="category">카테고리</option>
          <option value="content">내용</option>
        </select>
      </div>
      <div class="toolbar-actions">
        <p class="result-count">총 {{ filteredPosts.length }}개</p>
        <button class="write-button" @click="toggleCreateForm">글쓰기</button>
      </div>
    </div>

    <CreatePostForm v-if="showCreateForm" class="create-form" @submit="handleCreatePost" />

    <div class="content-grid">
      <div class="board-panel">
        <BoardTable :posts="pagedPosts" :selected-post-id="selectedPostId" @select-post="selectPost" />
        <Pagination :current-page="currentPage" :total-pages="totalPages" @change-page="changePage" />
      </div>
      <BoardDetail
        :post="selectedPost"
        :editing-post-id="editingPostId"
        :password-input="passwordInput"
        :password-error="passwordError"
        :comment-text="commentText"
        @like-post="likePost"
        @delete-post="deletePost"
        @edit-post="openEditMode"
        @submit-edit="submitEdit"
        @verify-password="verifyPassword"
        @update:password-input="(value) => (passwordInput = value)"
        @update:comment-text="(value) => (commentText = value)"
        @add-comment="addCommentToPost"
      />
    </div>
  </section>
</template>

<style scoped>
.community-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  max-width: 1160px;
  margin: 0 auto;
  padding: 2rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: end;
  gap: 1rem;
}

.eyebrow {
  margin: 0 0 0.25rem;
  color: #2563eb;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

h2 {
  margin: 0;
  font-size: 1.8rem;
  color: #0f172a;
}

.description {
  margin: 0;
  color: #64748b;
  max-width: 320px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.search-controls {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.search-select {
  border: 1px solid #dbe4ff;
  border-radius: 999px;
  padding: 0.7rem 0.9rem;
  background: #fff;
  color: #334155;
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.result-count {
  margin: 0;
  color: #475569;
  font-weight: 600;
}

.write-button {
  border: none;
  border-radius: 999px;
  padding: 0.7rem 1rem;
  background: #2563eb;
  color: #fff;
  cursor: pointer;
}

.create-form {
  margin-top: 0.25rem;
}

.content-grid {
  display: grid;
  grid-template-columns: 1.3fr 0.9fr;
  gap: 1rem;
}

.board-panel {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

@media (max-width: 900px) {
  .section-header,
  .toolbar {
    flex-direction: column;
    align-items: start;
  }

  .search-controls,
  .toolbar-actions {
    width: 100%;
  }

  .content-grid {
    grid-template-columns: 1fr;
  }
}
</style>
