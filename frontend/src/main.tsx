/**
 * Frontend entry point.
 * React StrictMode + styles.css (Tailwind directives + 10 §3 design token CSS Variables) import.
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './styles.css';

const rootEl = document.getElementById('root');
if (!rootEl) {
  throw new Error('root element 없음 — index.html에 <div id="root"> 필요');
}

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
