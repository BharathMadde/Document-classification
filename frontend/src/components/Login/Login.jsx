import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, MailCheck, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const quotes = [
  'AI is the new electricity. – Andrew Ng',
  'Let the bots do the boring stuff.',
  'Documents, meet your digital brain.',
  'Automate. Accelerate. Achieve.',
  'Your workflow, supercharged by AI.'
];

const LoginBg = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #3B82F6 0%, #9333EA 100%);
  position: relative;
  overflow: hidden;
`;

const GlassCard = styled(motion.div)`
  background: ${({ theme }) => theme.card};
  box-shadow: ${({ theme }) => theme.shadow};
  backdrop-filter: blur(18px);
  border-radius: 24px;
  border: 1.5px solid ${({ theme }) => theme.border};
  padding: 2.5rem 2.5rem 2rem 2.5rem;
  min-width: 350px;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
`;

const Logo = styled.div`
  margin-bottom: 1.5rem;
  font-size: 2.2rem;
  font-weight: bold;
  color: ${({ theme }) => theme.accent};
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Field = styled.div`
  width: 100%;
  margin-bottom: 1.2rem;
  position: relative;
`;

const Input = styled.input`
  width: 100%;
  padding: 1.1rem 1rem 0.6rem 2.5rem;
  border: none;
  border-radius: 12px;
  background: ${({ theme }) => theme.glass};
  color: ${({ theme }) => theme.text};
  font-size: 1rem;
  outline: none;
  box-shadow: ${({ theme }) => theme.shadow};
  transition: background 0.3s;
`;

const FloatingLabel = styled.label`
  position: absolute;
  left: 2.5rem;
  top: 1.1rem;
  color: #888;
  font-size: 1rem;
  pointer-events: none;
  transition: 0.2s;
  ${Input}:focus ~ &,
  ${Input}:not(:placeholder-shown) ~ & {
    top: 0.3rem;
    left: 2.5rem;
    font-size: 0.85rem;
    color: ${({ theme }) => theme.accent};
  }
`;

const Icon = styled.div`
  position: absolute;
  left: 0.8rem;
  top: 1.1rem;
  color: ${({ theme }) => theme.accent2};
`;

const Button = styled(motion.button)`
  width: 100%;
  padding: 0.9rem 0;
  margin-top: 0.5rem;
  border: none;
  border-radius: 12px;
  background: linear-gradient(90deg, #3B82F6 0%, #9333EA 100%);
  color: #fff;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: ${({ theme }) => theme.shadow};
  transition: background 0.3s;
  &:hover {
    filter: brightness(1.1);
    box-shadow: 0 4px 24px 0 #9333EA44;
  }
`;

const SSOButton = styled(Button)`
  background: ${({ theme }) => theme.card};
  color: ${({ theme }) => theme.accent};
  border: 1.5px solid ${({ theme }) => theme.accent};
  margin-top: 0.7rem;
  &:hover {
    background: ${({ theme }) => theme.accent};
    color: #fff;
  }
`;

const MailboxButton = styled(Button)`
  background: ${({ theme }) => theme.accent2};
  color: #fff;
  margin-top: 0.7rem;
  box-shadow: 0 2px 16px 0 #9333EA33;
  &:hover {
    filter: brightness(1.1);
    box-shadow: 0 4px 24px 0 #3B82F644;
  }
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-top: 0.7rem;
`;

const Remember = styled.label`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.95rem;
  color: #888;
  cursor: pointer;
  user-select: none;
`;

const Forgot = styled.a`
  color: ${({ theme }) => theme.accent2};
  font-size: 0.95rem;
  text-decoration: none;
  cursor: pointer;
  transition: color 0.2s;
  &:hover {
    color: ${({ theme }) => theme.accent};
    text-decoration: underline;
  }
`;

const Quote = styled(motion.div)`
  position: absolute;
  left: -340px;
  top: 50%;
  transform: translateY(-50%);
  width: 300px;
  color: #fff;
  font-size: 1.1rem;
  font-style: italic;
  opacity: 0.8;
  text-align: right;
  pointer-events: none;
`;

const ErrorMsg = styled.div`
  color: #e53e3e;
  font-size: 1rem;
  margin-bottom: 0.7rem;
  text-align: center;
`;

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [remember, setRemember] = useState(false);
  const [success, setSuccess] = useState(false);
  const [quoteIdx] = useState(() => Math.floor(Math.random() * quotes.length));
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = e => {
    e.preventDefault();
    setError('');
    const ok = onLogin({ username: email, password: pass });
    if (ok) {
      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 1200);
    } else {
      setError('Invalid credentials. Username: Admin, Password: b');
    }
  };

  return (
    <LoginBg>
      {/* Animated background placeholder */}
      <GlassCard
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0, scale: success ? 1.05 : 1 }}
        transition={{ duration: 0.7, type: 'spring' }}
        exit={{ opacity: 0, y: -40 }}
        style={{ zIndex: 2 }}
      >
        <Logo>
          <User size={32} />
          <span>AI DocFlow</span>
        </Logo>
        <form style={{ width: '100%' }} onSubmit={handleLogin} autoComplete="off">
          {error && <ErrorMsg>{error}</ErrorMsg>}
          <Field>
            <Input type="text" required value={email} onChange={e => setEmail(e.target.value)} placeholder=" " id="email" />
            <Icon><Mail size={18} /></Icon>
            <FloatingLabel htmlFor="email">Username</FloatingLabel>
          </Field>
          <Field>
            <Input type="password" required value={pass} onChange={e => setPass(e.target.value)} placeholder=" " id="password" />
            <Icon><Lock size={18} /></Icon>
            <FloatingLabel htmlFor="password">Password</FloatingLabel>
          </Field>
          <Button type="submit" whileTap={{ scale: 0.97 }}>
            <LogIn size={18} style={{ marginRight: 8, verticalAlign: -3 }} /> Login
          </Button>
          <SSOButton type="button" whileTap={{ scale: 0.97 }}>
            <MailCheck size={18} style={{ marginRight: 8, verticalAlign: -3 }} /> Login with SSO
          </SSOButton>
          <MailboxButton type="button" whileTap={{ scale: 0.97 }}>
            <Mail size={18} style={{ marginRight: 8, verticalAlign: -3 }} /> Connect Mailbox
          </MailboxButton>
          <Row>
            <Remember>
              <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} /> Remember Me
            </Remember>
            <Forgot href="#">Forgot Password?</Forgot>
          </Row>
        </form>
      </GlassCard>
      <Quote
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1.2 }}
        key={quoteIdx}
      >
        {quotes[quoteIdx]}
      </Quote>
      {/* TODO: Add animated background with Lottie or SVG nodes/icons */}
    </LoginBg>
  );
} 