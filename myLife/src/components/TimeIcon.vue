<script setup>
const emit = defineEmits(['setTime'])
</script>

<template>
    <div>
        <v-btn @click="emit('setTime', 15)">15min</v-btn>
        <v-btn @click="emit('setTime', 30)">30min</v-btn>
        <v-btn @click="emit('setTime', 60)">1h</v-btn>
    </div>
</template>

<style scoped>
div {
    display: flex;
    gap: 5px;
    margin: 10px;
}
</style>