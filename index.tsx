import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Esto asegura que el HTML esté listo antes de intentar meter a Emma
const renderApp = () => {
  const rootElement = document.getElementById('root');
  if (rootElement) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderApp);
} else {
  renderApp();
}
