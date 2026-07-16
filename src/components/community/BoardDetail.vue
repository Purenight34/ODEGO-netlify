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
const requestedAction = ref(null)

function requestEditAuth() {
  requestedAction.value = 'edit'
  openPasswordMode()
}

function requestDeleteAuth() {
  requestedAction.value = 'delete'
  openPasswordMode()
}

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
    emit('verify-password', props.post.id, requestedAction.value)
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
      if (requestedAction.value === 'edit') {
        editPost()
      } else if (requestedAction.value === 'delete') {
        deletePost()
      }
      requestedAction.value = null
    }
  }
)
</script>

<template>
  <article v-if="post" class="detail-main">
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
      <img v-if="post.image" :src="post.image" alt="post image" class="post-image" />
      <p class="content">{{ post.content }}</p>
    </template>

    <!-- tags removed from detail view -->

    <div class="detail-footer">
      <div class="action-group">
        <button class="like-button" @click="likePost">❤️ {{ post.likes }}</button>

        <button
          type="button"
          class="secondary-button"
          :class="{ disabled: !isAuthenticated }"
          @click="isAuthenticated ? editPost() : requestEditAuth()"
        >
          수정
        </button>

        <button
          type="button"
          class="secondary-button danger"
          :class="{ disabled: !isAuthenticated }"
          @click="isAuthenticated ? deletePost() : requestDeleteAuth()"
        >
          삭제
        </button>

        <!-- password-panel moved below .detail-footer to appear on its own line -->

      </div>
      <span>조회수 {{ post.views }}</span>
    </div>

    <div v-if="isPasswordMode" class="password-panel">
      <div class="password-row">
        <input
          :value="passwordInput"
          type="password"
          inputmode="numeric"
          maxlength="4"
          placeholder="비밀번호 (숫자 4자리)"
          @input="emit('update:password-input', $event.target.value.replace(/\D/g, '').slice(0, 4))"
          class="password-input"
        />
        <div class="password-actions">
          <button type="button" class="secondary-button compact" @click="verifyPassword">확인</button>
          <button type="button" class="secondary-button" @click="() => { isPasswordMode = false; requestedAction.value = null }">취소</button>
        </div>
      </div>
      <p v-if="passwordError" class="password-error">{{ passwordError }}</p>
    </div>

    <div class="detail-layout">
      <div class="detail-content">
        <div class="comment-box">
          <h4>댓글 {{ post.comments?.length || 0 }}</h4>
          <textarea
            :value="commentText"
            rows="3"
            placeholder="댓글을 입력해보세요"
            @input="emit('update:comment-text', $event.target.value)"
            class="comment-input"
          />
          <button class="primary-button" @click="emit('add-comment')">댓글 작성</button>
          <ul v-if="post.comments?.length" class="comment-list">
            <li v-for="comment in post.comments" :key="comment.id" class="comment-item">
              <strong>{{ comment.author || '익명' }}</strong>
              <span class="comment-content">{{ comment.content }}</span>
            </li>
          </ul>
        </div>
      </div>

      <aside class="detail-side">
      </aside>
    </div>
  </article>

  <div v-else class="detail-main empty-state">
    <p>게시글을 선택하면 상세 내용을 확인할 수 있습니다.</p>
  </div>
</template>

<style scoped>
.detail-main {
  display: flex;
  flex-direction: column;
  gap: 1rem;
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
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.35rem 0.65rem;
  border-radius: 999px;
  background: #f1f5f9;
  color: #475569;
  font-size: 0.8rem;
  font-weight: 700;
  line-height: 1;
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

.post-image {
  width: 100%;
  height: auto;
  border-radius: 12px;
  margin: 0.6rem 0;
  background: #f8fafc;
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

.secondary-button.disabled {
  opacity: 0.6;
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

.detail-layout {
  display: grid;
  gap: 1rem;
  align-items: start;
}

.detail-content,
.detail-side {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}

.edit-form,
.comment-box {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.password-box {
  padding: 0.85rem;
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

.password-input.inline {
  height: 2rem;
  padding: 0 0.6rem;
  font-size: 0.9rem;
  margin-left: 0.5rem;
  margin-right: 0.25rem;
}

.password-panel {
  width: 100%;
  margin-top: 0.5rem;
}

.password-row {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
}

.password-row .password-input {
  height: 2rem;
  padding: 0 0.6rem;
  font-size: 0.9rem;
  margin: 0;
  max-width: 240px;
}

.password-actions {
  display: flex;
  gap: 0.4rem;
  align-items: center;
}

.password-actions .secondary-button.compact {
  width: fit-content;
}

.password-error {
  margin: 0.25rem 0 0 0;
  color: #dc2626;
  font-size: 0.82rem;
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
  gap: 0.45rem;
  padding-left: 1rem;
  color: #475569;
}

.comment-box {
  width: 100%;
}

.comment-box .comment-input {
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  resize: none;
}

.comment-box .primary-button {
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  margin-top: 0.5rem;
}

.comment-item {
  display: flex;
  align-items: flex-start;
  gap: 0.4rem;
}

.comment-content {
  color: #334155;
}

.empty-state {
  justify-content: center;
  min-height: 220px;
  color: #64748b;
}

@media (max-width: 900px) {
  .detail-layout {
    grid-template-columns: 1fr;
  }
}
</style>
