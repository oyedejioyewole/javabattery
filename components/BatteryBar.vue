<script setup lang="ts">
const { status } = useBattery();
const barColor = ref<string>();

/**
 * Watches the level ref and changes the barColor ref's value
 */
watch(
  status,
  async (_new) => (barColor.value = (await useDynamicColor(_new)).value)
);

onMounted(
  async () => (barColor.value = (await useDynamicColor(status.value)).value)
);
</script>

<template>
  <span
    class="h-1 rounded-r-full block transition duration-300"
    :style="`width: ${status}%; background-color: ${barColor}`"
  ></span>
</template>
