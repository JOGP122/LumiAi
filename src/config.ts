declare global {
  interface Window {
    LUMI_API_BASE?: string;
  }
}

// Базовый URL API. Задаётся в /config.js (window.LUMI_API_BASE) на хостинге —
// туда пишем текущий URL туннеля, чтобы не пересобирать фронт при ротации.
export const API_BASE = (window.LUMI_API_BASE || '').replace(/\/+$/, '');
