<script setup>
import { reactive, ref } from 'vue'

const emit = defineEmits(['submit'])

const form = reactive({
  title: '',
  content: '',
  password: '',
  category: '맛집',
  images: []
})

const error = ref('')
const preview = ref([])

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
    ,images: Array.isArray(form.images) ? form.images : []
  })

  form.title = ''
  form.content = ''
  form.password = ''
  form.category = '맛집'
  form.images = []
  preview.value = []
  error.value = ''
}
function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('파일을 읽을 수 없습니다.'))
    reader.onload = () => resolve(reader.result)
    reader.readAsDataURL(file)
  })
}

async function onFileChange(e) {
  const files = Array.from(e.target.files || [])
  if (!files.length) return

  const invalid = files.find((f) => !f.type.startsWith('image/'))
  if (invalid) {
    error.value = '이미지 파일만 업로드 가능합니다.'
    return
  }

  try {
    const results = await Promise.all(files.map((f) => readFileAsDataURL(f)))
    form.images = [...form.images, ...results]
    preview.value = form.images
    // clear native input so same file can be reselected
    e.target.value = ''
  } catch (err) {
    error.value = err.message || '파일 처리 중 오류가 발생했습니다.'
  }
}

function removeImage(index) {
  form.images.splice(index, 1)
  preview.value = [...form.images]
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
    <textarea v-model="form.content" rows="5" placeholder="내용" class="field" />
    <label class="file-button">
      <input type="file" accept="image/*" multiple @change="onFileChange" />
      <span class="file-button-text">사진 추가</span>
    </label>
    <div v-if="preview.length" class="thumbnails">
      <div v-for="(src, idx) in preview" :key="idx" class="thumb">
        <img :src="src" alt="thumb" />
        <button type="button" class="thumb-remove" @click="removeImage(idx)">✕</button>
      </div>
    </div>
    <p v-if="error" class="error-text">{{ error }}</p>
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

.error-text {
  margin: 0.25rem 0 0 0;
  color: #dc2626;
  font-size: 0.9rem;
  text-align: left;
}


.file-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.45rem 0.8rem;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.95rem;
  color: #334155;
  cursor: pointer;
  width: fit-content;
}

.file-button input[type="file"] {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.file-button-text {
  pointer-events: none;
}

.image-preview {
  max-width: 100%;
  border-radius: 10px;
  margin-top: 0.4rem;
  object-fit: cover;
}

.thumbnails {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 0.4rem;
}

.thumb {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  background: #f8fafc;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumb-remove {
  position: absolute;
  top: 4px;
  right: 4px;
  border: none;
  background: rgba(0,0,0,0.5);
  color: white;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 12px;
  line-height: 18px;
}
</style>
