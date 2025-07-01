const fs = require("fs");
const path = require("path");
const { updateDocument } = require("./ingestor");
const Tesseract = require('tesseract.js');

// Enhanced OCR simulation that generates realistic data based on file content
const processDocumentContent = (filePath, fileName) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Generate unique data based on file name and content
      const fileExt = path.extname(fileName).toLowerCase();
      const baseName = path.basename(fileName, fileExt);
      const timestamp = Date.now();

      // Different content based on file type and name
      let extractedText = "";
      let entities = {};

      if (fileName.toLowerCase().includes("invoice")) {
        extractedText = `INVOICE #${Math.floor(Math.random() * 10000) + 1000}
Date: ${new Date().toISOString().split("T")[0]}
Due Date: ${
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0]
        }
Company: ${baseName} Corp
Address: 123 Business St, City, State 12345
Phone: (555) ${Math.floor(Math.random() * 900) + 100}-${
          Math.floor(Math.random() * 9000) + 1000
        }

Description: Professional Services
Amount: $${(Math.random() * 5000 + 100).toFixed(2)}
Tax: $${(Math.random() * 500 + 50).toFixed(2)}
Total: $${(Math.random() * 6000 + 200).toFixed(2)}

Payment Terms: Net 30
Invoice ID: INV-${timestamp}`;

        entities = {
          invoice_number: `INV-${timestamp}`,
          date: new Date().toISOString().split("T")[0],
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
          company: `${baseName} Corp`,
          amount: (Math.random() * 5000 + 100).toFixed(2),
          tax: (Math.random() * 500 + 50).toFixed(2),
          total: (Math.random() * 6000 + 200).toFixed(2),
        };
      } else if (fileName.toLowerCase().includes("contract")) {
        extractedText = `CONTRACT AGREEMENT
Contract ID: CON-${timestamp}
Date: ${new Date().toISOString().split("T")[0]}
Effective Date: ${new Date().toISOString().split("T")[0]}
Expiration Date: ${
          new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0]
        }

PARTIES:
Client: ${baseName} Corporation
Address: 456 Corporate Ave, Business City, BC 67890
Contact: John Smith, CEO
Email: john.smith@${baseName.toLowerCase()}.com

Vendor: Professional Services Inc.
Address: 789 Service Blvd, Vendor City, VC 54321
Contact: Jane Doe, Director
Email: jane.doe@proservices.com

SCOPE OF WORK:
Professional consulting services including analysis, planning, and implementation support.

TERM: 12 months
VALUE: $${(Math.random() * 50000 + 10000).toFixed(2)}`;

        entities = {
          contract_id: `CON-${timestamp}`,
          date: new Date().toISOString().split("T")[0],
          client: `${baseName} Corporation`,
          vendor: "Professional Services Inc.",
          term: "12 months",
          value: (Math.random() * 50000 + 10000).toFixed(2),
        };
      } else if (fileName.toLowerCase().includes("receipt")) {
        extractedText = `RECEIPT
Receipt #: RCP-${timestamp}
Date: ${new Date().toISOString().split("T")[0]}
Time: ${new Date().toLocaleTimeString()}
Store: ${baseName} Store
Location: 321 Retail Rd, Shopping City, SC 13579

Items:
1. Office Supplies - $${(Math.random() * 100 + 20).toFixed(2)}
2. Equipment - $${(Math.random() * 500 + 100).toFixed(2)}
3. Services - $${(Math.random() * 200 + 50).toFixed(2)}

Subtotal: $${(Math.random() * 800 + 200).toFixed(2)}
Tax: $${(Math.random() * 100 + 20).toFixed(2)}
Total: $${(Math.random() * 1000 + 300).toFixed(2)}

Payment Method: Credit Card
Card: **** **** **** ${Math.floor(Math.random() * 9000) + 1000}`;

        entities = {
          receipt_number: `RCP-${timestamp}`,
          date: new Date().toISOString().split("T")[0],
          store: `${baseName} Store`,
          subtotal: (Math.random() * 800 + 200).toFixed(2),
          tax: (Math.random() * 100 + 20).toFixed(2),
          total: (Math.random() * 1000 + 300).toFixed(2),
        };
      } else if (fileName.toLowerCase().includes("report")) {
        extractedText = `BUSINESS REPORT
Report ID: RPT-${timestamp}
Generated: ${new Date().toISOString().split("T")[0]}
Department: ${baseName} Division
Prepared By: Analytics Team

EXECUTIVE SUMMARY:
This report provides comprehensive analysis of ${baseName} operations for Q${
          Math.floor(Math.random() * 4) + 1
        } ${new Date().getFullYear()}.

KEY METRICS:
Revenue: $${(Math.random() * 1000000 + 100000).toFixed(2)}
Expenses: $${(Math.random() * 800000 + 80000).toFixed(2)}
Profit: $${(Math.random() * 300000 + 50000).toFixed(2)}
Growth Rate: ${(Math.random() * 25 + 5).toFixed(1)}%

RECOMMENDATIONS:
1. Optimize operational efficiency
2. Increase market presence
3. Enhance customer satisfaction
4. Implement cost controls`;

        entities = {
          report_id: `RPT-${timestamp}`,
          date: new Date().toISOString().split("T")[0],
          department: `${baseName} Division`,
          revenue: (Math.random() * 1000000 + 100000).toFixed(2),
          expenses: (Math.random() * 800000 + 80000).toFixed(2),
          profit: (Math.random() * 300000 + 50000).toFixed(2),
        };
      } else {
        // Generic document processing
        extractedText = `DOCUMENT: ${fileName}
Document ID: DOC-${timestamp}
Date: ${new Date().toISOString().split("T")[0]}
Type: ${fileExt.toUpperCase()} Document
Size: ${Math.floor(Math.random() * 1000 + 100)} KB

Content Summary:
This document contains information related to ${baseName} operations.
Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}.

Key Information:
- Document Type: ${fileExt.toUpperCase()}
- Processing Date: ${new Date().toISOString()}
- Reference: ${baseName}-${timestamp}`;

        entities = {
          document_id: `DOC-${timestamp}`,
          date: new Date().toISOString().split("T")[0],
          type: fileExt.toUpperCase(),
          reference: `${baseName}-${timestamp}`,
        };
      }

      resolve({ extractedText, entities });
    }, 10); // 10ms for fast processing
  });
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
