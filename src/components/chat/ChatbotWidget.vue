<template>
  <div class="chatbot-widget" :class="{ open: isOpen }">
    <button type="button" class="chatbot-toggle" @click="toggleOpen">
      <span v-if="!isOpen">챗봇</span>
      <span v-else>닫기</span>
    </button>

    <div v-if="isOpen" class="chatbot-panel">
      <header class="chatbot-header">
        <strong>LocalHub 챗봇</strong>
        <small>부산 여행과 커뮤니티를 도와드려요.</small>
      </header>

      <div ref="messageList" class="chatbot-messages">
        <div
          v-for="(item, index) in messages"
          :key="index"
          :class="['chatbot-message', item.role]"
        >
          <div class="message-bubble">
            <p>{{ item.text }}</p>
          </div>
        </div>
      </div>

      <form class="chatbot-input-area" @submit.prevent="sendMessage">
        <textarea
          v-model="draft"
          class="chatbot-input"
          rows="2"
          placeholder="궁금한 내용을 입력해보세요..."
          @keydown.enter.stop.prevent="sendMessage"
        ></textarea>
        <button type="submit" class="chatbot-send">전송</button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { nextTick, ref } from 'vue'

const isOpen = ref(false)
const draft = ref('')
const messages = ref([
  {
    role: 'assistant',
    text: '안녕하세요! LocalHub 챗봇입니다. 부산 여행 정보나 커뮤니티 이용 방법을 물어보세요.',
  },
])
const messageList = ref(null)

function toggleOpen() {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    nextTick(scrollToBottom)
  }
}

function sendMessage() {
  const trimmed = draft.value.trim()
  if (!trimmed) {
    draft.value = ''
    return
  }

  messages.value.push({ role: 'user', text: trimmed })
  draft.value = ''

  nextTick(() => {
    scrollToBottom()
    const answer = generateAssistantResponse(trimmed)
    setTimeout(() => {
      messages.value.push({ role: 'assistant', text: answer })
      nextTick(scrollToBottom)
    }, 250)
  })
}

function generateAssistantResponse(input) {
  const text = input.toLowerCase()

  if (text.includes('커뮤니티') || text.includes('게시글') || text.includes('글쓰기')) {
    return '커뮤니티 섹션에서는 게시글 검색, 작성, 조회와 댓글 기능을 이용하실 수 있어요. 상단 메뉴에서 바로 이동해보세요.'
  }

  if (text.includes('추천 장소') || text.includes('지도') || text.includes('부산지도')) {
    return '추천 장소 섹션에서는 부산 관광지, 여행코스, 축제 정보를 시각화된 지도에서 확인할 수 있습니다.'
  }

  if (text.includes('홈') || text.includes('소개') || text.includes('localhub')) {
    return '홈 섹션에서는 LocalHub의 메인 소개와 부산 여행의 핵심 정보를 확인하실 수 있어요.'
  }

  if (text.includes('안녕') || text.includes('안녕하세요') || text.includes('hi')) {
    return '안녕하세요! 무엇을 도와드릴까요? 부산 여행 정보나 커뮤니티 이용법을 물어보세요.'
  }

  if (text.includes('추천') || text.includes('어디')) {
    return '부산의 인기 여행지는 해운대, 광안리, 감천문화마을 등이 있어요. 지도 섹션에서 자세히 확인해 보세요.'
  }

  return '좋은 질문이에요! 조금 더 구체적으로 말씀해 주시면 관련 정보를 더 정확히 알려드릴게요.'
}

function scrollToBottom() {
  if (messageList.value) {
    messageList.value.scrollTop = messageList.value.scrollHeight
  }
}
</script>

<style scoped>
.chatbot-widget {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 1000;
  width: 320px;
  max-width: calc(100vw - 32px);
  font-family: inherit;
}

.chatbot-toggle {
  width: 100%;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  padding: 0.85rem 1rem;
  border-radius: 999px;
  border: none;
  background: #2563eb;
  color: white;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 16px 30px rgba(37, 99, 235, 0.2);
}

.chatbot-panel {
  margin-top: 0.85rem;
  border-radius: 26px;
  background: #ffffff;
  border: 1px solid rgba(15, 23, 42, 0.1);
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.12);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 420px;
}

.chatbot-header {
  padding: 1rem 1rem 0.75rem;
  border-bottom: 1px solid rgba(15, 23, 42, 0.08);
}

.chatbot-header strong {
  display: block;
  margin-bottom: 0.35rem;
  font-size: 1rem;
  color: #0f172a;
}

.chatbot-header small {
  color: #475569;
  line-height: 1.4;
}

.chatbot-messages {
  flex: 1;
  padding: 1rem;
  display: grid;
  gap: 0.75rem;
  overflow-y: auto;
}

.chatbot-message {
  display: flex;
}

.chatbot-message.assistant {
  justify-content: flex-start;
}

.chatbot-message.user {
  justify-content: flex-end;
}

.message-bubble {
  max-width: 100%;
  padding: 0.85rem 1rem;
  border-radius: 18px;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
  line-height: 1.5;
}

.chatbot-message.assistant .message-bubble {
  background: #f8fafc;
  color: #0f172a;
}

.chatbot-message.user .message-bubble {
  background: #2563eb;
  color: white;
}

.chatbot-input-area {
  display: grid;
  gap: 0.65rem;
  padding: 1rem;
  border-top: 1px solid rgba(15, 23, 42, 0.08);
}

.chatbot-input {
  width: 100%;
  min-height: 68px;
  resize: none;
  border: 1px solid rgba(15, 23, 42, 0.12);
  border-radius: 16px;
  padding: 0.9rem 1rem;
  font: inherit;
  color: #1f2937;
  outline: none;
}

.chatbot-input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.12);
}

.chatbot-send {
  width: 100%;
  padding: 0.95rem 1rem;
  border: none;
  border-radius: 16px;
  background: #2563eb;
  color: white;
  font-weight: 700;
  cursor: pointer;
}

@media (max-width: 768px) {
  .chatbot-widget {
    right: 16px;
    bottom: 16px;
    width: calc(100vw - 32px);
  }
}
</style>
