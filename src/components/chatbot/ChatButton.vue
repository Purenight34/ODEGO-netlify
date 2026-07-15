<template>
  <button
    class="chat-btn"
    @click="$emit('click')"
  >
    <div class="icon">
      💬
    </div>

    <span class="badge"></span>
  </button>
</template>

<script setup>
defineEmits(["click"]);
</script>

<style scoped>

.chat-btn{

  position:fixed;

  right:28px;

  bottom:28px;

  width:68px;

  height:68px;

  border:none;

  border-radius:50%;

  background:linear-gradient(
      135deg,
      #4F9BFF 0%,
      #2D7FF9 100%
  );

  display:flex;

  justify-content:center;

  align-items:center;

  cursor:pointer;

  box-shadow:
      0 12px 30px rgba(45,127,249,.28);

  transition:
      transform .25s ease,
      box-shadow .25s ease;

  z-index:9999;

}

.chat-btn:hover{

  transform:
      translateY(-3px)
      scale(1.04);

  box-shadow:
      0 18px 40px rgba(45,127,249,.35);

}

.chat-btn:active{

  transform:scale(.96);

}

.icon{

  color:white;

  font-size:28px;

  line-height:1;

}



@media(max-width:768px){

.chat-btn{

  width:60px;

  height:60px;

  right:18px;

  bottom:18px;

  border-radius:50%;

}

.icon{

  font-size:24px;

}

}

</style>