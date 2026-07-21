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

window.addEventListener('pageshow', (e) => {
  if (e.persisted) forceScrollTop();
});

// Fade out and remove the inline splash screen. Registered BEFORE render (and
// with a hard safety timer) so it always runs — even if the app were to throw
// during its initial render, the splash can never get permanently stuck.
function hideSplash() {
  const splash = document.getElementById('app-splash');
  if (!splash || splash.classList.contains('is-hiding')) return;
  splash.classList.add('is-hiding');
  splash.addEventListener('transitionend', () => splash.remove(), { once: true });
  setTimeout(() => splash.remove(), 800); // fallback if transitionend doesn't fire
}
setTimeout(hideSplash, 2900); // intentional minimum display (house draws, then TERRA appears)
setTimeout(hideSplash, 5000); // hard safety net

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
