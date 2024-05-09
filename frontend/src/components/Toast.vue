<script setup>
    import {toast} from 'vue3-toastify'
    import {useToastStore} from '../stores/toastStore.js'
    import { storeToRefs } from 'pinia'
    import { watch } from 'vue';

    const toastStore = useToastStore();
    const { toastMessage, toastType, toastDate } = storeToRefs(toastStore)


    const showToast = () =>  {
        if (toastMessage.value && toastType.value) {
            switch (toastType.value) {
                case 'error':
                    toast.error(toastMessage.value)
                    break;
                case 'info':
                    toast.info(toastMessage.value)
                    break;
                default:
                    toast.success(toastMessage.value)
            }
        }
    }

    watch(() => toastDate.value, (newDate, oldDate) => {
    setTimeout(() => {
      showToast()
    }, 100)
  })
    
</script>

<template></template>