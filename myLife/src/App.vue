<script setup>
import { ref, onMounted, computed, watch } from "vue"
import { loadData, loadTopics, saveToDB, deleteData, saveNewTopic, deleteTopic } from "./services/api.js"
import HistoryItem from "./components/HistoryItem.vue"
import HistoryCategory from "./components/HistoryCategory.vue"
import { v4 as uuidv4 } from 'uuid';
import { useDataFormatter } from "./composable/useDataFormatter.js"
import { VPie } from 'vuetify/labs/VPie'
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css'

const selectedMenu = ref('activities')
const showDialog = ref(false)
const editDialog = ref(false)
const tab = ref("dateSelection")
const headerTitle = ref("Aktivität anlegen")
const title = ref("")
const categories = ref([])
const category = ref("")
const categoriesChip = ref([])
const newCategory = ref("")
const color = ref("")
const selectedItem = ref(null)
const editSelectedItem = ref(null)
const minutes = ref()
const hours = ref()
const newTopic = ref("")
const newCategories = ref("")

const savedData = ref([])
const savedTopics = ref([])
const selectedDate = ref(new Date())
const selectedHistorieDate = ref(null)
const range = ref(false)
const { dateFormat } = useDataFormatter()

const data = [
  {
    id: 1, title: "Youtube", categories: [
      { title: "Tagesschau", color: "lightcoral" },
      { title: "Coding", color: "lightgreen" },
      { title: "Motivation", color: "lightblue" },
      { title: "Dokumentation", color: "lightyellow" }
    ], color: "lightcoral"
  },
  {
    id: 2, title: "Coding", categories: [
      { title: "MyLife", color: "lightblue" },
      { title: "alte Website", color: "lightgreen" },
      { title: "CodeWars", color: "lightyellow" }
    ], color: "lightblue"
  },
  {
    id: 3, title: "Sport", categories: [
      { title: "Joggen", color: "lightgreen" },
      { title: "Calesthetics", color: "lightblue" },
      { title: "Fitnessstudio", color: "lightcoral" }
    ], color: "lightgreen"
  },
  {
    id: 4, title: "Telefonieren", categories: [
      { title: "Familie", color: "lightyellow" },
      { title: "Freunde", color: "lightcoral" },
      { title: "Arbeit", color: "lightblue" }
    ], color: "lightyellow"
  },
  {
    id: 5, title: "Freizeit", categories: [
      { title: "Bar", color: "lightpink" },
      { title: "Cafe und Kuchen", color: "lightgreen" }
    ], color: "lightpink"
  },
  {
    id: 6, title: "Notizen", categories: [
      { title: "Tagebuch", color: "lightgray" },
      { title: "Ideen", color: "lightcoral" },
      { title: "Todo", color: "lightblue" }
    ], color: "lightgray"
  },
  {
    id: 7, title: "Haare schneiden", categories: [
      { title: "Tim", color: "lightseagreen" },
      { title: "Max", color: "lightpink" },
      { title: "Luis", color: "lightyellow" },
      { title: "Lui", color: "lightcoral" },
      { title: "Basti", color: "lightblue" }
    ], color: "lightseagreen"
  }
]


onMounted(async () => {
  savedData.value = await loadData()
  savedTopics.value = await loadTopics()
  console.log('Loaded topics:', savedTopics.value)
})


const dateSpecificData = computed(() => {
  if (!selectedHistorieDate.value) {
    return []
  }
  if (selectedHistorieDate.value instanceof Array) {
    const startDate = dateFormat(selectedHistorieDate.value[0])
    const endDate = dateFormat(selectedHistorieDate.value[1])
    const filteredData = savedData.value.filter(item => item.date >= startDate && item.date <= endDate)
    return filteredData
  } else {
    const filteredData = savedData.value.filter(item => item.date === dateFormat(selectedHistorieDate.value))
    return filteredData
  }

})

const withValueData = computed(() => {
  return calculateData(dateSpecificData.value)
})

