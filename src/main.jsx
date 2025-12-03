import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// ✅ Import Firebase services
import { auth, db } from './firebase'

// ✅ TEMP TEST: Confirm Firebase loaded correctly
console.log("Firebase Auth:", auth)
console.log("Firebase DB:", db)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
