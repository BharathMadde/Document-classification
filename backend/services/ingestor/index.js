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
  const io = req.app.get('io');

  doc.mv(docPath, async (err) => {
    if (err) {
      console.error('File upload error:', err);
      return res.status(500).json({ error: 'File upload failed', details: err.message });
    }
    
    try {
      // Save metadata and initial status
      const metadata = {
        id,
        name: doc.name,
        path: docPath,
        status: 'Ingested',
        type: null,
        confidence: null,
        entities: null,
        destination: null,
        timestamps: { ingested: new Date().toISOString() },
      };
      documents.push(metadata);
      
      // Emit real-time update
      io.emit('documentUpdated', metadata);
      
      res.json({ 
        message: 'Document ingested successfully', 
        id, 
        metadata,
        success: true
      });

      // Auto-trigger extraction after upload
      setTimeout(async () => {
        try {
          const { extractText } = require('../extractor');
          const mockReq = { body: { id, filePath: docPath }, app: req.app };
          const mockRes = {
            json: (data) => {
              if (data.extractedText) {
                const updatedDoc = updateDocument(id, {
                  entities: data.entities,
                  status: 'Extracted',
                });
                io.emit('documentUpdated', updatedDoc);
                
                // Auto-trigger classification
                setTimeout(async () => {
                  try {
                    const { classifyDocument } = require('../classifier');
                    const classifyReq = { body: { id, extractedText: data.extractedText }, app: req.app };
                    const classifyRes = {
                      json: (classifyData) => {
                        if (classifyData.type) {
                          const classifiedDoc = updateDocument(id, {
                            type: classifyData.type,
                            confidence: classifyData.confidence,
                            status: 'Classified',
                          });
                          io.emit('documentUpdated', classifiedDoc);
                          
                          // Auto-trigger routing
                          setTimeout(async () => {
                            try {
                              const { routeDocument } = require('../router');
                              const routeReq = { body: { id, type: classifyData.type }, app: req.app };
                              const routeRes = {
                                json: (routeData) => {
                                  if (routeData.destination) {
                                    const routedDoc = updateDocument(id, {
                                      status: 'Routed',
                                      destination: routeData.destination,
                                    });
                                    io.emit('documentUpdated', routedDoc);
                                  }
                                },
                                status: () => ({ json: (err) => {
                                  const failedDoc = updateDocument(id, { status: 'Human Intervention' });
                                  io.emit('documentUpdated', failedDoc);
                                }})
                              };
                              await routeDocument(routeReq, routeRes);
                            } catch (routeErr) {
                              console.error('Auto-routing failed:', routeErr);
                              const failedDoc = updateDocument(id, { status: 'Human Intervention' });
                              io.emit('documentUpdated', failedDoc);
                            }
                          }, 1000);
                        }
                      },
                      status: () => ({ json: (err) => {
                        const failedDoc = updateDocument(id, { status: 'Human Intervention' });
                        io.emit('documentUpdated', failedDoc);
                      }})
                    };
                    await classifyDocument(classifyReq, classifyRes);
                  } catch (classifyErr) {
                    console.error('Auto-classification failed:', classifyErr);
                    const failedDoc = updateDocument(id, { status: 'Human Intervention' });
                    io.emit('documentUpdated', failedDoc);
                  }
                }, 1000);
              }
            },
            status: () => ({ json: (err) => {
              const failedDoc = updateDocument(id, { status: 'Human Intervention' });
              io.emit('documentUpdated', failedDoc);
            }})
          };
          await extractText(mockReq, mockRes);
        } catch (extractErr) {
          console.error('Auto-extraction failed:', extractErr);
          const failedDoc = updateDocument(id, { status: 'Human Intervention' });
          io.emit('documentUpdated', failedDoc);
        }
      }, 1000);
      
    } catch (error) {
      console.error('Document processing error:', error);
      res.status(500).json({ error: 'Document processing failed', details: error.message });
    }
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