export const useConfig = async () => {
  return ref(await window.globals.readSettings());
};
