import { defineConfig } from 'unocss'
import presetWind4 from '@unocss/preset-wind4'
import { presetAttributify } from 'unocss'

export default defineConfig({
  presets: [
    presetWind4(),
    presetAttributify(),
  ],
  rules: [
    [/flex-(\d)-(\d)/, (a) => ({ flex: `${a[1]} ${a[2]} auto` })]
  ],
  theme: {
    colors: {
      primary: 'var(--v-theme-primary)',
      'on-primary': 'var(--v-theme-on-primary)',
      'primary-container': 'var(--v-theme-primary-container)',
      'on-primary-container': 'var(--v-theme-on-primary-container)',
      secondary: 'var(--v-theme-secondary)',
      'on-secondary': 'var(--v-theme-on-secondary)',
      'secondary-container': 'var(--v-theme-secondary-container)',
      'on-secondary-container': 'var(--v-theme-on-secondary-container)',
      tertiary: 'var(--v-theme-tertiary)',
      'on-tertiary': 'var(--v-theme-on-tertiary)',
      'tertiary-container': 'var(--v-theme-tertiary-container)',
      'on-tertiary-container': 'var(--v-theme-on-tertiary-container)',

      surface: 'var(--v-theme-surface)',
      'on-surface': 'var(--v-theme-on-surface)',
    }
  },
})
