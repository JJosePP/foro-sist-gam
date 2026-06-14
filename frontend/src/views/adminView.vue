<script setup>
    import Categories from './categoryListView.vue'
    import Genres from './genresListView.vue'
    import Platforms from './platformListView.vue';
    import Tags from './tagListView.vue';
    import Questions from './questionListView.vue';
    import Quizzes from './quizListView.vue';
    import Users from './userListView.vue'
    import Games from './gameListView.vue'
    import { onMounted, ref } from 'vue';
    import { useUserStore } from '@/stores/userStore.js';
    import {useToastStore} from '../stores/toastStore.js'
    import { useRouter } from 'vue-router';

    const currentTab = ref('categories')
    const userStore = useUserStore()
    const toastStore = useToastStore();
    const router = useRouter()

    const tabs = {
        categories: {name: 'categories', comp: Categories, label: 'Categorías'},
        genres:{name: 'genres', comp: Genres, label: 'Géneros'},
        platforms:{name: 'platforms', comp: Platforms, label: 'Plataformas'},
        tags:{name: 'tags', comp: Tags, label: 'Etiquetas'},
        questions:{name: 'questions', comp: Questions, label: 'Preguntas'},
        quizzes:{name: 'quizzes', comp: Quizzes, label: 'Pruebas'},
        games:{name: 'games', comp: Games, label: 'Juegos'},
        users:{name:'users', comp: Users, label: 'Usuarios'}
    }

    onMounted(() => {
        if(!userStore.isAdmin){
            toastStore.alert('No está autorizado a entrar en esta sección', 'error')
            router.push({path: '/'})
        }
    })
</script>

<template>
    <div class="flex flex-col max-w-[80%] mx-auto items-center justify-center">

        <div class="flex flex-row w-full justify-between rounded-t-md bg-dark-surface overflow-hidden">
            <button
                v-for="tab in tabs"
                :key="tab.name"
                :class="['py-3 w-full font-semibold text-2xl text-gray-200', {'bg-neon-blue/50': currentTab === tab.name}]"
                @click="currentTab = tab.name"
            >
            {{ tab.label }}
            </button>
        </div>
        <component :is="tabs[currentTab].comp"></component>
    </div>
</template>
<style>

</style>