const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// In-memory document store
const documents = [];
exports.documents = documents;
const uploadDir = path.join(__dirname, '..', '..', '..', 'uploaded_docs');

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

exports.uploadDocument = async (req, res) => {
  if (!req.files?.document) {
    return res.status(400).json({ error: 'No document uploaded' });
  }

  const doc = req.files.document;
  const id = uuidv4();
  const docPath = path.join(uploadDir, `${id}_${doc.name}`);

  doc.mv(docPath, (err) => {
    if (err) return res.status(500).send(err);
    // Save metadata and initial status
    const metadata = {
      id,
      name: doc.name,
      path: docPath,
      status: 'Ingested',
      type: null,
      confidence: null,
      entities: null,
      timestamps: { ingested: new Date().toISOString() },
    };
    documents.push(metadata);
    res.json({ message: 'Document uploaded', id, metadata });
  });
};

// List all documents
exports.listDocuments = (req, res) => {
  res.json(documents);
};

// Get a single document by ID
exports.getDocument = (req, res) => {
  const doc = documents.find(d => d.id === req.params.id);
  if (!doc) return res.status(404).json({ error: 'Document not found' });
  res.json(doc);
};

// Update document status helper
exports.updateDocument = (id, updates) => {
  const doc = documents.find(d => d.id === id);
  if (doc) {
    Object.assign(doc, updates);
    // Update timestamps for status changes
    if (updates.status) {
      doc.timestamps = doc.timestamps || {};
      doc.timestamps[updates.status.toLowerCase()] = new Date().toISOString();
    }
  }
  return doc;
}; 