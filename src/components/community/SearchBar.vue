<script setup>
defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: '검색어를 입력하세요'
  }
})

const emit = defineEmits(['update:modelValue'])

function handleInput(event) {
  emit('update:modelValue', event.target.value)
}
</script>

<template>
  <label class="search-bar">
    <span class="search-label">검색</span>
    <input :value="modelValue" :placeholder="placeholder" @input="handleInput" />
  </label>
</template>

<style scoped>
.search-bar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border: 1px solid #dbe4ff;
  border-radius: 999px;
  background: #fff;
  box-shadow: 0 8px 24px rgba(37, 99, 235, 0.08);
}

.search-label {
  font-size: 0.9rem;
  font-weight: 700;
  color: #2563eb;
}

input {
  border: none;
  outline: none;
  width: 100%;
  font-size: 0.95rem;
  background: transparent;
}
</style>
