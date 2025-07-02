const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { uploadDocument, listDocuments, getDocument, uploadMultipleDocuments } = require('../services/ingestor');
const { extractText, extractAndAnalyzeDocument } = require('../services/extractor');
const { classifyDocument } = require('../services/classifier');
const { routeDocument } = require('../services/router');

router.post('/upload', uploadDocument);
router.post('/upload-multiple', uploadMultipleDocuments);
router.post('/analyze', extractAndAnalyzeDocument);
router.post('/extract', extractText);
router.post('/classify', classifyDocument);
router.post('/route', routeDocument);

// List all documents
router.get('/', listDocuments);
// Get a single document by ID
router.get('/:id', getDocument);

// Download document file
router.get('/download/:filename', (req, res) => {
  const filename = req.params.filename;
  const uploadDir = path.join(__dirname, '..', '..', 'uploaded_docs');
  const filePath = path.join(uploadDir, filename);
  
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({
      success: false,
      error: 'File not found',
      userMessage: '❌ File not found. It may have been deleted or moved.'
    });
  }
  
  // Set appropriate headers for download
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.setHeader('Content-Type', 'application/octet-stream');
  
  // Stream the file
  const fileStream = fs.createReadStream(filePath);
  fileStream.pipe(res);
  
  fileStream.on('error', (err) => {
    console.error('File stream error:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to download file',
      userMessage: '❌ Failed to download file. Please try again.'
    });
  });
});

// Manual actions (re-trigger steps for a document)
router.post('/:id/extract', (req, res) => extractText({ ...req, body: { ...req.body, id: req.params.id } }, res));
router.post('/:id/classify', (req, res) => classifyDocument({ ...req, body: { ...req.body, id: req.params.id } }, res));
router.post('/:id/route', (req, res) => routeDocument({ ...req, body: { ...req.body, id: req.params.id } }, res));

module.exports = router;