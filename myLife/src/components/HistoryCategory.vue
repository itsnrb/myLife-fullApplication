<script setup>

const props = defineProps({
    object: {
        type: Object,
    }
})

const emit = defineEmits(['dataDeleted'])



</script>
<template>
    <div class="wrapper" :style="{ backgroundColor: props.object.color }">
        <h3>{{ object.title }}</h3>
        <p>{{ object.hours ? object.hours + ' Stunden' : '' }}, {{ object.minutes ? object.minutes + ' Minuten' : '' }}
        </p>
        <v-btn @click="emit('dataDeleted', object.id)">Löschen</v-btn>
    </div>
</template>
<style scoped>
.wrapper {
    border: 2px solid black;
    border-radius: 20px;
    padding: 10px;
}
</style>