import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const container = document.getElementById('root');

if (container) {
  const root = ReactDOM.createRoot(container);
  root.render(<App />);
} else {
  // Plan B: Si no lo encuentra, lo crea a la fuerza
  const newDiv = document.createElement('div');
  newDiv.id = 'root';
  document.body.appendChild(newDiv);
  const root = ReactDOM.createRoot(newDiv);
  root.render(<App />);
}
