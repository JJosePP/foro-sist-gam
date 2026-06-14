<template>
     <div class="flex flex-col rounded-2xl border-[1px] border-neon-blue/30 bg-dark-surface animate-pulse">
        <!-- header -->
        <div class="flex flex-col h-40 p-1 justify-center items-center rounded-2xl bg-gradient-to-b from-gray-400/40 to-dark-surface">
            <p class="p-1 rounded-md h-9 w-14 border-[1px] border-gray-500/30 bg-gray-500/20"></p>
        </div>
        <!-- body -->
        <div class="flex flex-col gap-4 p-5 ">
            <!-- tags + time/questions -->
            <div class="flex flex-row gap-1">
                <ul class="flex flex-row gap-2 w-2/3 flex-wrap max-h-14 overflow-auto scrollbar">
                    <li v-for="n in 4" class="w-16 px-1 py-0.5 rounded-md border-[1px] border-neon-blue bg-neon-blue/20">
                    </li>
                </ul>
                <div class="flex flex-col gap-2 font-semibold text-sm text-gray-400">
                    <div class="flex flex-row gap-1 items-center">
                        <v-icon name="bi-clock"/>
                        <span class="w-10 h-5 rounded-md bg-gray-700"></span>
                    </div>
                    <div class="flex flex-row gap-1 items-center">
                        <v-icon name="bi-question-diamond" />
                        <span class="w-10 h-5 rounded-md bg-gray-700"></span>
                    </div>
                </div>
            </div>

            <span class="w-full h-7 rounded-md bg-gray-700"></span>

            <span class="w-full h-14 rounded-md bg-gray-700"></span>

            <div class="flex flex-row py-1 justify-center items-center rounded-md border-[1px] border-neon-blue/30 bg-dark-base">
                <div class="w-12 h-12">
                    <div class="w-full h-full rounded-md border-[1px] border-neon-blue/30 p-0.5 bg-gray-700"></div>
                </div>
            </div>

            <div class="flex flex-row justify-center py-3 rounded-md bg-neon-blue hover:bg-neon-blue/50">
                <div class="h-4 w-32 rounded-md bg-gray-700"></div>
            </div>

        </div>
    </div>
</template>