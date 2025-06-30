import React, { useEffect, useState } from 'react';
import { listDocuments } from '../api';

export default function HumanIntervention() {
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const docs = await listDocuments();
        setDocuments(docs.filter(doc => doc.status === 'Human Intervention'));
      } catch (err) {
        setDocuments([]);
      }
    };
    fetchDocs();
  }, []);

  return (
    <div className="page-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">
          <span style={{ marginRight: '12px' }}>🧑‍💼</span>
          Human Intervention
        </h1>
        <p className="dashboard-subtitle">
          Documents that require manual review or intervention due to AI processing failure.
        </p>
      </div>
      <div className="recent-documents">
        <div className="recent-header">
          <h2 className="section-title">Manual Review Queue</h2>
        </div>
        {documents.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📄</div>
            <div className="empty-title">No documents need human intervention</div>
            <div className="empty-description">All documents have been processed by AI.</div>
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
} 