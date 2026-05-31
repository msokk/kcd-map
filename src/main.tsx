import React from 'react';
import ReactDOM from 'react-dom/client';
// Publish global L and load the legacy Leaflet plugins before anything renders.
import './vendor';
import './i18n';
import './styles/index.css';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
