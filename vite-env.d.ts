/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_GEMINI_API_KEY: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_URL: string;
  readonly VITE_DEV_MODE?: string;
  readonly VITE_API_MOCK?: string;
  readonly VITE_MIXPANEL_TOKEN?: string;
  readonly VITE_GA_ID?: string;
  readonly VITE_STRIPE_PUBLIC_KEY?: string;
  readonly VITE_YOOKASSA_SHOP_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
