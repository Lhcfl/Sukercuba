/**
 * main.ts
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Composables
import { createApp } from "vue";
// Plugins
import { registerPlugins } from "@/plugins";
// Components
import App from "./App.vue";
import { boot } from "./boot";

// Styles
import "virtual:uno.css";

const app = createApp(App);

registerPlugins(app);

app.mount("#app");

// boot;
boot();
