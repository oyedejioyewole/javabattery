<script setup lang="ts">
const { charging, status } = useBattery();

const blobColor = ref((await useDynamicColor(status.value)).value);

/**
 * Watches the level ref and changes the blobColor ref's value
 */
watch(
  status,
  async (_new) =>
    (blobColor.value = (await useDynamicColor(status.value)).value)
);
</script>

<template>
  <section>
    <div class="flex gap-x-1 items-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="w-10 h-10 dark:fill-white"
        viewBox="0 0 16 16"
        v-if="charging"
      >
        <!-- Charging icon -->
        <path
          d="M9.585 2.568a.5.5 0 0 1 .226.58L8.677 6.832h1.99a.5.5 0 0 1 .364.843l-5.334 5.667a.5.5 0 0 1-.842-.49L5.99 9.167H4a.5.5 0 0 1-.364-.843l5.333-5.667a.5.5 0 0 1 .616-.09z"
        />
        <path
          d="M2 4h4.332l-.94 1H2a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h2.38l-.308 1H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"
        />
        <path
          d="M2 6h2.45L2.908 7.639A1.5 1.5 0 0 0 3.313 10H2V6zm8.595-2-.308 1H12a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H9.276l-.942 1H12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-1.405z"
        />
        <path
          d="M12 10h-1.783l1.542-1.639c.097-.103.178-.218.241-.34V10zm0-3.354V6h-.646a1.5 1.5 0 0 1 .646.646zM16 8a1.5 1.5 0 0 1-1.5 1.5v-3A1.5 1.5 0 0 1 16 8z"
        />
      </svg>

      <!-- Battery percentage -->
      <h1
        class="text-5xl slashed-zero font-thin dark:text-white"
        v-if="status !== -1"
      >
        {{ status }}%
      </h1>
    </div>
  </section>
</template>
