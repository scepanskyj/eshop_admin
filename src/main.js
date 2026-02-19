import { createApp } from 'vue';
import { createVuetify } from 'vuetify';
import 'vuetify/styles';
import '@mdi/font/css/materialdesignicons.css';
import { aliases, mdi } from 'vuetify/iconsets/mdi';

import App from './App.vue';
import router from './router';

const vuetify = createVuetify({
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: { mdi }
  },
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#47850A',
          secondary: '#356B09',
          accent: '#5DA20A',
          error: '#B00020',
          info: '#2196F3',
          success: '#47850A',
          warning: '#FB8C00'
        }
      }
    }
  }
});

const app = createApp(App);
app.use(vuetify);
app.use(router);
app.mount('#app');
