interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_ROOM_FETCH_DELAY_MS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
