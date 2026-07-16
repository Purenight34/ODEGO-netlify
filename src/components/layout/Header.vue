<template>
  <header class="header">
    <div class="container">
          <a href="#home" class="logo">
            <span class="logo-text">ODEGO</span>
          </a>

          <nav class="nav">
            <a
              v-for="item in navItems"
              :key="item.id"
              :href="`#${item.id}`"
              class="nav-item"
              :class="{ active: activeSection === item.id }"
              @click="activeSection = item.id"
            >
              <component :is="item.icon" class="nav-icon" size="20" />
              <span class="nav-label">{{ item.label }}</span>
            </a>
          </nav>
    </div>
  </header>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { Home, Users, MapPin } from 'lucide-vue-next'

const navItems = [
  { id: 'home', label: '홈', icon: Home },
  { id: 'community', label: '커뮤니티', icon: Users },
  { id: 'place', label: '추천 장소', icon: MapPin },
]

const activeSection = ref('home')
let observer = null

onMounted(() => {
  const sectionIds = navItems.map((item) => item.id)
  observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)

      if (visible.length > 0) {
        activeSection.value = visible[0].target.id
      }
    },
    {
      rootMargin: '-40% 0px -55% 0px',
      threshold: 0.25,
    },
  )

  sectionIds.forEach((id) => {
    const section = document.getElementById(id)
    if (section) observer.observe(section)
  })
})

onBeforeUnmount(() => {
  observer?.disconnect()
})
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

  display:inline-flex;
  align-items:center;
  justify-content:center;
  width:30px;
  height:30px;

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

.nav-icon{
  display:none;
  vertical-align:middle;
  margin-right:6px;
}

.nav-label{
  display:inline;
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

.nav-item.active {
    color:#2D7FF9;
}

.nav-item.active::after {
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

/* Center the underline under the icon when labels are hidden */
.nav-item::after{
  left:50%;
  transform:translateX(-50%);
  width:0;
}

.nav-item:hover::after{
  width:20px;
}

.nav-item.active::after{
  width:20px;
}

/* Show icons instead of text on small screens */
.nav-label{ display:none; }
.nav-icon{ display:inline-block; }

}

</style>