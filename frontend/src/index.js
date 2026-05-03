import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

window.addEventListener('error', (event) => {
  const existing = document.getElementById('js-error-overlay');
  if (existing) return;
  const overlay = document.createElement('div');
  overlay.id = 'js-error-overlay';
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.backgroundColor = 'rgba(0,0,0,0.95)';
  overlay.style.color = 'white';
  overlay.style.zIndex = '9999';
  overlay.style.padding = '30px';
  overlay.style.overflowY = 'auto';
  overlay.style.fontFamily = 'sans-serif';
  overlay.innerHTML = `<h1 style="margin-top:0; font-size:28px;">JavaScript Error</h1><pre style="white-space:pre-wrap; font-size:14px;">${event.message}\n${event.filename}:${event.lineno}:${event.colno}</pre><button id="js-error-reload" style="margin-top:20px; padding:12px 18px; font-size:16px; background:#1976d2; color:#fff; border:none; border-radius:6px; cursor:pointer;">Reload App</button>`;
  document.body.appendChild(overlay);
  const btn = document.getElementById('js-error-reload');
  btn?.addEventListener('click', () => window.location.reload());
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection', event.reason);
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);