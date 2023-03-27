/**
 * It takes battery percentage specified and a color based on the following rules:
 *
 * - battery (%) >= 0.5 --> green
 * - 0.3 >= battery (%) <= 0.5 --> orange
 * - battery <= 0.3 --> red
 *
 * @param batteryLevel battery (%) in decimal
 */
export const useDynamicColor = async (batteryLevel: number) => {
  const { red, green, orange } = (await import("#tailwind-config")).theme!
    .colors;
  const color = ref<string>();

  if (batteryLevel < 0.3) {
    color.value = red[500];
  } else if (batteryLevel >= 0.3 && batteryLevel <= 0.5) {
    color.value = orange[500];
  } else if (batteryLevel > 0.5) {
    color.value = green[500];
  }
  return color;
};
