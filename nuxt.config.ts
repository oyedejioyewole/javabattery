export default defineNuxtConfig({
  modules: [
    "@nuxtjs/tailwindcss",
    "@vueuse/nuxt",
    "nuxt-fonty",
    "nuxt-electron",
    "@nuxtjs/color-mode",
    "nuxt-battery",
  ],
  app: {
    head: {
      htmlAttrs: {
        lang: "en-US",
      },
    },
  },
  tailwindcss: {
    exposeConfig: true,
    injectPosition: "first",
  },
  fonty: {
    autoImport: true,
  },
  electron: {
    outDir: "out",
  },
  colorMode: {
    classSuffix: "",
  },
});
