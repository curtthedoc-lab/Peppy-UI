import { createClient } from '@blinkdotnew/sdk'

export const blink = createClient({
  projectId: import.meta.env.VITE_BLINK_PROJECT_ID || 'peppies-pwa-tracker-sieo3o8h',
  publishableKey: import.meta.env.VITE_BLINK_PUBLISHABLE_KEY || 'blnk_pk_oOf9HRWqakOLyBS-AVNPDcd8JWYTw8SK',
  authRequired: false,
  auth: { mode: 'managed' },
})
