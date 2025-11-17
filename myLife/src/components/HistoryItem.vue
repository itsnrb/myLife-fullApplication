<script setup>

import { computed } from "vue"
const props = defineProps({
    object: {
        type: Object,
    }
})

const emit = defineEmits(['dataDeleted'])

const time = computed(() => {
    if (props.object.hours && props.object.minutes) {
        if (props.object.minutes === 0) {
            return props.object.hours + ' Stunden'
        }
        if (props.object.hours === 0) {
            return props.object.minutes + ' Minuten'
        }
        return props.object.hours + ' Stunden, ' + props.object.minutes + ' Minuten'
    } else if (props.object.hours) {
        return props.object.hours + ' Stunden'
    } else if (props.object.minutes) {
        return props.object.minutes + ' Minuten'
    } else {
        return ''
    }
})

</script>
<template>
    <div class="wrapper" :style="{ backgroundColor: props.object.color }">
        <h3>{{ object.title }}</h3>
        <p>{{ object.categorie.title }}</p>
        <p>{{ time }}</p>
        <p>{{ object.date }}</p>
        <v-btn @click="emit('dataDeleted', object.id)">Löschen</v-btn>
    </div>
</template>
<style scoped>
.wrapper {
    display: flex;
    flex-direction: column;
    border: 2px solid black;
    border-radius: 20px;
    padding: 10px;
}
</style>