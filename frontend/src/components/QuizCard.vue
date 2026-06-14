<script setup>
    import { computed } from 'vue';
    import { RouterLink } from 'vue-router';
    import { useUserStore } from '../stores/userStore.js'

    const props = defineProps({
        quizId: {
            type: String,
            required: true
        },
        title: {
            type: String,
            required: true 
        },
        description: {
            type: String,
            required: true 
        },
        numQuestions: {
            type: Number,
            required: true
        },
        difficulty: {
            type: String,
            required: true
        },
        tags: {
            type: Array,
            required: true
        },
        badge: {
            type: Object,
            required: true
        },
        completedQuizzes: {
            type: Array,
            required: true
        }
    });

    const quizIsCompleted = computed(() => {
        return props.completedQuizzes.includes(props.quizId)
    })
    const userStore = useUserStore()

</script>

<template>
    <div class="flex flex-col rounded-2xl border-[1px] border-neon-blue/30 bg-dark-surface">
        <!-- header -->
        <div v-if="difficulty === 'Fácil'" class="flex flex-col h-40 p-1 justify-center items-center rounded-2xl bg-gradient-to-b from-green-400/40 to-dark-surface">
            <p class="p-1 rounded-md font-bold text-base text-green-400 border-[1px] border-green-500/30 bg-green-500/20">{{ difficulty }}</p>
        </div>
        <div v-else-if="difficulty === 'Intermedio'" class="flex flex-col h-40 p-1 justify-center items-center rounded-2xl bg-gradient-to-b from-yellow-400/40 to-dark-surface">
            <p class="p-1 rounded-md font-bold text-base text-yellow-400 border-[1px] border-yellow-500/30 bg-yellow-500/20">{{ difficulty }}</p>
        </div>
        <div v-else class="flex flex-col h-40 p-1 justify-center items-center rounded-2xl bg-gradient-to-b from-red-400/40 to-dark-surface">
            <p class="p-1 rounded-md font-bold text-base text-red-400 border-[1px] border-red-500/30 bg-red-500/20">{{ difficulty }}</p>
        </div>

        <!-- body -->
        <div class="flex flex-col gap-4 p-5 ">
            <!-- tags + time/questions -->
            <div class="flex flex-row gap-1">
                <ul class="flex flex-row gap-2 w-2/3 flex-wrap max-h-14 overflow-auto scrollbar">
                    <li v-for="tag in tags" class="px-1 py-0.5 rounded-md font-semibold text-sm text-gray-400 border-[1px] border-neon-blue bg-neon-blue/20">{{ tag.name }}</li>
                </ul>
                <div class="flex flex-col gap-2 font-semibold text-sm text-gray-400">
                    <div class="flex flex-row gap-1 items-center">
                        <v-icon name="bi-clock"/>
                        <p>15 mins</p>
                    </div>
                    <div class="flex flex-row gap-1 items-center">
                        <v-icon name="bi-question-diamond" />
                        <p>{{ numQuestions + ' preg.' }}</p>
                    </div>
                </div>
            </div>

            <p class="font-semibold text-xl text-white">{{ title }}</p>

            <p class=" max-h-14  overflow-auto scrollbar font-semibold text-xs text-gray-400">{{ description }}</p>

            <div class="flex flex-row py-1 justify-center items-center rounded-md border-[1px] border-neon-blue/30 bg-dark-base">
                <div class="w-12 h-12">
                    <img :src="badge.image.secure_url" class="w-full h-full object-contain rounded-md border-[1px] border-neon-blue/30 p-0.5" />
                </div>
            </div>

            <div v-if="quizIsCompleted || userStore.isAdmin" class="font-bold text-base text-dark-base text-center py-3 rounded-md bg-neon-blue/20">Completada</div>
            <div v-else-if="userStore.isAdmin" class="font-bold text-base text-dark-base text-center py-3 rounded-md bg-neon-blue/20">Participar</div>
            <RouterLink v-else :to="{name: 'quiz', params:{quizId: quizId}}" class="font-bold text-base text-dark-base text-center py-3 rounded-md bg-neon-blue hover:bg-neon-blue/50">Empezar prueba</RouterLink>
        </div>
    </div>
</template>

<style scoped>
    .scrollbar::-webkit-scrollbar {
        width: 3px;
        height: 3px;
    }
</style>