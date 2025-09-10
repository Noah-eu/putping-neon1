import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './app/App.jsx'
import { initFirebase } from './firebase/index.js'
import 'mapbox-gl/dist/mapbox-gl.css'

// init Firebase a pak mount React (žádný top-level await)
function startApp() {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
}

// zavoláme initFirebase a pak pustíme appku
initFirebase()
  .catch((err) => {
    console.warn('Firebase init failed, falling back to mock:', err)
  })
  .finally(() => {
    startApp()
  })
