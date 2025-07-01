import React from 'react';
import styled from 'styled-components';
import { Sun, Moon, LogOut } from 'lucide-react';

const ToggleBar = styled.div`
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 16px;
`;

const ToggleBtn = styled.button`
  background: #3B82F6;
  border: none;
  border-radius: 50%;
  box-shadow: 0 2px 12px #3B82F633;
  padding: 0.7rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  &:hover {
    background: #2563eb;
    transform: scale(1.1);
  }
`;

const LogoutBtn = styled.button`
  background: #2563eb;
  border: none;
  border-radius: 12px;
  color: #fff;
  font-weight: 600;
  padding: 0.7rem 1.2rem;
  margin-left: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1rem;
  box-shadow: 0 2px 12px #2563eb33;
  transition: background 0.2s, transform 0.2s;
  &:hover {
    background: #1e40af;
    transform: scale(1.05);
  }
`;

const UserEmail = styled.span`
  color: #2563eb;
  font-weight: 500;
  margin-right: 8px;
  font-size: 1rem;
`;

export default function ThemeToggle({ theme, setTheme, onLogout, user }) {
  return (
    <ToggleBar>
      {user?.email && <UserEmail>{user.email.split("@")[0]}</UserEmail>}
      <ToggleBtn 
        onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} 
        title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        {theme === 'light' ? <Moon size={22} /> : <Sun size={22} />}
      </ToggleBtn>
      {onLogout && (
        <LogoutBtn onClick={onLogout} title="Logout">
          <LogOut size={20} /> Logout
        </LogoutBtn>
      )}
    </ToggleBar>
  );
}
