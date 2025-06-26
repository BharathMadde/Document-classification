import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { BarChart2, PieChart, AlertCircle } from 'lucide-react';

const Layout = styled.div`
  min-height: 100vh;
  padding: 3rem 2rem;
  background: ${({ theme }) => theme.background};
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
`;

const Panel = styled(motion.div)`
  background: ${({ theme }) => theme.card};
  box-shadow: ${({ theme }) => theme.shadow};
  border-radius: 18px;
  padding: 2rem;
`;

export default function Admin() {
  return (
    <Layout>
      <Panel initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <h2>Filters (Type, Confidence, Routing Status)</h2>
      </Panel>
      <Panel initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <h2>Animated Charts (Line, Pie)</h2>
        <BarChart2 size={32} style={{ marginRight: 16 }} /> <PieChart size={32} />
      </Panel>
      <Panel initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <h2>System Health Status <AlertCircle size={24} color="#3B82F6" /></h2>
      </Panel>
      <Panel initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <h2>Retry Queue (Animated Priority Badges)</h2>
      </Panel>
    </Layout>
  );
} 