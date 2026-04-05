import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Este mensaje aparecerá en la consola si el archivo carga
console.log("¡Hola! El motor de Emma Glow ha despertado.");

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  alert("No encontré el div 'root'. Revisa el HTML.");
}
