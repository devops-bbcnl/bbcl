/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Public contact email shown on the site (Build env on Netlify). Do not use MAIL_TO for client — scope MAIL_TO to Functions only. */
  readonly VITE_PUBLIC_CONTACT_EMAIL?: string;
  /** Local dev server port (optional; default 5173). */
  readonly VITE_DEV_SERVER_PORT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
