import React, { useEffect, useState } from 'react';
import { listDocuments, routeDocument } from '../api';

// Mapping from UI display names to backend routing values
const DESTINATION_MAP = {
  'Analytics Dashboard': 'Dashboard',
  'Expense Tracker': 'Expense Tracker',
  'Financial Review': 'Financial Review',
  'Legal DMS': 'Legal DMS',
  'Manual Review': 'Manual Review',
  'Slack': 'Slack',
  'Unclassified': 'Unclassified',
  // Add more mappings as needed
};

export default function HumanIntervention({ setCurrentPage, setRouteDestination }) {
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
      // Remove the routed document from the local state immediately
      setDocuments(prevDocs => prevDocs.filter(doc => doc.id !== docId));
      setSelectedDoc(null);
      // Optionally, update the route page if needed
      if (setCurrentPage && setRouteDestination) {
        setRouteDestination(destination);
        setCurrentPage('route');
      }
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

  function formatConfidence(conf) {
    if (typeof conf !== 'number') return 'N/A';
    return conf <= 1 ? `${(conf * 100).toFixed(1)}%` : `${conf.toFixed(1)}%`;
  }

  return (
    <div className="page-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title section-darkblue-light">
          <span style={{ marginRight: '12px' }}>🧑‍💼</span>
          Human Intervention & Manual Routing
        </h1>
        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e3a8a', margin: '8px 0 0 0', letterSpacing: '1px' }}>
          <span role="img" aria-label="intervention">🛠️</span> Human Intervention
        </div>
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
                    {doc.status === 'Human Intervention' ? (
                    <span style={{ 
                      marginLeft: '8px', 
                        fontSize: '0.85rem',
                      background: getStatusColor(doc.status), 
                      color: 'white',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        whiteSpace: 'nowrap',
                        display: 'inline-block',
                        fontWeight: 600
                      }}>
                        Human Intervention
                    </span>
                    ) : null}
                  </div>
                </div>
                <div className="feature-description">
                  <div><strong>Type:</strong> {doc.type || 'Unknown'}</div>
                  <div><strong>Classification Confidence:</strong> {doc.confidence ? `${(doc.confidence * 100).toFixed(1)}%` : 'N/A'}</div>
                  <div><strong>Extraction Confidence:</strong> {doc.extractionConfidence ? `${(doc.extractionConfidence * 100).toFixed(1)}%` : 'N/A'}</div>
                  <div><strong>Routing Confidence:</strong> {doc.routingConfidence ? `${(doc.routingConfidence * 100).toFixed(1)}%` : 'N/A'}</div>
                  <div><strong>Extraction Method:</strong> {doc.extractionMethod || 'Unknown'}</div>
                  <div><strong>Uploaded:</strong> {doc.timestamps?.ingested ? new Date(doc.timestamps.ingested).toLocaleDateString() : 'Unknown'}</div>
                  {doc.classificationReason && (
                    <div><strong>Classification Reason:</strong> {doc.classificationReason}</div>
                  )}
                  {doc.routingReason && (
                    <div><strong>Routing Reason:</strong> {doc.routingReason}</div>
                  )}
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
        <div
          onClick={e => { if (e.target === e.currentTarget) setSelectedDoc(null); }}
          style={{
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
          }}
        >
          <div
            style={{
            background: 'var(--bg-secondary)',
            borderRadius: '16px',
            padding: '32px',
              maxWidth: '900px',
              width: '95%',
            maxHeight: '80vh',
              overflowY: 'auto',
              overflowX: 'hidden',
              boxShadow: 'var(--shadow-neumorphism)',
              position: 'relative',
              scrollbarColor: '#2563eb var(--bg-primary)',
              scrollbarWidth: 'thin',
            }}
            onClick={e => e.stopPropagation()}
          >
            <style>{`
              .modal-scrollbar::-webkit-scrollbar {
                width: 8px;
                background: var(--bg-primary);
              }
              .modal-scrollbar::-webkit-scrollbar-thumb {
                background: #2563eb;
                border-radius: 8px;
              }
            `}</style>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ margin: 0, color: '#1e3a8a', fontWeight: 800, fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span role="img" aria-label="doc">📄</span> {selectedDoc.name}
              </h2>
              <button 
                onClick={() => setSelectedDoc(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '2rem',
                  cursor: 'pointer',
                  color: '#1e3a8a',
                  fontWeight: 700
                }}
                title="Close"
              >
                ×
              </button>
            </div>
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ color: '#2563eb', fontWeight: 700 }}>Document Preview</h3>
              <div style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: '12px', marginBottom: '16px', textAlign: 'center', boxShadow: '0 2px 8px rgba(30,64,175,0.08)' }}>
                {selectedDoc.name && /\.(png|jpg|jpeg|gif)$/i.test(selectedDoc.name) ? (
                  <img
                    src={(() => {
                      const path = selectedDoc.path || selectedDoc.filePath || '';
                      const fileName = path.split(/[/\\]/).pop();
                      return '/uploaded_docs/' + fileName;
                    })()}
                    alt="Document Preview"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '60vh',
                      borderRadius: '8px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                      display: 'block',
                      margin: '0 auto'
                    }}
                  />
                ) : selectedDoc.name && /\.(pdf)$/i.test(selectedDoc.name) ? (
                  <iframe
                    src={(() => {
                      const path = selectedDoc.path || selectedDoc.filePath || '';
                      const fileName = path.split(/[/\\]/).pop();
                      return '/uploaded_docs/' + fileName;
                    })()}
                    title="PDF Preview"
                    style={{ width: '100%', height: '250px', border: 'none', borderRadius: '8px', background: 'white' }}
                  />
                ) : selectedDoc.extractedText ? (
                  <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0, textAlign: 'left', fontFamily: 'monospace', fontSize: '1rem', color: '#1e3a8a' }}>{selectedDoc.extractedText}</pre>
                ) : (
                  <span style={{ color: 'var(--text-secondary)' }}>No preview available.</span>
                )}
                <a
                  href={(() => {
                    const path = selectedDoc.path || selectedDoc.filePath || '';
                    const fileName = path.split(/[/\\]/).pop();
                    return '/uploaded_docs/' + fileName;
                  })()}
                  download
                  style={{
                    display: 'inline-block',
                    marginTop: 16,
                    background: '#2563eb',
                    color: 'white',
                    padding: '10px 24px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    textDecoration: 'none',
                    fontSize: '1rem',
                    boxShadow: '0 2px 8px #2563eb33',
                    alignItems: 'center',
                    gap: 8
                  }}
                >
                  ⬇️ Download File
                </a>
              </div>
            </div>
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ color: '#2563eb', fontWeight: 700 }}>Document Details</h3>
              <div style={{ background: 'var(--bg-tertiary)', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
                <div><strong>Status:</strong> {selectedDoc.status}</div>
                <div><strong>Type:</strong> {selectedDoc.type || 'Unknown'}</div>
                <div><strong>Classification Confidence:</strong> {selectedDoc.confidence ? `${(selectedDoc.confidence * 100).toFixed(1)}%` : 'N/A'}</div>
                <div><strong>Extraction Confidence:</strong> {selectedDoc.extractionConfidence ? `${(selectedDoc.extractionConfidence * 100).toFixed(1)}%` : 'N/A'}</div>
                <div><strong>Routing Confidence:</strong> {selectedDoc.routingConfidence ? `${(selectedDoc.routingConfidence * 100).toFixed(1)}%` : 'N/A'}</div>
                <div><strong>Extraction Method:</strong> {selectedDoc.extractionMethod || 'Unknown'}</div>
                <div><strong>Uploaded:</strong> {selectedDoc.timestamps?.ingested ? new Date(selectedDoc.timestamps.ingested).toLocaleDateString() : 'Unknown'}</div>
                {selectedDoc.classificationReason && (
                  <div><strong>Classification Reason:</strong> {selectedDoc.classificationReason}</div>
                )}
                {selectedDoc.routingReason && (
                  <div><strong>Routing Reason:</strong> {selectedDoc.routingReason}</div>
                )}
                {selectedDoc.entities && Object.keys(selectedDoc.entities).length > 0 && (
                  <div><strong>Extracted Entities:</strong> {JSON.stringify(selectedDoc.entities)}</div>
                )}
                {selectedDoc.extractedText && (
                  <div><strong>Extracted Text:</strong> <pre style={{ whiteSpace: 'pre-wrap', fontSize: 12 }}>{selectedDoc.extractedText}</pre></div>
                )}
                <div><strong>Ingested:</strong> {selectedDoc.timestamps?.ingested ? new Date(selectedDoc.timestamps.ingested).toLocaleString() : 'N/A'}</div>
                <div><strong>Extracted:</strong> {selectedDoc.timestamps?.extracted ? new Date(selectedDoc.timestamps.extracted).toLocaleString() : 'N/A'}</div>
                <div><strong>Classified:</strong> {selectedDoc.timestamps?.classified ? new Date(selectedDoc.timestamps.classified).toLocaleString() : 'N/A'}</div>
                <div><strong>Routed:</strong> {selectedDoc.timestamps?.routed ? new Date(selectedDoc.timestamps.routed).toLocaleString() : 'N/A'}</div>
              </div>
            </div>
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ color: '#2563eb', fontWeight: 700 }}>Select Destination</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
                Choose the appropriate destination for this document:
              </p>
              <div className="features-grid">
                {routingOptions.map(option => (
                  <div 
                    key={option.id}
                    className="feature-card"
                    onClick={() => handleManualRoute(selectedDoc.id, DESTINATION_MAP[option.name] || option.name)}
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
            <div className="stat-icon">📊</div>
            <div className="stat-title">Avg Confidence</div>
            <div className="stat-value">
              {documents.length > 0 
                ? `${Math.round((documents.reduce((sum, doc) => sum + (doc.confidence || 0), 0) / documents.length) * 100)}%`
                : '0%'
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 