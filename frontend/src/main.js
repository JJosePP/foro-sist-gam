import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import {OhVueIcon, addIcons} from "oh-vue-icons"
import {FaUserAlt, BiCalendar4, OiPencil, MdBarchart, GiAchievement, BiClock, MdComment, MdCopyrightRound, OiCommentDiscussion} from "oh-vue-icons/icons"

import Vue3Toastify from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'

addIcons(FaUserAlt, BiCalendar4, OiPencil, MdBarchart, GiAchievement, BiClock, MdComment, MdCopyrightRound,OiCommentDiscussion)

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(Vue3Toastify, {
    autoClose: 3000
})
app.component("v-icon", OhVueIcon)
app.use(router)

app.mount('#app')
