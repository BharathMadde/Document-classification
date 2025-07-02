const fs = require("fs");
const path = require("path");
const { updateDocument } = require("./ingestor");
const Tesseract = require('tesseract.js');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI("AIzaSyBrA0LGtMg26-vYg_6qKTxyQK2cn6ZWBVs");

// Enhanced text extraction with multiple fallback strategies
const extractTextFromFile = async (filePath, fileName) => {
  const ext = path.extname(fileName).toLowerCase();
  let extractedText = '';
  let extractionMethod = '';
  let confidence = 0.5;

  try {
    // Handle different file types with appropriate extraction methods
    if ([".png", ".jpg", ".jpeg", ".gif", ".bmp", ".tiff"].includes(ext)) {
      // Image files - use OCR
      console.log(`Extracting text from image: ${fileName}`);
      const { data: { text } } = await Tesseract.recognize(filePath, 'eng', {
        logger: m => console.log(m)
      });
      extractedText = text.trim();
      extractionMethod = 'OCR';
      confidence = extractedText.length > 10 ? 0.8 : 0.3;
      
    } else if (ext === ".pdf") {
      // PDF files - try text extraction first, then OCR if needed
      console.log(`Extracting text from PDF: ${fileName}`);
      try {
        const dataBuffer = fs.readFileSync(filePath);
        const pdfData = await pdfParse(dataBuffer);
        extractedText = pdfData.text.trim();
        extractionMethod = 'PDF Text Extraction';
        confidence = 0.9;
        
        // If no text found, try OCR
        if (!extractedText || extractedText.length < 10) {
          console.log(`No text found in PDF, trying OCR: ${fileName}`);
          const { data: { text } } = await Tesseract.recognize(filePath, 'eng');
          extractedText = text.trim();
          extractionMethod = 'PDF OCR';
          confidence = extractedText.length > 10 ? 0.7 : 0.3;
        }
      } catch (pdfErr) {
        console.log(`PDF text extraction failed, trying OCR: ${fileName}`);
        const { data: { text } } = await Tesseract.recognize(filePath, 'eng');
        extractedText = text.trim();
        extractionMethod = 'PDF OCR Fallback';
        confidence = extractedText.length > 10 ? 0.6 : 0.3;
      }
      
    } else if ([".docx", ".doc"].includes(ext)) {
      // Word documents
      console.log(`Extracting text from Word document: ${fileName}`);
      try {
        const result = await mammoth.extractRawText({ path: filePath });
        extractedText = result.value.trim();
        extractionMethod = 'Word Document';
        confidence = 0.9;
        
        // If no text found, try OCR
        if (!extractedText || extractedText.length < 10) {
          console.log(`No text found in Word doc, trying OCR: ${fileName}`);
          const { data: { text } } = await Tesseract.recognize(filePath, 'eng');
          extractedText = text.trim();
          extractionMethod = 'Word OCR';
          confidence = extractedText.length > 10 ? 0.7 : 0.3;
        }
      } catch (wordErr) {
        console.log(`Word extraction failed, trying OCR: ${fileName}`);
        const { data: { text } } = await Tesseract.recognize(filePath, 'eng');
        extractedText = text.trim();
        extractionMethod = 'Word OCR Fallback';
        confidence = extractedText.length > 10 ? 0.6 : 0.3;
      }
      
    } else if (ext === ".txt") {
      // Plain text files
      console.log(`Reading text file: ${fileName}`);
      extractedText = fs.readFileSync(filePath, 'utf8').trim();
      extractionMethod = 'Plain Text';
      confidence = 1.0;
      
    } else {
      // Unknown file type - try OCR as last resort
      console.log(`Unknown file type, trying OCR: ${fileName}`);
      try {
        const { data: { text } } = await Tesseract.recognize(filePath, 'eng');
        extractedText = text.trim();
        extractionMethod = 'OCR for Unknown Type';
        confidence = extractedText.length > 10 ? 0.5 : 0.2;
      } catch (ocrErr) {
        extractedText = '';
        extractionMethod = 'Failed';
        confidence = 0.0;
      }
    }

    // If we still have no text, try Gemini Vision API for images
    if ((!extractedText || extractedText.length < 10) && 
        [".png", ".jpg", ".jpeg", ".gif", ".bmp", ".tiff"].includes(ext)) {
      console.log(`Trying Gemini Vision API for: ${fileName}`);
      try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const imageData = fs.readFileSync(filePath);
        const base64Image = imageData.toString('base64');
        
        const prompt = `Extract all text content from this image. If there's no readable text, describe what you see in the image. Return only the extracted text or description.`;
        
        const result = await model.generateContent([
          prompt,
          {
            inlineData: {
              data: base64Image,
              mimeType: `image/${ext.slice(1)}`
            }
          }
        ]);
        
        const geminiText = result.response.text().trim();
        if (geminiText && geminiText.length > 5) {
          extractedText = geminiText;
          extractionMethod = 'Gemini Vision API';
          confidence = 0.8;
        }
      } catch (geminiErr) {
        console.log(`Gemini Vision API failed: ${geminiErr.message}`);
      }
    }

    console.log(`Extraction completed for ${fileName}: ${extractionMethod}, Confidence: ${confidence}, Text length: ${extractedText.length}`);

  } catch (err) {
    console.error(`Extraction error for ${fileName}:`, err);
    extractedText = '';
    extractionMethod = 'Failed';
    confidence = 0.0;
  }

  return { 
    extractedText, 
    extractionMethod, 
    confidence,
    entities: {} // Will be enhanced later if needed
  };
};

