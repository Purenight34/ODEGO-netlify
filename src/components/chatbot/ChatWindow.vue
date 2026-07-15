<template>
  <div class="chat-window">

    <ChatHeader @close="$emit('close')" />

    <div class="chat-body" ref="chatBody">

      <!-- 초기 진입 시 상단에 노출되는 추천 질문 -->
      <div class="quick-menu top">
        <button @click="handleSend('부산 여행코스')">부산 여행코스</button>
        <button @click="handleSend('부산 관광지')">부산 관광지</button>
        <button @click="handleSend('축제 정보')">축제 정보</button>
      </div>


      <ChatMessage
        v-for="(m, i) in messages"
        :key="i"
        :sender="m.role === 'user' ? 'user' : 'bot'"
        :message="m.preview ?? m.content"
        :fullMessage="m.content"
      />

    </div>

    <ChatInput @send="handleSend" />

  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue';
import ChatHeader from './ChatHeader.vue';
import ChatMessage from './ChatMessage.vue';
import ChatInput from './ChatInput.vue';

const emit = defineEmits(['close']);

const messages = ref([
  { role: 'bot', content: '안녕하세요! LocalHub AI입니다' },
  { role: 'bot', content: '부산 여행에 대해 무엇이든 물어보세요.' }
]);

const hasUserMessages = computed(() => messages.value.some(m => m.role === 'user'));

