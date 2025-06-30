import React, { useState, useEffect } from 'react';
import { uploadDocument, extractDocument, classifyDocument, routeDocument, listDocuments, getDocument } from '../api';

const SUPPORTED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.txt', '.jpg', '.jpeg', '.png', '.gif'];
function getFileExtension(filename) {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 1).toLowerCase();
}

export default function Route() {
  const [selectedId, setSelectedId] = useState('');
  const [isRouting, setIsRouting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [autoRoutedId, setAutoRoutedId] = useState(null);

  const fetchDocuments = async () => {
    try {
      const docs = await listDocuments();
      setDocuments(docs);
    } catch (err) {}
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  // Auto-route the most recent 'Classified' document
  useEffect(() => {
    const classifiedDoc = documents.find(doc => doc.status === 'Classified');
    if (classifiedDoc && classifiedDoc.id !== autoRoutedId) {
      setAutoRoutedId(classifiedDoc.id);
      handleAutoRoute(classifiedDoc.id);
    }
    // eslint-disable-next-line
  }, [documents]);

  const handleAutoRoute = async (id) => {
    setError(null);
    setResult(null);
    try {
      const doc = await getDocument(id);
      const res = await routeDocument(id, doc.type);
      setResult(res);
      await fetchDocuments();
    } catch (err) {
      setError(err.message);
      // Simulate status update to 'Human Intervention' in frontend
      setDocuments(prev => prev.map(doc => doc.id === id ? { ...doc, status: 'Human Intervention' } : doc));
    }
  };

  const handleRoute = async () => {
    if (!selectedId) return;
    setIsRouting(true);
    setError(null);
    setResult(null);
    try {
      const doc = await getDocument(selectedId);
      const res = await routeDocument(selectedId, doc.type);
      setResult(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsRouting(false);
    }
  };

  const handleRouteUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
      setResult(null);
      setIsRouting(true);
      try {
        const uploadRes = await uploadDocument(file);
        const id = uploadRes.id;
        const extractRes = await extractDocument(id);
        const classifyRes = await classifyDocument(id, extractRes.extractedText);
        const routeRes = await routeDocument(id, classifyRes.type);
        setResult(routeRes);
        setSelectedId(id);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsRouting(false);
      }
    }
  };

  const capabilities = [
    {
      title: 'Smart Routing',
      icon: '🧠',
      description: 'AI-powered routing based on document content and classification.',
      color: '#1e3a8a'
    },
    {
      title: 'Workflow Integration',
      icon: '🔄',
      description: 'Seamless integration with existing business workflows and systems.',
      color: '#1d4ed8'
    },
    {
      title: 'Priority Assessment',
      icon: '⚡',
      description: 'Intelligent priority scoring for urgent document processing.',
      color: '#2563eb'
    },
    {
      title: 'Custom Rules',
      icon: '⚙️',
      description: 'Configurable routing rules based on business requirements.',
      color: '#3730a3'
    }
  ];

  return (
    <div className="page-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">
          <span style={{ marginRight: '12px' }}>🚀</span>
          Intelligent Document Routing
        </h1>
        <p className="dashboard-subtitle">
          Automatically route documents to appropriate systems and departments 
          based on their classification. Our AI determines the optimal destination for 
          each document type with smart workflow integration.
        </p>
      </div>

      <div className="pipeline-section">
        <div className="section-title">
          <span style={{ marginRight: '12px' }}>🤖</span>
          AI Routing Upload
        </div>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
          Upload a document or select an existing one to route
        </p>
        <input
          type="file"
          onChange={handleRouteUpload}
          style={{ display: 'inline-block', marginBottom: 8 }}
          id="route-upload"
        />
        <br />
        <select value={selectedId} onChange={e => setSelectedId(e.target.value)} style={{ marginRight: 8 }}>
          <option value="">Select Existing Document</option>
          {documents.map(doc => (
            <option key={doc.id} value={doc.id}>{doc.name}</option>
          ))}
        </select>
        <button onClick={handleRoute} disabled={!selectedId || isRouting} style={{ marginLeft: 8 }}>
          {isRouting ? 'Routing...' : 'Route'}
        </button>
        {selectedFile && (
          <div style={{ marginTop: '8px', color: 'var(--text-secondary)' }}>
            Uploaded: {selectedFile.name}
          </div>
        )}
        {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
        {result && (
          <div style={{ marginTop: 16, color: 'green' }}>
            <div>Message: {result.message}</div>
            <div>Destination: {result.destination}</div>
            <div>Status: {result.status}</div>
          </div>
        )}
      </div>

      <div className="pipeline-section">
        <div className="section-title">
          <span style={{ marginRight: '8px' }}>🔧</span>
          AI Routing Capabilities
        </div>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
          Intelligent routing features powered by advanced machine learning
        </p>
        
        <div className="features-grid">
          {capabilities.map((capability, index) => (
            <div key={index} className="feature-card">
              <div className="feature-header">
                <div className="feature-icon" style={{
                  backgroundColor: capability.color,
                  color: 'white'
                }}>
                  {capability.icon}
                </div>
                <div className="feature-title">{capability.title}</div>
              </div>
              <div className="feature-description">{capability.description}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="recent-documents">
        <div className="recent-header">
          <h2 className="section-title">Routing History</h2>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Track document routing decisions and destinations
          </span>
        </div>
        <div className="empty-state">
          <div className="empty-icon">🚀</div>
          <div className="empty-title">No routing history yet</div>
          <div className="empty-description">Upload documents to see AI routing results</div>
        </div>
      </div>

      <div className="pipeline-section">
        <div className="section-title">Routing Performance</div>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
          Monitor routing accuracy and efficiency metrics
        </p>
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <div className="empty-title">No routing data available</div>
          <div className="empty-description">Process documents to see routing performance metrics</div>
        </div>
      </div>
    </div>
  );
}
