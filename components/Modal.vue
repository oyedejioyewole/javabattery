<script setup lang="ts">
import {
  TransitionRoot,
  TransitionChild,
  Dialog,
  DialogPanel,
  DialogTitle,
  Switch,
} from "@headlessui/vue";
import { useStorage } from "@vueuse/core";

const closeModal = () =>
  (modal.value.isOpen = useToggle(ref(modal.value.isOpen))(false));

const openSite = async (url: string) => await window.globals.openSite(url);

const { status } = useBattery();
const modal = useState<Modal>("modal", () => ({ isOpen: false }));

const settings = useStorage<Settings>("settings", {
  enableNotifications: true,
  enableHighlighter: true,
});

onMounted(
  async () => await window.globals.saveSettings(JSON.stringify(settings.value))
);

watch(
  settings,
  async (_new) => await window.globals.saveSettings(JSON.stringify(_new))
);

const notificationToggled = ref(settings.value.enableNotifications);
const highlighterToggled = ref(settings.value.enableHighlighter);

/**
 * Watches the [notificationToggled, highlighterToggled] refs'
 *
 * - Changes the value of the settings.value.enableHighlighter, if (old !== new)
 * - Changes the value of the settings.value.enableNotifications, if (old !== new)
 */
watch(
  [notificationToggled, highlighterToggled],
  async (
    [newNotificationToggled, newHighlighterToggled],
    [oldNotificationToggled, oldHighlighterToggled]
  ) => {
    if (newNotificationToggled !== oldNotificationToggled)
      settings.value.enableNotifications = newNotificationToggled;
    if (newHighlighterToggled !== oldHighlighterToggled)
      settings.value.enableHighlighter = newHighlighterToggled;
  }
);
</script>

