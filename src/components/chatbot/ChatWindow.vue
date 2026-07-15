<template>
  <div class="chat-window">

    <ChatHeader @close="$emit('close')" />

    <div class="chat-body">

      <ChatMessage
        sender="bot"
        message="안녕하세요 👋"
      />

      <ChatMessage
        sender="bot"
        message="LocalHub AI입니다."
      />

      <ChatMessage
        sender="bot"
        message="부산 여행에 대해 무엇이든 물어보세요."
      />

      <!-- 추천 질문 -->

      <div class="quick-menu">

        <button>부산 여행코스</button>

        <button>부산 관광지</button>

        <button>축제 정보</button>

      </div>

      <ChatMessage
        sender="user"
        message="추천 관광지 알려줘"
      />

      <ChatMessage
        sender="bot"
        message="광안리, 해운대, 감천문화마을을 추천드립니다 😊"
      />

    </div>

    <ChatInput />

  </div>
</template>

<script setup>

import ChatHeader from "./ChatHeader.vue";
import ChatMessage from "./ChatMessage.vue";
import ChatInput from "./ChatInput.vue";

defineEmits(["close"]);

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