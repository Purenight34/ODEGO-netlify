<template>
  <div class="chatbot">

    <Transition name="chat-fade">
      <ChatWindow
        v-if="isOpen"
        @close="closeChat"
      />
    </Transition>

    <Transition name="button-fade">
      <ChatButton
        v-if="!isOpen"
        @click="openChat"
      />
    </Transition>

  </div>
</template>

<script setup>
import { ref } from "vue";

import ChatButton from "./ChatButton.vue";
import ChatWindow from "./ChatWindow.vue";

const isOpen = ref(false);

const openChat = () => {
  isOpen.value = true;
};

const closeChat = () => {
  isOpen.value = false;
};
</script>

<style scoped>

.chatbot{
  position:fixed;
  right:0;
  bottom:0;
  z-index:9999;
}

/* ---------- Chat ---------- */

.chat-fade-enter-active,
.chat-fade-leave-active{

  transition:
    opacity .25s ease,
    transform .25s ease;

}

.chat-fade-enter-from,
.chat-fade-leave-to{

  opacity:0;

  transform:
    translateY(20px)
    scale(.95);

}

/* ---------- Button ---------- */

.button-fade-enter-active,
.button-fade-leave-active{

  transition:opacity .2s;

}

.button-fade-enter-from,
.button-fade-leave-to{

  opacity:0;

}

</style>