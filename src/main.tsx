import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './print.css'
import './i18n'
import '@fontsource-variable/sora'
import '@fontsource-variable/dm-sans'
import '@fontsource-variable/cairo'
import { registerSW } from 'virtual:pwa-register'

registerSW({ immediate: true })

createRoot(document.getElementById("root")!).render(<App />);
