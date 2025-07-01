import React, { useState } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, LogIn, Eye, EyeOff } from 'lucide-react';

const LoginBg = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #3B82F6 0%, #2563eb 100%);
  position: relative;
  overflow: hidden;
`;

// Animated blue circles
const float = keyframes`
  0% { transform: translateY(0) scale(1); opacity: 0.7; }
  50% { transform: translateY(-40px) scale(1.1); opacity: 0.9; }
  100% { transform: translateY(0) scale(1); opacity: 0.7; }
`;

const AnimatedCircle = styled(motion.div)`
  position: absolute;
  border-radius: 50%;
  background: ${({ color }) => color || '#60a5fa'};
  opacity: 0.5;
  filter: blur(8px);
  animation: ${float} ${({ duration }) => duration || 6}s ease-in-out infinite;
`;

// Animated file icons
const iconFloat = keyframes`
  0% { transform: translateY(0) translateX(0) scale(1) rotate(0deg); opacity: 0.7; }
  25% { transform: translateY(-20px) translateX(10px) scale(1.1) rotate(8deg); opacity: 0.9; }
  50% { transform: translateY(-40px) translateX(-10px) scale(1.05) rotate(-8deg); opacity: 0.8; }
  75% { transform: translateY(-20px) translateX(10px) scale(1.1) rotate(8deg); opacity: 0.9; }
  100% { transform: translateY(0) translateX(0) scale(1) rotate(0deg); opacity: 0.7; }
`;

const AnimatedIcon = styled(motion.div)`
  position: absolute;
  font-size: ${({ size }) => size || 38}px;
  opacity: 0.7;
  animation: ${iconFloat} ${({ duration }) => duration || 10}s ease-in-out infinite;
  color: ${({ color }) => color || '#fff'};
  filter: drop-shadow(0 2px 12px #3B82F655);
`;

const GlassCard = styled(motion.div)`
  background: rgba(255,255,255,0.13);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.18);
  backdrop-filter: blur(18px);
  border-radius: 24px;
  border: 1.5px solid #3B82F6;
  padding: 2.5rem 2.5rem 2rem 2.5rem;
  min-width: 350px;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
`;

const Logo = styled.div`
  margin-bottom: 0.7rem;
  font-size: 2.2rem;
  font-weight: bold;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;
  text-shadow: 0 2px 12px #2563eb55;
`;

const Tagline = styled.div`
  color: #fff;
  font-size: 1.08rem;
  font-weight: 500;
  margin-bottom: 1.5rem;
  text-align: center;
  letter-spacing: 0.01em;
  text-shadow: 0 2px 12px #2563eb55;
`;

const Field = styled.div`
  width: 100%;
  margin-bottom: 1.2rem;
  position: relative;
`;

const Input = styled.input`
  width: 100%;
  padding: 1.1rem 1rem 0.6rem 2.5rem;
  border: 2px solid #e0e7ff;
  border-radius: 12px;
  background: rgba(255,255,255,0.8);
  color: #2563eb;
  font-size: 1rem;
  outline: none;
  box-shadow: 0 2px 12px #3B82F633;
  transition: background 0.3s, border 0.2s, box-shadow 0.2s;
  &:focus {
    border: 2px solid #3B82F6;
    background: #fff;
    box-shadow: 0 4px 24px 0 #2563eb33;
  }
`;

const FloatingLabel = styled.label`
  position: absolute;
  left: 2.5rem;
  top: 1.1rem;
  color: #2563eb;
  font-size: 1rem;
  pointer-events: none;
  background: transparent;
  padding: 0 2px;
  border-radius: 6px;
  transition: 0.2s;
  ${({ focused }) => focused && css`
    color: #3B82F6;
    font-weight: 600;
    z-index: 2;
  `}
  ${({ floating }) => floating && css`
    top: -0.1rem;
    left: 2.5rem;
    font-size: 0.85rem;
    color: #3B82F6;
    background: transparent;
    font-weight: 600;
    z-index: 2;
  `}
`;

const Icon = styled.div`
  position: absolute;
  left: 0.8rem;
  top: 1.1rem;
  color: #3B82F6;
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 0.8rem;
  top: 0.7rem;
  background: none;
  border: none;
  color: #2563eb;
  cursor: pointer;
  padding: 0;
  z-index: 2;
