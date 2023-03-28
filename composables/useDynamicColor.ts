/**
 * It takes battery percentage specified and a color based on the following rules:
 *
 * - battery (%) >= 50 --> green
 * - 30 >= battery (%) <= 50 --> orange
 * - battery <= 30 --> red
 *
 * @param batteryLevel battery (%) in decimal
 */
export const useDynamicColor = async (batteryLevel: number) => {
  const { red, green, orange } = (await import("#tailwind-config")).theme!
    .colors;
  const color = ref("");

  if (batteryLevel === -1) return color;

  if (batteryLevel < 30) {
    color.value = red[500];
  } else if (batteryLevel >= 30 && batteryLevel <= 50) {
    color.value = orange[500];
  } else if (batteryLevel > 50) {
    color.value = green[500];
  }
  return color;
};
