/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_FRONTEND_URL: string
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_STORAGE_URL: string
  readonly VITE_ENABLE_ERROR_LOGGING: string
  readonly MODE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