function calculateData(data) {
  const uniqueData = data.reduce((acc, item) => {
    const existingItem = acc.find(i => i.title === item.title)
    if (existingItem) {
      existingItem.hours = Number(existingItem.hours) + Number(item.hours)
      existingItem.minutes = Number(existingItem.minutes) + Number(item.minutes)
    } else {
      acc.push({ ...item })
    }
    return acc
  }, [])
  const minutes = uniqueData.reduce((acc, item) => {
    acc += Number(item.hours * 60) + Number(item.minutes)
    return acc
  }, 0)
  console.log('Total minutes:', minutes)
  const result = uniqueData.map(item => {
    return {
      ...item,
      value: Math.round(((Number(item.hours * 60) + Number(item.minutes)) / minutes) * 100)
    }
  })
  return result
}

const computedTimeRange = computed(() => {
  if (selectedHistorieDate.value instanceof Array) {
    const start = dateFormat(selectedHistorieDate.value[0])
    const end = dateFormat(selectedHistorieDate.value[1])
    return `${start} bis ${end}`
  } else {
    return dateFormat(selectedHistorieDate.value)
  }
})

const doubleTitle = computed(() => {
  const titleCount = {}
  dateSpecificData.value.forEach(item => {
    if (titleCount[item.title]) {
      titleCount[item.title] += 1
    } else {
      titleCount[item.title] = 1
    }
  })

  // Nur Titel, die mehrfach vorkommen
  const titlesSet = new Set()
  Object.keys(titleCount).filter(key => titleCount[key] > 1).forEach(title => titlesSet.add(title))

  console.log('Duplicate Titles:', titlesSet)
  return titlesSet
})

const doubleTitleData = computed(() => {
  const titles = Array.from(doubleTitle.value)
  return titles.flatMap(title => {
    const items = dateSpecificData.value.filter(item => item.title === title)
    const catArray = items.map(item => ({
      topic: item.title,
      title: item.categorie?.title,
      color: item.categorie?.color,
      hours: item.hours,
      minutes: item.minutes
    }))
    return calculateData(catArray) // gibt ein Array zurück, flatMap macht daraus ein flaches Array
  })
})

const doubleTitleGrouped = computed(() => {
  const groups = {}
  doubleTitleData.value.forEach(item => {
    if (!groups[item.topic]) groups[item.topic] = []
    groups[item.topic].push(item)
  })
  // Rückgabe als Array von Objekten
  return Object.entries(groups).map(([topic, items]) => ({
    topic,
    items,
    palette: items.map(i => i.color || 'gray')
  }))
})

function categorieForSameTopic(topic) {
  return doubleTitleData.value.filter(item => item.topic === topic)
}
watch(selectedDate, (newDate) => {
  headerTitle.value = `Aktivität anlegen: ${dateFormat(newDate)}`
  tab.value = "activitySelection"
})

function setActivity(item) {
  tab.value = "categorySelection"
  title.value = item.title
  categories.value = item.categories
  color.value = item.color
  selectedItem.value = item
  headerTitle.value += ` > ${item.title}`
}

function setCategory(cat) {
  tab.value = "timeSelection"
  category.value = cat
  headerTitle.value += ` > ${cat.title}`
}

function setTime(minutesValue) {
  console.log('Called setTime with', minutesValue)
  hours.value = Math.floor(minutesValue / 60) || ''
  minutes.value = minutesValue % 60 || ''
}

async function sendData() {
  const newData = {
    id: uuidv4(),
    title: title.value,
    color: color.value,
    categorie: category.value,
    hours: hours.value,
    minutes: minutes.value,
    date: dateFormat(selectedDate.value)
  }
  await saveToDB(newData.id, newData)
  savedData.value = await loadData()
  resetDialog()
  showDialog.value = false
}

function resetDialog() {
  tab.value = "dateSelection"
  headerTitle.value = "Aktivität anlegen"
  title.value = ""
  categories.value = []
  category.value = ""
  color.value = ""
  selectedItem.value = null
  minutes.value = ''
  hours.value = ''
}


function catToChip() {
  console.log('Adding category:', newCategories.value)
  if (newCategories.value.trim() !== "") {
    categoriesChip.value.push({ title: newCategories.value.trim(), color: getNewColor("edit") })
    newCategories.value = ""
  }
}

