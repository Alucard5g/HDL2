import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';

// Safeguard against SecurityError when localStorage or sessionStorage is disabled or blocked in sandbox iframes
try {
  const testKey = '__test_local_storage__';
  window.localStorage.setItem(testKey, 'test');
  window.localStorage.removeItem(testKey);
} catch (e) {
  console.warn('localStorage access is blocked or restricted. Implementing a safe in-memory fallback store.', e);
  const memoryStore: Record<string, string> = {};
  const mockStorage: Storage = {
    getItem: (key: string): string | null => (key in memoryStore ? memoryStore[key] : null),
    setItem: (key: string, value: string): void => { memoryStore[key] = String(value); },
    removeItem: (key: string): void => { delete memoryStore[key]; },
    clear: (): void => { Object.keys(memoryStore).forEach(key => delete memoryStore[key]); },
    key: (index: number): string | null => {
      const keys = Object.keys(memoryStore);
      return index < keys.length ? keys[index] : null;
    },
    length: 0,
  };
  Object.defineProperty(mockStorage, 'length', {
    get: () => Object.keys(memoryStore).length,
  });
  try {
    Object.defineProperty(window, 'localStorage', { value: mockStorage, configurable: true, writable: true });
  } catch (err) {
    console.error('Failed to redefine window.localStorage:', err);
  }
}

try {
  const testKey = '__test_session_storage__';
  window.sessionStorage.setItem(testKey, 'test');
  window.sessionStorage.removeItem(testKey);
} catch (e) {
  console.warn('sessionStorage access is blocked or restricted. Implementing a safe in-memory fallback store.', e);
  const memoryStore: Record<string, string> = {};
  const mockStorage: Storage = {
    getItem: (key: string): string | null => (key in memoryStore ? memoryStore[key] : null),
    setItem: (key: string, value: string): void => { memoryStore[key] = String(value); },
    removeItem: (key: string): void => { delete memoryStore[key]; },
    clear: (): void => { Object.keys(memoryStore).forEach(key => delete memoryStore[key]); },
    key: (index: number): string | null => {
      const keys = Object.keys(memoryStore);
      return index < keys.length ? keys[index] : null;
    },
    length: 0,
  };
  Object.defineProperty(mockStorage, 'length', {
    get: () => Object.keys(memoryStore).length,
  });
  try {
    Object.defineProperty(window, 'sessionStorage', { value: mockStorage, configurable: true, writable: true });
  } catch (err) {
    console.error('Failed to redefine window.sessionStorage:', err);
  }
}

import App from './App.tsx';
import './index.css';

// Meta Pixel dynamic initializer
const initMetaPixel = (pixelId: string) => {
  if (typeof window === 'undefined') return;
  const w = window as any;
  if (w.fbq) return;

  w.fbq = function (...args: any[]) {
    if (w.fbq.callMethod) {
      w.fbq.callMethod.apply(w.fbq, args);
    } else {
      w.fbq.queue.push(args);
    }
  };
  if (!w._fbq) w._fbq = w.fbq;
  w.fbq.push = w.fbq;
  w.fbq.loaded = true;
  w.fbq.version = '2.0';
  w.fbq.queue = [];

  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://connect.facebook.net/en_US/fbevents.js';
  const firstScript = document.getElementsByTagName('script')[0];
  if (firstScript && firstScript.parentNode) {
    firstScript.parentNode.insertBefore(script, firstScript);
  } else {
    document.head.appendChild(script);
  }

  w.fbq('init', pixelId);
  w.fbq('track', 'PageView');
  console.log('%c✓ Meta Pixel activo con ID:', 'color: #10b981; font-weight: bold;', pixelId);
};

// Google Analytics 4 dynamic initializer
const initGA4 = (measurementId: string) => {
  if (typeof window === 'undefined') return;
  const w = window as any;

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;

  const firstScript = document.getElementsByTagName('script')[0];
  if (firstScript && firstScript.parentNode) {
    firstScript.parentNode.insertBefore(script, firstScript);
  } else {
    document.head.appendChild(script);
  }

  w.dataLayer = w.dataLayer || [];
  w.gtag = function (...args: any[]) {
    w.dataLayer.push(args);
  };
  w.gtag('js', new Date());
  w.gtag('config', measurementId);
  console.log('%c✓ Google Analytics 4 activo con ID:', 'color: #10b981; font-weight: bold;', measurementId);
};

// Load configurations dynamically from environments
try {
  const metaEnv = (import.meta as any).env || {};
  const pixelId = metaEnv.VITE_META_PIXEL_ID;
  const ga4Id = metaEnv.VITE_GA4_MEASUREMENT_ID;

  if (pixelId && pixelId.trim() !== '') {
    initMetaPixel(pixelId.trim());
  }
  if (ga4Id && ga4Id.trim() !== '') {
    initGA4(ga4Id.trim());
  }
} catch (e) {
  console.error('Failed to load tracking analytics:', e);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
