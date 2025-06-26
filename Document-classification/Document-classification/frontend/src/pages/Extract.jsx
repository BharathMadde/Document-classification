import React, { useState, useEffect } from 'react';
import { uploadDocument, extractDocument, listDocuments, getSocket, initializeSocket } from '../api';

const SUPPORTED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.txt', '.jpg', '.jpeg', '.png', '.gif'];
function getFileExtension(filename) {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 1).toLowerCase();
}

export default function Extract() {
  const [selectedId, setSelectedId] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [extractionResults, setExtractionResults] = useState([]);
  const [successMessage, setSuccessMessage] = useState(null);

  const fetchDocuments = async () => {
    try {
      const docs = await listDocuments();
      setDocuments(docs);
      
      // Update extraction results
      const extracted = docs.filter(doc => 
        doc.status === 'Extracted' || 
        doc.status === 'Classified' || 
        doc.status === 'Routed'
      );
      setExtractionResults(extracted);
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
      
      // Show success message for extraction
      if (document.status === 'Extracted') {
        setSuccessMessage(`Text extraction completed for "${document.name}". Processing continues automatically.`);
        setTimeout(() => setSuccessMessage(null), 5000);
      }
      
      // Update extraction results
      if (document.status === 'Extracted' || document.status === 'Classified' || document.status === 'Routed') {
        setExtractionResults(prev => {
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

  const handleExtract = async () => {
    if (!selectedId) return;
    setIsExtracting(true);
    setError(null);
    setResult(null);
    setSuccessMessage(null);
    try {
      const res = await extractDocument(selectedId);
      if (res.success) {
        setSuccessMessage('Text extraction initiated successfully! Results will update automatically.');
        setResult(res);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleExtractUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
      setResult(null);
      setIsExtracting(true);
      try {
        const uploadRes = await uploadDocument(file);
        const id = uploadRes.id;
        const extractRes = await extractDocument(id);
        setResult(extractRes);
        setSelectedId(id);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsExtracting(false);
      }
    }
  };

  const capabilities = [
    {
      title: 'OCR Text Extraction',
      icon: '👁️',
      description: 'Advanced optical character recognition for scanned documents and images.',
      color: '#1e3a8a'
    },
    {
      title: 'Table Recognition',
      icon: '📋',
      description: 'Intelligent extraction of tabular data with structure preservation.',
      color: '#1d4ed8'
    },
    {
      title: 'Entity Extraction',
      icon: '🔍',
      description: 'Identify and extract key entities like names, dates, and amounts.',
      color: '#2563eb'
    },
    {
      title: 'Form Processing',
      icon: '📝',
      description: 'Automatic extraction of data from structured forms and documents.',
      color: '#3730a3'
    }
  ];

  return (
    <div className="page-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">
          <span style={{ marginRight: '12px' }}>🔍</span>
          AI Document Extraction
        </h1>
        <p className="dashboard-subtitle">
          Extract text, tables, and structured data from documents using advanced AI. 
          Our machine learning models can process various document types and formats 
          with high accuracy and speed.
        </p>
      </div>

      <div className="pipeline-section">
        <div className="section-title">
          <span style={{ marginRight: '12px' }}>🤖</span>
          AI Extraction Upload
        </div>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
          Upload a document or select an existing one to extract text/entities
        </p>
        <input
          type="file"
          onChange={handleExtractUpload}
          style={{ display: 'inline-block', marginBottom: 8 }}
          id="extract-upload"
        />
        <br />
        <select value={selectedId} onChange={e => setSelectedId(e.target.value)} style={{ marginRight: 8 }}>
          <option value="">Select Existing Document</option>
          {documents.map(doc => (
            <option key={doc.id} value={doc.id}>{doc.name}</option>
          ))}
        </select>
        <button onClick={handleExtract} disabled={!selectedId || isExtracting} style={{ marginLeft: 8 }}>
          {isExtracting ? 'Extracting...' : 'Extract'}
        </button>
        {selectedFile && (
          <div style={{ marginTop: '8px', color: 'var(--text-secondary)' }}>
            Uploaded: {selectedFile.name}
          </div>
        )}
        {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
        {result && (
          <div style={{ marginTop: 16, color: 'green' }}>
            <div>Extracted Text: <pre style={{ whiteSpace: 'pre-wrap' }}>{result.extractedText}</pre></div>
            <div>Entities: {JSON.stringify(result.entities)}</div>
          </div>
        )}
      </div>

      <div className="pipeline-section">
        <div className="section-title">
          <span style={{ marginRight: '8px' }}>🔧</span>
          AI Extraction Capabilities
        </div>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
          Advanced AI algorithms to intelligently extract various content types
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
          <h2 className="section-title">Extraction Results</h2>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Real-time view of extracted data from processed documents
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
        {extractionResults.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📄</div>
            <div className="empty-title">No extraction results yet</div>
            <div className="empty-description">Documents will appear here automatically as they are extracted</div>
          </div>
        ) : (
          <div className="extraction-results">
            {extractionResults.map(doc => (
              <div key={doc.id} className="extraction-result-card">
                <div className="extraction-header">
                  <h3>{doc.name}</h3>
                  <span className={`status-badge status-${doc.status.toLowerCase().replace(' ', '-')}`}>
                    {doc.status}
                  </span>
                </div>
                <div className="extraction-details">
                  <div className="extraction-meta">
                    <span>Extracted: {doc.timestamps?.extracted ? new Date(doc.timestamps.extracted).toLocaleString() : 'Processing...'}</span>
                    {doc.type && <span>Type: {doc.type}</span>}
                    {doc.confidence && <span>Confidence: {Math.round(doc.confidence * 100)}%</span>}
                  </div>
                  {doc.entities?.text && (
                    <div className="extracted-text">
                      <strong>Extracted Text (Preview):</strong>
                      <p>{doc.entities.text.substring(0, 200)}...</p>
                    </div>
                  )}
                  {doc.entities && Object.keys(doc.entities).length > 1 && (
                    <div className="extracted-entities">
                      <strong>Extracted Entities:</strong>
                      <div className="entities-grid">
                        {Object.entries(doc.entities).filter(([key]) => key !== 'text').map(([key, value]) => (
                          <div key={key} className="entity-item">
                            <span className="entity-key">{key.replace('_', ' ')}:</span>
                            <span className="entity-value">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
