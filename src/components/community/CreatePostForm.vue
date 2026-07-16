<script setup>
import { reactive, ref } from 'vue'

const emit = defineEmits(['submit'])

const form = reactive({
  title: '',
  content: '',
  password: '',
  category: '맛집'
})

const error = ref('')

function onPasswordInput(e) {
  // allow only digits, limit to 4 characters
  form.password = e.target.value.replace(/\D/g, '').slice(0, 4)
}

function submit() {
  if (!form.title.trim() || !form.content.trim() || !form.password.trim()) {
    error.value = '모든 필드를 입력하세요.'
    return
  }

  if (!/^\d{4}$/.test(form.password)) {
    error.value = '비밀번호는 숫자 4자리여야 합니다.'
    return
  }

  emit('submit', {
    title: form.title.trim(),
    content: form.content.trim(),
    password: form.password.trim(),
    category: form.category
  })

  form.title = ''
  form.content = ''
  form.password = ''
  form.category = '맛집'
  error.value = ''
}
</script>

<template>
  <form class="post-form" @submit.prevent="submit">
    <input v-model="form.title" placeholder="제목" class="field" />
    <select v-model="form.category" class="field">
      <option value="맛집">맛집</option>
      <option value="카페">카페</option>
      <option value="여행지">여행지</option>
      <option value="행사/축제">행사/축제</option>
      <option value="기타">기타</option>
    </select>
    <input v-model="form.password" @input="onPasswordInput" type="password" maxlength="4" placeholder="비밀번호 (숫자 4자리)" class="field" />
    <p v-if="error" class="error-text">{{ error }}</p>
    <textarea v-model="form.content" rows="5" placeholder="내용" class="field" />
    <div class="actions">
      <button type="submit" class="submit-button">등록</button>
    </div>
  </form>
</template>

<style scoped>
.post-form {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}

.field {
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 0.7rem 0.8rem;
  font: inherit;
  background: #fff;
}

textarea {
  resize: vertical;
}

.actions {
  display: flex;
  justify-content: flex-end;
}

.submit-button {
  border: none;
  border-radius: 10px;
  padding: 0.7rem 1rem;
  background: #2563eb;
  color: white;
  cursor: pointer;
}
</style>
