import { createGlobalStyle } from 'styled-components';

export const lightTheme = {
  background: '#E5E7EB',
  card: 'rgba(255,255,255,0.7)',
  text: '#1F2937',
  accent: '#3B82F6',
  accent2: '#9333EA',
  shadow: '0 8px 32px 0 rgba(31,41,55,0.15)',
  glass: 'rgba(255,255,255,0.4)',
  border: 'rgba(255,255,255,0.18)',
};

export const darkTheme = {
  background: '#1F2937',
  card: 'rgba(31,41,55,0.7)',
  text: '#E5E7EB',
  accent: '#3B82F6',
  accent2: '#9333EA',
  shadow: '0 8px 32px 0 rgba(31,41,55,0.37)',
  glass: 'rgba(31,41,55,0.4)',
  border: 'rgba(255,255,255,0.08)',
};

const GlobalStyle = createGlobalStyle`
  body {
    background: ${({ theme }) => theme.background};
    color: ${({ theme }) => theme.text};
    font-family: 'Inter', 'Poppins', 'IBM Plex Sans', sans-serif;
    margin: 0;
    min-height: 100vh;
    transition: background 0.4s, color 0.4s;
  }
  *, *::before, *::after {
    box-sizing: border-box;
  }
  ::selection {
    background: ${({ theme }) => theme.accent2}22;
  }
`;

export default GlobalStyle; 