<template>
  <TransitionRoot appear :show="modal.isOpen" as="section">
    <Dialog as="div" @close="closeModal" class="relative z-10">
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black bg-opacity-25" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4">
          <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <DialogPanel
              class="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-[#191919]/70 backdrop-blur-lg bg-opacity-70 p-6 align-middle shadow-xl transition-all"
            >
              <DialogTitle
                as="h3"
                class="text-lg font-medium leading-6 text-gray-900 dark:text-white"
              >
                {{ modal.type === "settings" ? "Settings" : "" }}
              </DialogTitle>

              <div class="my-4">
                <div class="flex items-center justify-between">
                  <h1 class="dark:text-white">
                    Allow app to send notifications
                  </h1>
                  <Switch
                    v-model="notificationToggled"
                    :class="`${
                      notificationToggled
                        ? status > 50
                          ? 'bg-green-700'
                          : status >= 30 && status <= 50
                          ? 'bg-orange-700'
                          : status < 30
                          ? 'bg-red-700'
                          : ''
                        : status > 50
                        ? 'bg-green-500'
                        : status >= 30 && status <= 50
                        ? 'bg-orange-500'
                        : status < 30
                        ? 'bg-red-500'
                        : ''
                    } ${
                      status > 50
                        ? 'focus-visible:ring-green-900'
                        : status >= 30 && status <= 50
                        ? 'focus-visible:ring-orange-900'
                        : 'focus-visible:ring-red-900'
                    }`"
                    class="relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-opacity-50 border-white transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-opacity-75 items-center"
                  >
                    <span class="sr-only">Use settings</span>
                    <span
                      aria-hidden="true"
                      :class="
                        notificationToggled ? 'translate-x-6' : 'translate-x-1'
                      "
                      class="pointer-events-none inline-block w-4 aspect-square transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out"
                    />
                  </Switch>
                </div>
              </div>

              <div class="my-4">
                <div class="flex items-center justify-between">
                  <h1 class="dark:text-white">Enable the highlighter</h1>
                  <Switch
                    v-model="highlighterToggled"
                    :class="`${
                      highlighterToggled
                        ? status > 50
                          ? 'bg-green-700'
                          : status >= 30 && status <= 50
                          ? 'bg-orange-700'
                          : status < 30
                          ? 'bg-red-700'
                          : ''
                        : status > 50
                        ? 'bg-green-500'
                        : status >= 30 && status <= 50
                        ? 'bg-orange-500'
                        : status < 30
                        ? 'bg-red-500'
                        : ''
                    } ${
                      status > 50
                        ? 'focus-visible:ring-green-900'
                        : status >= 30 && status <= 50
                        ? 'focus-visible:ring-orange-900'
                        : 'focus-visible:ring-red-900'
                    }`"
                    class="relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-opacity-50 border-white transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-opacity-75 items-center"
                  >
                    <span class="sr-only">Enable the highlighter</span>
                    <span
                      aria-hidden="true"
                      :class="
                        highlighterToggled ? 'translate-x-6' : 'translate-x-1'
                      "
                      class="pointer-events-none inline-block w-4 aspect-square transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out"
                    />
                  </Switch>
                </div>
              </div>

              <div class="flex justify-between mt-4">
                <h3 class="dark:text-white">Theme</h3>
                <div class="inline-flex gap-x-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="w-6 aspect-square cursor-pointer hover:rotate-[360deg] transition duration-500"
                    :class="
                      status > 50
                        ? `${
                            $colorMode.value === 'light'
                              ? 'dark:fill-green-500'
                              : 'dark:fill-green-300'
                          } fill-green-500`
                        : status >= 30 && status <= 50
                        ? `${
                            $colorMode.value === 'light'
                              ? 'dark:fill-orange-500'
                              : 'dark:fill-orange-300'
                          } fill-orange-500`
                        : status < 30
                        ? `${
                            $colorMode.value === 'light'
                              ? 'dark:fill-red-500'
                              : 'dark:fill-red-300'
                          } fill-red-500`
                        : ''
                    "
                    viewBox="0 0 16 16"
                    @click="$colorMode.preference = 'light'"
                  >
                    <path
                      d="M8 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0zm0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13zm8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5zM3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8zm10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0zm-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0zm9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707zM4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708z"
                    />
                  </svg>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="w-6 aspect-square cursor-pointer hover:opacity-70 transition"
                    :class="
                      status > 50
                        ? `${
                            $colorMode.value === 'dark'
                              ? 'dark:fill-green-500'
                              : 'dark:fill-green-300'
                          } fill-green-500`
                        : status >= 30 && status <= 50
                        ? `${
                            $colorMode.value === 'dark'
                              ? 'dark:fill-orange-500'
                              : 'dark:fill-orange-300'
                          } fill-orange-500`
                        : status < 30
                        ? `${
                            $colorMode.value === 'dark'
                              ? 'dark:fill-red-500'
                              : 'dark:fill-red-300'
                          } fill-red-500`
                        : ''
                    "
                    viewBox="0 0 16 16"
                    @click="$colorMode.preference = 'dark'"
                  >
                    <path
                      d="M6 .278a.768.768 0 0 1 .08.858 7.208 7.208 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277.527 0 1.04-.055 1.533-.16a.787.787 0 0 1 .81.316.733.733 0 0 1-.031.893A8.349 8.349 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.752.752 0 0 1 6 .278z"
                    />
                  </svg>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="w-6 aspect-square cursor-pointer hover:opacity-70 transition"
                    :class="
                      status > 50
                        ? `${
                            $colorMode.value === 'dark'
                              ? 'dark:fill-green-500'
                              : 'dark:fill-green-300'
                          } fill-green-500`
                        : status >= 30 && status <= 50
                        ? `${
                            $colorMode.value === 'dark'
                              ? 'dark:fill-orange-500'
                              : 'dark:fill-orange-300'
                          } fill-orange-500`
                        : status < 30
                        ? `${
                            $colorMode.value === 'dark'
                              ? 'dark:fill-red-500'
                              : 'dark:fill-red-300'
                          } fill-red-500`
                        : ''
                    "
                    @click="$colorMode.preference = 'system'"
                    viewBox="0 0 16 16"
                  >
                    <path
                      d="M0 4s0-2 2-2h12s2 0 2 2v6s0 2-2 2h-4c0 .667.083 1.167.25 1.5H11a.5.5 0 0 1 0 1H5a.5.5 0 0 1 0-1h.75c.167-.333.25-.833.25-1.5H2s-2 0-2-2V4zm1.398-.855a.758.758 0 0 0-.254.302A1.46 1.46 0 0 0 1 4.01V10c0 .325.078.502.145.602.07.105.17.188.302.254a1.464 1.464 0 0 0 .538.143L2.01 11H14c.325 0 .502-.078.602-.145a.758.758 0 0 0 .254-.302 1.464 1.464 0 0 0 .143-.538L15 9.99V4c0-.325-.078-.502-.145-.602a.757.757 0 0 0-.302-.254A1.46 1.46 0 0 0 13.99 3H2c-.325 0-.502.078-.602.145z"
                    />
                  </svg>
                </div>
              </div>

              <div class="space-y-4 mt-4">
                <hr class="border-gray-900 dark:border-white w-1/4 mx-auto" />
                <h1 class="text-sm text-center text-gray-900 dark:text-white">
                  Made with 💖 by
                  <a
                    href="https://github.com/OyewoleOyedeji"
                    @click.prevent="
                      openSite('https://github.com/OyewoleOyedeji')
                    "
                    class="relative before:absolute before:content-[''] before:w-0 before:h-1 before:bg-black/50 dark:before:bg-white/50 before:-bottom-[0.06rem] before:left-[0.1rem] hover:before:w-full hover:before:h-1 before:-z-10 z-10 before:rounded-full before:duration-300"
                    style="transition: width"
                    >OyewoleOyedeji</a
                  >
                </h1>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
