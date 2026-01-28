import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
// Styles - ORDER MATTERS!
import './styles/styles.css'        // 1. Reset & Base (Must be first)
import './styles/design-tokens.css' // 2. Variables
import './styles/utilities.css'     // 3. Utility Classes
import './styles/dev.css'           // 4. Dev-only styles (background, etc.)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
