import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FilePlus, Settings, BarChart2, User, Upload, ArrowRight, CheckCircle, Mail, Layers, RefreshCcw, Play } from 'lucide-react';

const API_URL = 'http://localhost:3000/api/documents';

const Layout = styled.div`
  display: grid;
  grid-template-columns: 80px 1fr;
  grid-template-rows: 64px 1fr;
  min-height: 100vh;
  background: ${({ theme }) => theme.background};
`;

const TopNav = styled(motion.div)`
  grid-column: 1 / span 2;
  grid-row: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
  height: 64px;
  background: ${({ theme }) => theme.card};
  box-shadow: ${({ theme }) => theme.shadow};
  z-index: 10;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.7rem;
  font-size: 1.5rem;
  font-weight: bold;
  color: ${({ theme }) => theme.accent};
`;

const Tabs = styled.div`
  display: flex;
  gap: 2.5rem;
  font-size: 1.1rem;
  color: ${({ theme }) => theme.text};
`;

const Tab = styled.div`
  cursor: pointer;
  padding: 0.3rem 0.7rem;
  border-radius: 8px;
  transition: background 0.2s;
  &:hover {
    background: ${({ theme }) => theme.glass};
  }
`;

const Profile = styled.div`
  display: flex;
  align-items: center;
  gap: 0.7rem;
  cursor: pointer;
`;

const Sidebar = styled(motion.div)`
  grid-column: 1;
  grid-row: 2;
  background: ${({ theme }) => theme.card};
  box-shadow: ${({ theme }) => theme.shadow};
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem 0 0 0;
  z-index: 5;
`;

const SideIcon = styled(motion.div)`
  margin-bottom: 2.2rem;
  color: ${({ theme }) => theme.accent2};
  font-size: 1.7rem;
  cursor: pointer;
  border-radius: 12px;
  padding: 0.7rem;
  background: ${({ active, theme }) => active ? theme.glass : 'none'};
  box-shadow: ${({ active, theme }) => active ? theme.shadow : 'none'};
  transition: background 0.2s, box-shadow 0.2s;
  &:hover {
    background: ${({ theme }) => theme.glass};
    box-shadow: ${({ theme }) => theme.shadow};
  }
`;

const Main = styled.div`
  grid-column: 2;
  grid-row: 2;
  padding: 2.5rem 2.5rem 2rem 2.5rem;
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: none;
`;

const Th = styled.th`
  background: ${({ theme }) => theme.card};
  color: ${({ theme }) => theme.text};
  font-weight: 600;
  padding: 0.7rem 1rem;
  border-bottom: 1.5px solid ${({ theme }) => theme.accent2}22;
`;

const Td = styled.td`
  padding: 0.7rem 1rem;
  border-bottom: 1px solid #eee2;
  background: ${({ theme }) => theme.card};
`;

const ExpandDrawer = styled(motion.td)`
  background: ${({ theme }) => theme.glass};
  border-radius: 12px;
  box-shadow: ${({ theme }) => theme.shadow};
  padding: 1.5rem;
  font-size: 1rem;
`;

const ActionBtn = styled(motion.button)`
  margin-right: 0.7rem;
  padding: 0.5rem 1.1rem;
  border: none;
  border-radius: 8px;
  background: ${({ theme }) => theme.accent2};
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  box-shadow: ${({ theme }) => theme.shadow};
  transition: background 0.2s;
  &:hover {
    background: ${({ theme }) => theme.accent};
  }
`;

