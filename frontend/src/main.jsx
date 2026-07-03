import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// A deploy replaces every chunk's content-hashed filename. A tab that's been
// open since before a deploy still holds `import()` calls pointing at the
// old (now-gone) filenames -- navigating into a route that lazy-loads one of
// those chunks fails with an uncaught error that otherwise only recovers via
// a manual hard refresh. Vite fires this specific event for exactly that
// failure mode; forcing a real reload fetches the current index.html and
// chunk graph instead of leaving the user stuck on the error boundary.
window.addEventListener('vite:preloadError', () => {
  window.location.reload()
})

// The app is loading successfully -- clear the one-shot guard ErrorBoundary
// sets before a stale-chunk reload, so a future deploy's chunk error can
// still trigger the same auto-recovery instead of being silently skipped.
sessionStorage.removeItem('chunkErrorReload')

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
