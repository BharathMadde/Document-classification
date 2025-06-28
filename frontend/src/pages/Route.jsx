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
  const [selectedRoute, setSelectedRoute] = useState(null);

  // Define all possible routing destinations
  const routingDestinations = [
    {
      id: 'accounting-erp',
      name: 'Accounting ERP',
      icon: '💰',
      description: 'Financial documents, invoices, and payment processing',
      color: '#1e3a8a',
      documents: []
    },
    {
      id: 'legal-dms',
      name: 'Legal DMS',
      icon: '⚖️',
      description: 'Contracts, legal documents, and compliance materials',
      color: '#1d4ed8',
      documents: []
    },
    {
      id: 'analytics-dashboard',
      name: 'Analytics Dashboard',
      icon: '📊',
      description: 'Reports, analytics, and business intelligence data',
      color: '#2563eb',
      documents: []
    },
    {
      id: 'expense-tracker',
      name: 'Expense Tracker',
      icon: '🧾',
      description: 'Receipts, expense reports, and reimbursement documents',
      color: '#3730a3',
      documents: []
    },
    {
      id: 'financial-review',
      name: 'Financial Review',
      icon: '📈',
      description: 'Financial statements, budgets, and financial analysis',
      color: '#7c3aed',
      documents: []
    },
    {
      id: 'slack',
      name: 'Slack',
      icon: '💬',
      description: 'Documents sent to Slack for team review and collaboration',
      color: '#4f46e5',
      documents: []
    },
    {
      id: 'unclassified-unrouted',
      name: 'Unclassified/Unrouted',
      icon: '❓',
      description: 'Documents that need processing or manual routing',
      color: '#f59e0b',
      documents: []
    },
    {
      id: 'manual-review',
      name: 'Manual Review',
      icon: '👀',
      description: 'Documents requiring human intervention and review',
      color: '#dc2626',
      documents: []
    }
  ];

  const fetchDocuments = async () => {
    try {
      const response = await listDocuments();
      // Handle the response structure from backend
      if (response.success && Array.isArray(response.documents)) {
        setDocuments(response.documents);
      } else if (Array.isArray(response)) {
        // Fallback: if response is directly an array
        setDocuments(response);
      } else {
        setDocuments([]);
      }
    } catch (err) {
      setDocuments([]);
    }
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
      await fetchDocuments();
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
        await fetchDocuments();
      } catch (err) {
        setError(err.message);
      } finally {
        setIsRouting(false);
      }
    }
  };

  const handleRouteCardClick = (route) => {
    setSelectedRoute(route);
  };

  const handleBackToRoutes = () => {
    setSelectedRoute(null);
  };

  // Group documents by destination
  const getDocumentsByDestination = () => {
    const grouped = {};
    routingDestinations.forEach(dest => {
      if (dest.name === 'Unclassified/Unrouted') {
        // Documents that haven't been processed or routed yet
        grouped[dest.name] = documents.filter(doc => 
          !doc.destination || 
          doc.status === 'Ingested' || 
          doc.status === 'Extracted' ||
          doc.status === 'Classified' && !doc.destination
        );
      } else if (dest.name === 'Manual Review') {
        // Documents specifically marked for manual review
        grouped[dest.name] = documents.filter(doc => 
          doc.destination === 'Manual Review' || 
          doc.status === 'Human Intervention'
        );
      } else {
        // Regular destination grouping
        grouped[dest.name] = documents.filter(doc => doc.destination === dest.name);
      }
    });
    return grouped;
  };

  const documentsByDestination = getDocumentsByDestination();

  // If a specific route is selected, show its documents
  if (selectedRoute) {
    const routeDocuments = documentsByDestination[selectedRoute.name] || [];
    
    return (
      <div className="page-container">
        <div className="dashboard-header">
          <button 
            onClick={handleBackToRoutes}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--accent-primary)',
              cursor: 'pointer',
              fontSize: '1rem',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            ← Back to Routes
          </button>
          <h1 className="dashboard-title">
            <span style={{ marginRight: '12px' }}>{selectedRoute.icon}</span>
            {selectedRoute.name}
          </h1>
          <p className="dashboard-subtitle">
            {selectedRoute.description}
          </p>
        </div>

        <div className="recent-documents">
          <div className="recent-header">
            <h2 className="section-title">
              Documents in {selectedRoute.name}
              <span style={{ marginLeft: '12px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                ({routeDocuments.length} documents)
              </span>
            </h2>
          </div>
          
          {routeDocuments.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">{selectedRoute.icon}</div>
              <div className="empty-title">No documents in {selectedRoute.name}</div>
              <div className="empty-description">Documents will appear here once they are routed to this destination</div>
            </div>
          ) : (
            <table style={{ width: '100%', marginTop: 16 }}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Type</th>
                  <th>Confidence</th>
                  <th>Uploaded</th>
                </tr>
              </thead>
              <tbody>
                {routeDocuments.map(doc => (
                  <tr key={doc.id}>
                    <td>{doc.name}</td>
                    <td>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        background: doc.status === 'Routed' ? 'var(--success)' : 'var(--processing)',
                        color: 'white'
                      }}>
                        {doc.status}
                      </span>
                    </td>
                    <td>{doc.type || '-'}</td>
                    <td>{doc.confidence ? `${(doc.confidence * 100).toFixed(1)}%` : '-'}</td>
                    <td>{doc.timestamps?.ingested ? new Date(doc.timestamps.ingested).toLocaleDateString() : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    );
  }

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
          {documents.filter(doc => doc.status === 'Classified').map(doc => (
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
          <div style={{ marginTop: 16, color: 'green', padding: '12px', background: 'rgba(0, 223, 162, 0.1)', borderRadius: '8px' }}>
            <div><strong>✅ {result.userMessage}</strong></div>
            <div style={{ marginTop: '4px', fontSize: '0.875rem' }}>
              Destination: {result.destination} | Status: {result.status}
            </div>
          </div>
        )}
      </div>

      <div className="pipeline-section">
        <div className="section-title">
          <span style={{ marginRight: '8px' }}>🎯</span>
          Routing Destinations
        </div>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
          Click on a destination to view documents routed there
        </p>
        
        <div className="features-grid">
          {routingDestinations.map((route, index) => {
            const routeDocuments = documentsByDestination[route.name] || [];
            return (
              <div 
                key={route.id} 
                className="feature-card"
                onClick={() => handleRouteCardClick(route)}
                style={{ cursor: 'pointer' }}
              >
                <div className="feature-header">
                  <div className="feature-icon" style={{
                    backgroundColor: route.color,
                    color: 'white'
                  }}>
                    {route.icon}
                  </div>
                  <div className="feature-title">
                    {route.name}
                    <span style={{ 
                      marginLeft: '8px', 
                      fontSize: '0.75rem', 
                      background: 'var(--accent-primary)', 
                      color: 'white',
                      padding: '2px 6px',
                      borderRadius: '8px'
                    }}>
                      {routeDocuments.length}
                    </span>
                  </div>
                </div>
                <div className="feature-description">{route.description}</div>
                {routeDocuments.length > 0 && (
                  <div style={{ marginTop: '12px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    Latest: {routeDocuments[0]?.name}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="recent-documents">
        <div className="recent-header">
          <h2 className="section-title">Recent Routing Activity</h2>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Track recent document routing decisions
          </span>
        </div>
        
        {documents.filter(doc => doc.status === 'Routed').length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🚀</div>
            <div className="empty-title">No routing activity yet</div>
            <div className="empty-description">Upload and process documents to see routing results</div>
          </div>
        ) : (
          <table style={{ width: '100%', marginTop: 16 }}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Destination</th>
                <th>Confidence</th>
                <th>Routed</th>
              </tr>
            </thead>
            <tbody>
              {documents
                .filter(doc => doc.status === 'Routed')
                .slice(0, 10)
                .map(doc => (
                  <tr key={doc.id}>
                    <td>{doc.name}</td>
                    <td>{doc.type || '-'}</td>
                    <td>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        background: 'var(--success)',
                        color: 'white'
                      }}>
                        {doc.destination}
                      </span>
                    </td>
                    <td>{doc.confidence ? `${(doc.confidence * 100).toFixed(1)}%` : '-'}</td>
                    <td>{doc.timestamps?.routed ? new Date(doc.timestamps.routed).toLocaleDateString() : '-'}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
