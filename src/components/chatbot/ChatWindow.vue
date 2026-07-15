<template>
  <div class="chat-window">

    <ChatHeader @close="$emit('close')" />

    <div class="chat-body">

      <ChatMessage
        v-for="(m, i) in messages"
        :key="i"
        :sender="m.role === 'user' ? 'user' : 'bot'"
        :message="m.content"
      />

      <!-- 추천 질문 -->

      <div class="quick-menu">

        <button @click="handleSend('부산 여행코스')">부산 여행코스</button>

        <button @click="handleSend('부산 관광지')">부산 관광지</button>

        <button @click="handleSend('축제 정보')">축제 정보</button>

      </div>

    </div>

    <ChatInput @send="handleSend" />

  </div>
</template>

<script setup>
import { ref } from 'vue';
import ChatHeader from './ChatHeader.vue';
import ChatMessage from './ChatMessage.vue';
import ChatInput from './ChatInput.vue';

const emit = defineEmits(['close']);

const messages = ref([
  { role: 'bot', content: '안녕하세요 👋' },
  { role: 'bot', content: 'LocalHub AI입니다.' },
  { role: 'bot', content: '부산 여행에 대해 무엇이든 물어보세요.' }
]);

const loading = ref(false);

const handleSend = async (text) => {
  if (!text || !text.toString().trim()) return;

  console.log('handleSend called with:', text);

  // push user message
  messages.value.push({ role: 'user', content: text });

  // push placeholder for bot
  messages.value.push({ role: 'bot', content: '잠시만 기다려주세요...' });
  loading.value = true;

  const attempts = [];
  const fetchWithTimeout = (input, init = {}, timeout = 15000) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    return fetch(input, { ...init, signal: controller.signal }).finally(() => clearTimeout(id));
  };

  try {
    // Option A: direct client-side OpenAI (DEV ONLY) if VITE_OPENAI_API_KEY present
    const clientKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (clientKey) {
      const url = 'https://api.openai.com/v1/chat/completions';
      try {
        attempts.push({ type: 'openai-direct', url });
        const upstream = await fetchWithTimeout(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${clientKey}` },
          body: JSON.stringify({ model: 'gpt-3.5-turbo', messages: messages.value.map(m => ({ role: m.role === 'user' ? 'user' : m.role || 'assistant', content: m.content })) })
        }, 20000);

        const status = upstream.status;
        const textResp = await upstream.text().catch(() => '');
        attempts[attempts.length - 1].status = status;
        attempts[attempts.length - 1].response = textResp;

        if (!upstream.ok) {
          throw new Error(`OpenAI direct returned ${status}: ${textResp}`);
        }

        const data = JSON.parse(textResp || '{}');
        const reply = data?.choices?.[0]?.message?.content || data?.choices?.[0]?.text || '';
        for (let i = messages.value.length - 1; i >= 0; i--) {
          if (messages.value[i].role === 'bot') { messages.value[i].content = reply || '응답이 없습니다.'; break; }
        }
        console.log('OpenAI direct success', attempts);
        return;
      } catch (err) {
        console.error('OpenAI direct error', err);
        // continue to try Netlify function fallback
      }
    }

    // Option B: call Netlify Function via relative path (preferred when using netlify dev)
    const relativeUrl = '/.netlify/functions/chat';
    try {
      attempts.push({ type: 'netlify-function', url: relativeUrl });
      let resp = await fetchWithTimeout(relativeUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      }, 15000);

      attempts[attempts.length - 1].status = resp.status;
      if (resp.status === 404) {
        // if opened on Vite port, the relative proxy may not exist — try Netlify Dev host
        const devUrl = `${window.location.protocol}//localhost:8889/.netlify/functions/chat`;
        attempts.push({ type: 'netlify-function-dev', url: devUrl });
        try {
          resp = await fetchWithTimeout(devUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: text })
          }, 15000);
          attempts[attempts.length - 1].status = resp.status;
        } catch (err) {
          attempts[attempts.length - 1].error = String(err);
          throw err;
        }
      }

      const respText = await resp.text().catch(() => '');
      attempts[attempts.length - 1].response = respText;

      if (!resp.ok) {
        throw new Error(`Function returned ${resp.status}: ${respText}`);
      }

      const data = respText ? JSON.parse(respText) : null;
      const reply = data?.reply || '';
      for (let i = messages.value.length - 1; i >= 0; i--) {
        if (messages.value[i].role === 'bot') { messages.value[i].content = reply || '응답이 없습니다.'; break; }
      }

      console.log('Netlify function success', attempts);
      return;
    } catch (err) {
      console.error('Netlify function error', err);
      // fall through to final error handler
      attempts.push({ type: 'final-error', error: String(err) });
    }

    // If we reach here, all attempts failed
    const shortMsg = '메시지 전송에 실패했습니다. 콘솔에서 상세 오류를 확인하세요.';
    for (let i = messages.value.length - 1; i >= 0; i--) {
      if (messages.value[i].role === 'bot') {
        messages.value[i].content = shortMsg;
        break;
      }
    }
    console.error('All send attempts failed:', attempts);

  } catch (e) {
    // unexpected
    for (let i = messages.value.length - 1; i >= 0; i--) {
      if (messages.value[i].role === 'bot') { messages.value[i].content = '알 수 없는 오류가 발생했습니다.'; break; }
    }
    console.error('Unexpected error in handleSend:', e);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>

.chat-window{

    position:fixed;

    right:28px;

    bottom:110px;

    width:380px;
    min-width:380px;
    max-width:380px;
    height:640px;
    min-height:640px;
    max-height:640px;

    display:flex;

    flex-direction:column;

    overflow:hidden;

    border-radius:22px;

    background:white;

    border:1px solid #E8EEF5;

    box-shadow:

        0 20px 60px rgba(15,23,42,.15);

    animation:popup .25s ease;

}

@keyframes popup{

from{

    opacity:0;

    transform:

        translateY(25px)

        scale(.97);

}

to{

    opacity:1;

    transform:none;

}

}

.chat-body{

    flex:1;

    overflow-y:auto;

    padding:15px;

    background:linear-gradient(

        180deg,

        #FAFCFF 0%,

        #F5F8FD 100%

    );

}

/* 스크롤 */

.chat-body::-webkit-scrollbar{

    width:6px;

}

.chat-body::-webkit-scrollbar-thumb{

    background:#D6E4F8;

    border-radius:20px;

}

/* 추천 질문 */

.quick-menu{

    display:flex;

    gap:10px;

    margin:18px 0 18px;

    overflow-x:auto;

    scrollbar-width:none;

}

.quick-menu::-webkit-scrollbar{

    display:none;

}

.quick-menu button{

    flex-shrink:0;

    white-space:nowrap;

    padding:10px 16px;

    border-radius:16px;

    background:#fff;

    border:1px solid #E8EEF5;

    color:#2D7FF9;

    font-size:13px;

    font-weight:600;

    cursor:pointer;

    transition:.2s;

}

.quick-menu button:hover{

    background:#EDF5FF;

}
</style>