function getNewColor(status) {
  const colors = ['lightcoral', 'lightblue', 'lightgreen', 'lightyellow', 'lightpink', 'lightgray', 'lightseagreen', 'lightsalmon', 'lightcyan']
  let allCurrentColors = []
  if (status === "topic") {
    allCurrentColors = savedTopics.value.map(t => t.color)
  } else if (status === "edit") {
    allCurrentColors = editSelectedItem.value.categories.map(c => c.color)
  } else if (status === "newCat") {
    allCurrentColors = categoriesChip.value.map(c => c.color)
  }
  const availableColors = colors.filter(color => !allCurrentColors.includes(color))
  if (availableColors.length > 0) {
    return availableColors[Math.floor(Math.random() * availableColors.length)]
  } else {
    console.log('All colors are used, selecting random color')
    return 'lightgray'
  }
}

async function addTopic() {
  console.log('Adding topic:', newTopic.value, categoriesChip.value)
  const data = {
    id: savedTopics.value.length + 1,
    title: newTopic.value,
    categories: [...categoriesChip.value],
    color: getNewColor("topic")
  }
  newTopic.value = ""
  categoriesChip.value = []
  await saveNewTopic(data)
  savedTopics.value = await loadTopics()
  console.log('New data array:', data)
}

function closeAddTopicPopUp() {
  isActive.value = false
  newTopic.value = ""
  categoriesChip.value = []
}
function closeEditTopicPopUp() {
  editDialog.value = false
  editSelectedItem.value = null
}

async function saveEditedTopic() {
  console.log('Saving edited topic:', editSelectedItem.value)
  await deleteTopic(editSelectedItem.value.id)
  await saveNewTopic(editSelectedItem.value)
  savedTopics.value = await loadTopics()
  closeEditTopicPopUp()
  console.log('All done')
}

function openEditDialog(item) {
  editSelectedItem.value = JSON.parse(JSON.stringify(item))
  console.log('Opening edit dialog for item:', editSelectedItem.value)
  editDialog.value = true
}

function addNewCategory() {
  if (newCategory.value.trim() !== "") {
    editSelectedItem.value.categories.push({ title: newCategory.value.trim(), color: getNewColor("newCat") })
    newCategory.value = ""
  }
}

//Chart JS

