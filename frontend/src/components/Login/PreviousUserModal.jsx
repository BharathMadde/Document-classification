import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, LogIn, X } from 'lucide-react';

const ModalBg = styled(motion.div)`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(30, 64, 175, 0.25);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ModalCard = styled(motion.div)`
  background: rgba(255,255,255,0.18);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.18);
  backdrop-filter: blur(18px);
  border-radius: 24px;
  border: 1.5px solid #3B82F6;
  padding: 2.2rem 2.2rem 1.5rem 2.2rem;
  min-width: 340px;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
`;

const Title = styled.div`
  font-size: 1.3rem;
  font-weight: 700;
  color: #2563eb;
  margin-bottom: 0.7rem;
  text-align: center;
`;

const Email = styled.div`
  color: #1e40af;
  font-size: 1.08rem;
  font-weight: 600;
  margin-bottom: 1.2rem;
  text-align: center;
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

const Icon = styled.div`
  position: absolute;
  left: 0.8rem;
  top: 1.1rem;
  color: #3B82F6;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 16px;
  width: 100%;
  margin-top: 0.5rem;
`;

const Button = styled(motion.button)`
  flex: 1;
  padding: 0.9rem 0;
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

const CancelBtn = styled(Button)`
  background: #e0e7ff;
  color: #2563eb;
  &:hover {
    background: #dbeafe;
    color: #1e40af;
  }
`;

const ErrorMsg = styled.div`
  color: #e53e3e;
  font-size: 1rem;
  margin-bottom: 0.7rem;
  text-align: center;
`;

const CloseBtn = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  background: none;
  border: none;
  color: #2563eb;
  font-size: 1.2rem;
  cursor: pointer;
`;

export default function PreviousUserModal({ email, onLogin, onCancel }) {
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const ok = await onLogin(pass);
    setLoading(false);
    if (!ok) {
      setError("Incorrect password. Please try again.");
    }
  };

  return (
    <AnimatePresence>
      <ModalBg
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <ModalCard
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <CloseBtn onClick={onCancel} title="Cancel"><X size={22} /></CloseBtn>
          <Title>Login as previous user?</Title>
          <Email>{email}</Email>
          <form style={{ width: '100%' }} onSubmit={handleLogin} autoComplete="off">
            <Field>
              <Input
                type="password"
                id="prev-password"
                value={pass}
                onChange={e => setPass(e.target.value)}
                placeholder="Enter password"
                autoFocus
                required
              />
              <Icon><Lock size={18} /></Icon>
            </Field>
            {error && <ErrorMsg>{error}</ErrorMsg>}
            <ButtonRow>
              <Button type="submit" whileTap={{ scale: 0.97 }} whileHover={{ scale: 1.04 }} disabled={loading}>
                <LogIn size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} /> Login
              </Button>
              <CancelBtn type="button" onClick={onCancel} whileTap={{ scale: 0.97 }} whileHover={{ scale: 1.04 }}>
                Cancel
              </CancelBtn>
            </ButtonRow>
          </form>
        </ModalCard>
      </ModalBg>
    </AnimatePresence>
  );
} 