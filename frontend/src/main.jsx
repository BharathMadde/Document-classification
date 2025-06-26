import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import GlobalStyle, { lightTheme, darkTheme } from './styles/theme';
import { useState } from 'react';

function Root() {
  const [theme, setTheme] = useState('light');
  const themeObj = theme === 'light' ? lightTheme : darkTheme;
  return (
    <ThemeProvider theme={themeObj}>
      <GlobalStyle />
      <BrowserRouter>
        <App theme={theme} setTheme={setTheme} />
      </BrowserRouter>
    </ThemeProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<Root />);
