import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './global.css';

// Register Service Worker (production only — fails silently in dev)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then((reg) => console.log('[SW] Registered:', reg.scope))
      .catch((err) => console.debug('[SW] Not available:', err.message));
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
