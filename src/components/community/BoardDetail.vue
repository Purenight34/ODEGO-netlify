<script setup>
import { reactive, ref, watch } from 'vue'

const props = defineProps({
  post: {
    type: Object,
    default: null
  },
  editingPostId: {
    type: [Number, String, null],
    default: null
  },
  passwordInput: {
    type: String,
    default: ''
  },
  passwordError: {
    type: String,
    default: ''
  },
  commentText: {
    type: String,
    default: ''
  },
  isAuthenticated: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'like-post',
  'delete-post',
  'edit-post',
  'submit-edit',
  'verify-password',
  'update:password-input',
  'update:comment-text',
  'add-comment'
])

const editForm = reactive({
  title: '',
  content: ''
})
const isPasswordMode = ref(false)

function likePost() {
  if (props.post) {
    emit('like-post', props.post.id)
  }
}

function deletePost() {
  if (props.post) {
    emit('delete-post', props.post.id)
  }
}

function editPost() {
  if (props.post) {
    editForm.title = props.post.title
    editForm.content = props.post.content
    emit('edit-post', props.post.id)
  }
}

function submitEdit() {
  emit('submit-edit', { title: editForm.title, content: editForm.content })
}

function verifyPassword() {
  if (props.post) {
    emit('verify-password', props.post.id)
  }
}

function openPasswordMode() {
  isPasswordMode.value = true
  emit('update:password-input', '')
}

watch(
  () => props.post,
  (value) => {
    if (value) {
      editForm.title = value.title
      editForm.content = value.content
    }
    isPasswordMode.value = false
  },
  { immediate: true }
)

watch(
  () => props.isAuthenticated,
  (value) => {
    if (value) {
      isPasswordMode.value = false
      emit('update:password-input', '')
    }
  }
)
</script>

<template>
  <article v-if="post" class="detail-card">
    <div class="detail-header">
      <div>
        <p class="eyebrow">{{ post.category }}</p>
        <h3>{{ post.title }}</h3>
      </div>
      <div class="badge-group">
        <span class="badge">익명</span>
        <span class="badge">{{ post.date }}</span>
      </div>
    </div>

    <div v-if="editingPostId === post.id" class="edit-form">
      <label>
        <span>제목</span>
        <input v-model="editForm.title" />
      </label>
      <label>
        <span>내용</span>
        <textarea v-model="editForm.content" rows="4" />
      </label>
      <button class="primary-button" @click="submitEdit">수정 완료</button>
    </div>

    <template v-else>
      <p class="summary">{{ post.summary }}</p>
      <p class="content">{{ post.content }}</p>
    </template>

    <div class="tag-list">
      <span v-for="tag in post.tags" :key="tag" class="tag">{{ tag }}</span>
    </div>

    <div class="detail-footer">
      <div class="action-group">
        <button class="like-button" @click="likePost">❤️ {{ post.likes }}</button>
        <button v-if="!isAuthenticated && !isPasswordMode" class="auth-link" @click="openPasswordMode">수정/삭제 인증</button>
        <template v-else-if="isAuthenticated">
          <button class="secondary-button" @click="editPost">수정</button>
          <button class="secondary-button danger" @click="deletePost">삭제</button>
        </template>
      </div>
      <span>조회수 {{ post.views }}</span>
    </div>

    <div v-if="isPasswordMode" class="password-box">
      <div class="password-head">
        <p class="password-title">글 수정/삭제</p>
        <button class="icon-button" type="button" @click="isPasswordMode = false">✕</button>
      </div>
      <input
        :value="passwordInput"
        type="number"
        inputmode="numeric"
        placeholder="비밀번호 (숫자)"
        @input="emit('update:password-input', $event.target.value.slice(0, 4))"
        class="password-input"
      />
      <button class="secondary-button compact" @click="verifyPassword">확인</button>
      <p v-if="passwordError" class="error-text">{{ passwordError }}</p>
    </div>

    <div class="comment-box">
      <h4>댓글</h4>
      <textarea :value="commentText" rows="3" placeholder="댓글을 입력해보세요" @input="emit('update:comment-text', $event.target.value)" />
      <button class="primary-button" @click="emit('add-comment')">댓글 작성</button>
      <ul v-if="post.comments?.length" class="comment-list">
        <li v-for="comment in post.comments" :key="comment.id">
          <strong>익명</strong>
          <span>{{ comment.content }}</span>
        </li>
      </ul>
    </div>
  </article>

  <div v-else class="detail-card empty-state">
    <p>게시글을 선택하면 상세 내용을 확인할 수 있습니다.</p>
  </div>
</template>

<style scoped>
.detail-card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.25rem;
  border: 1px solid #e5e7eb;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 20px 45px rgba(15, 23, 42, 0.08);
}

.detail-header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.eyebrow {
  margin: 0 0 0.35rem;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #64748b;
}

h3,
h4 {
  margin: 0;
  color: #0f172a;
}

.badge-group {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.badge,
.tag {
  padding: 0.35rem 0.65rem;
  border-radius: 999px;
  background: #f1f5f9;
  color: #475569;
  font-size: 0.8rem;
  font-weight: 700;
}

.summary {
  margin: 0;
  color: #334155;
  font-weight: 600;
}

.content {
  margin: 0;
  color: #475569;
  line-height: 1.7;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.detail-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #64748b;
  font-size: 0.95rem;
}

.action-group {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.primary-button,
.secondary-button,
.like-button {
  border: none;
  border-radius: 999px;
  padding: 0.55rem 0.8rem;
  cursor: pointer;
  font: inherit;
}

.primary-button {
  background: #111827;
  color: #fff;
}

.secondary-button {
  background: #f8fafc;
  color: #334155;
}

.like-button {
  background: #fee2e2;
  color: #dc2626;
}

.secondary-button.danger {
  color: #dc2626;
}

.auth-link {
  border: none;
  background: transparent;
  padding: 0;
  color: #64748b;
  font: inherit;
  cursor: pointer;
}

.edit-form,
.password-box,
.comment-box {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.password-box {
  align-self: flex-end;
  width: min(16rem, 100%);
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.04);
}

.password-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.35rem;
}

.password-title {
  margin: 0;
  font-size: 0.72rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
}

.icon-button {
  border: none;
  background: transparent;
  color: #94a3b8;
  cursor: pointer;
  font-size: 0.9rem;
}

.password-box input {
  height: 2rem;
  padding: 0 0.7rem;
  font-size: 0.9rem;
  appearance: textfield;
}

.password-box input::-webkit-outer-spin-button,
.password-box input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.password-box .compact {
  height: 2rem;
  padding: 0 0.75rem;
  font-size: 0.85rem;
}


label {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  color: #334155;
  font-weight: 600;
}

input,
textarea {
  border: 1px solid #dbe4ff;
  border-radius: 12px;
  padding: 0.7rem 0.8rem;
  font: inherit;
  background: #fff;
}

.error-text {
  margin: 0;
  color: #dc2626;
  font-size: 0.9rem;
}

.comment-list {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  padding-left: 1rem;
  color: #475569;
}

.empty-state {
  justify-content: center;
  min-height: 220px;
  color: #64748b;
}
</style>
