<template>
  <header class="chat-header">

    <div class="header-left">

      <div class="avatar">
        🤖
      </div>

      <div class="info">
        <h3>ODEGO AI</h3>

        <div class="status">
          <span class="dot"></span>
          <span>온라인</span>
        </div>
      </div>

    </div>

    <button
      class="close-btn"
      @click="$emit('close')"
    >
      ✕
    </button>

  </header>
</template>

<script setup>
defineEmits(["close"]);
</script>

<style scoped>

.chat-header{

    height:78px;

    display:flex;

    justify-content:space-between;

    align-items:center;

    padding:0 20px;

    background:#ffffff;

    border-bottom:1px solid #EEF2F6;

}

/* ---------- 왼쪽 ---------- */

.header-left{

    display:flex;

    align-items:center;

    gap:14px;

}

.avatar{

    width:46px;

    height:46px;

    border-radius:14px;

    background:linear-gradient(
        135deg,
        #4A90FF,
        #2D7FF9
    );

    display:flex;

    justify-content:center;

    align-items:center;

    font-size:22px;

    color:white;

    box-shadow:
        0 8px 20px rgba(45,127,249,.18);

}

.info h3{

    margin:0;

    font-size:16px;

    font-weight:700;

    color:#1F2937;

}

.status{

    margin-top:4px;

    display:flex;

    align-items:center;

    gap:6px;

    font-size:12px;

    color:#64748B;

}

.dot{

    width:8px;

    height:8px;

    border-radius:50%;

    background:#22C55E;

}

/* ---------- 닫기 ---------- */

.close-btn{

    width:36px;

    height:36px;

    border:none;

    border-radius:10px;

    background:#F4F7FB;

    color:#64748B;

    cursor:pointer;

    font-size:18px;

    transition:.2s;

}

.close-btn:hover{

    background:#E8EEF7;

    color:#1F2937;

}

</style>