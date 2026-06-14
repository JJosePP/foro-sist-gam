<script setup>
import { RouterView } from 'vue-router'
import {onMounted} from 'vue'
import Navbar from './components/Navbar.vue'
import Toast from './components/Toast.vue'
import Footer from './components/Footer.vue'

onMounted(async()=>{
  try {
    
  } catch (error) {
    console.log(error.data.message)
  }
})

</script>

<template>
  <div class="min-h-screen flex flex-col ">
    <Navbar/>
    <main class="flex-1 py-10 bg-dark-base font-rajdhani">
      <RouterView :key="$route.path" />
      <Toast></Toast>
    </main>
    <Footer></Footer>
  </div>
</template>

<style scoped>
  .scrollbar::-webkit-scrollbar {
      width: 5px;
      height: 10px;
  }

  .scrollbar::-webkit-scrollbar-track {
      border-radius: 100vh;
      background: #0a0a0c;
  }

  .scrollbar::-webkit-scrollbar-thumb {
      background: #16161e;
      border-radius: 100vh;
      border: 1px solid rgb(0 212 255 / 0.3);
  }

  .scrollbar::-webkit-scrollbar-thumb:hover {
      background: #00d4ff
  } 
</style>