// Enhanced entity extraction using Gemini API
const extractEntities = async (extractedText, fileName) => {
  if (!extractedText || extractedText.length < 10) {
    return {};
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Extract key entities from this document text. Return a JSON object with these fields if found:
    - amount: monetary amounts
    - date: dates mentioned
    - company: company names
    - person: person names
    - invoice_number: invoice or reference numbers
    - document_type: type of document (invoice, receipt, contract, etc.)
    
    Text: ${extractedText.substring(0, 2000)} // Limit to first 2000 chars
    
    Return only valid JSON.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();
    
    // Try to parse JSON response
    try {
      const entities = JSON.parse(responseText);
      return entities;
    } catch (parseErr) {
      console.log('Failed to parse Gemini entities response:', responseText);
      return {};
    }
  } catch (err) {
    console.log('Entity extraction failed:', err.message);
    return {};
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

    // Extract text with enhanced methods
    const { extractedText, extractionMethod, confidence } = await extractTextFromFile(filePath, fileName);
    
    // Extract entities if we have text
    const entities = await extractEntities(extractedText, fileName);

    // Determine extraction status and message
    let status = "Extracted";
    let userMessage = "";
    
    if (extractedText && extractedText.length > 10) {
      userMessage = `✅ Text extracted using ${extractionMethod}! Found ${Object.keys(entities).length} entities.`;
    } else if (extractedText && extractedText.length > 0) {
      status = "Low Confidence";
      userMessage = `⚠️ Limited text extracted using ${extractionMethod}. Consider manual review.`;
    } else {
      status = "Human Intervention";
      userMessage = `❌ No text could be extracted. Sent for human intervention.`;
    }

    // Update document with extracted data
    const ingestor = require("./ingestor");
    const doc = ingestor.updateDocument(id, {
      entities,
      status,
      extractedText,
      extractionMethod,
      extractionConfidence: confidence,
      messages: {
        ...(ingestor.documents.find((d) => d.id === id)?.messages || {}),
        extract: userMessage,
      },
    });

    res.json({
      success: true,
      message: "Extraction completed",
      userMessage: doc.messages.extract,
      extractedText,
      entities,
      extractionMethod,
      extractionConfidence: confidence,
      status,
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

// Legacy function for backward compatibility
exports.extractAndAnalyzeDocument = async (req, res) => {
  try {
    if (!req.files || !req.files.document) {
      return res.status(400).json({ success: false, error: 'No document uploaded' });
    }
    const doc = req.files.document;
    const fileName = doc.name;
    const tempPath = path.join(__dirname, '../../uploaded_docs', `${Date.now()}_${fileName}`);
    await doc.mv(tempPath);

    const { extractedText, extractionMethod, confidence } = await extractTextFromFile(tempPath, fileName);
    const entities = await extractEntities(extractedText, fileName);

    res.json({
      success: true,
      extractedText,
      entities,
      extractionMethod,
      extractionConfidence: confidence,
      fileName,
      message: 'Extraction and analysis complete.'
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Extraction failed', details: err.message });
  }
};
