export default defineNuxtConfig({
  modules: [
    "@nuxtjs/tailwindcss",
    "@vueuse/nuxt",
    "nuxt-fonty",
    "nuxt-electron",
    "@nuxtjs/color-mode",
  ],
  app: {
    head: {
      htmlAttrs: {
        lang: "en-US",
      },
    },
  },
  ssr: false,
  tailwindcss: {
    exposeConfig: true,
  },
  fonty: {
    autoImport: true,
  },
  electron: {
    outDir: "out",
    renderer: {
      nodeIntegration: true,
    },
  },
  colorMode: {
    classSuffix: "",
  },
});
