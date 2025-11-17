// src/main.js
import { createApp } from 'vue'
import App from './App.vue'

// Import Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import VueDatePicker from '@vuepic/vue-datepicker';

// Optional: Material Design Icons (empfohlen)
import '@mdi/font/css/materialdesignicons.css'
import '@vuepic/vue-datepicker/dist/main.css'

// Vuetify instance
const vuetify = createVuetify({
  components,
  directives,
})

const app = createApp(App)
app.component('VueDatePicker', VueDatePicker);

// App starten
app.use(vuetify)
  .mount('#app')