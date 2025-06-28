import React from 'react';
import styled from 'styled-components';
import { Sun, Moon } from 'lucide-react';

const ToggleBtn = styled.button`
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 1000;
  background: ${({ theme }) => theme.card};
  border: none;
  border-radius: 50%;
  box-shadow: ${({ theme }) => theme.shadow};
  padding: 0.7rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover {
    background: ${({ theme }) => theme.glass};
    transform: scale(1.1);
  }
`;

export default function ThemeToggle({ theme, setTheme }) {
  return (
    <ToggleBtn 
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} 
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? <Moon size={22} /> : <Sun size={22} />}
    </ToggleBtn>
  );
}
