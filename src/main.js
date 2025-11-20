import Vue from 'vue';
import Vuetify from 'vuetify';
import 'vuetify/dist/vuetify.min.css';
import '@mdi/font/css/materialdesignicons.css';

import App from './App.vue';
import router from './router';

Vue.use(Vuetify);

const vuetify = new Vuetify({
  icons: { iconfont: 'mdi' },
  theme: { dark: false }
});

Vue.config.productionTip = false;

new Vue({
  vuetify,
  router,
  render: h => h(App)
}).$mount('#app');


