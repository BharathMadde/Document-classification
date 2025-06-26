import React, { useState, useEffect } from 'react';
import { listDocuments, initializeSocket } from '../api';

export default function Dashboard() {
  const [documents, setDocuments] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    ingested: 0,
    extracted: 0,
    classified: 0,
    routed: 0,
    humanIntervention: 0
  });

  const calculateStats = (docs) => {
    const stats = {
      total: docs.length,
      ingested: docs.filter(d => d.status === 'Ingested').length,
      extracted: docs.filter(d => d.status === 'Extracted').length,
      classified: docs.filter(d => d.status === 'Classified').length,
      routed: docs.filter(d => d.status === 'Routed').length,
      humanIntervention: docs.filter(d => d.status === 'Human Intervention').length
    };
    setStats(stats);
  };

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const docs = await listDocuments();
        setDocuments(docs);
        calculateStats(docs);
      } catch (err) {
        setDocuments([]);
      }
    };
    fetchDocs();

    // Initialize socket connection
    const socket = initializeSocket();

    socket.on('documentUpdated', (document) => {
      setDocuments(prev => {
        const index = prev.findIndex(d => d.id === document.id);
        let updated;
        if (index >= 0) {
          updated = [...prev];
          updated[index] = document;
        } else {
          updated = [document, ...prev];
        }
        calculateStats(updated);
        return updated;
      });
    });

    return () => {
      socket.off('documentUpdated');
    };
  }, []);

  return (
    <div className="page-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">
          <span style={{ marginRight: '12px' }}>📊</span>
          Document Dashboard
        </h1>
        <p className="dashboard-subtitle">
          Real-time document stats and workflow overview
        </p>
      </div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ backgroundColor: '#3b82f6' }}>📊</div>
            <div className="stat-title">Total Documents</div>
          </div>
          <div className="stat-value">{stats.total}</div>
          <div className="stat-description">Documents processed today</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ backgroundColor: '#10b981' }}>✅</div>
            <div className="stat-title">Successfully Routed</div>
          </div>
          <div className="stat-value">{stats.routed}</div>
          <div className="stat-description">End-to-end processing completed</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ backgroundColor: '#f59e0b' }}>⚙️</div>
            <div className="stat-title">In Progress</div>
          </div>
          <div className="stat-value">{stats.ingested + stats.extracted + stats.classified}</div>
          <div className="stat-description">Currently being processed</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ backgroundColor: '#ef4444' }}>🧑‍💼</div>
            <div className="stat-title">Human Review</div>
          </div>
          <div className="stat-value">{stats.humanIntervention}</div>
          <div className="stat-description">Requires manual intervention</div>
        </div>
      </div>
      <div className="recent-documents">
        <div className="recent-header">
          <h2 className="section-title">Recent Documents</h2>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Latest document processing activity - updates in real-time
          </span>
        </div>
        {documents.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📄</div>
            <div className="empty-title">No documents processed yet</div>
            <div className="empty-description">Upload your first documents to see them here</div>
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
                  <th>Last Updated</th>
                </tr>
              </thead>
              <tbody>
                {documents.slice(0, 10).map(doc => (
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
                      {doc.timestamps?.[doc.status.toLowerCase()] 
                        ? new Date(doc.timestamps[doc.status.toLowerCase()]).toLocaleString()
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