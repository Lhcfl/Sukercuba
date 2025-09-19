import { defineConfig, presetWebFonts } from 'unocss'
import presetWind4 from '@unocss/preset-wind4'
import transformerDirectives from '@unocss/transformer-directives';

export default defineConfig({
  presets: [
    presetWind4(),
    presetWebFonts({
      fonts: {
        sans: ['Roboto', 'Noto Sans']
      }
    }),
  ],
  transformers: [
    transformerDirectives(),
  ],
  rules: [
    [/flex-(\d)-(\d)/, (a) => ({ flex: `${a[1]} ${a[2]} auto` })]
  ],
  theme: {
    colors: {
      primary: 'rgb(var(--v-theme-primary))',
      'on-primary': 'rgb(var(--v-theme-on-primary))',
      'primary-container': 'rgb(var(--v-theme-primary-container))',
      'on-primary-container': 'rgb(var(--v-theme-on-primary-container))',
      secondary: 'rgb(var(--v-theme-secondary))',
      'on-secondary': 'rgb(var(--v-theme-on-secondary))',
      'secondary-container': 'rgb(var(--v-theme-secondary-container))',
      'on-secondary-container': 'rgb(var(--v-theme-on-secondary-container))',
      tertiary: 'rgb(var(--v-theme-tertiary))',
      'on-tertiary': 'rgb(var(--v-theme-on-tertiary))',
      'tertiary-container': 'rgb(var(--v-theme-tertiary-container))',
      'on-tertiary-container': 'rgb(var(--v-theme-on-tertiary-container))',
      surface: 'rgb(var(--v-theme-surface))',
      'on-surface': 'rgb(var(--v-theme-on-surface))',
    }
  },

})
