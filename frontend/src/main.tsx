import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

/* 避免 StrictMode 双挂载导致 epub.js 偶发空白 */
console.log('main.tsx loaded');
const rootElement = document.getElementById('root');
console.log('root element:', rootElement);

if (rootElement) {
  try {
    const root = createRoot(rootElement);
    console.log('createRoot success');
    root.render(<App />);
    console.log('render called');
  } catch (error) {
    console.error('Error rendering app:', error);
  }
} else {
  console.error('Root element not found!');
}
