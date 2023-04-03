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
      script: [
        process.env.NODE_ENV === "development"
          ? { src: "http://localhost:8098", tagPosition: "bodyClose" }
          : {},
      ],
    },
  },
  tailwindcss: {
    exposeConfig: true,
  },
  fonty: {
    autoImport: true,
  },
  electron: {
    outDir: "out",
    disableDefaultOptions: true,
  },
  colorMode: {
    classSuffix: "",
  },
});
