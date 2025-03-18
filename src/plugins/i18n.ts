import { watch, type WritableComputedRef } from "vue";
import { createI18n } from "vue-i18n";
import en from "@/locales/en-US.json";
import zh from "@/locales/zh-CN.json";

let created_i18n: ReturnType<typeof initI18n> | null = null;

export function initI18n() {
  const savedLocale = localStorage.getItem("locale") || 'zh-CN';

  const i18n = createI18n({
    legacy: false,
    locale: savedLocale, // 默认语言
    fallbackLocale: 'en-US', // 回退语言
    messages: {
      'en-US': en,
      'zh-CN': zh,
    },
  });

  created_i18n = i18n;

  watch(
    i18n.global.locale as WritableComputedRef<string>,
    async (locale) => {
      /**
       * NOTE:
       * If you need to specify the language setting for headers, such as the `fetch` API, set it here.
       * The following is an example for axios.
       *
       * axios.defaults.headers.common['Accept-Language'] = locale
       */
      document.documentElement.setAttribute("lang", locale);
      localStorage.setItem("locale", locale);
      // load locale messages with dynamic import
      const messages = await import(`@/locales/${locale}.json`);
      // set locale and locale message
      i18n.global.setLocaleMessage(locale, messages.default);
    },
    {
      immediate: true,
    },
  );

  return i18n;
}

export function getI18n() {
  if (created_i18n == null) {
    throw "i18n is not initialized";
  }
  return created_i18n;
}
