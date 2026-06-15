<script setup>
    import { ref, onMounted, nextTick } from 'vue';
    import api from '@/boot/axios';
    import { useUserStore } from '../stores/userStore.js';
    import {useToastStore} from '../stores/toastStore.js'
    import { Field, Form } from 'vee-validate';
    import { formatBanDate } from '@/utils/date.js';


    const userStore = useUserStore()
    const toastStore = useToastStore();
    const users = ref([])
    const banningUserId = ref(null)
    const banningUserIndex = ref(null)
    
    const getUsers = async () => {
        try {
            const {data} = await api({
                url: 'users',
                method: 'GET',
                headers: {
                    Authorization: "Bearer " + userStore.token
                }
            })
            users.value = data.users
            return users
        } catch (error) {
            console.log("ERROR: ", error)
            toastStore.alert(error.response.data.details, 'error')
        }
    }

    const handleBanButton = (userId, index) => {
        console.log(userId)
        console.log(index)

        if(banningUserId.value === userId){
            banningUserId.value = null;
            banningUserIndex.value = null;
        }else{
            banningUserId.value = userId
            banningUserIndex.value = index
        }
    }
    const banUser = async (values) => {
        try {
            if(confirm('Confirme la acción')){
                const {data} = await api.put(`users/ban/${banningUserId.value}`,
                    {
                        bannedUntil: values.banDate
                    },
                    {
                        headers: {
                            Authorization: "Bearer " + userStore.token
                        }
                    }
                )
                console.log(banningUserIndex.value)
                toastStore.alert(data.message)
                users.value[banningUserIndex.value] = data.bannedUser
            }else{
                return
            }
        } catch (error) {
            console.log("ERROR: ", error)
            toastStore.alert(error.response.data.details, 'error')
        }finally{
            banningUserId.value = null
            banningUserIndex.value = null
        }
    }

    const unBanUser = async (userId, index) => {
        try {
            if(confirm('¿Levantar restricción al usuario?')){
                const {data} = await api.put(`users/unban/${userId}`,
                    {},
                    {
                        headers: {
                            Authorization: "Bearer " + userStore.token
                        }
                    }
                )
                toastStore.alert(data.message)
                users.value[index] = data.unbannedUser

            }else{
                return
            }

        } catch (error) {
            console.log("ERROR: ", error)
            toastStore.alert(error.response.data.details, 'error')
        }
    }

    const invalidSubmit = (values) => {
        console.log(values)
    }

    onMounted(async () => {
        if(!userStore.isModOrAdmin){
            toastStore.alert('No está autorizado a entrar en esta sección', 'error')
            router.push({path: '/'})
        }else{
            await getUsers()
        }
    })
</script>

<template>
    <div class="flex flex-col gap-8 w-full ">
    <ul class="flex flex-col max-h-[560px] rounded-b-md divide-y divide-neon-blue/30 bg-dark-surface border-[1px] border-neon-blue/30 overflow-y-scroll">
            <li v-for="(user,index) in users"  class="py-2 px-20 grid grid-cols-4 justify-between items-center">
                <div class="flex flex-row items-center gap-2">
                    <div class="w-10 h-10">
                        <img :src="user.profilePic.secure_url" class="w-full h-full object-cover rounded-full">
                    </div>
                    <p class="font-semibold text-lg text-gray-200">{{user.userName}}</p>
                </div>
                <div class="justify-self-center font-medium text-lg text-gray-200">{{ user.authorized === true ? 'Autorizado' : 'Bloqueado' }}</div>
                <time :datetime="user.bannedUntil" class="justify-self-center font-medium text-lg text-gray-200">{{formatBanDate(user.bannedUntil)}}</time>
                <div class="flex flex-row justify-self-end gap-2">
                    <div v-if="banningUserId === user._id" class="flex flex-row items-center">
                        <Form class="flex flex-row gap-2" @submit="banUser" @invalid-submit="invalidSubmit">
                            <label for="banDate" class="font-medium text-lg text-gray-200">Prohibir hasta:</label>
                            <Field id="banDate" name="banDate" type="date"/>
                            <button type="submit">
                                <v-icon name="gi-confirmed" class="text-green-950"/>
                            </button>
                            <button type="button" @click="handleBanButton(user._id, index)">
                                <v-icon name="gi-cancel" class="text-red-950"/>
                            </button>
                        </Form>

                    </div>
                    <div v-else class="flex flex-row items-center">
                        <button v-if="user.authorized" type="button" @click="handleBanButton(user._id, index)">
                            <v-icon name="bi-lock" scale="1.3" class="text-red-950"/>
                        </button>
                        <button v-if="!user.authorized && userStore.isAdmin" type="button" @click="unBanUser(user._id, index)">
                            <v-icon name="bi-unlock" scale="1.3" class="text-green-950"/>
                        </button>
                    </div>
                </div>
            </li>
        </ul>
    </div>
</template>