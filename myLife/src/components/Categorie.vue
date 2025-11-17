<script setup>
import { ref, inject } from "vue"
import { v4 as uuidv4 } from 'uuid';
import TimeIcon from "./TimeIcon.vue"

const props = defineProps({
    catTitle: {
        type: String,
        required: true
    },
    object: {
        type: Object,
        required: true
    }
})
const showInput = ref(false)
const minutes = ref()
const hours = ref()

const sendToApp = inject('sendToApp')

function sendData() {
    const newData = {
        id: uuidv4(),
        title: props.object.title,
        color: props.object.color,
        categorie: props.object.categories.find(cat => cat.title === props.catTitle),
        hours: hours.value,
        minutes: minutes.value
    }
    sendToApp(newData)
    minutes.value = ''
    hours.value = ''
    showInput.value = false
}

function setTime(minutesValue) {
    console.log('Called setTime with', minutesValue)
    hours.value = Math.floor(minutesValue / 60) || ''
    minutes.value = minutesValue % 60 || ''
}
</script>

<template>
    <div class="wrapper">
        <h3>{{ props.object.title }}</h3>
    </div>
</template>

<style scoped>
.wrapper {
    display: flex;
    flex-direction: column;
    margin: 10px;
}
</style>