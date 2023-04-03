<script setup lang="ts">
import {
  TransitionRoot,
  TransitionChild,
  Dialog,
  DialogPanel,
  DialogTitle,
  Switch,
} from "@headlessui/vue";

/**
 * Closes the modal
 */
const closeModal = () =>
  (modal.value.isOpen = useToggle(ref(modal.value.isOpen))(false));

/**
 * Opens a site in the default browser
 * @param url The URL to open
 */
const openSite = async (url: string) => await window.globals.openSite(url);

/**
 * Adds a battery level
 * @param batteryLevel The battery level to add
 */
const addBatteryLevel = (batteryLevel: number) => {
  if (
    settings.value.notifyOnBatteryLevels.find(
      ({ level }) => batteryLevel === level
    )
  )
    return;

  userProvidedBatteryLevel.value = "";
  currentlyToggledBatteryLevel.value = undefined;
  useToggle(showIndividualBatteryLevelOptions)(false);

  settings.value.notifyOnBatteryLevels.push({
    level: batteryLevel,
    whenCharging: true,
    whenDischarging: true,
  });

  settings.value.notifyOnBatteryLevels.sort((a, b) => a.level - b.level);
};

/**
 * Manages a battery level
 * @param action "delete" | "toggle-charging" | "toggle-discharging"
 * @param batteryLevel The battery level to manage
 */
const manageBatteryLevel = (
  action: "delete" | "toggle-charging" | "toggle-discharging",
  batteryLevel: number
) => {
  if (action === "toggle-charging") {
    const _selectedBatteryLevel = settings.value.notifyOnBatteryLevels.find(
      ({ level }) => level === batteryLevel
    );
    if (_selectedBatteryLevel)
      _selectedBatteryLevel.whenCharging = !_selectedBatteryLevel.whenCharging;
  } else if (action === "toggle-discharging") {
    const _selectedBatteryLevel = settings.value.notifyOnBatteryLevels.find(
      ({ level }) => level === batteryLevel
    );

    if (_selectedBatteryLevel)
      _selectedBatteryLevel.whenDischarging =
        !_selectedBatteryLevel.whenDischarging;
  } else if (action === "delete") {
    settings.value.notifyOnBatteryLevels =
      settings.value.notifyOnBatteryLevels.filter(
        ({ level }) => level !== batteryLevel
      );
  }
};

/**
 * Toggles options per battery level
 * @param batteryLevel The battery level to toggle
 */
const showBatteryLevelOptions = (batteryLevel: number) => {
  if (currentlyToggledBatteryLevel.value === `at-${batteryLevel}`)
    useToggle(showIndividualBatteryLevelOptions)();
  else {
    currentlyToggledBatteryLevel.value = `at-${batteryLevel}`;
    useToggle(showIndividualBatteryLevelOptions)(true);
  }
};

/**
 * Clears all the battery levels
 */
const clearBatteryLevels = () => {
  settings.value.notifyOnBatteryLevels = [];
};

/**
 * Decides what to do when there are no battery levels based parameters
 * @param action "generate-random" | "use-defaults"
 */
const performActionWhenNoBatteryLevels = async (
  action: "generate-random" | "use-defaults"
) => {
  if (action === "use-defaults") {
    settings.value.notifyOnBatteryLevels = (
      await import("~/config/defaults.json")
    ).notifyOnBatteryLevels;
  } else if (action === "generate-random") {
    // Generate 5 random battery levels
    const randomBatteryLevels = Array.from(
      { length: 5 },
      () => Math.floor(Math.random() * 100) + 1
    );
    // Remove duplicates
    const uniqueRandomBatteryLevels = [...new Set(randomBatteryLevels)];
    // Sort the array
    const sortedUniqueRandomBatteryLevels = uniqueRandomBatteryLevels.sort(
      (a, b) => a - b
    );
    // Add the battery levels to the settings
    settings.value.notifyOnBatteryLevels = sortedUniqueRandomBatteryLevels.map(
      (level) => ({ level, whenCharging: true, whenDischarging: true })
    );
  }
};

const { status } = useBattery();
const modal = useState<Modal>("modal", () => ({ isOpen: false }));
const currentlyToggledBatteryLevel = ref<string>();
const showIndividualBatteryLevelOptions = ref(false);
const userAction = ref<"clear" | "add">("clear");
const userProvidedBatteryLevel = ref<number | string>("");

