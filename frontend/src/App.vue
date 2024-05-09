<script setup>
import { RouterView } from 'vue-router'
import {onMounted} from 'vue'

import Toast from './components/Toast.vue'

onMounted(async()=>{
  try {
    
  } catch (error) {
    console.log(error.data.message)
  }
})

</script>

<template>
  <!-- <Navbar/> -->
  <RouterView />
  <Toast></Toast>
 
</template>

<style scoped></style>
