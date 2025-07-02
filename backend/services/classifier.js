const { GoogleGenerativeAI } = require("@google/generative-ai");
const { updateDocument } = require("./ingestor");

const genAI = new GoogleGenerativeAI("AIzaSyBrA0LGtMg26-vYg_6qKTxyQK2cn6ZWBVs");

// Enhanced classification based on extracted content and entities
const classifyDocumentContent = async (extractedText, entities, fileName, extractionMethod, extractionConfidence) => {
  let docType = "Unknown";
  let confidence = 0.5;
  
  // If no text was extracted or confidence is very low, classify as Unknown
  if (!extractedText || extractedText.trim().length < 5 || extractionConfidence < 0.3) {
    return { docType: "Unknown", confidence: 0.2, reason: "No readable text extracted" };
  }

  // First, try pattern-based classification for common document types
  const text = extractedText.toLowerCase();
  const fileNameLower = fileName.toLowerCase();
  
  // Pattern-based classification with high confidence for clear matches
  if (text.includes('quarterly') || text.includes('business intelligence') || text.includes('analytics dashboard') || 
      text.includes('real-time analytics') || text.includes('performance metrics') || text.includes('kpi') ||
      text.includes('executive summary') || text.includes('market analysis') || text.includes('recommendations')) {
    return { docType: "Report", confidence: 0.95, reason: "Analytics/Reporting document detected" };
  }
  
  if (text.includes('receipt') || text.includes('purchase') || text.includes('payment method') || 
      text.includes('subtotal') || text.includes('tax') || text.includes('total') ||
      text.includes('item description') || text.includes('qty') || text.includes('unit price') ||
      text.includes('office supplies') || text.includes('travel expense')) {
    return { docType: "Receipt", confidence: 0.95, reason: "Receipt/Expense document detected" };
  }
  
  if (text.includes('financial statement') || text.includes('income statement') || text.includes('balance sheet') ||
      text.includes('revenue') || text.includes('cost of goods sold') || text.includes('operating expenses') ||
      text.includes('net income') || text.includes('assets') || text.includes('liabilities') ||
      text.includes('equity') || text.includes('auditor') || text.includes('fiscal year')) {
    return { docType: "Statement", confidence: 0.95, reason: "Financial statement detected" };
  }
  
  if (text.includes('budget') || text.includes('budget analysis') || text.includes('financial planning') ||
      text.includes('forecast') || text.includes('projected') || text.includes('allocation')) {
    return { docType: "Budget", confidence: 0.9, reason: "Budget document detected" };
  }
  
  if (text.includes('contract') || text.includes('agreement') || text.includes('service agreement') ||
      text.includes('terms and conditions') || text.includes('governing law') || text.includes('confidentiality') ||
      text.includes('termination') || text.includes('compensation') || text.includes('compliance policy')) {
    return { docType: "Contract", confidence: 0.95, reason: "Contract/Legal document detected" };
  }
  
  if (text.includes('team collaboration') || text.includes('slack channel') || text.includes('meeting notes') ||
      text.includes('project status') || text.includes('action items') || text.includes('next steps') ||
      text.includes('client feedback') || text.includes('collaboration notes')) {
    return { docType: "Communication", confidence: 0.9, reason: "Team communication document detected" };
  }
  
  if (text.includes('invoice') || text.includes('bill') || text.includes('invoice number') ||
      text.includes('amount due') || text.includes('payment terms')) {
    return { docType: "Invoice", confidence: 0.9, reason: "Invoice document detected" };
  }

  // If pattern matching didn't work, use AI classification
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
<<<<<<< HEAD
    const prompt = `Classify the following document content into one of these types: Invoice, Contract, Report, Receipt, Statement, Budget, Payment, Legal, Analysis, Expense, Financial, or Unknown. Respond in the format: Type: <type> (Confidence: <confidence between 0 and 1>).\nContent:\n${contentToClassify}`;
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    // Try to extract type and confidence from the response
    const match = text.match(/Type:\s*(\w+)(?:\s*\(Confidence:\s*([0-9.]+)\))?/i);
    if (match) {
      docType = match[1];
      if (match[2]) {
        confidence = parseFloat(match[2]);
      } else {
        // Estimate confidence based on strong keywords
        const strongTypes = ["Invoice", "Contract", "Report", "Receipt", "Statement", "Budget", "Payment", "Legal", "Analysis", "Expense", "Financial"];
        if (strongTypes.includes(docType)) {
          confidence = 0.9;
        } else {
          confidence = 0.7;
        }
      }
    } else {
      // Fallback: try to find a type in the text
      const strongTypes = ["Invoice", "Contract", "Report", "Receipt", "Statement", "Budget", "Payment", "Legal", "Analysis", "Expense", "Financial"];
      const foundType = strongTypes.find(type => text.toLowerCase().includes(type.toLowerCase()));
      if (foundType) {
        docType = foundType;
        confidence = 0.8;
      } else {
        docType = text.trim();
        confidence = 0.7;
      }
    }
  } catch (err) {
    // Local fallback classification if Gemini fails
    const fileNameLower = (fileName || "").toLowerCase();
    if (fileNameLower.includes("invoice") || fileNameLower.includes("bill")) {
      docType = "Invoice";
      confidence = 0.9;
    } else if (fileNameLower.includes("contract") || fileNameLower.includes("agreement")) {
      docType = "Contract";
      confidence = 0.9;
    } else if (fileNameLower.includes("receipt")) {
      docType = "Receipt";
      confidence = 0.9;
    } else if (fileNameLower.includes("report")) {
      docType = "Report";
      confidence = 0.9;
    } else if (fileNameLower.includes("statement")) {
      docType = "Statement";
      confidence = 0.9;
    } else if (fileNameLower.includes("budget")) {
      docType = "Budget";
      confidence = 0.9;
    } else if (fileNameLower.includes("payment")) {
      docType = "Payment";
      confidence = 0.9;
    } else if (fileNameLower.includes("legal") || fileNameLower.includes("compliance")) {
      docType = "Legal";
      confidence = 0.9;
    } else if (fileNameLower.includes("analysis") || fileNameLower.includes("analytics")) {
      docType = "Analysis";
      confidence = 0.9;
    } else if (fileNameLower.includes("expense")) {
      docType = "Expense";
      confidence = 0.9;
    } else if (fileNameLower.includes("financial")) {
      docType = "Financial";
      confidence = 0.9;
    } else if (entities) {
      if (entities.invoice_number || entities.amount || entities.total) {
        docType = "Invoice";
        confidence = 0.7;
      } else if (entities.contract_id || entities.client || entities.vendor) {
        docType = "Contract";
        confidence = 0.7;
      } else if (entities.receipt_number || entities.store || entities.subtotal) {
        docType = "Receipt";
        confidence = 0.7;
      } else if (entities.report_id || entities.department || entities.revenue) {
        docType = "Report";
        confidence = 0.7;
      } else if (entities.document_id) {
        docType = "Document";
        confidence = 0.7;
      }
    }
    // else keep as Unknown with 0.5
=======
    
    // Create a comprehensive prompt for classification
    const prompt = `Analyze this document content and classify it into one of these specific types:

Document Types:
- Report: Business reports, analytics dashboards, quarterly reports, performance reports, market analysis
- Receipt: Purchase receipts, expense receipts, office supplies receipts, travel expense reports
- Statement: Financial statements, annual financial statements, income statements, balance sheets
- Budget: Budget analysis, financial planning documents, budget reports, financial forecasts
- Contract: Service agreements, legal contracts, compliance policies, terms and conditions
- Communication: Team collaboration notes, meeting notes, client feedback, project updates
- Invoice: Bills, payment requests, commercial invoices, billing documents
- Analysis: Data analysis, market analysis, research reports, analytical documents
- Expense: Expense reports, cost analysis, spending reports, expense tracking
- Financial: Financial documents, accounting records, financial summaries
- Unknown: If the document doesn't fit any category or is unclear

Document Content: ${extractedText.substring(0, 3000)}
File Name: ${fileName}
Extraction Method: ${extractionMethod}
Extraction Confidence: ${extractionConfidence}

Instructions:
1. Analyze the content carefully
2. Look for specific keywords and patterns
3. Consider the document structure and format
4. Return ONLY a JSON object in this exact format:
{
  "type": "DocumentType",
  "confidence": 0.0-1.0,
  "reason": "Brief explanation of classification"
}

Be specific and accurate. If uncertain, use "Unknown" type with low confidence.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();
    
    // Try to parse JSON response
    try {
      const classification = JSON.parse(responseText);
      docType = classification.type || "Unknown";
      confidence = Math.min(Math.max(classification.confidence || 0.5, 0.0), 1.0);
      
      // Adjust confidence based on extraction confidence
      if (extractionConfidence < 0.7) {
        confidence = Math.min(confidence, 0.7); // Cap confidence if extraction was poor
      }
      
      return { 
        docType, 
        confidence, 
        reason: classification.reason || "AI classification" 
      };
    } catch (parseErr) {
      console.log('Failed to parse classification response:', responseText);
      
      // Fallback: try to extract type from text response
      const typeMatch = responseText.match(/type["\s:]+([a-zA-Z]+)/i);
      if (typeMatch) {
        docType = typeMatch[1];
        confidence = 0.6;
      } else {
        docType = "Unknown";
        confidence = 0.3;
      }
      
      return { docType, confidence, reason: "Fallback classification" };
    }
  } catch (err) {
    console.error('Classification error:', err);
    return { docType: "Unknown", confidence: 0.2, reason: "Classification failed" };
>>>>>>> 128d17d (Backend fixed)
  }
};

exports.classifyDocument = async (req, res) => {
  const { extractedText, id } = req.body;

  try {
    // Get document details for better classification
    const documents = require("./ingestor").documents || [];
    const doc = documents.find((d) => d.id === id);

    if (!doc) {
      return res.status(404).json({
        success: false,
        error: "Document not found",
        userMessage: "❌ Document not found. Please try again.",
      });
    }

    // Use provided extractedText or get from document
    const textToClassify = extractedText || doc.extractedText || "";
    const entities = doc.entities || {};
    const extractionMethod = doc.extractionMethod || "Unknown";
    const extractionConfidence = doc.extractionConfidence || 0.5;

    // Classify based on extracted content and entities
    const { docType, confidence, reason } = await classifyDocumentContent(
      textToClassify,
      entities,
      doc.name || "",
      extractionMethod,
      extractionConfidence
    );

    // Enhanced user messages with more context
    const userMessages = {
      Report: "📊 Report - Ready for analytics dashboard",
      Receipt: "🧾 Receipt - Ready for expense tracking",
      Statement: "📈 Statement - Ready for financial review",
      Budget: "💰 Budget - Ready for financial planning",
      Contract: "📋 Contract - Ready for legal review",
      Communication: "💬 Communication - Ready for team collaboration",
      Invoice: "📄 Invoice - Ready for accounting processing",
      Analysis: "📊 Analysis - Ready for strategic insights",
      Expense: "🧾 Expense - Ready for cost tracking",
      Financial: "📈 Financial - Ready for financial review",
      Unknown: "❓ Unknown - Requires human intervention",
    };

    // Determine classification status
    let status = "Classified";
    if (docType === "Unknown" || confidence < 0.4) {
      status = "Human Intervention";
    } else if (confidence < 0.7) {
      status = "Low Confidence";
    }

    // Update document
    const ingestor = require("./ingestor");
    const updatedDoc = ingestor.updateDocument(id, {
      type: docType,
      confidence,
      classificationReason: reason,
      status,
      messages: {
        ...(ingestor.documents.find((d) => d.id === id)?.messages || {}),
        classify: userMessages[docType] || `✅ Classified as: ${docType} (${Math.round(confidence * 100)}% confidence)`,
      },
    });

    res.json({
      success: true,
      type: docType,
      confidence,
      reason,
      status,
      message: "Classification completed",
      userMessage: updatedDoc.messages.classify,
      documentId: id,
      fileName: doc.name,
      messages: updatedDoc.messages,
    });
  } catch (err) {
    console.error("Classification error:", err);
    res.status(500).json({
      success: false,
      error: "Classification failed",
      userMessage: "❌ Failed to classify. Please try again.",
    });
  }
};
