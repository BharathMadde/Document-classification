const express = require('express');
const router = express.Router();
const { uploadDocument, listDocuments, getDocument } = require('../services/ingestor');
const { extractText } = require('../services/extractor');
const { classifyDocument } = require('../services/classifier');
const { routeDocument } = require('../services/router');

router.post('/upload', uploadDocument);
router.post('/extract', extractText);
router.post('/classify', classifyDocument);
router.post('/route', routeDocument);

// List all documents
router.get('/', listDocuments);
// Get a single document by ID
router.get('/:id', getDocument);
// Manual actions (re-trigger steps for a document)
router.post('/:id/extract', (req, res) => extractText({ ...req, body: { ...req.body, id: req.params.id } }, res));
router.post('/:id/classify', (req, res) => classifyDocument({ ...req, body: { ...req.body, id: req.params.id } }, res));
router.post('/:id/route', (req, res) => routeDocument({ ...req, body: { ...req.body, id: req.params.id } }, res));

module.exports = router;