`;

const Button = styled(motion.button)`
  width: 100%;
  padding: 0.9rem 0;
  margin-top: 0.5rem;
  border: none;
  border-radius: 12px;
  background: linear-gradient(90deg, #3B82F6 0%, #2563eb 100%);
  color: #fff;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 2px 12px #3B82F633;
  transition: background 0.3s, transform 0.2s;
  &:hover {
    filter: brightness(1.1);
    box-shadow: 0 4px 24px 0 #2563eb44;
    transform: translateY(-2px) scale(1.04);
  }
`;

const ErrorMsg = styled.div`
  color: #e53e3e;
  font-size: 1rem;
  margin-bottom: 0.7rem;
  text-align: center;
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
  font-size: 0.97rem;
  color: #2563eb;
  cursor: pointer;
  user-select: none;
`;

const Forgot = styled.a`
  color: #3B82F6;
  font-size: 0.97rem;
  text-decoration: none;
  cursor: pointer;
  transition: color 0.2s;
  &:hover {
    color: #fff;
    text-decoration: underline;
  }
`;

export default function Login({ onLogin, rememberedUser }) {
  const [email, setEmail] = useState(rememberedUser?.email || '');
  const [pass, setPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(!!rememberedUser);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [focus, setFocus] = useState({ email: false, password: false });

  // Animate all icons and card to center on successful login
  const [animateOut, setAnimateOut] = useState(false);

  const handleLogin = e => {
    e.preventDefault();
    setError('');
    const ok = onLogin({ username: email, password: pass, remember });
    if (ok) {
      setSuccess(true);
      setAnimateOut(true);
      setTimeout(() => {
        setAnimateOut(false);
      }, 900);
    } else {
      setError('Invalid email or password.');
    }
  };

  // Floating label logic
  const isEmailFloating = focus.email || email.length > 0;
  const isPasswordFloating = focus.password || pass.length > 0;

  return (
    <LoginBg>
      {/* Animated circles */}
      <AnimatedCircle style={{ top: 60, left: 80, width: 120, height: 120 }} color="#60a5fa" duration={7} animate={animateOut ? { left: '50vw', top: '50vh', scale: 2, opacity: 0 } : {}} />
      <AnimatedCircle style={{ bottom: 40, right: 100, width: 90, height: 90 }} color="#2563eb" duration={6} animate={animateOut ? { right: '50vw', bottom: '50vh', scale: 2, opacity: 0 } : {}} />
      <AnimatedCircle style={{ top: 200, right: 40, width: 60, height: 60 }} color="#3B82F6" duration={8} animate={animateOut ? { right: '50vw', top: '50vh', scale: 2, opacity: 0 } : {}} />
      <AnimatedCircle style={{ bottom: 120, left: 60, width: 70, height: 70 }} color="#1e40af" duration={9} animate={animateOut ? { left: '50vw', bottom: '50vh', scale: 2, opacity: 0 } : {}} />
      {/* Animated file icons */}
      <AnimatedIcon style={{ top: 120, left: 180 }} duration={13} size={38} color="#fff" animate={animateOut ? { left: '50vw', top: '50vh', scale: 2, opacity: 0 } : {}}>📄</AnimatedIcon>
      <AnimatedIcon style={{ top: 320, left: 60 }} duration={15} size={44} color="#e0e7ff" animate={animateOut ? { left: '50vw', top: '50vh', scale: 2, opacity: 0 } : {}}>📁</AnimatedIcon>
      <AnimatedIcon style={{ bottom: 80, right: 120 }} duration={12} size={40} color="#60a5fa" animate={animateOut ? { right: '50vw', bottom: '50vh', scale: 2, opacity: 0 } : {}}>🗂️</AnimatedIcon>
      <AnimatedIcon style={{ top: 80, right: 80 }} duration={14} size={36} color="#3B82F6" animate={animateOut ? { right: '50vw', top: '50vh', scale: 2, opacity: 0 } : {}}>📑</AnimatedIcon>
      <AnimatedIcon style={{ bottom: 160, left: 120 }} duration={16} size={42} color="#2563eb" animate={animateOut ? { left: '50vw', bottom: '50vh', scale: 2, opacity: 0 } : {}}>📝</AnimatedIcon>
      <AnimatePresence>
        {!animateOut && (
          <GlassCard
            initial={{ opacity: 0, y: 60, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2, y: 0 }}
            transition={{ duration: 0.8, type: 'spring' }}
          >
            <Logo>
              <span role="img" aria-label="ai">🤖</span> DocumentDigger-AI
            </Logo>
            <Tagline>Smart. Secure. Effortless Document Management.</Tagline>
            <form style={{ width: '100%' }} onSubmit={handleLogin} autoComplete="off">
              <Field>
                <Input
                  type="email"
                  id="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoFocus
                  required
                  onFocus={() => setFocus(f => ({ ...f, email: true }))}
                  onBlur={() => setFocus(f => ({ ...f, email: false }))}
                />
                <Icon><Mail size={18} /></Icon>
                <FloatingLabel
                  htmlFor="email"
                  focused={focus.email || email.length > 0}
                  floating={focus.email || email.length > 0}
                >
                  Email
                </FloatingLabel>
              </Field>
              <Field style={{ marginBottom: 0 }}>
                <Input
                  type={showPass ? "text" : "password"}
                  id="password"
                  value={pass}
                  onChange={e => setPass(e.target.value)}
                  required
                  onFocus={() => setFocus(f => ({ ...f, password: true }))}
                  onBlur={() => setFocus(f => ({ ...f, password: false }))}
                />
                <Icon><Lock size={18} /></Icon>
                <PasswordToggle type="button" tabIndex={-1} onClick={() => setShowPass(v => !v)} aria-label={showPass ? "Hide password" : "Show password"}>
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </PasswordToggle>
                <FloatingLabel
                  htmlFor="password"
                  focused={focus.password || pass.length > 0}
                  floating={focus.password || pass.length > 0}
                >
                  Password
                </FloatingLabel>
              </Field>
              {error && <ErrorMsg>{error}</ErrorMsg>}
              <Row>
                <Remember>
                  <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} style={{ accentColor: '#2563eb' }} /> Remember Me
                </Remember>
                <Forgot href="#">Forgot Password?</Forgot>
              </Row>
              <Button
                type="submit"
                whileTap={{ scale: 0.97 }}
                whileHover={{ scale: 1.04 }}
              >
                <LogIn size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} /> Sign In
              </Button>
            </form>
          </GlassCard>
        )}
      </AnimatePresence>
    </LoginBg>
  );
} 