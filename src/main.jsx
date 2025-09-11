import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app/App.jsx';
import { initFirebase } from './firebase/index.js';
import 'mapbox-gl/dist/mapbox-gl.css';

function mount() {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode><App /></React.StrictMode>
  );
}

initFirebase().catch(() => {}).finally(mount);
