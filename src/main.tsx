import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/globals.css';

// PWA: handle Spotify OAuth callback redirect
// When popup redirects back with ?code=XXX, exchange it and notify opener
const params = new URLSearchParams(window.location.search);
const authCode = params.get('code');
if (authCode && window.opener) {
  import('./lib/browser-spotify').then(async ({ handleCallback }) => {
    const success = await handleCallback(authCode);
    window.opener?.postMessage({ type: 'spotify-auth', success }, '*');
    window.close();
  });
  // Clear URL params immediately
  window.history.replaceState({}, '', window.location.pathname);
} else if (authCode) {
  // No opener — standalone callback page, just clean up URL
  import('./lib/browser-spotify').then(async ({ handleCallback }) => {
    await handleCallback(authCode);
  });
  window.history.replaceState({}, '', window.location.pathname);
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
