import React, { useState, useEffect } from 'react';
import { uploadDocument, extractDocument, classifyDocument, listDocuments, getDocument, getSocket, initializeSocket } from '../api';

const SUPPORTED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.txt', '.jpg', '.jpeg', '.png', '.gif'];
function getFileExtension(filename) {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 1).toLowerCase();
}

export default function Classify() {
  const [selectedId, setSelectedId] = useState('');
  const [isClassifying, setIsClassifying] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [classificationResults, setClassificationResults] = useState([]);
  const [successMessage, setSuccessMessage] = useState(null);

  const features = [
    {
      title: 'Multi-Modal AI',
      icon: '🧠',
      description: 'Combine multiple AI models for accurate document classification.',
      color: '#1e3a8a'
    },
    {
      title: 'Confidence Scoring',
      icon: '📊',
      description: 'Receive confidence percentages for classification accuracy.',
      color: '#1d4ed8'
    },
    {
      title: 'Real-time Processing',
      icon: '⚡',
      description: 'Fast, scalable and responsive results for high-volume workflows.',
      color: '#2563eb'
    },
    {
      title: 'Custom Categories',
      icon: '🏷️',
      description: 'Support custom document types and industry-specific categories.',
      color: '#3730a3'
    }
  ];

  const fetchDocuments = async () => {
    try {
      const docs = await listDocuments();
      setDocuments(docs);
      
      // Update classification results
      const classified = docs.filter(doc => 
        doc.status === 'Classified' || 
        doc.status === 'Routed'
      );
      setClassificationResults(classified);
    } catch (err) {
      console.error('Failed to fetch documents:', err);
    }
  };

  useEffect(() => {
    fetchDocuments();
    
    // Initialize socket connection
    const socket = initializeSocket();
    
    socket.on('documentUpdated', (document) => {
      setDocuments(prev => {
        const index = prev.findIndex(d => d.id === document.id);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = document;
          return updated;
        } else {
          return [document, ...prev];
        }
      });
      
      // Show success message for classification
      if (document.status === 'Classified') {
        setSuccessMessage(`Document "${document.name}" classified as "${document.type}" with ${Math.round(document.confidence * 100)}% confidence.`);
        setTimeout(() => setSuccessMessage(null), 5000);
      }
      
      // Update classification results
      if (document.status === 'Classified' || document.status === 'Routed') {
        setClassificationResults(prev => {
          const index = prev.findIndex(d => d.id === document.id);
          if (index >= 0) {
            const updated = [...prev];
            updated[index] = document;
            return updated;
          } else {
            return [document, ...prev];
          }
        });
      }
    });

    return () => {
      socket.off('documentUpdated');
    };
  }, []);

  const handleAutoClassify = async (id) => {
    setError(null);
    setResult(null);
    try {
      const doc = await getDocument(id);
      const res = await classifyDocument(id, doc.entities ? doc.entities.text || '' : '');
      setResult(res);
      await fetchDocuments();
    } catch (err) {
      setError(err.message);
      // Simulate status update to 'Human Intervention' in frontend
      setDocuments(prev => prev.map(doc => doc.id === id ? { ...doc, status: 'Human Intervention' } : doc));
    }
  };

  const handleClassify = async () => {
    if (!selectedId) return;
    setIsClassifying(true);
    setError(null);
    setResult(null);
    try {
      const doc = await getDocument(selectedId);
      const res = await classifyDocument(selectedId, doc.entities ? doc.entities.text || '' : '');
      setResult(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsClassifying(false);
    }
  };

  const handleClassifyUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
      setResult(null);
      setIsClassifying(true);
      try {
        const uploadRes = await uploadDocument(file);
        const id = uploadRes.id;
        const extractRes = await extractDocument(id);
        const classifyRes = await classifyDocument(id, extractRes.extractedText);
        setResult(classifyRes);
        setSelectedId(id);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsClassifying(false);
      }
    }
  };

  return (
    <div className="page-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">
          <span style={{ marginRight: '12px' }}>🧠</span>
          AI Document Classification
        </h1>
        <p className="dashboard-subtitle">
          Automatically classify documents using advanced machine learning models. 
          Our AI analyzes content, structure, and context to determine document 
          types with high confidence scores.
        </p>
      </div>

      <div className="pipeline-section">
        <div className="section-title">
          <span style={{ marginRight: '12px' }}>🤖</span>
          AI Classification Upload
        </div>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
          Upload a document or select an existing one to classify
        </p>
        <input
          type="file"
          onChange={handleClassifyUpload}
          style={{ display: 'inline-block', marginBottom: 8 }}
          id="classify-upload"
        />
        <br />
        <select value={selectedId} onChange={e => setSelectedId(e.target.value)} style={{ marginRight: 8 }}>
          <option value="">Select Existing Document</option>
          {documents.map(doc => (
            <option key={doc.id} value={doc.id}>{doc.name}</option>
          ))}
        </select>
        <button onClick={handleClassify} disabled={!selectedId || isClassifying} style={{ marginLeft: 8 }}>
          {isClassifying ? 'Classifying...' : 'Classify'}
        </button>
        {selectedFile && (
          <div style={{ marginTop: '8px', color: 'var(--text-secondary)' }}>
            Uploaded: {selectedFile.name}
          </div>
        )}
        {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
        {result && (
          <div style={{ marginTop: 16, color: 'green' }}>
            <div>Type: {result.type}</div>
            <div>Confidence: {result.confidence}</div>
            <div>Status: {result.status}</div>
          </div>
        )}
      </div>

      <div className="pipeline-section">
        <div className="section-title">
          <span style={{ marginRight: '8px' }}>🔧</span>
          AI Classification Features
        </div>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
          State-of-the-art machine learning for document classification
        </p>
        
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-header">
                <div className="feature-icon" style={{
                  backgroundColor: feature.color,
                  color: 'white'
                }}>
                  {feature.icon}
                </div>
                <div className="feature-title">{feature.title}</div>
              </div>
              <div className="feature-description">{feature.description}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="recent-documents">
        <div className="recent-header">
          <h2 className="section-title">Classification Results</h2>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Real-time AI classification results with confidence scores
          </span>
        </div>
        {successMessage && (
          <div style={{ 
            padding: '12px', 
            background: 'rgba(34, 197, 94, 0.1)', 
            color: 'rgb(34, 197, 94)',
            borderRadius: '8px',
            marginBottom: '16px',
            fontWeight: 500
          }}>
            {successMessage}
          </div>
        )}
        {classificationResults.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🏷️</div>
            <div className="empty-title">No classification results yet</div>
            <div className="empty-description">Documents will appear here automatically as they are classified</div>
          </div>
        ) : (
          <div className="classification-results">
            {classificationResults.map(doc => (
              <div key={doc.id} className="classification-result-card">
                <div className="classification-header">
                  <h3>{doc.name}</h3>
                  <span className={`status-badge status-${doc.status.toLowerCase().replace(' ', '-')}`}>
                    {doc.status}
                  </span>
                </div>
                <div className="classification-details">
                  <div className="classification-meta">
                    <span>Classified: {doc.timestamps?.classified ? new Date(doc.timestamps.classified).toLocaleString() : 'Processing...'}</span>
                    {doc.destination && <span>Routed to: {doc.destination}</span>}
                  </div>
                  <div className="classification-type">
                    <div className="type-badge">
                      <span className="type-label">Document Type</span>
                      <span className="type-value">{doc.type}</span>
                    </div>
                    <div className="confidence-badge">
                      <span className="confidence-label">Confidence</span>
                      <span className="confidence-value">{Math.round(doc.confidence * 100)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="pipeline-section">
        <div className="section-title">Document Types Distribution</div>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
          Breakdown of classified document types and accuracy metrics
        </p>
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <div className="empty-title">No classification data available</div>
          <div className="empty-description">Process documents to see AI classification results</div>
        </div>
      </div>
    </div>
  );
}
