import React, { useState, useEffect, useRef } from 'react';
import { uploadDocument, listDocuments, initializeSocket, getSocket } from '../api';

const SUPPORTED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.txt', '.jpg', '.jpeg', '.png', '.gif'];

function getFileExtension(filename) {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 1).toLowerCase();
}

export default function Ingest() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isIngesting, setIsIngesting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [recentActivity, setRecentActivity] = useState([]);
  const fileInputRef = useRef(null);
  const dragCounter = useRef(0);

  const features = [
    {
      title: 'Smart Validation',
      icon: '🔍',
      description: 'Automatically validate file formats, content type, and document structure for accurate classification.',
      items: ['Format validation', 'Content analysis', 'Structure detection']
    },
    {
      title: 'Metadata Extraction',
      icon: '⚡',
      description: 'Extract relevant metadata from document properties and embedded information for enhanced processing.',
      items: ['File properties', 'Embedded metadata', 'Content insights']
    },
    {
      title: 'Quality Assessment',
      icon: '✅',
      description: 'Analyze document quality and readiness for processing with confidence scoring for optimal results.',
      items: ['Quality scoring', 'Readiness check', 'Optimization tips']
    },
    {
      title: 'AI Preprocessing',
      icon: '🤖',
      description: 'Intelligent preprocessing with AI-powered document enhancement and optimization.',
      items: ['Image enhancement', 'Text correction', 'Format optimization']
    }
  ];

  const fetchDocuments = async () => {
    try {
      const docs = await listDocuments();
      setDocuments(docs);
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
      
      // Add to recent activity
      setRecentActivity(prev => [{
        id: document.id,
        name: document.name,
        status: document.status,
        timestamp: new Date().toISOString()
      }, ...prev.slice(0, 9)]);
    });

    return () => {
      socket.off('documentUpdated');
    };
  }, []);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragIn = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragOut = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleFileUpload(file);
      e.dataTransfer.clearData();
    }
  };

  const handleFileUpload = async (file) => {
    if (!file) return;
    
    setSelectedFile(file);
    setError(null);
    setSuccess(null);
    
    if (file.size > 20 * 1024 * 1024) {
      setError('File size must be less than 20MB.');
      return;
    }
    
    const fileExt = '.' + getFileExtension(file.name);
    if (!SUPPORTED_EXTENSIONS.includes(fileExt)) {
      setError('Unsupported file type. Please upload PDF, DOC, DOCX, TXT, or image files.');
      return;
    }
    
    setIsIngesting(true);
    try {
      const result = await uploadDocument(file);
      if (result.success) {
        setSuccess('Document ingested successfully! Processing will begin automatically.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsIngesting(false);
    }
  };

  const handleIngestUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      await handleFileUpload(file);
    }
  };

  return (
    <div className="page-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">
          <span style={{ marginRight: '12px' }}>⬆️</span>
          AI-Powered Document Ingestion
        </h1>
        <p className="dashboard-subtitle">
          Upload and ingest documents with intelligent metadata extraction and validation. 
          Our AI analyzes file structure, content type, and quality to prepare documents for processing.
        </p>
      </div>

      <div className="upload-section">
        <div className="section-title">
          <span style={{ marginRight: '8px' }}>🤖</span>
          AI Document Ingestion
        </div>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
          Upload files for AI-powered ingestion with smart validation and preprocessing
        </p>
        
        <div 
          className={`upload-area ${isDragging ? 'drag-over' : ''}`}
          onDrag={handleDrag}
          onDragStart={handleDrag}
          onDragEnd={handleDrag}
          onDragOver={handleDrag}
          onDragEnter={handleDragIn}
          onDragLeave={handleDragOut}
          onDrop={handleDrop}
        >
          <div className="upload-icon">⬆️</div>
          <div className="upload-title">
            {isDragging ? 'Drop file here' : 'Upload for AI Ingestion'}
          </div>
          <div className="upload-description">
            {isDragging 
              ? 'Release to upload and start AI processing'
              : 'Drag & drop files here or click to browse'
            }
          </div>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleIngestUpload}
            accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
            style={{ display: 'none' }}
            id="ingest-upload"
          />
          <label htmlFor="ingest-upload" className="upload-button">
            {isIngesting ? 'Processing...' : 'Browse Files'}
          </label>
          {selectedFile && (
            <div style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>
              Selected: {selectedFile.name}
            </div>
          )}
          {success && <div style={{ color: 'green', marginTop: 8, fontWeight: 'bold' }}>{success}</div>}
          {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
          <div style={{ marginTop: '16px', fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>
            Maximum file size: 20MB | Supported: PDF, DOC, DOCX, TXT, JPG, PNG, GIF
          </div>
        </div>
      </div>

      <div className="pipeline-section">
        <div className="section-title">
          <span style={{ marginRight: '8px' }}>🔧</span>
          AI Ingestion Features
        </div>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
          Advanced AI algorithms to intelligently process document ingestion
        </p>
        
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-header">
                <div className="feature-icon" style={{
                  background: index === 0 ? 'var(--accent-primary)' : index === 1 ? 'var(--accent-secondary)' : index === 2 ? 'var(--accent-tertiary)' : '#3730a3',
                  color: 'white'
                }}>
                  {feature.icon}
                </div>
                <div className="feature-title">{feature.title}</div>
              </div>
              <div className="feature-description">{feature.description}</div>
              <ul className="feature-list">
                {feature.items.map((item, itemIndex) => (
                  <li key={itemIndex}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="recent-documents">
        <div className="recent-header">
          <h2 className="section-title">Recent Activity</h2>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Real-time document processing updates
          </span>
        </div>
        {recentActivity.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">⚡</div>
            <div className="empty-title">No recent activity</div>
            <div className="empty-description">Activity will appear here as documents are processed</div>
          </div>
        ) : (
          <div className="activity-list">
            {recentActivity.map(activity => (
              <div key={`${activity.id}-${activity.timestamp}`} className="activity-item">
                <div className="activity-icon">
                  {activity.status === 'Ingested' && '📤'}
                  {activity.status === 'Extracted' && '🔍'}
                  {activity.status === 'Classified' && '🏷️'}
                  {activity.status === 'Routed' && '🚀'}
                  {activity.status === 'Human Intervention' && '🧑‍💼'}
                </div>
                <div className="activity-content">
                  <div className="activity-title">{activity.name}</div>
                  <div className="activity-status">Status: {activity.status}</div>
                  <div className="activity-time">
                    {new Date(activity.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="recent-documents">
        <div className="recent-header">
          <h2 className="section-title">Document Management</h2>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Manage and monitor ingested documents with AI insights
          </span>
        </div>
        {documents.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📄</div>
            <div className="empty-title">No documents uploaded yet</div>
            <div className="empty-description">Upload your first documents to get started with AI processing</div>
          </div>
        ) : (
          <div className="documents-table-container">
            <table className="documents-table">
              <thead>
                <tr>
                  <th>Document Name</th>
                  <th>Status</th>
                  <th>Type</th>
                  <th>Confidence</th>
                  <th>Destination</th>
                  <th>Processed</th>
                </tr>
              </thead>
              <tbody>
                {documents.map(doc => (
                  <tr key={doc.id}>
                    <td className="document-name">{doc.name}</td>
                    <td>
                      <span className={`status-badge status-${doc.status.toLowerCase().replace(' ', '-')}`}>
                        {doc.status}
                      </span>
                    </td>
                    <td>{doc.type || '-'}</td>
                    <td>{doc.confidence ? `${Math.round(doc.confidence * 100)}%` : '-'}</td>
                    <td>{doc.destination || '-'}</td>
                    <td>
                      {doc.timestamps?.ingested 
                        ? new Date(doc.timestamps.ingested).toLocaleString()
                        : '-'
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
