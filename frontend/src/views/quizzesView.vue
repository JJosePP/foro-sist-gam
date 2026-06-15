<script setup>
    import { ref, onMounted, computed } from 'vue';
    import { useUserStore } from '../stores/userStore.js';
    import api from '@/boot/axios.js';
    import QuizCard from '@/components/QuizCard.vue';
    import QuizCardSkeleton from '@/components/QuizCardSkeleton.vue';

    const userStore = useUserStore();
    const totalPages = ref(1)
    const currentPage = ref(1)
    const quizzes = ref([])
    const isLoading = ref(true)
    const completedQuizzes = ref([])
    const visiblePages = computed(() => {
        const pages = [];
        const total = totalPages.value;
        const current = currentPage.value;
        const delta = 1; //numero de paginas alrededor de la actual

        const left = Math.max(2, current - delta);
        const rigth = Math.max(2, current + delta)
        
        //se mete la primera pagina siempre
        pages.push(1); 

        //puntos suspensivos izquierda
        if(left > 2){
            pages.push('...');
        }

        // paginas del medio
        for(let i=left; i <= rigth; i++){
            if(i < total){
                pages.push(i)
            }
        }

        //puntos suspensivos derecha
        if(rigth < total -1){
            pages.push('...')
        }

        // ultima pagina (si hay mas de 1)
        if(total > 1){
            pages.push(total)
        }
        return pages
    })

    const getQuizzes = async () => {
        try {
            const {data} = await api({
                url: '/quizzes',
                method: 'GET'
            });
            quizzes.value = data.quizzes
            currentPage.value = data.currentPage
            totalPages.value = data.totalPages
            
            return quizzes
        } catch (error) {
            console.log("ERROR: ", error)
        }
    }

    const getCompletedQuizzes = async () => {
        try {
            const {data} = await api({
                url: `/users/${userStore.userId}/completedQuizzes`,
                method: 'GET',
                headers: {
                    Authorization: "Bearer " + userStore.token,
                }
            });
            completedQuizzes.value = data.completedQuizzes
            console.log(completedQuizzes.value)
            return completedQuizzes

        } catch (error) {
            console.log("ERROR: ", error)
        }
    }
    onMounted(async() => {
        try {
            await getQuizzes()
            await getCompletedQuizzes()
        } catch (error) {
            console.log(error)  
            
        }finally{
            isLoading.value = false
        }
    })

</script>

<template>
    <div class="flex flex-col max-w-[80%] mx-auto gap-5">

        <div class="flex flex-col gap-5">
            <div class="flex flex-row gap-1">
                <div class="w-1 h-6 md:h-10 rounded-2xl bg-neon-blue"></div>
                <div v-if="isLoading"  class="w-44 h-10 rounded-md bg-gray-700"></div>
                <h2 v-else class="font-bold sm:text-xl md:text-4xl text-white">Retos disponibles</h2>
            </div>
            <div v-if="isLoading" class="w-96 h-6 rounded-md bg-gray-700"></div>
            <p v-else class="font-bold text-base text-gray-400">Pon a prueba tu conocimiento sobre distintos temas completando diferentes pruebas. Gana insignias exclusivas para mostrar en tu perfil.</p>
        </div>

        <div class="flex flex-row justify-end px-2 py-4 items-center">

            <div>
                <div class="flex gap-0.5 pe-5">
                    <button v-for="page in visiblePages"
                        :key="page + Math.random()"
                        :disabled="page === '...'"
                        @click="typeof page === 'number' && goToPage(page)"
                        class="px-1 py-1"
                        :class="{'text-neon-blue font-bold': page === currentPage}"
                    >
                        {{ page }}
                    </button>
                </div>
            </div>
        </div>

        <!-- contenedor pruebas -->
        <div v-if="isLoading" class="grid grid-cols-5 gap-x-8 gap-y-2">
            <QuizCardSkeleton v-for="n in 10"/>
        </div>
        <div v-else class="grid grid-cols-5 gap-x-8 gap-y-2">
            <QuizCard v-for="quiz in quizzes" :quizId="quiz._id" :title="quiz.title" :description="quiz.description" :numQuestions="quiz.numQuestions" :difficulty="quiz.difficulty" :tags="quiz.tags" :badge="quiz.badge" :completedQuizzes="completedQuizzes"></QuizCard>
        </div>
    </div>
</template>