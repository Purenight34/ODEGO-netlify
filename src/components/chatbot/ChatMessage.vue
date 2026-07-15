<template>
  <div :class="['message-row', sender]">

    <div :class="['message', sender]">

                <p class="text">
                    {{ displayMessage }}
                    <button v-if="hasFullToggle" class="toggle-btn" @click="toggleFull">{{ showFull ? '간략히' : '더보기' }}</button>
                </p>

      </div>

  </div>
</template>

<script setup>

import { ref, computed } from 'vue';

const props = defineProps({
  sender: { type: String, default: 'bot' },
  message: { type: String, required: true },
  fullMessage: { type: String, default: null }
});

const showFull = ref(false);

const hasFullToggle = computed(() => {
  return typeof props.fullMessage === 'string' && props.fullMessage && props.fullMessage !== props.message;
});

const displayMessage = computed(() => (showFull.value && props.fullMessage) ? props.fullMessage : props.message);

function toggleFull() { showFull.value = !showFull.value; }

</script>

<style scoped>

.message-row{

    display:flex;
    width:100%;
    margin:14px 0;
    background:transparent;

}

.message-row.bot{

    justify-content:flex-start;

}

.message-row.user{

    justify-content:flex-end;

}

.message{

    display:flex;

    flex-direction:column;

    gap:6px;

    max-width:75%;

    padding:0;

    border-radius:0;

    background:transparent;

    border:none;

    box-shadow:none;

    animation:fade .25s ease;

}

.message-row.bot .message{

    align-items:flex-start;

}

.message-row.user .message{

    align-items:flex-end;

}

.bot{

    color:#1F2937;

}

.user{

    color:white;

}

.message-row.bot .text{

    margin:0;

    font-size:14px;

    line-height:1.6;

    word-break:break-word;

    background:#FFFFFF;

    padding:10px 12px;

    border-radius:14px;

    border:1px solid #E8EEF5;

}

.toggle-btn{
    background:transparent;
    border:none;
    color:#2D7FF9;
    font-size:13px;
    font-weight:600;
    padding:0;
    margin-left:8px;
    cursor:pointer;
    display:inline-block;
    vertical-align:middle;
}

.message-row.user .toggle-btn{
    color: rgba(255,255,255,0.95);
}

.message-row.user .text{

    margin:0;

    font-size:14px;

    line-height:1.6;

    word-break:break-word;

    background:linear-gradient(135deg, #4A90FF, #2D7FF9);

    padding:10px 12px;

    border-radius:14px;

    color:white;

}

@keyframes fade{

from{

    opacity:0;

    transform:
        translateY(10px);

}



to{

    opacity:1;

    transform:none;

}

}

</style>