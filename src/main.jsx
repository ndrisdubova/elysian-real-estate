import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

if ('scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}

const forceScrollTop = () => window.scrollTo(0, 0);

forceScrollTop();
window.addEventListener('load', () => {
  forceScrollTop();
  requestAnimationFrame(forceScrollTop);
});
// iOS Safari restores pages from bfcache without re-running this module,
// so catch that case explicitly.
window.addEventListener('pageshow', (e) => {
  if (e.persisted) forceScrollTop();
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
