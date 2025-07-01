const fs = require("fs");
const path = require("path");
const { updateDocument } = require("./ingestor");
const Tesseract = require('tesseract.js');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

// Enhanced OCR simulation that generates realistic data based on file content
const processDocumentContent = async (filePath, fileName) => {
  const ext = path.extname(fileName).toLowerCase();
  let extractedText = '';
  let triedOCR = false;
  try {
    if ([".png", ".jpg", ".jpeg", ".gif", ".bmp", ".tiff"].includes(ext)) {
      // OCR for images
      const { data: { text } } = await Tesseract.recognize(filePath, 'eng');
      extractedText = text;
      triedOCR = true;
    } else if ([".pdf"].includes(ext)) {
      // Try PDF text extraction
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(dataBuffer);
      extractedText = pdfData.text;
      if (!extractedText.trim()) {
        // Fallback to OCR if no text found
        const { data: { text } } = await Tesseract.recognize(filePath, 'eng');
        extractedText = text;
        triedOCR = true;
      }
    } else if ([".docx"].includes(ext)) {
      // Try DOCX text extraction
      const result = await mammoth.extractRawText({ path: filePath });
      extractedText = result.value;
      if (!extractedText.trim()) {
        // Fallback to OCR if no text found
        const { data: { text } } = await Tesseract.recognize(filePath, 'eng');
        extractedText = text;
        triedOCR = true;
      }
    } else {
      // For text-based docs, read as text
      extractedText = fs.readFileSync(filePath, 'utf8');
      if (!extractedText.trim()) {
        // Fallback to OCR if no text found
        const { data: { text } } = await Tesseract.recognize(filePath, 'eng');
        extractedText = text;
        triedOCR = true;
      }
    }
  } catch (err) {
    // Fallback to OCR if not already tried
    if (!triedOCR) {
      try {
        const { data: { text } } = await Tesseract.recognize(filePath, 'eng');
        extractedText = text;
      } catch (ocrErr) {
        extractedText = '';
      }
    } else {
      extractedText = '';
    }
  }
  return { extractedText, entities: {} };
};

// Helper to detect tables in text (simple heuristic: lines with multiple columns separated by tabs or multiple spaces)
function detectTables(text) {
  const lines = text.split('\n');
  const tables = [];
  let currentTable = [];
  for (const line of lines) {
    if (/\t|\s{2,}/.test(line)) {
      currentTable.push(line);
    } else {
      if (currentTable.length > 1) {
        tables.push([...currentTable]);
        currentTable = [];
      } else {
        currentTable = [];
      }
    }
  }
  if (currentTable.length > 1) tables.push(currentTable);
  return tables;
}

// Unified endpoint for file upload, text extraction, and table detection
exports.extractAndAnalyzeDocument = async (req, res) => {
  try {
    if (!req.files || !req.files.document) {
      return res.status(400).json({ success: false, error: 'No document uploaded' });
    }
    const doc = req.files.document;
    const fileName = doc.name;
    const ext = path.extname(fileName).toLowerCase();
    const tempPath = path.join(__dirname, '../../uploaded_docs', `${Date.now()}_${fileName}`);
    await doc.mv(tempPath);

    let extractedText = '';
    let tables = [];
    if ([".png", ".jpg", ".jpeg", ".gif"].includes(ext)) {
      // OCR for images
      const { data: { text } } = await Tesseract.recognize(tempPath, 'eng');
      extractedText = text;
      tables = detectTables(text);
    } else {
      // For text-based docs, read as text
      extractedText = fs.readFileSync(tempPath, 'utf8');
      tables = detectTables(extractedText);
    }

    res.json({
      success: true,
      extractedText,
      tables,
      fileName,
      message: 'Extraction and analysis complete.'
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Extraction failed', details: err.message });
  }
};

exports.extractText = async (req, res) => {
  let { filePath, id } = req.body;

  try {
    // If filePath is not provided, look up by id
    if ((!filePath || filePath === "") && id) {
      const documents = require("./ingestor").documents || [];
      const found = documents.find((d) => d.id === id);
      if (found && found.path) filePath = found.path;
    }

    if (!filePath) {
      return res.status(400).json({
        success: false,
        message: "Document path not found",
        userMessage: "❌ Document not found. Please re-upload.",
      });
    }

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "File not found on disk",
        userMessage: "❌ File not found. Please re-upload.",
      });
    }

    // Get file name from path
    const fileName = path.basename(filePath);

    // Process document content
    const { extractedText, entities } = await processDocumentContent(
      filePath,
      fileName
    );

    // Update document with extracted data and message
    const ingestor = require("./ingestor");
    const doc = ingestor.updateDocument(id, {
      entities,
      status: "Extracted",
      extractedText,
      messages: {
        ...(ingestor.documents.find((d) => d.id === id)?.messages || {}),
        extract: `✅ Text extracted from "${fileName}"! Found ${
          Object.keys(entities).length
        } details.`,
      },
    });

    res.json({
      success: true,
      message: "Extracted successfully",
      userMessage: doc.messages.extract,
      extractedText,
      entities,
      status: "Extracted",
      documentId: id,
      fileName: fileName,
      messages: doc.messages,
    });
  } catch (err) {
    console.error("Extraction error:", err);
    res.status(500).json({
      success: false,
      error: "Extraction failed",
      userMessage: "❌ Failed to extract text. Please try again.",
    });
  }
};
