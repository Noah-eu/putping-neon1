import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './app/App.jsx'
import { initFirebase } from './firebase/index.js'

// init Firebase (mock-friendly)
await initFirebase().catch(()=>{})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
