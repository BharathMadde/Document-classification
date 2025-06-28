import React, { useEffect, useState } from 'react';
import { listDocuments } from '../api';
import { BarChart2 } from 'lucide-react';

export default function Dashboard() {
  const [documents, setDocuments] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    listDocuments()
      .then(response => {
        // Handle the response structure from backend
        if (response.success && Array.isArray(response.documents)) {
          setDocuments(response.documents);
        } else if (Array.isArray(response)) {
          // Fallback: if response is directly an array
          setDocuments(response);
        } else {
          setDocuments([]);
          setError('Invalid response format from server');
        }
      })
      .catch(err => {
        setError(err.message);
        setDocuments([]);
      });
  }, []);

  const stats = [
    { title: 'Total Documents', value: documents.length, icon: '📄', color: 'blue' },
    { title: 'Processed', value: documents.filter(d => d.status === 'Routed').length, icon: '✅', color: 'green' },
    { title: 'Processing', value: documents.filter(d => d.status !== 'Routed' && d.status !== 'Ingested').length, icon: '⚡', color: 'yellow' },
    { title: 'Failed', value: 0, icon: '❌', color: 'red' },
  ];

  return (
    <div className="page-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">
          <span style={{ marginRight: '12px', verticalAlign: 'middle' }}><BarChart2 size={32} color="#3b82f6" /></span>
          Document Dashboard
        </h1>
        <p className="dashboard-subtitle">
          Real-time document stats and workflow overview
        </p>
      </div>
      <div className="stats-grid">
        {stats.map((stat, idx) => (
          <div key={idx} className="stat-card" style={{ borderLeft: `6px solid ${stat.color}` }}>
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-title">{stat.title}</div>
            <div className="stat-value">{stat.value}</div>
          </div>
        ))}
      </div>
      <div className="recent-documents">
        <div className="recent-header">
          <h2 className="section-title">Recent Documents</h2>
        </div>
        {error && <div style={{ color: 'red' }}>{error}</div>}
        <table style={{ width: '100%', marginTop: 16, borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'center', padding: '8px' }}>Name</th>
              <th style={{ textAlign: 'center', padding: '8px' }}>Status</th>
              <th style={{ textAlign: 'center', padding: '8px' }}>Type</th>
              <th style={{ textAlign: 'center', padding: '8px' }}>Confidence</th>
              <th style={{ textAlign: 'center', padding: '8px' }}>Destination</th>
            </tr>
          </thead>
          <tbody>
            {documents.map(doc => (
              <tr key={doc.id}>
                <td style={{ textAlign: 'center', padding: '8px', verticalAlign: 'middle' }}>{doc.name}</td>
                <td style={{ textAlign: 'center', padding: '8px', verticalAlign: 'middle' }}>{doc.status}</td>
                <td style={{ textAlign: 'center', padding: '8px', verticalAlign: 'middle' }}>{doc.type || '-'}</td>
                <td style={{ textAlign: 'center', padding: '8px', verticalAlign: 'middle' }}>{doc.confidence || '-'}</td>
                <td style={{ textAlign: 'center', padding: '8px', verticalAlign: 'middle' }}>{doc.destination || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