</script>
<template>
  <v-app>
    <v-layout>
      <v-navigation-drawer theme="dark" permanent rail>
        <v-list>
          <v-list-item prepend-avatar="https://randomuser.me/api/portraits/women/75.jpg"></v-list-item>
        </v-list>

        <v-divider></v-divider>

        <v-list density="compact" nav>
          <v-list-item prepend-icon="mdi-view-dashboard" value="dashboard"></v-list-item>

          <v-list-item prepend-icon="mdi-forum" value="messages"></v-list-item>
        </v-list>
      </v-navigation-drawer>

      <v-navigation-drawer permanent>
        <v-list>
          <v-list-item title="Eintrag anlegen" value="action" @click="selectedMenu = 'action'"></v-list-item>
          <v-list-item title="Aktivität hinzufügen" value="activity" @click="selectedMenu = 'activity'"></v-list-item>
          <v-list-item title="Historie" value="history" @click="selectedMenu = 'history'"></v-list-item>
        </v-list>
      </v-navigation-drawer>

      <v-main style="height: 100vh">
        <div v-if="selectedMenu === 'action'">
          <v-toolbar color="primary" :title="headerTitle"></v-toolbar>

          <div class="d-flex flex-row">
            <v-tabs v-model="tab" color="primary" direction="vertikal">
              <v-tab text="Datum auswählen" value="dateSelection"></v-tab>
              <v-tab text="Aktivität auswählen" value="activitySelection"></v-tab>
              <v-tab text="Kategorie auswählen" value="categorySelection"></v-tab>
              <v-tab text="Zeit auswählen" value="timeSelection"></v-tab>
            </v-tabs>

            <v-tabs-window v-model="tab">
              <v-tabs-window-item value="dateSelection">
                <v-card flat>
                  <v-card-text>Bitte wähle ein Datum aus:</v-card-text>
                  <VueDatePicker v-model="selectedDate" inline />
                </v-card>
              </v-tabs-window-item>
              <v-tabs-window-item value="activitySelection">
                <v-card flat>
                  <div class="activities">
                    <div class="icon" v-for="item in savedTopics" :key="item.id" @click="setActivity(item)">
                      <h3>{{ item.title }}</h3>
                    </div>
                  </div>
                </v-card>
              </v-tabs-window-item>
              <v-tabs-window-item value="categorySelection">
                <v-card flat>
                  <div class="categories">
                    <div class="icon" v-for="item in categories" :key="item" @click="setCategory(item)">
                      <h3>{{ item.title }}</h3>
                    </div>
                  </div>
                </v-card>
              </v-tabs-window-item>
              <v-tabs-window-item value="timeSelection">
                <v-card flat>
                  <div class="time-selection">
                    <v-btn @click="setTime(15)">15min</v-btn>
                    <v-btn @click="setTime(30)">30min</v-btn>
                    <v-btn @click="setTime(60)">1h</v-btn>
                    <input v-model="hours" type="text" placeholder="Stunden"></input>
                    <input v-model="minutes" type="text" placeholder="Minuten"></input>
                    <v-btn @click="sendData">Sichern</v-btn>
                  </div>
                </v-card>
              </v-tabs-window-item>
            </v-tabs-window>
          </div>
        </div>
        <div v-else-if="selectedMenu === 'activity'">
          <div class="activity">
            <v-dialog max-width="500">
              <template v-slot:activator="{ props: activatorProps }">
                <v-btn v-bind="activatorProps" color="surface-variant" text="Aktivität hinzufügen"
                  variant="flat"></v-btn>
              </template>

              <template v-slot:default="{ isActive }">
                <v-card>
                  <v-card-title>Aktivität hinzufügen</v-card-title>
                  <div class="pa-6 d-flex flex-row">
                    <div class="d-flex flex-column">
                      <label for="topic">Thema:</label>
                      <label for="categories">Kategorien:</label>
                    </div>
                    <div class="d-flex flex-column ml-4 ">
                      <input id="topic" type="text" placeholder="Thema eingeben" v-model="newTopic"></input>
                      <input id="categories" type="text" placeholder="Kategorien eingeben" v-model="newCategories"
                        @keyup.enter="catToChip"></input>
                      <v-chip v-for="cat in categoriesChip" :key="cat.title" closeable>{{ cat.title }}</v-chip>
                    </div>
                  </div>

                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn text="Hinzufügen" @click="addTopic"></v-btn>
                    <v-btn text="Schließen" @click="closeAddTopicPopUp"></v-btn>
                  </v-card-actions>
                </v-card>
              </template>
            </v-dialog>
            <div class="mt-4">
              <h2>alle Aktivitäten</h2>
            </div>
            <div class="topic">
              <v-hover v-for="item in savedTopics" :key="item.id" v-slot="{ isHovering, props }">
                <v-card class="item" :class="{ 'on-hover': isHovering }" :elevation="isHovering ? 16 : 2" v-bind="props"
                  @click="openEditDialog(item)">
                  <h3>{{ item.title }}</h3>
                  <v-card class="categories">
                    <div class="category" v-for="cat in item.categories" :key="cat.title">
                      <h4>{{ cat.title }}</h4>
                    </div>
                  </v-card>
                </v-card>
              </v-hover>

              <v-dialog max-width="500" v-model="editDialog">

                <template v-slot:default="{ isActive }">
                  <v-card>
                    <v-card-title>Aktivität bearbeiten</v-card-title>
                    <div class="pa-6 d-flex flex-row">
                      <div class="d-flex flex-column">
                        <label for="topic">Thema:</label>
                        <label for="categories">Kategorien:</label>
                      </div>
                      <div class="d-flex flex-column ml-4 ">
                        <div v-if="editSelectedItem">
                          <input type="text" v-model="editSelectedItem.title"></input>
                          <input v-for="(cat, idx) in editSelectedItem.categories" :key="idx" type="text"
                            v-model="cat.title"></input>
                          <input type="text" placeholder="neue Kategorie" v-model="newCategory"
                            @keyup.enter="addNewCategory"></input>
                        </div>
                      </div>
                    </div>
                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn text="Speichern" @click="saveEditedTopic"></v-btn>
                      <v-btn text="Schließen" @click="closeEditTopicPopUp"></v-btn>
                    </v-card-actions>
                  </v-card>
                </template>
              </v-dialog>
            </div>
          </div>

        </div>
        <div v-else-if="selectedMenu === 'history'">
          <h2>Historie</h2>
          <div class="history">
            <div class="calendar">
              <v-switch label="Zeitraum" v-model="range"></v-switch>
              <VueDatePicker v-model="selectedHistorieDate" :range="range" inline />
            </div>
            <div class="historyDetails" v-if="selectedHistorieDate">
              <div class="historyDetailsTopic">
                <div class="heading">
                  <h3>festgelegter Zeitraum: {{ computedTimeRange }}</h3>
                </div>
                <div class="historyItems">
                  <history-item v-for="d in dateSpecificData" :key="d.id" :object="d" @dataDeleted="deleteData($event)">
                  </history-item>
                </div>
                <div class="topicsPie">
                  <v-pie title="Aktivitäten" animation :items="withValueData" tooltip></v-pie>
                </div>
              </div>
              <div class="historyDetailsCategorie">
                <div class="heading">
                  <h3>Kategorien mit gleichen Titeln</h3>
                </div>
                <div v-for="topic in doubleTitle">
                  <h3>{{ topic }}</h3>
                  <div class="d-flex">
                    <history-category v-for="d in categorieForSameTopic(topic)" :key="d.title" :object="d"
                      @dataDelete="deleteData($event)">
                    </history-category>
                    <div class="categoriePie">
                      <v-pie v-for="group in doubleTitleGrouped.filter(g => g.topic === topic)" :key="group.topic"
                        :title="`Kategorie: ${group.topic}`" :items="group.items" :palette="group.palette" tooltip />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- ... -->
        </div>
      </v-main>
    </v-layout>
  </v-app>
