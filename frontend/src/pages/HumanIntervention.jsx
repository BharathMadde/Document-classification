import React, { useEffect, useState } from 'react';
import { listDocuments, routeDocument } from '../api';

export default function HumanIntervention() {
  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [isRouting, setIsRouting] = useState(false);
  const [routingResult, setRoutingResult] = useState(null);

  // Available routing destinations for manual routing
  const routingOptions = [
    { id: 'accounting-erp', name: 'Accounting ERP', icon: '💰', color: '#1e3a8a' },
    { id: 'legal-dms', name: 'Legal DMS', icon: '⚖️', color: '#1d4ed8' },
    { id: 'analytics-dashboard', name: 'Analytics Dashboard', icon: '📊', color: '#2563eb' },
    { id: 'expense-tracker', name: 'Expense Tracker', icon: '🧾', color: '#3730a3' },
    { id: 'financial-review', name: 'Financial Review', icon: '📈', color: '#7c3aed' },
    { id: 'slack', name: 'Slack', icon: '💬', color: '#4f46e5' }
  ];

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const response = await listDocuments();
        // Handle the response structure from backend
        let docs = [];
        if (response.success && Array.isArray(response.documents)) {
          docs = response.documents;
        } else if (Array.isArray(response)) {
          docs = response;
        }
        // Filter for documents that need human intervention
        const interventionDocs = docs.filter(doc => 
          doc.status === 'Human Intervention' || 
          doc.status === 'Ingested' || 
          doc.status === 'Extracted' ||
          !doc.destination ||
          doc.destination === 'Manual Review'
        );
        setDocuments(interventionDocs);
      } catch (err) {
        setDocuments([]);
      }
    };
    fetchDocs();
  }, []);

  const handleManualRoute = async (docId, destination) => {
    setIsRouting(true);
    setRoutingResult(null);
    try {
      const res = await routeDocument(docId, destination);
      setRoutingResult(res);
      // Refresh the documents list
      const response = await listDocuments();
      let docs = [];
      if (response.success && Array.isArray(response.documents)) {
        docs = response.documents;
      } else if (Array.isArray(response)) {
        docs = response;
      }
      const interventionDocs = docs.filter(doc => 
        doc.status === 'Human Intervention' || 
        doc.status === 'Ingested' || 
        doc.status === 'Extracted' ||
        !doc.destination ||
        doc.destination === 'Manual Review'
      );
      setDocuments(interventionDocs);
      setSelectedDoc(null);
    } catch (err) {
      setRoutingResult({ success: false, userMessage: err.message });
    } finally {
      setIsRouting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Ingested': return '#1e3a8a';
      case 'Extracted': return '#1d4ed8';
      case 'Classified': return '#2563eb';
      case 'Human Intervention': return '#dc2626';
      default: return '#6b7280';
    }
  };

  return (
    <div className="page-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">
          <span style={{ marginRight: '12px' }}>🧑‍💼</span>
          Human Intervention & Manual Routing
        </h1>
        <p className="dashboard-subtitle">
          Review documents that AI couldn't process and manually route them to appropriate destinations.
        </p>
      </div>

      {routingResult && (
        <div style={{ 
          marginBottom: '24px', 
          padding: '12px', 
          borderRadius: '8px',
          background: routingResult.success ? 'rgba(0, 223, 162, 0.1)' : 'rgba(220, 38, 38, 0.1)',
          color: routingResult.success ? 'green' : 'red'
        }}>
          <strong>{routingResult.userMessage}</strong>
        </div>
      )}

      <div className="pipeline-section">
        <div className="section-title">
          <span style={{ marginRight: '8px' }}>📋</span>
          Documents Requiring Human Review
        </div>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
          These documents need manual routing due to AI processing limitations or unclear content.
        </p>
        
        {documents.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">✅</div>
            <div className="empty-title">No documents need human intervention</div>
            <div className="empty-description">All documents have been successfully processed by AI.</div>
          </div>
        ) : (
          <div className="features-grid">
            {documents.map(doc => (
              <div key={doc.id} className="feature-card" style={{ cursor: 'pointer' }} onClick={() => setSelectedDoc(doc)}>
                <div className="feature-header">
                  <div className="feature-icon" style={{
                    backgroundColor: getStatusColor(doc.status),
                    color: 'white'
                  }}>
                    📄
                  </div>
                  <div className="feature-title">
                    {doc.name}
                    <span style={{ 
                      marginLeft: '8px', 
                      fontSize: '0.75rem', 
                      background: getStatusColor(doc.status), 
                      color: 'white',
                      padding: '2px 6px',
                      borderRadius: '8px'
                    }}>
                      {doc.status}
                    </span>
                  </div>
                </div>
                <div className="feature-description">
                  <div><strong>Type:</strong> {doc.type || 'Unknown'}</div>
                  <div><strong>Confidence:</strong> {doc.confidence ? `${(doc.confidence * 100).toFixed(1)}%` : 'N/A'}</div>
                  <div><strong>Uploaded:</strong> {doc.timestamps?.ingested ? new Date(doc.timestamps.ingested).toLocaleDateString() : 'Unknown'}</div>
                  <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                    <a href={doc.path.replace(/\\/g, '/').replace(/^.*uploaded_docs\//, '/uploaded_docs/')} download target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: '#2563eb', fontWeight: 600 }}>
                      Download
                    </a>
                    <button onClick={e => { e.stopPropagation(); setSelectedDoc(doc); }} style={{ background: 'none', border: '1px solid #2563eb', color: '#2563eb', borderRadius: '6px', padding: '2px 10px', cursor: 'pointer', fontWeight: 600 }}>
                      Preview
                    </button>
                  </div>
                </div>
                <div style={{ marginTop: '12px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  Click to review and route manually
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Manual Routing Modal */}
      {selectedDoc && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'var(--bg-secondary)',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto',
            boxShadow: 'var(--shadow-neumorphism)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ margin: 0 }}>Manual Routing: {selectedDoc.name}</h2>
              <button 
                onClick={() => setSelectedDoc(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: 'var(--text-secondary)'
                }}
              >
                ×
              </button>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <h3>Document Details</h3>
              <div style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
                <div><strong>Status:</strong> {selectedDoc.status}</div>
                <div><strong>Type:</strong> {selectedDoc.type || 'Unknown'}</div>
                <div><strong>Confidence:</strong> {selectedDoc.confidence ? `${(selectedDoc.confidence * 100).toFixed(1)}%` : 'N/A'}</div>
                <div><strong>Uploaded:</strong> {selectedDoc.timestamps?.ingested ? new Date(selectedDoc.timestamps.ingested).toLocaleDateString() : 'Unknown'}</div>
                {selectedDoc.entities && (
                  <div><strong>Extracted Entities:</strong> {JSON.stringify(selectedDoc.entities)}</div>
                )}
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <h3>Select Destination</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
                Choose the appropriate destination for this document:
              </p>
              <div className="features-grid">
                {routingOptions.map(option => (
                  <div 
                    key={option.id}
                    className="feature-card"
                    onClick={() => handleManualRoute(selectedDoc.id, option.name)}
                    style={{ 
                      cursor: isRouting ? 'not-allowed' : 'pointer',
                      opacity: isRouting ? 0.6 : 1
                    }}
                  >
                    <div className="feature-header">
                      <div className="feature-icon" style={{
                        backgroundColor: option.color,
                        color: 'white'
                      }}>
                        {option.icon}
                      </div>
                      <div className="feature-title">{option.name}</div>
                    </div>
                    <div className="feature-description">
                      Route this document to {option.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <h3>Document Preview</h3>
              <div style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: '8px', marginBottom: '16px', maxHeight: '200px', overflowY: 'auto' }}>
                {selectedDoc.extractedText ? (
                  <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0 }}>{selectedDoc.extractedText}</pre>
                ) : (
                  <span style={{ color: 'var(--text-secondary)' }}>No preview available.</span>
                )}
              </div>
            </div>

            {isRouting && (
              <div style={{ textAlign: 'center', padding: '16px' }}>
                <div className="processing-indicator">
                  <div className="processing-dots">
                    <div className="processing-dot"></div>
                    <div className="processing-dot"></div>
                    <div className="processing-dot"></div>
                  </div>
                  Routing document...
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="recent-documents">
        <div className="recent-header">
          <h2 className="section-title">Intervention Statistics</h2>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Track documents requiring human intervention
          </span>
        </div>
        
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📄</div>
            <div className="stat-title">Total Pending</div>
            <div className="stat-value">{documents.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🤖</div>
            <div className="stat-title">AI Processed</div>
            <div className="stat-value">{documents.filter(d => d.status === 'Extracted' || d.status === 'Classified').length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">👀</div>
            <div className="stat-title">Needs Review</div>
            <div className="stat-value">{documents.filter(d => d.status === 'Human Intervention').length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-title">Manually Routed</div>
            <div className="stat-value">0</div>
          </div>
        </div>
      </div>
    </div>
  );
} 