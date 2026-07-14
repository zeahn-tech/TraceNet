import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

registerSW({
  onNeedRefresh() {
    // A new service worker is waiting; in a production app you'd show a toast here.
  },
  onOfflineReady() {
    // App is ready to work offline.
  },
});
