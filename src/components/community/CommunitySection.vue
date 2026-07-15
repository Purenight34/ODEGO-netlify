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
  <section class="community-shell">
    <div class="banner-card">
      <div>
        <p class="eyebrow">Community</p>
        <h1>부산 커뮤니티</h1>
        <p class="banner-text">부산의 맛집, 여행지, 축제 정보를 익명으로 자유롭게 공유해요! 🌊</p>
      </div>
    </div>

    <div class="search-card">
      <select v-model="searchField" class="search-select">
        <option value="all">전체</option>
        <option value="title">제목</option>
        <option value="category">카테고리</option>
        <option value="content">내용</option>
      </select>
      <div class="search-input-wrap">
        <input v-model="searchTerm" type="text" placeholder="검색어를 입력하세요..." />
        <button class="search-button" type="button">⌕</button>
      </div>
    </div>

    <div class="tab-grid">
      <button
        v-for="tab in tabs"
        :key="tab"
        class="tab-button"
        :class="{ active: activeTab === tab }"
        @click="activeTab = tab"
      >
        {{ tab }}
      </button>
    </div>

    <CreatePostForm v-if="showCreateForm" class="create-form" @submit="handleCreatePost" />

    <div class="board-card">
      <div class="board-card-header">
        <h2>게시판 목록</h2>
        <button class="write-button" @click="toggleCreateForm">
          <span class="plus-icon">＋</span>
          글쓰기
        </button>
      </div>

      <div class="table-header">
        <div class="col-number">번호</div>
        <div class="col-title">제목</div>
        <div class="col-category">구분</div>
        <div class="col-date">작성일</div>
        <div class="col-views">조회</div>
        <div class="col-likes">좋아요</div>
      </div>

      <BoardTable :posts="pagedPosts" :selected-post-id="selectedPostId" @select-post="selectPost" />
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
  </section>
</template>

<style scoped>
.community-shell {
  max-width: 1120px;
  margin: 0 auto;
  padding: 2rem 1.25rem 3rem;
  min-height: 100vh;
  background: #f8fafc;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.banner-card,
.search-card,
.board-card,
.detail-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 28px;
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.05);
}

.banner-card {
  padding: 1.6rem 1.75rem;
}

.banner-card h1 {
  margin: 0 0 0.35rem;
  font-size: 2rem;
  font-weight: 700;
  color: #0f172a;
}

.banner-text {
  margin: 0;
  color: #64748b;
  font-size: 0.96rem;
}

.search-card {
  display: flex;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
}

.search-select,
.search-input-wrap input {
  width: 100%;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 0.8rem 1rem;
  background: white;
  font: inherit;
  color: #334155;
  outline: none;
}

.search-select {
  width: 120px;
}

.search-input-wrap {
  position: relative;
  flex: 1;
}

.search-input-wrap input {
  padding-right: 3rem;
}

.search-input-wrap input:focus,
.search-select:focus {
  border-color: #93c5fd;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
}

.search-button {
  position: absolute;
  top: 50%;
  right: 0.75rem;
  transform: translateY(-50%);
  border: none;
  background: transparent;
  cursor: pointer;
  color: #64748b;
}

.tab-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 0.6rem;
  padding: 0 0.1rem;
}

.tab-button {
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 0.7rem 0.8rem;
  background: white;
  color: #475569;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-button.active {
  background: #2563eb;
  border-color: #2563eb;
  color: white;
}

.create-form {
  margin: 0 0.2rem;
}

.board-card {
  padding: 1rem 1.25rem 1.25rem;
}

.board-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.board-card-header h2 {
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
  border-radius: 999px;
  padding: 0.75rem 1rem;
  background: #2563eb;
  color: white;
  font-weight: 600;
  cursor: pointer;
}

.plus-icon {
  font-size: 1rem;
}

.table-header {
  display: grid;
  grid-template-columns: 0.8fr 3.2fr 1.2fr 1.2fr 0.8fr 0.8fr;
  gap: 0.75rem;
  padding: 0.8rem 0.3rem;
  margin-bottom: 0.4rem;
  border-bottom: 1px solid #e2e8f0;
  color: #64748b;
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.detail-card {
  padding: 1.1rem 1.25rem 1.25rem;
}

.eyebrow {
  margin: 0 0 0.3rem;
  color: #64748b;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

@media (max-width: 900px) {
  .tab-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
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
