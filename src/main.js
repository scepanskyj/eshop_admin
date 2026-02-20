import { createApp, h } from 'vue';
import { createVuetify } from 'vuetify';
import 'vuetify/styles';
import '@mdi/font/css/materialdesignicons.css';
import '@fortawesome/fontawesome-free/css/all.css';
import { aliases, mdi } from 'vuetify/iconsets/mdi';

import App from './App.vue';
import router from './router';

// Font Awesome icon set
const fa = {
  component: (props) => {
    // Map icon name like "fa-cog" to Font Awesome class "fa-solid fa-cog"
    const iconName = props.icon ? props.icon.replace(/^fa-/, '') : '';
    return h('i', {
      class: `fa-solid fa-${iconName}`,
      style: props.color ? { color: props.color } : undefined
    });
  }
};

const vuetify = createVuetify({
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: { mdi, fa }
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
          warning: '#FB8C00',
          green: '#47850A',
          grey: '#757575'
        }
      }
    }
  }
});

const app = createApp(App);
app.use(vuetify);
app.use(router);
app.mount('#app');
