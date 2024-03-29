<script setup lang="ts">
const toggleModal = (type: ModalType) => {
  const modal = useState<Modal>("modal");
  modal.value = {
    type,
    isOpen: useToggle(ref(modal.value.isOpen))(),
  };
};

const convertTime = (time: number) => {
  const hours = Math.max(0, Math.floor(time / 60));
  const minutes = (time % 60).toFixed(0);

  return {
    hours,
    minutes,
  };
};

useFont([
  {
    family: "Open Sans",
    src: "/fonts/open-sans.woff2",
    display: "swap",
  },
]);

useHead({
  bodyAttrs: {
    class: "dark:bg-black/90",
  },
});

const { x, y } = useMouse();
const { status, charging, time } = useBattery();

const settings = useState<Settings>("settings");
const isSettingsLoaded = ref(false);

watch(status, async (_new) => {
  if (
    !settings.value.enableNotifications ||
    settings.value.notifyOnBatteryLevels.length < 1
  )
    return;

  const notification = useWebNotification({
    icon: "/favicon.ico",
    title: "Javabattery",
  });

  for (const batteryLevel of settings.value.notifyOnBatteryLevels) {
    if (batteryLevel.level === _new) {
      notification.show({
        body: charging.value
          ? `You have reached ${_new}% 🎉`
          : `You at ${_new}% 👀`,
      });
    }
  }
});

const isSettingsShortcutPressed = useMagicKeys({})["Shift+S"];

/**
 * Watches for keystroke `Shift + S`, if found toggles the settings modal
 */
watch(isSettingsShortcutPressed, (_new) => {
  if (_new) toggleModal("settings");
});

onMounted(async () => {
  settings.value = (await useConfig()).value;
  isSettingsLoaded.value = true;
});
</script>

<template>
  <main class="min-h-screen relative overflow-hidden">
    <!-- Moving blob -->
    <div
      class="h-48 bg-gradient-to-br aspect-square absolute -z-10 duration-[3000ms] transition rounded-full blur-lg animate-[spin_10s_linear_infinite]"
      :style="`left: ${x - 90}px; top: ${y - 90}px;`"
      style="animation-fill-mode: forwards"
      :class="{
        'from-green-300 to-green-700': status > 50,
        'from-orange-300 to-orange-700': status >= 30 && status <= 50,
        'from-red-300 to-red-700': status < 30,
        'animate-scale': charging,
        'opacity-0': isSettingsLoaded && !settings.enableHighlighter,
      }"
      v-if="status !== -1"
    ></div>

    <!-- Battery percentage bar -->
    <BatteryBar />

    <!-- Battery percentage and charging status -->
    <Content
      class="flex items-center absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 select-none"
    />

    <!-- Anonymous modal -->
    <Modal v-if="isSettingsLoaded" />

    <!-- Hidden info -->
    <div
      class="absolute left-1/2 -translate-x-1/2 text-center select-none"
      :class="{ 'bottom-[35%]': !charging, 'bottom-[40%]': charging }"
    >
      <h3
        class="text-sm inline-flex gap-2 items-center"
        :class="{
          'text-white dark:text-[#191919]': settings.enableHighlighter,
          'text-black dark:text-white': !settings.enableHighlighter,
        }"
        v-if="isSettingsLoaded"
      >
        <span>Press <code>Shift + S</code> for</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="w-5 aspect-square"
          :class="{
            'fill-white dark:fill-[#191919]':
              isSettingsLoaded && settings.enableHighlighter,
            'fill-black dark:fill-white':
              isSettingsLoaded && !settings.enableHighlighter,
          }"
          viewBox="0 0 16 16"
        >
          <path
            d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872l-.1-.34zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z"
          />
        </svg>
      </h3>

      <h4
        :class="{
          'text-white dark:text-[#191919]':
            isSettingsLoaded && settings.enableHighlighter,
          'text-black dark:text-white':
            isSettingsLoaded && !settings.enableHighlighter,
        }"
        v-if="!charging && time !== Infinity && time !== -1 && isSettingsLoaded"
      >
        &approx;
        {{
          convertTime(time).hours > 0
            ? `${convertTime(time).hours} hour${
                convertTime(time).hours > 1 ? "s" : ""
              } ${convertTime(time).minutes} minutes remaining`
            : `${convertTime(time).minutes} minutes remaining`
        }}
      </h4>
    </div>
  </main>
</template>

<style>
@keyframes scale {
  from {
    scale: 1;
  }
  50% {
    scale: 1.5;
  }
  to {
    scale: 1;
  }
}

.animate-scale {
  animation: scale 5s linear infinite both;
}
</style>
