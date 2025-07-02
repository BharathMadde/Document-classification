const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const axios = require("axios");

// In-memory document store
const documents = [];
exports.documents = documents;
const uploadDir = path.join(__dirname, "..", "..", "uploaded_docs");

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3000";

// Supported file extensions including email files
const SUPPORTED_EXTENSIONS = [
  ".pdf",
  ".doc",
  ".docx",
  ".txt",
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".msg",
  ".eml",
];

async function processDocumentWorkflow(id) {
  try {
    const start = Date.now();
    console.log(`Starting workflow for document ${id}`);
    
    // 1. Extract text with enhanced OCR and AI
    console.log(`Step 1: Extracting text from document ${id}`);
    await new Promise((resolve) => setTimeout(resolve, 2000)); // 2s delay
    try {
      const extractResponse = await axios.post(`${BACKEND_URL}/api/extract`, { id });
      console.log(`Extraction completed for ${id}:`, extractResponse.data.status);
      
      // Check if extraction was successful
      if (extractResponse.data.status === "Human Intervention") {
        console.log(`Document ${id} sent to human intervention due to extraction failure`);
        return; // Stop workflow if extraction failed
      }
    } catch (e) {
      console.error("Extract error for", id, e.message);
      // Continue with workflow even if extraction fails
    }
    
    // 2. Classify document based on extracted content
    console.log(`Step 2: Classifying document ${id}`);
    await new Promise((resolve) => setTimeout(resolve, 3000)); // 3s delay for AI processing
    try {
      const classifyResponse = await axios.post(`${BACKEND_URL}/api/classify`, { id });
      console.log(`Classification completed for ${id}:`, classifyResponse.data.type, classifyResponse.data.confidence);
    } catch (e) {
      console.error("Classify error for", id, e.message);
    }
    
    // 3. Route document based on classification
    console.log(`Step 3: Routing document ${id}`);
    await new Promise((resolve) => setTimeout(resolve, 2000)); // 2s delay
    try {
      const routeResponse = await axios.post(`${BACKEND_URL}/api/route`, { id });
      console.log(`Routing completed for ${id}:`, routeResponse.data.destination, routeResponse.data.confidence);
    } catch (e) {
      console.error("Route error for", id, e.message);
    }
    
    // Ensure minimum total time for user experience
    const elapsed = Date.now() - start;
    if (elapsed < 8000) {
      await new Promise((resolve) => setTimeout(resolve, 8000 - elapsed));
    }
    
    console.log(`Workflow for ${id} completed in ${Date.now() - start}ms`);
  } catch (err) {
    console.error("Auto workflow error for", id, err.message);
  }
}

exports.uploadDocument = async (req, res) => {
  if (!req.files?.document) {
    return res.status(400).json({
      success: false,
      error: "No document uploaded",
      userMessage: "❌ Please select a file to upload.",
    });
  }

  const doc = req.files.document;
  const fileName = doc.name || "";
  const lastDotIndex = fileName.lastIndexOf(".");
  const ext = lastDotIndex > 0 ? fileName.slice(lastDotIndex).toLowerCase() : "";
  
  console.log("File name:", fileName, "Extension:", ext, "Supported:", SUPPORTED_EXTENSIONS);
  
  if (!SUPPORTED_EXTENSIONS.includes(ext)) {
    return res.status(400).json({
      success: false,
      error: "Unsupported file type",
      userMessage:
        `❌ Only PDF, DOC, DOCX, TXT, image, MSG, and EML files are supported. Received: ${ext}`,
    });
  }

  const id = uuidv4();
  const docPath = path.join(uploadDir, `${id}_${doc.name}`);

  doc.mv(docPath, (err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        error: err.message,
        userMessage: "❌ Failed to save document. Please try again.",
      });
    }

    // Save metadata and initial status
    const metadata = {
      id,
      name: doc.name,
      path: docPath,
      filePath: docPath,
      status: "Ingested",
      type: null,
      confidence: null,
      entities: null,
      timestamps: { ingested: new Date().toISOString() },
      messages: {
        ingest: `✅ "${doc.name}" uploaded and ready for processing!`,
        extract: "⏳ Waiting for extraction...",
        classify: "⏳ Waiting for classification...",
        route: "⏳ Waiting for routing...",
      },
    };
    documents.push(metadata);

    res.json({
      success: true,
      message: "Upload successful",
      id,
      metadata,
      userMessage: `✅ "${doc.name}" uploaded!`,
      summary: {
        fileName: doc.name,
        fileSize: `${(doc.size / 1024).toFixed(1)} KB`,
        status: "Ready for processing",
      },
    });
    
    // Trigger full workflow after response
    processDocumentWorkflow(id);
  });
};

