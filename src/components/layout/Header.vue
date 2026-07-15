<template>
  <header class="header">
    <div class="container">
      <a href="#" class="logo">
        <span class="logo-icon">📍</span>
        <span class="logo-text">LocalHub</span>
      </a>

      <nav class="nav">
        <a href="#" class="nav-item">홈</a>
        <a href="#community" class="nav-item">커뮤니티</a>
        <a href="#place" class="nav-item">추천 장소</a>
      </nav>
    </div>
  </header>
</template>

<script setup>
</script>

<style scoped>

.header {
    position: sticky;
    top: 0;
    z-index: 999;

    width: 100%;
    height: 80px;

    background: white;

    box-shadow: 0 2px 15px rgba(0,0,0,.05);
}

.container{

    width:1200px;
    height:100%;

    margin:auto;

    display:flex;

    justify-content:space-between;

    align-items:center;

}

.logo{

    display:flex;

    align-items:center;

    gap:10px;

    text-decoration:none;

}

.logo-icon{

    font-size:30px;

}

.logo-text{

    font-size:30px;

    font-weight:700;

    color:#2D7FF9;

}

.nav{

    display:flex;

    gap:50px;

}

.nav-item{

    position:relative;

    text-decoration:none;

    color:#333;

    font-size:18px;

    font-weight:600;

    transition:.3s;

}

.nav-item:hover{

    color:#2D7FF9;

}

.nav-item::after{

    content:"";

    position:absolute;

    left:0;
    bottom:-8px;

    width:0%;

    height:2px;

    background:#2D7FF9;

    transition:.3s;

}

.nav-item:hover::after{

    width:100%;

}

/* Tablet */

@media (max-width:1200px){

.container{

    width:90%;

}

}

/* Mobile */

@media(max-width:768px){

.header{

    height:70px;

}

.logo-text{

    font-size:24px;

}

.nav{

    gap:20px;

}

.nav-item{

    font-size:15px;

}

}

</style>