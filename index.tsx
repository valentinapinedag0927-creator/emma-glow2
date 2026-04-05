import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const start = () => {
  const el = document.getElementById('root');
  if (el) {
    const root = ReactDOM.createRoot(el);
    root.render(<App />);
  } else {
    console.error("No encontré el div 'root'. Revisa el index.html");
  }
};

window.onload = start;
