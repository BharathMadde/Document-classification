const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');

// In-memory document store
const documents = [];
exports.documents = documents;
const uploadDir = path.join(__dirname, '..', '..', 'uploaded_docs');

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';

async function processDocumentWorkflow(id) {
  try {
    const start = Date.now();
    // 1. Extract
    await new Promise(resolve => setTimeout(resolve, 2500)); // 2.5s delay
    try { await axios.post(`${BACKEND_URL}/api/extract`, { id }); } catch (e) { console.error('Extract error', e.message); }
    // 2. Classify
    await new Promise(resolve => setTimeout(resolve, 2500)); // 2.5s delay
    try { await axios.post(`${BACKEND_URL}/api/classify`, { id }); } catch (e) { console.error('Classify error', e.message); }
    // 3. Route
    await new Promise(resolve => setTimeout(resolve, 2500)); // 2.5s delay
    try { await axios.post(`${BACKEND_URL}/api/route`, { id }); } catch (e) { console.error('Route error', e.message); }
    // Ensure total time does not exceed 10-12s
    const elapsed = Date.now() - start;
    if (elapsed < 10000) await new Promise(resolve => setTimeout(resolve, 10000 - elapsed));
    console.log(`Workflow for ${id} completed in ${Date.now() - start}ms`);
  } catch (err) {
    console.error('Auto workflow error:', err.message);
  }
}

exports.uploadDocument = async (req, res) => {
  if (!req.files?.document) {
    return res.status(400).json({ 
      success: false,
      error: 'No document uploaded',
      userMessage: '❌ Please select a file to upload.'
    });
  }

  const doc = req.files.document;
  const id = uuidv4();
  const docPath = path.join(uploadDir, `${id}_${doc.name}`);

  doc.mv(docPath, (err) => {
    if (err) return res.status(500).json({ 
      success: false,
      error: err.message,
      userMessage: '❌ Failed to save document. Please try again.'
    });
    
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
    
    res.json({ 
      success: true,
      message: 'Upload successful', 
      id, 
      metadata,
      userMessage: `✅ "${doc.name}" uploaded!`,
      summary: {
        fileName: doc.name,
        fileSize: `${(doc.size / 1024).toFixed(1)} KB`,
        status: 'Ready for processing'
      }
    });
    // Trigger full workflow after response
    processDocumentWorkflow(id);
  });
};

// List all documents
exports.listDocuments = (req, res) => {
  res.json({
    success: true,
    documents: documents,
    count: documents.length,
    userMessage: `📋 Found ${documents.length} document(s) in the system.`
  });
};

// Get a single document by ID
exports.getDocument = (req, res) => {
  const doc = documents.find(d => d.id === req.params.id);
  if (!doc) return res.status(404).json({ 
    success: false,
    error: 'Document not found',
    userMessage: '❌ Document not found. It may have been deleted or moved.'
  });
  res.json({
    success: true,
    document: doc,
    userMessage: `📄 Document "${doc.name}" details retrieved.`
  });
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