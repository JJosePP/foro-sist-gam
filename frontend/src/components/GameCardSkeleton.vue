<template>
    <div class="flex flex-col rounded-xl border-[1px] border-neon-blue/30 overflow-hidden w-[270px] flex-shrink-0 sm:w-full max-w-[270px] animate-pulse">
        <!-- Imagen -->
        <div class="flex flex-row w-full h-64 bg-gray-700">
        </div>
        <!-- Datos juego -->
        <div class="flex flex-col px-2 py-5 gap-1 bg-dark-surface">
            <h2 class="h-7 md:h-8 rounded bg-gray-700 "></h2>
            <div class="flex flex-row gap-2">
                <!-- Rating -->
                <div class="flex flex-row gap-1 p-1 border-[1px] border-white/10 rounded-xl items-center">
                    <span class=" px-3 py-1 h-9 w-12 rounded-xl bg-gray-700"></span>
                    <h2 class="w-10 h-4 rounded bg-gray-700 "></h2>
                </div>
                <!-- Generos -->
                <div class="flex flex-col gap-1 max-h-12">
                    <h2 class="h-3 w-16 rounded bg-gray-700"></h2>
                    <div class="w-12 h-3 rounded bg-gray-700 "></div>
                </div>
            </div>
        </div>
    </div>
</template>