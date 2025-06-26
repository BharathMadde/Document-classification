import React, { useState, useEffect } from 'react';
import { uploadDocument, extractDocument, listDocuments } from '../api';

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
  const [autoExtractedId, setAutoExtractedId] = useState(null);

  const fetchDocuments = async () => {
    try {
      const docs = await listDocuments();
      setDocuments(docs);
    } catch (err) {}
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  // Auto-extract the most recent 'Ingested' document
  useEffect(() => {
    const ingestedDoc = documents.find(doc => doc.status === 'Ingested');
    if (ingestedDoc && ingestedDoc.id !== autoExtractedId) {
      setAutoExtractedId(ingestedDoc.id);
      handleAutoExtract(ingestedDoc.id);
    }
    // eslint-disable-next-line
  }, [documents]);

  const handleAutoExtract = async (id) => {
    setError(null);
    setResult(null);
    try {
      const res = await extractDocument(id);
      setResult(res);
      await fetchDocuments();
    } catch (err) {
      setError(err.message);
      // Simulate status update to 'Human Intervention' in frontend
      setDocuments(prev => prev.map(doc => doc.id === id ? { ...doc, status: 'Human Intervention' } : doc));
    }
  };

  const handleExtract = async () => {
    if (!selectedId) return;
    setIsExtracting(true);
    setError(null);
    setResult(null);
    try {
      const res = await extractDocument(selectedId);
      setResult(res);
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
            View and download extracted data from processed documents
          </span>
        </div>
        <div className="empty-state">
          <div className="empty-icon">📄</div>
          <div className="empty-title">No extraction results yet</div>
          <div className="empty-description">Upload documents to see AI extraction results</div>
        </div>
      </div>
    </div>
  );
}
