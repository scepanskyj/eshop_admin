import Vue from 'vue';
import Vuetify from 'vuetify';
import 'vuetify/dist/vuetify.min.css';
import '@mdi/font/css/materialdesignicons.css';

import App from './App.vue';
import router from './router';

Vue.use(Vuetify);

const vuetify = new Vuetify({
  icons: { iconfont: 'mdi' },
  theme: {
    dark: false,
    themes: {
      light: {
        primary: '#47850A', // Green 500
        secondary: '#356B09', // Green 600
        accent: '#5DA20A', // Green 400
        error: '#B00020',
        info: '#2196F3',
        success: '#47850A', // Green 500
        warning: '#FB8C00'
      }
    }
  }
});

Vue.config.productionTip = false;

new Vue({
  vuetify,
  router,
  render: h => h(App)
}).$mount('#app');


