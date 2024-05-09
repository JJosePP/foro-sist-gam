import { defineStore } from "pinia";
import { ref } from "vue";

export const useToastStore = defineStore("toast", () => {
    const toastMessage = ref(null)
    const toastType = ref(null)
    const toastDate = ref(null)

    const alert = (message,type = 'success') => {
        toastMessage.value=message
        toastType.value = type
        toastDate.value = new Date()
    }

    return {toastMessage,toastType,toastDate,alert}
})