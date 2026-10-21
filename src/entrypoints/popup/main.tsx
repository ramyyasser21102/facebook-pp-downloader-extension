import React from 'react';
import ReactDOM from 'react-dom/client';
import '@/assets/styles/theme.css';
import { applyTheme, getStoredTheme } from '@/lib/theme';
import App from './App';

// Apply the OS theme synchronously, then the saved preference, before the
// first render so the popup does not paint in the wrong theme.
applyTheme('system');
void getStoredTheme()
  .then(applyTheme)
  .finally(() => {
    const root = document.getElementById('root');
    if (!root) throw new Error('Missing #root element');
    ReactDOM.createRoot(root).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    );
  });
