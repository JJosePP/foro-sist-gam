<script setup>
    import { onMounted, ref } from 'vue';
    import api from '@/boot/axios';

    const categories = ref([])
    const isLoading = ref(true)

    const getCategories = async () => {
        try {
            const {data} = await api({
                url: '/categories',
                method: 'GET'
            })
            categories.value = data.result

            return categories
        } catch (error) {
            console.log(error)
        }
    }

    onMounted(async () => {
        try {
            await getCategories()
        } catch (error) {
            console.log(error)
        }finally {
            isLoading.value = false
        }
    })
</script>

<template>
    <div v-if="isLoading" class="flex flex-col max-w-[80%] mx-auto gap-5 md:gap-10 animate-pulse">

        <div class="flex flex-col gap-5">
            <!-- label -->
            <div class="flex flex-row gap-1">
                <div class="w-1 h-6 md:h-10 rounded-2xl bg-neon-blue"></div>
                <h2 class="font-bold sm:text-xl md:text-4xl text-white">Categorías de hilos</h2>
            </div>

            <div class="grid grid-cols-2 gap-2 ">
                <div v-for="n in 12" class="flex flex-row gap-2 p-1 rounded-md border-[1px] border-neon-blue/30 bg-dark-surface items-center">
                    <div class="w-20 h-20 shrink-0 p-1 bg-dark-base rounded-md border-[1px] border-neon-blue/30">
                        <div class="w-full h-full object-contain bg-dark-surface rounded-md "></div>
                    </div>

                    <div class="flex flex-col gap-1 justify-center">
                        <span class="h-7 w-32 bg-gray-700 rounded-md"></span>
                        <p class="h-4 w-80 bg-gray-700 rounded-md"></p>
                    </div>
                </div>
            </div>

        </div>
    </div>

    <div v-else class="flex flex-col max-w-[80%] mx-auto gap-5 md:gap-10">

        <div class="flex flex-col gap-5">
            <!-- label -->
            <div class="flex flex-row gap-1">
                <div class="w-1 h-6 md:h-10 rounded-2xl bg-neon-blue"></div>
                <h2 class="font-bold sm:text-xl md:text-4xl text-white">Categorías de hilos</h2>
            </div>

            <div class="grid grid-cols-2 gap-2 ">
                <div v-for="category in categories" class="flex flex-row gap-2 p-1 rounded-md border-[1px] border-neon-blue/30 bg-dark-surface items-center">
                    <div class="w-20 h-20 shrink-0 p-1 bg-dark-base rounded-md border-[1px] border-neon-blue/30">
                        <img :src="category.image.secure_url" class="w-full h-full object-contain"/>
                    </div>

                    <div class="flex flex-col gap-1 justify-center">
                        <RouterLink :to="{name: 'threads', params:{categoryId: category._id}}" class="font-bold text-xl text-white hover:text-neon-blue hover:underline">{{category.name}}</RouterLink>
                        <p class="font-medium text-xs text-gray-400">{{ category.description }}</p>
                    </div>
                </div>
            </div>

        </div>
    </div>
</template>