export default function Dashboard() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    fetch(API_URL)
      .then(res => res.json())
      .then(setDocuments)
      .catch(() => setError('Failed to fetch documents'))
      .finally(() => setLoading(false));
  }, [actionLoading]);

  const manualAction = async (id, action) => {
    setActionLoading(true);
    setError('');
    let endpoint = `${API_URL}/${id}/${action}`;
    let body = { id };
    if (action === 'classify') {
      const doc = documents.find(d => d.id === id);
      body.extractedText = doc?.entities ? JSON.stringify(doc.entities) : '';
    }
    if (action === 'route') {
      const doc = documents.find(d => d.id === id);
      body.type = doc?.type || '';
    }
    await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    setActionLoading(false);
  };

  return (
    <Layout>
      <TopNav initial={{ y: -32, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.7 }}>
        <Logo><Layers size={28} /> AI DocFlow</Logo>
        <Tabs>
          <Tab>Dashboard</Tab>
          <Tab>Uploads</Tab>
          <Tab>Monitoring</Tab>
          <Tab>Settings</Tab>
        </Tabs>
        <Profile>
          <User size={22} />
        </Profile>
      </TopNav>
      <Sidebar initial={{ x: -40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.7, delay: 0.2 }}>
        <SideIcon active><Upload size={22} /></SideIcon>
        <SideIcon><ArrowRight size={22} /></SideIcon>
        <SideIcon><CheckCircle size={22} /></SideIcon>
        <SideIcon><Settings size={22} /></SideIcon>
      </Sidebar>
      <Main>
        {/* Upload Panel */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 18, boxShadow: '0 4px 24px 0 #3B82F633', padding: '2rem', minHeight: 180 }}>
          <h2>Upload Panel (Drag & Drop, Connect Mailbox)</h2>
        </motion.div>
        {/* Workflow Progress Bar */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 18, boxShadow: '0 4px 24px 0 #9333EA33', padding: '2rem', minHeight: 120 }}>
          <h2>Workflow Progress Bar (Animated)</h2>
        </motion.div>
        {/* Document Table */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 18, boxShadow: '0 4px 24px 0 #1F293733', padding: '2rem', minHeight: 220 }}>
          <h2>Document List Table</h2>
          {loading ? (
            <div>Loading documents...</div>
          ) : error ? (
            <div style={{ color: '#e53e3e' }}>{error}</div>
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>Name</Th>
                  <Th>Type</Th>
                  <Th>Status</Th>
                  <Th>Last Updated</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {documents.map(doc => (
                  <React.Fragment key={doc.id}>
                    <tr style={{ cursor: 'pointer', background: selected === doc.id ? '#e3f2fd' : '' }} onClick={() => setSelected(selected === doc.id ? null : doc.id)}>
                      <Td>{doc.name}</Td>
                      <Td>{doc.type || '-'}</Td>
                      <Td>{doc.status}</Td>
                      <Td>{doc.timestamps?.ingested ? new Date(doc.timestamps.ingested).toLocaleString() : '-'}</Td>
                      <Td>
                        <ActionBtn whileTap={{ scale: 0.95 }} onClick={e => { e.stopPropagation(); manualAction(doc.id, 'extract'); }}><RefreshCcw size={16} /> Re-extract</ActionBtn>
                        <ActionBtn whileTap={{ scale: 0.95 }} onClick={e => { e.stopPropagation(); manualAction(doc.id, 'classify'); }}><Play size={16} /> Re-classify</ActionBtn>
                        <ActionBtn whileTap={{ scale: 0.95 }} onClick={e => { e.stopPropagation(); manualAction(doc.id, 'route'); }}><ArrowRight size={16} /> Route</ActionBtn>
                      </Td>
                    </tr>
                    {selected === doc.id && (
                      <tr>
                        <ExpandDrawer colSpan={5} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                          <div><b>Entities:</b> <pre>{JSON.stringify(doc.entities, null, 2)}</pre></div>
                          <div><b>Metadata:</b> <pre>{JSON.stringify(doc, null, 2)}</pre></div>
                        </ExpandDrawer>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </Table>
          )}
        </motion.div>
        {/* Manual Overrides */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 18, boxShadow: '0 4px 24px 0 #3B82F633', padding: '2rem', minHeight: 100 }}>
          <h2>Manual Overrides (Re-extract, Re-classify, Route)</h2>
        </motion.div>
        {/* Admin View CTA */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 18, boxShadow: '0 4px 24px 0 #9333EA33', padding: '2rem', minHeight: 80, textAlign: 'center' }}>
          <h3>Want to see analytics and system health? <a href="/admin" style={{ color: '#3B82F6', textDecoration: 'underline' }}>Go to Admin View</a></h3>
        </motion.div>
      </Main>
    </Layout>
  );
} 