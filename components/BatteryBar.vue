<script setup lang="ts">
const { level } = useBattery();
const barColor = ref<string>();

/**
 * Watches the level ref and changes the barColor ref's value
 */
watch(
  level,
  async (_new) => (barColor.value = (await useDynamicColor(_new)).value)
);

onMounted(
  async () => (barColor.value = (await useDynamicColor(level.value)).value)
);
</script>

<template>
  <span
    class="h-1 rounded-r-full block transition-all"
    :style="`width: ${level * 100}%; background-color: ${barColor}`"
  ></span>
</template>
