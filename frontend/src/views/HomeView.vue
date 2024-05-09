<script setup>
import TheWelcome from '../components/TheWelcome.vue'
import { useUserStore } from "../stores/userStore.js";

const userStore = useUserStore();

</script>

<template>
  <main>
    {{ userStore.token }} - {{ userStore.expiresIn }}
    <TheWelcome />
  </main>
</template>
