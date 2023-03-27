<script setup lang="ts">
import { useStorage } from "@vueuse/core";
import { secondsToHours, secondsToMinutes } from "date-fns";

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

const toggleModal = (type: ModalType) => {
  const modal = useState<Modal>("modal");
  modal.value = {
    type,
    isOpen: useToggle(ref(modal.value.isOpen))(),
  };
};

const { level, charging, dischargingTime } = useBattery();

/**
 * Watches the level ref and sends an appropriate notification based on the
 *  new value approximated to .1 or .12 places
 */
watch(level, async (_new) => {
  if (!settings.value.enableNotifications) return;

  const approximatedBatteryLevels = [
    Number(_new.toFixed(1)),
    Number(_new.toFixed(2)),
  ];

  const notification = useWebNotification({
    icon: "/icon.ico",
    title: "Javabattery",
  });

  if (approximatedBatteryLevels[0] === approximatedBatteryLevels[1]) {
    if (charging.value) {
      if (approximatedBatteryLevels[0] === 0.9)
        notification.show({ body: "You can stop charging the device now 🎉" });
      else if (approximatedBatteryLevels[0] === 0.5)
        notification.show({ body: "You've reached the halfway mark 🎉" });
      else if (approximatedBatteryLevels[0] === 1) {
        notification.show({ body: "The device is fully charged 🎉" });
      }

      return;
    } else if (approximatedBatteryLevels[0] === 0.5)
      notification.show({ body: "I'll advise you to start charging now 👀" });
    else if (approximatedBatteryLevels[0] === 0.3)
      notification.show({ body: "You really need to starting charging 👀" });
  } else if (approximatedBatteryLevels[1] === 0.15 && !charging.value)
    notification.show({ body: "I've warned you, now I'll shut up 👀" });
});

const { x, y } = useMouse();
const settings = useStorage<Settings>("settings", {
  enableNotifications: true,
  enableHighlighter: true,
});

const isSettingsShortcutPressed = useMagicKeys({})["Shift+S"];

/**
 * Watches for keystroke `Shift + S`, if found toggles the settings modal
 */
watch(isSettingsShortcutPressed, (_new) => {
  if (_new) toggleModal("settings");
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
        'from-green-300 to-green-700': level > 0.5,
        'from-orange-300 to-orange-700': level >= 0.3 && level <= 0.5,
        'from-red-300 to-red-700': level < 0.3,
        'animate-scale': charging,
        'opacity-0': !settings.enableHighlighter,
      }"
    ></div>

    <!-- Battery percentage bar -->
    <BatteryBar />

    <!-- Battery percentage and charging status -->
    <Content
      class="flex items-center absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 select-none"
    />

    <!-- Anonymous modal -->
    <Modal />

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
      >
        <span>Press <code>Shift + S</code> for</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="w-5 aspect-square"
          :class="{
            'fill-white dark:fill-[#191919]': settings.enableHighlighter,
            'fill-black dark:fill-white': !settings.enableHighlighter,
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
          'text-white dark:text-[#191919]': settings.enableHighlighter,
          'text-black dark:text-white': !settings.enableHighlighter,
        }"
        v-if="!charging && level !== Infinity"
      >
        &approx;
        {{ secondsToHours(dischargingTime) }} hour{{
          secondsToHours(dischargingTime) > 1 ? "s" : ""
        }}
        {{ secondsToMinutes(dischargingTime) }} minutes remaining
      </h4>
    </div>
  </main>
</template>

<style scoped>
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
