import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import App from './App.jsx';
import { AppProvider } from './contexts/AppContext.jsx';
import { CartProvider } from './contexts/CartContext.jsx';
import { theme } from './theme.js';
import { GlobalStyle } from './GlobalStyle.js';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Router>
        <AppProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </AppProvider>
      </Router>
    </ThemeProvider>
  </React.StrictMode>
);