</template>

<style scoped>
html,
body,
#app {
  height: 100%;
  margin: 0;
  padding: 0;
}

.v-application,
.v-layout,
.v-main {
  height: 100%;
  min-height: 0;
  overflow: auto;
}

.categories {
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  gap: 10px;
  padding: 10px;
  border-radius: 20px;
}

.activity {
  margin: 20px;
}

.topic {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 10px;
  padding: 10px;
}

.top {
  display: flex;
  flex-direction: row;
  gap: 20px;
}

.topics {
  display: flex;
}

.details {
  display: flex;
}

.pie {
  display: flex;
}

.item {
  border: solid black 2px;
  border-radius: 20px;
  background-color: lightgray;
  height: auto;
  width: auto;
  margin: 10px;
  padding: 10px;
}

.icon {
  border: solid black 2px;
  border-radius: 20px;
  background-color: lightblue;
  height: 50px;
  width: auto;
  margin: 10px;
  padding: 10px;
  display: flex;
  justify-content: center;
  flex-direction: column;
  text-align: center;
}

.time-selection {
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 10px;
}

.heuteContent {
  display: flex;
  gap: 10px;
  padding: 10px;
  margin: 10px;
}

.history {
  display: flex;
  flex-direction: row;
  height: 110vh;
  min-width: 0;
  min-height: 0;
}

.historyDetails {
  display: flex;
  flex-direction: column;
  flex: 1 1 0;
  min-width: 0;
  min-height: 0;
  gap: 20px;
}

.historyDetailsCategorie {
  display: flex;
  flex-direction: column;
  gap: 30px;
  margin-top: 40px;
  flex: 1 1 0;
  padding: 10px;
  width: 100%;
  min-width: 0;
  min-height: 0;
  box-sizing: border-box;
}

.historyDetailsTopic {
  display: flex;
  flex-direction: column;
  gap: 30px;
  border-radius: 20px;
  margin: 20px;
  padding: 10px;
  min-width: 0;
  min-height: 0;
  margin: 0;
  box-sizing: border-box;
  /* flex, min-width, min-height, overflow wie oben */
}

.historyItems {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 10px;
  width: 100%;
  height: 100%;
}

.topicsPie {
  display: flex;
  height: 100%;
  border: solid black 2px;
}

.v-card.on-hover.v-theme--dark {
  background-color: rgba(255, 255, 255, 0.8);
}

.v-card.on-hover.v-theme--dark>.v-card__text {
  color: #000;
}
</style>