// Upload multiple documents
exports.uploadMultipleDocuments = async (req, res) => {
  if (!req.files || !req.files.documents) {
    return res.status(400).json({
      success: false,
      error: "No documents uploaded",
      userMessage: "❌ Please select files to upload.",
    });
  }

  const files = Array.isArray(req.files.documents) ? req.files.documents : [req.files.documents];
  const results = [];
  const errors = [];

  for (const doc of files) {
    try {
      const fileName = doc.name || "";
      const lastDotIndex = fileName.lastIndexOf(".");
      const ext = lastDotIndex > 0 ? fileName.slice(lastDotIndex).toLowerCase() : "";
      
      console.log("Processing file:", fileName, "Extension:", ext);
      
      if (!SUPPORTED_EXTENSIONS.includes(ext)) {
        errors.push({
          fileName,
          error: `Unsupported file type: ${ext}`
        });
        continue;
      }

      if (doc.size > 20 * 1024 * 1024) {
        errors.push({
          fileName,
          error: "File size exceeds 20MB limit"
        });
        continue;
      }

      const id = uuidv4();
      const docPath = path.join(uploadDir, `${id}_${doc.name}`);

      await new Promise((resolve, reject) => {
        doc.mv(docPath, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });

      // Save metadata and initial status
      const metadata = {
        id,
        name: doc.name,
        path: docPath,
        filePath: docPath,
        status: "Ingested",
        type: null,
        confidence: null,
        entities: null,
        timestamps: { ingested: new Date().toISOString() },
        messages: {
          ingest: `✅ "${doc.name}" uploaded and ready for processing!`,
          extract: "⏳ Waiting for extraction...",
          classify: "⏳ Waiting for classification...",
          route: "⏳ Waiting for routing...",
        },
      };
      documents.push(metadata);

      results.push({
        id,
        fileName: doc.name,
        fileSize: `${(doc.size / 1024).toFixed(1)} KB`,
        status: "Uploaded successfully"
      });

      // Trigger full workflow after saving
      processDocumentWorkflow(id);

    } catch (err) {
      console.error(`Error processing ${doc.name}:`, err);
      errors.push({
        fileName: doc.name,
        error: err.message
      });
    }
  }

  res.json({
    success: true,
    message: `Processed ${files.length} files`,
    results,
    errors,
    userMessage: `✅ ${results.length} file(s) uploaded successfully${errors.length > 0 ? `, ${errors.length} failed` : ''}!`,
    summary: {
      totalFiles: files.length,
      successful: results.length,
      failed: errors.length
    }
  });
};

// List all documents
exports.listDocuments = (req, res) => {
  res.json({
    success: true,
    documents: documents.map((doc) => ({
      ...doc,
      messages: doc.messages || {
        ingest:
          doc.status === "Ingested"
            ? `✅ "${doc.name}" uploaded and ready for processing!`
            : "⏳ Waiting for ingestion...",
        extract:
          doc.status === "Extracted"
            ? doc.messages?.extract || "✅ Text extracted!"
            : "⏳ Waiting for extraction...",
        classify:
          doc.status === "Classified"
            ? doc.messages?.classify || "✅ Classified!"
            : "⏳ Waiting for classification...",
        route:
          doc.status === "Routed"
            ? doc.messages?.route || "✅ Routed!"
            : "⏳ Waiting for routing...",
      },
    })),
    count: documents.length,
    userMessage: `📋 Found ${documents.length} document(s) in the system.`,
  });
};

// Get a single document by ID
exports.getDocument = (req, res) => {
  const doc = documents.find((d) => d.id === req.params.id);
  if (!doc) {
    return res.status(404).json({
      success: false,
      error: "Document not found",
      userMessage: "❌ Document not found. It may have been deleted or moved.",
    });
  }
  
  res.json({
    success: true,
    document: {
      ...doc,
      messages: doc.messages || {
        ingest:
          doc.status === "Ingested"
            ? `✅ "${doc.name}" uploaded and ready for processing!`
            : "⏳ Waiting for ingestion...",
        extract:
          doc.status === "Extracted"
            ? doc.messages?.extract || "✅ Text extracted!"
            : "⏳ Waiting for extraction...",
        classify:
          doc.status === "Classified"
            ? doc.messages?.classify || "✅ Classified!"
            : "⏳ Waiting for classification...",
        route:
          doc.status === "Routed"
            ? doc.messages?.route || "✅ Routed!"
            : "⏳ Waiting for routing...",
      },
    },
    userMessage: `📄 Document "${doc.name}" details retrieved.`,
  });
};

// Update document status helper
exports.updateDocument = (id, updates) => {
  const doc = documents.find((d) => d.id === id);
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