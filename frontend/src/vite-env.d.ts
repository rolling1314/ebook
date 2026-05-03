/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Empty string = same-origin + Vite `/api` proxy. */
  readonly VITE_API_BASE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
