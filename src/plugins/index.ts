/**
 * plugins/index.ts
 *
 * Automatically included in `./src/main.ts`
 */
import { VueQueryPlugin } from "@tanstack/vue-query";
import type { App } from "vue";
import router from "../router";
import pinia from "../stores";
import { initI18n } from "./i18n";
import vuetify from "./vuetify";

export function registerPlugins(app: App) {
  app.use(vuetify).use(router).use(pinia).use(initI18n()).use(VueQueryPlugin);
}
