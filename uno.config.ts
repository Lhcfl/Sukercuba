import { defineConfig } from 'unocss'
import presetWind4 from '@unocss/preset-wind4'

export default defineConfig({
  presets: [
    presetWind4(),
  ],
  rules: [
    [/flex-(\d)-(\d)/, (a) => ({ flex: `${a[1]} ${a[2]} auto` })]
  ]
})
