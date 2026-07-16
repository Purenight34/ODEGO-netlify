<template>
  <div class="chat-input">

    <div class="input-wrapper">

      <input
        v-model="message"
        type="text"
        placeholder="부산 여행에 대해 질문해보세요."
        @keyup.enter="sendMessage"
      />

      <button
        class="send-btn"
        @click="sendMessage"
      >
        →
      </button>

    </div>

    <p class="notice">
      ODEGO AI는 참고용 답변을 제공합니다.
    </p>

  </div>
</template>

<script setup>
import { ref } from "vue";

const emit = defineEmits(["send"]);

const message = ref("");

const sendMessage = () => {

  if (!message.value.trim()) return;

  emit("send", message.value);

  message.value = "";

};
</script>

<style scoped>

.chat-input{

    background:white;

    padding:16px;

    border-top:1px solid #EEF2F7;

}

.input-wrapper{

    display:flex;

    align-items:center;

    gap:12px;

    background:#F8FAFD;

    border:1px solid #E5ECF5;

    border-radius:18px;

    padding:8px;

    transition:.25s;

}

.input-wrapper:focus-within{

    border-color:#2D7FF9;

    box-shadow:
        0 0 0 4px rgba(45,127,249,.12);

}

input{

    flex:1;

    border:none;

    outline:none;

    background:transparent;

    padding:10px 12px;

    font-size:14px;

    color:#1F2937;

}

input::placeholder{

    color:#94A3B8;

}

.send-btn{

    width:42px;

    height:35px;

    border:none;

    border-radius:14px;

    background:#2D7FF9;

    color:white;

    font-size:20px;

    cursor:pointer;

    transition:.2s;

    flex-shrink:0;

}

.send-btn:hover{

    background:#1565E8;

    transform:translateY(-2px);

}

.send-btn:active{

    transform:scale(.96);

}

.notice{

    margin:10px 0 0;

    text-align:center;

    font-size:11px;

    color:#94A3B8;

}

</style>