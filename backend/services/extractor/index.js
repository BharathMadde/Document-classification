const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
const { updateDocument, getDocument, documents } = require('../ingestor');

const OCR_SPACE_API_KEY = process.env.OCR_SPACE_API_KEY || 'K82657515988957'; // 'helloworld' is a demo key

exports.extractText = async (req, res) => {
  let { filePath, id } = req.body;
  try {
    // If filePath is not provided, look up by id
    if ((!filePath || filePath === '') && id) {
      const found = documents.find(d => d.id === id);
      if (found && found.path) filePath = found.path;
    }
    if (!filePath) {
      return res.status(400).json({ error: 'No filePath or id provided' });
    }
    // Read file as stream
    const fileStream = fs.createReadStream(filePath);
    const form = new FormData();
    form.append('file', fileStream);
    form.append('language', 'eng');
    form.append('isOverlayRequired', 'false');
    // API key
    const headers = {
      ...form.getHeaders(),
      apikey: OCR_SPACE_API_KEY,
    };
    const response = await axios.post('https://api.ocr.space/parse/image', form, { headers });
    const parsed = response.data;
    if (!parsed.ParsedResults || !parsed.ParsedResults[0]) {
      throw new Error('No text extracted');
    }
    const text = parsed.ParsedResults[0].ParsedText;
    // Simple entity extraction (demo)
    const entities = {};
    const invoiceMatch = text.match(/Invoice\s*#(\d+)/i);
    if (invoiceMatch) entities.invoice_number = invoiceMatch[1];
    const dateMatch = text.match(/Date[:\s]*([\d\-\/]+)/i);
    if (dateMatch) entities.date = dateMatch[1];
    const totalMatch = text.match(/Total[:\s]*\$?(\d+[\.,]?\d*)/i);
    if (totalMatch) entities.total = totalMatch[1];
    // Update document
    const doc = updateDocument(id, {
      entities,
      status: 'Extracted',
    });
    res.json({ extractedText: text, entities, status: 'Extracted', timestamps: doc ? doc.timestamps : {} });
  } catch (err) {
    res.status(500).json({ error: 'OCR failed', details: err.message });
  }
}; 