import { createVuetify } from 'vuetify';
import { aliases, mdi } from 'vuetify/iconsets/mdi';
import 'vuetify/styles';

export default createVuetify({
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
          warning: '#FB8C00',
          surface: '#ffffff',
          background: '#fafafa',
          neutral: '#1B1B1B'
        }
      }
    }
  },
  defaults: {
    global: {
      density: 'compact'
    },
    VSwitch: {
      color: 'primary'
    },
    VCheckbox: {
      color: 'primary'
    },
    VRadio: {
      color: 'primary'
    },
    VTextField: {
      variant: 'outlined',
      hideDetails: 'auto'
    },
    VSelect: {
      variant: 'outlined',
      hideDetails: 'auto'
    },
    VAutocomplete: {
      variant: 'outlined',
      hideDetails: 'auto'
    },
    VTextarea: {
      variant: 'outlined',
      hideDetails: 'auto'
    },
    VList: {
      density: 'compact'
    }
  }
});