watch(userProvidedBatteryLevel, (_new) => {
  userAction.value =
    typeof _new === "number" && /^([1-9][0-9]?|100)$/.test(_new.toString())
      ? "add"
      : "clear";
});

const settings = useState<Settings>("settings");

/**
 * Watches the settings ref and sends an IPC message to the main process (to save the settings)
 */
watch(
  settings,
  async (_new) => {
    await window.globals.saveSettings(JSON.stringify(_new));
  },
  { deep: true }
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

              <!-- Settings options -->
              <div class="my-4">
                <!-- Allow app to send notifications -->
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

              <!-- Enable the highlighter -->
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

              <!-- Toggle the application theme -->
              <div class="flex justify-between mt-4">
                <h1 class="dark:text-white">Theme</h1>
                <div class="inline-flex gap-x-3">
                  <!-- Light theme -->
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="w-6 aspect-square cursor-pointer hover:rotate-[360deg] transition duration-500"
                    :class="{
                      'fill-green-700': status > 50,
                      'fill-orange-700': status >= 30 && status <= 50,
                      'fill-red-700': status < 30,
                      'dark:fill-green-500':
                        status > 50 && $colorMode.preference === 'dark',
                      'dark:fill-orange-500':
                        status >= 30 &&
                        status <= 50 &&
                        $colorMode.preference === 'dark',
                      'dark:fill-red-500':
                        status < 30 && $colorMode.preference === 'dark',
                    }"
                    viewBox="0 0 16 16"
                    @click="$colorMode.preference = 'light'"
                  >
                    <path
                      d="M8 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0zm0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13zm8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5zM3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8zm10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0zm-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0zm9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707zM4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708z"
                    />
                  </svg>

                  <!-- Dark theme -->
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="w-6 aspect-square cursor-pointer hover:opacity-70 transition"
                    :class="{
                      'fill-green-700': status > 50,
                      'fill-orange-700': status >= 30 && status <= 50,
                      'fill-red-700': status < 30,
                      'dark:fill-green-500':
                        status > 50 && $colorMode.preference === 'dark',
                      'dark:fill-orange-500':
                        status >= 30 &&
                        status <= 50 &&
                        $colorMode.preference === 'dark',
                      'dark:fill-red-500':
                        status < 30 && $colorMode.preference === 'dark',
                    }"
                    viewBox="0 0 16 16"
                    @click="$colorMode.preference = 'dark'"
                  >
                    <path
                      d="M6 .278a.768.768 0 0 1 .08.858 7.208 7.208 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277.527 0 1.04-.055 1.533-.16a.787.787 0 0 1 .81.316.733.733 0 0 1-.031.893A8.349 8.349 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.752.752 0 0 1 6 .278z"
                    />
                  </svg>

                  <!-- System theme -->
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="w-6 aspect-square cursor-pointer hover:opacity-70 transition"
                    :class="{
                      'fill-green-700': status > 50,
                      'fill-orange-700': status >= 30 && status <= 50,
                      'fill-red-700': status < 30,
                      'dark:fill-green-500':
                        status > 50 && $colorMode.preference === 'dark',
                      'dark:fill-orange-500':
                        status >= 30 &&
                        status <= 50 &&
                        $colorMode.preference === 'dark',
                      'dark:fill-red-500':
                        status < 30 && $colorMode.preference === 'dark',
                    }"
                    @click="$colorMode.preference = 'system'"
                    viewBox="0 0 16 16"
                  >
                    <path
                      d="M0 4s0-2 2-2h12s2 0 2 2v6s0 2-2 2h-4c0 .667.083 1.167.25 1.5H11a.5.5 0 0 1 0 1H5a.5.5 0 0 1 0-1h.75c.167-.333.25-.833.25-1.5H2s-2 0-2-2V4zm1.398-.855a.758.758 0 0 0-.254.302A1.46 1.46 0 0 0 1 4.01V10c0 .325.078.502.145.602.07.105.17.188.302.254a1.464 1.464 0 0 0 .538.143L2.01 11H14c.325 0 .502-.078.602-.145a.758.758 0 0 0 .254-.302 1.464 1.464 0 0 0 .143-.538L15 9.99V4c0-.325-.078-.502-.145-.602a.757.757 0 0 0-.302-.254A1.46 1.46 0 0 0 13.99 3H2c-.325 0-.502.078-.602.145z"
                    />
                  </svg>
                </div>
              </div>

              <div class="mt-4 space-y-2">
                <div class="flex justify-between items-center">
                  <h1 class="dark:text-white">When should I notify you?</h1>
                  <div class="flex justify-end gap-x-2">
                    <!-- Enter your battery percentage -->
                    <input
                      type="number"
                      placeholder="%"
                      class="placeholder:text-center dark:placeholder:text-black/70 p-1 rounded-full backdrop-blur-lg bg-transparent dark:bg-white dark:bg-opacity-70 outline-none text-center focus-visible:ring-2 dark:focus-visible:ring-2 dark:focus-visible:ring-green-500 dark:focus-visible:ring-offset-2 form-input border-0"
                      max="100"
                      min="0"
                      :class="{
                        'focus-visible:ring-green-900': status > 50,
                        'focus-visible:ring-orange-900':
                          status >= 30 && status <= 50,
                        'focus-visible:ring-red-900': status < 30,
                      }"
                      v-model="userProvidedBatteryLevel"
                    />

                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="w-5 aspect-square cursor-pointer hover:opacity-70 transition"
                      viewBox="0 0 16 16"
                      :class="{
                        'fill-green-700': status > 50,
                        'fill-orange-700': status >= 30 && status <= 50,
                        'fill-red-700': status < 30,
                        'dark:fill-green-500':
                          status > 50 && $colorMode.value === 'dark',
                        'dark:fill-orange-500':
                          status >= 30 &&
                          status <= 50 &&
                          $colorMode.value === 'dark',
                        'dark:fill-red-500':
                          status < 30 && $colorMode.value === 'dark',
                      }"
                      v-if="userAction === 'clear'"
                      @click="clearBatteryLevels()"
                    >
                      <!-- Trash icon (close to input form) -->
                      <title>Clear!</title>
                      <path
                        d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5Zm-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5ZM4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06Zm6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528ZM8 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5Z"
                      />
                    </svg>

                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="w-6 aspect-square cursor-pointer hover:opacity-70 transition"
                      :class="{
                        'fill-green-700': status > 50,
                        'fill-orange-700': status >= 30 && status <= 50,
                        'fill-red-700': status < 30,
                        'dark:fill-green-500':
                          status > 50 && $colorMode.value === 'dark',
                        'dark:fill-orange-500':
                          status >= 30 &&
                          status <= 50 &&
                          $colorMode.value === 'dark',
                        'dark:fill-red-500':
                          status < 30 && $colorMode.value === 'dark',
                      }"
                      viewBox="0 0 16 16"
                      @click="
                        addBatteryLevel(userProvidedBatteryLevel as number)
                      "
                      v-else
                    >
                      <!-- Double check icon (close to input form) -->
                      <title>Add</title>
                      <path
                        d="M12.354 4.354a.5.5 0 0 0-.708-.708L5 10.293 1.854 7.146a.5.5 0 1 0-.708.708l3.5 3.5a.5.5 0 0 0 .708 0l7-7zm-4.208 7-.896-.897.707-.707.543.543 6.646-6.647a.5.5 0 0 1 .708.708l-7 7a.5.5 0 0 1-.708 0z"
                      />
                      <path
                        d="m5.354 7.146.896.897-.707.707-.897-.896a.5.5 0 1 1 .708-.708z"
                      />
                    </svg>
                  </div>
                </div>

                <div class="flex gap-x-3 flex-wrap gap-y-2">
                  <!-- List of battery levels -->
                  <div
                    v-for="(
                      { level, whenCharging, whenDischarging }, index
                    ) in settings.notifyOnBatteryLevels"
                    :key="index"
                    class="flex gap-x-1 text-sm select-none items-center"
                    v-if="settings.notifyOnBatteryLevels.length > 0"
                  >
                    <h3
                      class="px-2 py-1 bg-green-300 rounded-full cursor-pointer hover:bg-green-400 transition"
                      @click="showBatteryLevelOptions(level)"
                    >
                      {{ level }}%
                    </h3>

                    <span
                      v-if="
                        `at-${level}` === currentlyToggledBatteryLevel &&
                        showIndividualBatteryLevelOptions
                      "
                      class="dark:text-white"
                      >&#8212;</span
                    >

                    <div
                      class="flex gap-x-3"
                      v-if="
                        `at-${level}` === currentlyToggledBatteryLevel &&
                        showIndividualBatteryLevelOptions
                      "
                    >
                      <div
                        :class="{
                          'after:absolute after:content-[\'\'] after:w-2 after:aspect-square relative after:-top-2 after:-right-1 after:rounded-full after:animate-pulse after:duration-1000':
                            whenCharging,
                          'after:bg-green-700': whenCharging && status > 50,
                          'after:bg-orange-700':
                            whenCharging && status >= 30 && status <= 50,
                          'after:bg-red-700': whenCharging && status < 30,
                          'dark:after:bg-green-500':
                            whenCharging &&
                            status > 50 &&
                            $colorMode.value === 'dark',
                          'dark:after:bg-orange-500':
                            whenCharging &&
                            status >= 30 &&
                            status <= 50 &&
                            $colorMode.value === 'dark',
                          'dark:after:bg-red-500':
                            whenCharging &&
                            status < 30 &&
                            $colorMode.value === 'dark',
                        }"
                      >
                        <!-- Toggle charging -->
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          class="w-5 aspect-square cursor-pointer hover:opacity-70 transition relative"
                          :class="{
                            'fill-green-700': status > 50,
                            'fill-orange-700': status >= 30 && status <= 50,
                            'fill-red-700': status < 30,
                            'dark:fill-green-500':
                              status > 50 && $colorMode.value === 'dark',
                            'dark:fill-orange-500':
                              status >= 30 &&
                              status <= 50 &&
                              $colorMode.value === 'dark',
                            'dark:fill-red-500':
                              status < 30 && $colorMode.value === 'dark',
                          }"
                          viewBox="0 0 16 16"
                          @click="manageBatteryLevel('toggle-charging', level)"
                        >
                          <title>Show when charging!</title>
                          <path
                            d="M11.251.068a.5.5 0 0 1 .227.58L9.677 6.5H13a.5.5 0 0 1 .364.843l-8 8.5a.5.5 0 0 1-.842-.49L6.323 9.5H3a.5.5 0 0 1-.364-.843l8-8.5a.5.5 0 0 1 .615-.09z"
                          />
                        </svg>
                      </div>

                      <div
                        :class="{
                          'after:absolute after:content-[\'\'] after:w-2 after:aspect-square relative after:-top-2 after:-right-1 after:rounded-full after:animate-pulse after:duration-1000':
                            whenDischarging,
                          'after:bg-green-700': whenDischarging && status > 50,
                          'after:bg-orange-700':
                            whenDischarging && status >= 30 && status <= 50,
                          'after:bg-red-700': whenDischarging && status < 30,
                          'dark:after:bg-green-500':
                            whenDischarging &&
                            status > 50 &&
                            $colorMode.value === 'dark',
                          'dark:after:bg-orange-500':
                            whenDischarging &&
                            status >= 30 &&
                            status <= 50 &&
                            $colorMode.value === 'dark',
                          'dark:after:bg-red-500':
                            whenDischarging &&
                            status < 30 &&
                            $colorMode.value === 'dark',
                        }"
                      >
                        <!-- Toggle discharging -->
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          class="w-5 aspect-square cursor-pointer -rotate-90 hover:opacity-70 transition"
                          :class="{
                            'fill-green-700': status > 50,
                            'fill-orange-700': status >= 30 && status <= 50,
                            'fill-red-700': status < 30,
                            'dark:fill-green-500':
                              status > 50 && $colorMode.value === 'dark',
                            'dark:fill-orange-500':
                              status >= 30 &&
                              status <= 50 &&
                              $colorMode.value === 'dark',
                            'dark:fill-red-500':
                              status < 30 && $colorMode.value === 'dark',
                          }"
                          viewBox="0 0 16 16"
                          @click="
                            manageBatteryLevel('toggle-discharging', level)
                          "
                        >
                          <title>Show when on battery power!</title>
                          <path d="M2 6h5v4H2V6z" />
                          <path
                            d="M2 4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H2zm10 1a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h10zm4 3a1.5 1.5 0 0 1-1.5 1.5v-3A1.5 1.5 0 0 1 16 8z"
                          />
                        </svg>
                      </div>

                      <!-- Delete icon -->
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="w-5 aspect-square cursor-pointer hover:opacity-70 transition"
                        viewBox="0 0 16 16"
                        :class="{
                          'fill-green-700': status > 50,
                          'fill-orange-700': status >= 30 && status <= 50,
                          'fill-red-700': status < 30,
                          'dark:fill-green-500':
                            status > 50 && $colorMode.value === 'dark',
                          'dark:fill-orange-500':
                            status >= 30 &&
                            status <= 50 &&
                            $colorMode.value === 'dark',
                          'dark:fill-red-500':
                            status < 30 && $colorMode.value === 'dark',
                        }"
                        @click="manageBatteryLevel('delete', level)"
                      >
                        <title>Delete this!</title>
                        <path
                          d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5Zm-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5ZM4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06Zm6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528ZM8 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5Z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div class="flex items-center justify-between w-full" v-else>
                    <h1 class="text-sm dark:text-white">
                      No battery levels set
                    </h1>
                    <div class="flex gap-x-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="w-5 aspect-square cursor-pointer hover:opacity-70 transition"
                        :class="{
                          'fill-green-700': status > 50,
                          'fill-orange-700': status >= 30 && status <= 50,
                          'fill-red-700': status < 30,
                          'dark:fill-green-500':
                            status > 50 && $colorMode.value === 'dark',
                          'dark:fill-orange-500':
                            status >= 30 &&
                            status <= 50 &&
                            $colorMode.value === 'dark',
                          'dark:fill-red-500':
                            status < 30 && $colorMode.value === 'dark',
                        }"
                        viewBox="0 0 16 16"
                        @click="
                          performActionWhenNoBatteryLevels('generate-random')
                        "
                      >
                        <title>Choose random levels</title>
                        <path
                          d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41zm-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9z"
                        />
                        <path
                          fill-rule="evenodd"
                          d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5.002 5.002 0 0 0 8 3zM3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9H3.1z"
                        />
                      </svg>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="w-5 aspect-square cursor-pointer hover:opacity-70 transition"
                        :class="{
                          'fill-green-700': status > 50,
                          'fill-orange-700': status >= 30 && status <= 50,
                          'fill-red-700': status < 30,
                          'dark:fill-green-500':
                            status > 50 && $colorMode.value === 'dark',
                          'dark:fill-orange-500':
                            status >= 30 &&
                            status <= 50 &&
                            $colorMode.value === 'dark',
                          'dark:fill-red-500':
                            status < 30 && $colorMode.value === 'dark',
                        }"
                        viewBox="0 0 16 16"
                        @click="
                          performActionWhenNoBatteryLevels('use-defaults')
                        "
                      >
                        <title>Use defaults</title>
                        <path
                          d="M12.643 15C13.979 15 15 13.845 15 12.5V5H1v7.5C1 13.845 2.021 15 3.357 15h9.286zM5.5 7h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1 0-1zM.8 1a.8.8 0 0 0-.8.8V3a.8.8 0 0 0 .8.8h14.4A.8.8 0 0 0 16 3V1.8a.8.8 0 0 0-.8-.8H.8z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <div class="space-y-4 mt-4">
                <!-- Divider -->
                <hr class="border-gray-900 dark:border-white w-1/4 mx-auto" />

                <!-- Made with 💖 by OyewoleOyedeji -->
                <h1 class="text-sm text-center text-gray-900 dark:text-white">
                  Made with 💖 by
                  <a
                    @click="openSite('https://github.com/OyewoleOyedeji')"
                    class="relative before:absolute before:content-[''] before:w-0 before:h-1 before:bg-black/50 dark:before:bg-white/50 before:-bottom-[0.06rem] before:left-[0.1rem] hover:before:w-full hover:before:h-1 before:-z-10 z-10 before:rounded-full before:duration-300 cursor-pointer"
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

<style scoped>
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style>
