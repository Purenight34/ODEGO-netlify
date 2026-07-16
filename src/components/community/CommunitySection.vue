<script setup>
import { computed, onMounted, ref, watch } from 'vue'
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
const pageSize = 5
const searchField = ref('all')
const activeTab = ref('전체')
const showCreateForm = ref(false)
const editingPostId = ref(null)
const passwordInput = ref('')
const passwordError = ref('')
const commentText = ref('')
const authenticatedPostId = ref(null)

const tabs = ['전체', '맛집', '여행지', '축제', '카페', '기타']

onMounted(() => {
  const loaded = loadPosts(postsData)
  posts.value = loaded
  if (loaded.length) {
    selectedPostId.value = loaded[0].id
  }
})

const filteredPosts = computed(() => {
  let result = filterPosts(posts.value, searchTerm.value, searchField.value)
  if (activeTab.value !== '전체') {
    result = result.filter((post) => post.category === activeTab.value)
  }
  return result
})

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
  authenticatedPostId.value = null
  editingPostId.value = null
  passwordError.value = ''
  passwordInput.value = ''
  commentText.value = ''
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
  authenticatedPostId.value = null
  passwordError.value = ''
  passwordInput.value = ''
}

function openEditMode() {
  if (!selectedPost.value) return
  if (authenticatedPostId.value !== selectedPost.value.id) {
    passwordError.value = '먼저 수정/삭제 인증을 진행해주세요.'
    return
  }
  editingPostId.value = selectedPost.value.id
}

function submitEdit(payload) {
  if (!selectedPost.value || authenticatedPostId.value !== selectedPost.value.id) return
  posts.value = updatePostEntry(posts.value, selectedPost.value.id, payload)
  savePosts(posts.value)
  editingPostId.value = null
}

function deletePost(postId) {
  const target = posts.value.find((post) => post.id === postId)
  if (!target) return
  if (authenticatedPostId.value !== postId) {
    passwordError.value = '먼저 수정/삭제 인증을 진행해주세요.'
    return
  }

  const confirmed = window.confirm('정말로 이 글을 삭제하시겠습니까?')
  if (!confirmed) return

  posts.value = deletePostEntry(posts.value, postId)
  savePosts(posts.value)
  authenticatedPostId.value = null
  passwordInput.value = ''
  passwordError.value = ''
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
  passwordInput.value = ''
  authenticatedPostId.value = postId
}

watch(searchTerm, () => {
  currentPage.value = 1
})
</script>

<template>
  <section id="community" class="community-shell">
    <header class="community-header">
      <div>
        <p class="eyebrow">Community board</p>
        <h2>실시간으로 소통하는 부산 커뮤니티</h2>
        <p class="description">검색하고, 읽고, 댓글을 남기며 다른 여행자와 이야기를 나눠보세요.</p>
      </div>
    </header>

    <div class="section-block">
      <p class="eyebrow">Community</p>
      <h2>부산커뮤니티</h2>
    </div>

    <div class="search-card">
      <select v-model="searchField" class="search-select">
        <option value="all">전체</option>
        <option value="title">제목</option>
        <option value="category">카테고리</option>
        <option value="content">내용</option>
      </select>
      <input v-model="searchTerm" type="text" placeholder="검색어를 입력하세요..." class="search-input" />
      <button class="search-button" type="button">검색</button>
    </div>

    <div class="board-head">
      <h2>전체 게시글</h2>
      <button class="write-button" @click="toggleCreateForm">
        <span class="plus-icon">✎</span>
        글쓰기
      </button>
    </div>

    <div class="board-card">
      <div class="table-header">
        <div class="col-number">번호</div>
        <div class="col-title">제목</div>
        <div class="col-category">구분</div>
        <div class="col-views">조회수</div>
        <div class="col-likes">좋아요</div>
      </div>

      <BoardTable
        :posts="pagedPosts"
        :selected-post-id="selectedPostId"
        :start-number="(currentPage - 1) * pageSize + 1"
        @select-post="selectPost"
      />
      <Pagination :current-page="currentPage" :total-pages="totalPages" @change-page="changePage" />
    </div>

    <div class="detail-card">
      <BoardDetail
        :post="selectedPost"
        :editing-post-id="editingPostId"
        :password-input="passwordInput"
        :password-error="passwordError"
        :comment-text="commentText"
        :is-authenticated="authenticatedPostId === selectedPost?.id"
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

    <div v-if="showCreateForm" class="modal-backdrop" @click.self="toggleCreateForm">
      <div class="modal-card">
        <h3>새 글 작성</h3>
        <CreatePostForm @submit="handleCreatePost" />
      </div>
    </div>
  </section>
</template>

<style scoped>
.community-shell {
  width: min(1280px, calc(100% - 32px));
  margin: 40px auto;
  padding: 28px;
  border-radius: 28px;
  background: #ffffff;
  border: 1px solid rgba(15, 23, 42, 0.08);
  box-shadow: 0 20px 60px rgba(15, 23, 42, 0.08);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.search-card,
.board-card,
.detail-card,
.modal-card {
  background: white;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 24px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.04);
}

.search-card {
  display: flex;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
}

.search-select,
.search-input {
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 18px;
  padding: 0.9rem 1rem;
  background: #f8fafc;
  font: inherit;
  color: #334155;
  outline: none;
}

.search-select {
  width: 110px;
}

.search-input {
  flex: 1;
}

.search-button {
  border: none;
  border-radius: 10px;
  padding: 0.7rem 1rem;
  background: #1f2937;
  color: white;
  cursor: pointer;
}

.section-block {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-bottom: 1rem;
  padding: 1rem 1.25rem;
  border-radius: 22px;
  background: rgba(37, 99, 235, 0.06);
  border: 1px solid rgba(37, 99, 235, 0.14);
}

.section-block h2 {
  margin: 0;
  font-size: 1.8rem;
  color: #0f172a;
}

.community-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 20px;
}

.community-header h2 {
  margin: 0;
  color: #0f172a;
  font-size: 1.4rem;
}

.description {
  margin: 8px 0 0;
  color: #475569;
}

.board-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.2rem;
}

.board-head h2 {
  margin: 0;
  color: #334155;
  font-size: 1.05rem;
  font-weight: 700;
}

.write-button {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  border: none;
  border-radius: 10px;
  padding: 0.7rem 1rem;
  background: #2563eb;
  color: white;
  font-weight: 600;
  cursor: pointer;
}

.board-card {
  padding: 1rem 1.25rem 1.25rem;
}

.table-header {
  display: grid;
  grid-template-columns: 60px minmax(0, 1fr) 90px 70px 70px;
  gap: 0.75rem;
  padding: 0.8rem 0.3rem;
  border-bottom: 1px solid #e2e8f0;
  color: #64748b;
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
}

.detail-card {
  padding: 1rem 1.25rem 1.25rem;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  z-index: 50;
}

.modal-card {
  width: min(100%, 32rem);
  padding: 1.25rem;
}

.modal-card h3 {
  margin: 0 0 0.8rem;
  color: #0f172a;
  font-size: 1.2rem;
}

@media (max-width: 768px) {
  .search-card {
    flex-direction: column;
  }

  .search-select {
    width: 100%;
  }

  .table-header {
    display: none;
  }
}
</style>
