import React, { useEffect, useState } from 'react';
import { listDocuments } from '../api';

export default function Dashboard() {
  const [documents, setDocuments] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    listDocuments().then(setDocuments).catch(err => setError(err.message));
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
          <span style={{ marginRight: '12px' }}>📊</span>
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
        <table style={{ width: '100%', marginTop: 16 }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Status</th>
              <th>Type</th>
              <th>Confidence</th>
              <th>Destination</th>
            </tr>
          </thead>
          <tbody>
            {documents.map(doc => (
              <tr key={doc.id}>
                <td>{doc.name}</td>
                <td>{doc.status}</td>
                <td>{doc.type || '-'}</td>
                <td>{doc.confidence || '-'}</td>
                <td>{doc.destination || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
