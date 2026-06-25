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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
