// React dashboard UI

import React, { useEffect, useState } from 'react';

const API_URL = 'http://localhost:3000/api/documents';

function WorkflowTracker({ status, timestamps, confidence }) {
  const stages = [
    { key: 'Ingested', label: 'Ingested' },
    { key: 'Extracted', label: 'Extracted' },
    { key: 'Classified', label: 'Classified' },
    { key: 'Routed', label: 'Routed' },
  ];
  const currentIdx = stages.findIndex(s => s.key === status);
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
      {stages.map((stage, idx) => (
        <div key={stage.key} style={{ display: 'flex', alignItems: 'center' }}>
          <div
            title={timestamps && timestamps[stage.key.toLowerCase()] ?
              `${new Date(timestamps[stage.key.toLowerCase()]).toLocaleString()}${stage.key === 'Classified' && confidence ? `\nConfidence: ${confidence}` : ''}` : ''}
            style={{
              width: 24, height: 24, borderRadius: '50%',
              background: idx <= currentIdx ? '#4caf50' : '#ccc',
              color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 'bold', fontSize: 14
            }}
          >
            {idx + 1}
          </div>
          {idx < stages.length - 1 && <div style={{ width: 40, height: 4, background: idx < currentIdx ? '#4caf50' : '#ccc' }} />}
        </div>
      ))}
    </div>
  );
}

function App() {
  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    fetch(API_URL)
      .then(res => res.json())
      .then(setDocuments);
  }, [refresh]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('document', file);
    await fetch(`${API_URL}/upload`, { method: 'POST', body: formData });
    setUploading(false);
    setFile(null);
    setRefresh(r => r + 1);
  };

  const manualAction = async (id, action, body = {}) => {
    await fetch(`${API_URL}/${id}/${action}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    setRefresh(r => r + 1);
  };

  return (
    <div style={{ maxWidth: 900, margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h1>Document Workflow Dashboard</h1>
      {/* Upload Panel */}
      <form onSubmit={handleUpload} style={{ marginBottom: 24 }}>
        <input type="file" onChange={e => setFile(e.target.files[0])} />
        <button type="submit" disabled={uploading || !file} style={{ marginLeft: 8 }}>
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
        <span style={{ marginLeft: 16, color: '#888' }}>[Mailbox connect coming soon]</span>
      </form>
      {/* Document Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 24 }}>
        <thead>
          <tr style={{ background: '#f0f0f0' }}>
            <th>Name</th>
            <th>Status</th>
            <th>Type</th>
            <th>Last Updated</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {documents.map(doc => (
            <React.Fragment key={doc.id}>
              <tr
                style={{ cursor: 'pointer', background: selectedDoc === doc.id ? '#e3f2fd' : '' }}
                onClick={() => setSelectedDoc(selectedDoc === doc.id ? null : doc.id)}
              >
                <td>{doc.name}</td>
                <td>{doc.status}</td>
                <td>{doc.type || '-'}</td>
                <td>{doc.timestamps && doc.timestamps.ingested ? new Date(doc.timestamps.ingested).toLocaleString() : '-'}</td>
                <td>
                  <button onClick={e => { e.stopPropagation(); manualAction(doc.id, 'extract', { filePath: doc.path }); }}>Re-extract</button>
                  <button onClick={e => { e.stopPropagation(); manualAction(doc.id, 'classify', { extractedText: doc.entities || '' }); }}>Re-classify</button>
                  <button onClick={e => { e.stopPropagation(); manualAction(doc.id, 'route', { type: doc.type || '' }); }}>Re-route</button>
                </td>
              </tr>
              {selectedDoc === doc.id && (
                <tr>
                  <td colSpan={5} style={{ background: '#f9f9f9' }}>
                    <div style={{ padding: 16 }}>
                      <WorkflowTracker status={doc.status} timestamps={doc.timestamps} confidence={doc.confidence} />
                      <div><b>Entities:</b> <pre>{JSON.stringify(doc.entities, null, 2)}</pre></div>
                      <div><b>Metadata:</b> <pre>{JSON.stringify(doc, null, 2)}</pre></div>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
