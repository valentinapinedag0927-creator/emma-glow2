import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

console.log("Intentando arrancar React...");

const rootElement = document.getElementById('root');

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log("React renderizado en #root");
} else {
  alert("ERROR: No se encontró el div 'root' en el HTML");
}