// auto-scroll support
const chatBody = ref(null);
function scrollToBottom(smooth = true) {
  const el = chatBody.value;
  if (!el) return;
  try {
    if (smooth && 'scrollTo' in el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    else el.scrollTop = el.scrollHeight;
  } catch (e) { el.scrollTop = el.scrollHeight; }
}

watch(messages, async () => {
  await nextTick();
  // ensure scroll after nested content updates (e.g. replacing bot.content)
  scrollToBottom(true);
}, { deep: true });

onMounted(() => {
  nextTick(() => scrollToBottom(false));
});

const loading = ref(false);
const tokenInfo = ref(null); // { used: number, limit: number }

const handleSend = async (text) => {
  if (!text || !text.toString().trim()) return;
  console.groupCollapsed('Client send start');
  console.log('message:', text);
  console.log('messages snapshot:', JSON.parse(JSON.stringify(messages.value)));
  console.groupEnd();

  messages.value.push({ role: 'user', content: text });
  messages.value.push({ role: 'bot', content: '잠시만 기다려주세요...' });
  loading.value = true;

  const attempts = [];
  const fetchWithTimeout = (input, init = {}, timeout = 15000) => {
    const controller = new AbortController();
    const id = setTimeout(() => {
      controller.abort();
      console.warn('fetch timeout aborted for', input);
    }, timeout);
    return fetch(input, { ...init, signal: controller.signal }).finally(() => clearTimeout(id));
  };

  try {
    const clientKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (clientKey) {
      attempts.push({ type: 'openai-direct', url: 'https://api.openai.com/v1/responses' });
      try {
        const upstream = await fetchWithTimeout('https://api.openai.com/v1/responses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${clientKey}` },
          body: JSON.stringify({ model: 'gpt-3.5-turbo', messages: messages.value.map(m => ({ role: m.role === 'user' ? 'user' : m.role || 'assistant', content: m.content })) })
        }, 20000);
        const textResp = await upstream.text().catch(()=>'');
        attempts[attempts.length-1].status = upstream.status;
        attempts[attempts.length-1].response = textResp.slice(0,2000);
        console.log('OpenAI direct attempt:', attempts[attempts.length-1]);
        if (!upstream.ok) throw new Error(`OpenAI direct returned ${upstream.status}: ${textResp}`);
        const data = JSON.parse(textResp || '{}');
        const reply = data?.choices?.[0]?.message?.content || data?.choices?.[0]?.text || '';
        for (let i = messages.value.length - 1; i >= 0; i--) {
          if (messages.value[i].role === 'bot') { messages.value[i].content = reply || '응답이 없습니다.'; break; }
        }
        console.log('OpenAI direct success');
        return;
      } catch (err) {
        console.error('OpenAI direct error', err && (err.stack || err));
      }
    }

    const relativeUrl = '/.netlify/functions/chat';
    attempts.push({ type: 'netlify-function', url: relativeUrl, start: Date.now() });
    try {
      let resp = await fetchWithTimeout(relativeUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      }, 15000);
      attempts[attempts.length-1].status = resp.status;
      const respTextFull = await resp.text().catch(()=>'');
      // keep full text for parsing, keep a truncated preview for logs
      attempts[attempts.length-1].response = respTextFull;
      attempts[attempts.length-1].responsePreview = respTextFull.slice(0,2000);
      console.log('Netlify function attempt:', attempts[attempts.length-1]);

      if (resp.status === 404) {
        const devUrl = `${window.location.protocol}//localhost:8889/.netlify/functions/chat`;
        attempts.push({ type: 'netlify-function-dev', url: devUrl, start: Date.now() });
        try {
          resp = await fetchWithTimeout(devUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: text })
          }, 15000);
          attempts[attempts.length-1].status = resp.status;
          const respText2Full = await resp.text().catch(()=>'');
          attempts[attempts.length-1].response = respText2Full;
          attempts[attempts.length-1].responsePreview = respText2Full.slice(0,2000);
          console.log('Netlify dev attempt:', attempts[attempts.length-1]);
        } catch (err) {
          attempts[attempts.length-1].error = String(err);
          console.error('Netlify dev fetch error', err);
          throw err;
        }
      }

      if (!resp.ok) {
        throw new Error(`Function returned ${resp.status}: ${attempts[attempts.length-1].response || ''}`);
      }

      const data = attempts[attempts.length-1].response ? JSON.parse(attempts[attempts.length-1].response) : null;
      const reply = data?.reply || data?.message || data?.msg || '';
      // extract upstream usage if present in debug
      try {
        const dbg = data?._debug;
        if (dbg && dbg.upstreamUsage) {
          const usage = dbg.upstreamUsage;
          // prefer completion_tokens then total_tokens
          const used = usage.completion_tokens ?? usage.total_tokens ?? null;
          const limit = dbg.model && /gpt-5|gpt-4o/i.test(dbg.model) ? (Number(import.meta.env.VITE_OPENAI_MAX_COMPLETION_TOKENS || 2000)) : (Number(import.meta.env.VITE_OPENAI_MAX_TOKENS || 2000));
          tokenInfo.value = used != null ? { used, limit } : null;
        } else {
          tokenInfo.value = null;
        }
      } catch (e) { tokenInfo.value = null; }
      // create a short preview (first two sections) for long replies
      const makePreview = (text, maxSections = 2, maxListItems = 3) => {
        if (!text) return text;
        // If the text looks like a list (lines starting with '-' or numbering), show top list items
        const lines = text.split(/\r?\n/).map(l=>l.trim()).filter(Boolean);
        const listLines = lines.filter(l => /^[-*]\s+/.test(l) || /^\d+\./.test(l));
        if (listLines.length) {
          const take = listLines.slice(0, maxListItems);
          return take.join('\n') + (listLines.length > take.length ? '\n...': '');
        }
        // fallback to section-based preview
        const sections = text.split(/\n\n+/).map(s=>s.trim()).filter(Boolean);
        if (sections.length <= maxSections) return text;
        return sections.slice(0, maxSections).join('\n\n') + '\n\n...';
      };

      const preview = makePreview(reply, 2);
      for (let i = messages.value.length - 1; i >= 0; i--) {
        if (messages.value[i].role === 'bot') {
          messages.value[i].content = reply || '응답이 없습니다.';
          if (preview && preview !== reply) messages.value[i].preview = preview;
          else delete messages.value[i].preview;
          break;
        }
      }

      console.log('Netlify function success', attempts);
      return;
    } catch (err) {
      console.error('Netlify function error', err && (err.stack || err));
      attempts.push({ type: 'final-error', error: String(err) });
    }

    for (let i = messages.value.length - 1; i >= 0; i--) {
      if (messages.value[i].role === 'bot') { messages.value[i].content = '메시지 전송에 실패했습니다. 콘솔에서 상세 오류를 확인하세요.'; break; }
    }
    console.error('All send attempts failed:', attempts);
  } catch (e) {
    for (let i = messages.value.length - 1; i >= 0; i--) {
      if (messages.value[i].role === 'bot') { messages.value[i].content = '알 수 없는 오류가 발생했습니다.'; break; }
    }
    console.error('Unexpected error in handleSend:', e && (e.stack || e));
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

/* token display removed */

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
  margin:0;
  background:transparent;
  padding:12px 15px;
  overflow-x:auto;
  scrollbar-width:none;
}

.quick-menu.top{
  margin-bottom:12px;
  position:relative;
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
  background:rgba(237,245,255,0.35);
}

.quick-menu.fixed{
  position:absolute;
  left:0;
  right:0;
  bottom:88px; /* sits above the input area */
  border-top:1px solid rgba(238,243,250,0.6);
  background: transparent;
  display:flex;
  align-items:center;
  justify-content:flex-start;
  padding:12px 15px;
}

.chat-window > .quick-menu.fixed{
  flex-shrink:0;
}
</style>
