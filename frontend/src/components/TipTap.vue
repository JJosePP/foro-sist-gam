<script setup>
    import { useEditor, EditorContent } from '@tiptap/vue-3'
    import StarterKit from '@tiptap/starter-kit'
    import Image from '@tiptap/extension-image'
    import Link from '@tiptap/extension-link';
    import { watch } from 'vue';


    const props = defineProps({
        modelValue: {
            type: String,
            default: ''
        }
    })
    const emit = defineEmits(['update:modelValue']);
    const editor = useEditor({
        content: props.modelValue,
        extensions: [StarterKit.configure({
            heading: {
                levels: [1,2,3]
            },
            undoRedo: false
        }),Image, 
        Link.configure({
            openOnClick: false,
            defaultProtocol: 'https'
        })],
        injectCSS: false,
        onUpdate: ({editor}) => {
            emit('update:modelValue', editor.getHTML())
        }
    })

    watch(() => props.modelValue,(value) => {
        if(!editor.value) return

        const isSame = editor.value.getHTML() === value

        if(!isSame) {
            editor.value.commands.setContent(value, false)
        }
    })

    const addImage = () => {
        const url = window.prompt('URL')
        console.log(editor.value)
        if(url) {
            editor.value.chain().focus().setImage({src: url}).run()
        }
    }

    const setLink = () => {
        const previousUrl = editor.value.getAttributes('link').href;
        const url = window.prompt('URL', previousUrl)

        if(url === null){
            return
        }
        if(url === ''){
            editor.value.chain().focus().extendMarkRange('link').unsetLink().run()
        }

        editor.value.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
    }
</script>

<template>
    <div v-if="editor" class="flex w-full bg-dark-reply divide-x divide-neon-blue/20 items-center text-neon-blue">
        <div class="flex gap-2 p-2">
             <button type="button" @click="editor.chain().focus().toggleBold().run()" class="flex items-center" :class="['px-2 rounded-md hover:bg-neon-blue/30', {'bg-neon-blue/20':editor?.isActive('bold')}]">
                <v-icon name="md-formatbold"></v-icon>
            </button>


            <button type="button" @click="editor.chain().focus().toggleItalic().run()" class="flex items-center" :class="['px-2 rounded-md hover:bg-neon-blue/30', {'bg-neon-blue/20': editor?.isActive('italic')}]">
                <v-icon name="md-formatitalic"/>
            </button>
            <button type="button" @click="editor.chain().focus().toggleBulletList().run()" class="flex items-center" :class="['px-2 rounded-md hover:bg-neon-blue/30', {'bg-neon-blue/20': editor?.isActive('bulletList')}]">
                <v-icon name="md-list" />
            </button>
            <button type="button" @click="editor.chain().focus().toggleHeading({ level: 1 }).run()" class="flex text-center" :class="['px-2 rounded-md hover:bg-neon-blue/30', {'bg-neon-blue/20': editor?.isActive('heading', {level: 1})}]">H1</button>
            <button type="button" @click="editor.chain().focus().toggleHeading({ level: 2 }).run()" class="flex text-center" :class="['px-2 rounded-md hover:bg-neon-blue/30', {'bg-neon-blue/20': editor?.isActive('heading', {level: 2})}]">H2</button>
            <button type="button" @click="editor.chain().focus().toggleHeading({ level: 3 }).run()" class="flex text-center" :class="['px-2 rounded-md hover:bg-neon-blue/30', {'bg-neon-blue/20': editor?.isActive('heading', {level: 3})}]">H3</button>
        </div>
        <div class="flex gap-2 p-2">
            <button type="button" @click="addImage" class="flex items-center px-2 rounded-md hover:bg-neon-blue/30">
                <v-icon name="bi-card-image"/>
            </button>
            <button type="button" @click="setLink" class="flex items-center" :class="['px-2 rounded-md hover:bg-neon-blue/30', {'bg-neon-blue/20': editor?.isActive('link')}]">
                <v-icon name="md-link" />
            </button>

            <button type="button" @click="editor.chain().focus().unsetLink().run()" :disabled="!editor.isActive('link')" class="flex items-center px-2 rounded-md" :class="[editor?.isActive('link') ? 'text-neon-blue bg-neon-blue/20' : 'text-gray-400']">
                <v-icon name="md-linkoff"/>
            </button>

        </div>

    </div>
    <editor-content :editor="editor" class="tiptap w-full h-72 p-5 bg-dark-base text-gray-200"/>
</template>

<style>

    .tiptap {
        :first-child {
            margin-top: 0;
        }
        display: flex;
        flex-direction: column;
    }
    .tiptap:focus {
        outline: 1px solid #00d4ff;
    }

    .ProseMirror:focus {
        outline: none;
    }
    /* set */
    .ProseMirror {        
        height: 100%;
        overflow-y: auto;
    }

    .tiptap ul {
        list-style: disc;
        padding-left: 1.5rem;
    }

    .tiptap ol {
        list-style: decimal;
        padding-left: 1.5rem;
    }

    .tiptap li {
        display: list-item;
    }
    .tiptap img{
        display: block;
        height: 300px;
        margin: 1.5rem 0;
        max-width: 100%;
    }

    .tiptap h1,
    .tiptap h2,
    .tiptap h3 {
        line-height: 1.1;
        margin-top: 2.5rem;
        text-wrap: pretty;
        font-weight: bold;
    }
    .tiptaph1,
    .tiptap h2 {
        margin-top: 3.5rem;
        margin-bottom: 1.5rem;
    }

    .tiptap h1 {
        font-size: 1.4rem;
    }
    .tiptap h2 {
        font-size: 1.2rem;
    }
    .tiptap h3 {
        font-size: 1.1rem;
    }

    .tiptap a {
        color: #00d4ff;
        cursor: pointer;
        text-decoration: underline;

            &:hover {
            color: #005e70;
            }
    }
</style>