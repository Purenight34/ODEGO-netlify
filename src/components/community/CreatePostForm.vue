<script setup>
import { reactive } from 'vue'

const emit = defineEmits(['submit'])

const form = reactive({
  title: '',
  content: '',
  password: ''
})

function submit() {
  if (!form.title.trim() || !form.content.trim() || !form.password.trim()) {
    return
  }

  emit('submit', {
    title: form.title.trim(),
    content: form.content.trim(),
    password: form.password.trim()
  })

  form.title = ''
  form.content = ''
  form.password = ''
}
</script>

<template>
  <form class="post-form" @submit.prevent="submit">
    <h3>새 글 작성</h3>
    <p class="hint">익명으로 작성하고 비밀번호를 설정할 수 있습니다.</p>

    <label>
      <span>제목</span>
      <input v-model="form.title" placeholder="제목을 입력하세요" required />
    </label>

    <label>
      <span>내용</span>
      <textarea v-model="form.content" rows="5" placeholder="여행 이야기나 질문을 남겨보세요" required />
    </label>

    <label>
      <span>비밀번호</span>
      <input v-model="form.password" type="password" placeholder="비밀번호를 입력하세요" required />
    </label>

    <button type="submit">작성하기</button>
  </form>
</template>

<style scoped>
.post-form {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  padding: 1rem;
  border: 1px solid #dbeafe;
  border-radius: 16px;
  background: #fff;
}

h3 {
  margin: 0;
  color: #0f172a;
}

.hint {
  margin: 0;
  color: #64748b;
  font-size: 0.9rem;
}

label {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  color: #334155;
  font-weight: 600;
}

input,
textarea {
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  padding: 0.7rem 0.8rem;
  font: inherit;
}

textarea {
  resize: vertical;
}

button {
  align-self: flex-start;
  border: none;
  border-radius: 999px;
  padding: 0.7rem 1rem;
  background: #2563eb;
  color: #fff;
  cursor: pointer;
}
</style>
