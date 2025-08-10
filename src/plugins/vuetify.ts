/**
 * plugins/vuetify.ts
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles
import "@mdi/font/css/materialdesignicons.css";
import "vuetify/styles";

// Composables
import { createVuetify } from "vuetify";
import { md3 } from "vuetify/blueprints";
import colors from "vuetify/util/colors";

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  blueprint: md3,
  theme: {
    defaultTheme: "lightWarm",
    themes: {
      lightWarm: {
        dark: false,
        colors: {
          primary: colors.deepOrange.base,
          "on-primary": "#ffffff",
          "primary-container": colors.deepOrange.lighten4,
          "on-primary-container": "#591a07",

          secondary: colors.amber.darken2,
          "on-secondary": "#000000",
          "secondary-container": colors.amber.lighten4,
          "on-secondary-container": "#591a07",

          tertiary: colors.pink.darken2,
          "on-tertiary": "#000000",
          "tertiary-container": colors.pink.lighten5,
          "on-tertiary-container": "#591a07",

          background: "#FFF8F5",
          "on-background": "#1C1B1F",

          surface: "#FFF8F5",
          "on-surface": "#1C1B1F",
          "surface-variant": "#F5DED6",
          "on-surface-variant": "#52443D",

          "surface-light": colors.amber.lighten5,

          outline: "#85736C",
        },
      },
      darkPurple: {
        dark: true,
        colors: {
          primary: "#BB86FC",
          "on-primary": "#1E1B29",
          "primary-container": "#251947",
          "on-primary-container": "#CBB8E9",

          secondary: "#9A8CFC",
          "on-secondary": "#1E1B29",
          "secondary-container": "#3B2F5C",
          "on-secondary-container": "#E0D4FF",

          tertiary: "#03DAC6",
          "on-tertiary": "#003730",
          "tertiary-container": "#005047",
          "on-tertiary-container": "#A0F0E8",

          background: "#1E1B29",
          "on-background": "#E6E1E5",

          surface: "#1E1B29",
          "on-surface": "#E6E1E5",
          "surface-variant": "#49454F",
          "on-surface-variant": "#CAC4D0",

          outline: "#938F99",
        },
      },
    },
  },
});
