<template>
  <section id="home" class="hero">
    <img :src="heroImage" alt="부산 여행 이미지" class="hero-image" />
    <div class="overlay">
      <div class="hero-content">
        <p class="subtitle">Explore Local Community</p>

        <h1>
          당신의 지역과 여행을<br />
          더 특별하게,
          <span>ODEGO</span>
        </h1>

        <p class="description">
          우리 동네의 이야기부터 여행지 추천까지.<br />
          다양한 사람들과 자유롭게 소통하며 새로운 장소를 발견해보세요.
        </p>

      </div>
    </div>
  </section>
</template>

<script setup>
import heroImage from '@/assets/images/busan.jpg';

    const goToCommunity = () => {
      const el = document.getElementById('community')
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      } else {
        // fallback: update hash
        window.location.hash = '#community'
      }
    }
</script>

<style scoped>
.hero {
  width: 100%;
  height: 620px;
  position: relative;
  overflow: hidden;
}

.hero-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  display: block;
  filter: brightness(0.8);
}

.overlay {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
}

.hero-content{

    width:1200px;

    margin:auto;

    color:white;

}

.subtitle{

    font-size:18px;

    color:#d8d8d8;

    margin-bottom:20px;

    letter-spacing:2px;

}

h1{

    font-size:64px;

    line-height:1.3;

    font-weight:800;

}

h1 span{

    color:#4FA4FF;

}

.description{

    margin-top:35px;

    font-size:21px;

    line-height:1.8;

    color:#ededed;

}

button{

    margin-top:50px;

    border:none;

    outline:none;

    cursor:pointer;

    background:#2D7FF9;

    color:white;

    font-size:18px;

    font-weight:600;

    padding:18px 42px;

    border-radius:50px;

    transition:.3s;

}

button:hover{

    background:#1b63d6;

    transform:translateY(-2px);

    box-shadow:0 10px 25px rgba(45,127,249,.35);

}

/* Tablet */

@media(max-width:1200px){

.hero-content{

    width:90%;

}

h1{

    font-size:54px;

}

}

/* Mobile */

@media(max-width:768px){

.hero{

    height:520px;

}

h1{

    font-size:38px;

}

.description{

    font-size:17px;

}

button{

    padding:15px 30px;

    font-size:16px;

}

}

</style>