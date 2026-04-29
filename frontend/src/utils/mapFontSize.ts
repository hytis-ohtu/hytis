export const MAP_FONT_SIZE_STORAGE_KEY = "font-size-map";
export const MAP_FONT_SIZE_DEFAULT = 24;

export function getMapFontSize(): number {
  try {
    const storedValue = localStorage.getItem(MAP_FONT_SIZE_STORAGE_KEY);
    if (!storedValue) {
      return MAP_FONT_SIZE_DEFAULT;
    }

    const parsedValue = Number(storedValue);
    if (Number.isNaN(parsedValue)) {
      return MAP_FONT_SIZE_DEFAULT;
    }

    return parsedValue;
  } catch {
    return MAP_FONT_SIZE_DEFAULT;
  }
}

export function setMapFontSize(fontSize: number) {
  localStorage.setItem(MAP_FONT_SIZE_STORAGE_KEY, String(fontSize));
}

export function applyMapFontSize(fontSize: number) {
  document.documentElement.style.setProperty(
    "--font-size-map",
    `${fontSize}px`,
  );
}
