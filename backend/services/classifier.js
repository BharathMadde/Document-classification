const { GoogleGenerativeAI } = require("@google/generative-ai");
const { updateDocument } = require("./ingestor");

const genAI = new GoogleGenerativeAI("AIzaSyBrA0LGtMg26-vYg_6qKTxyQK2cn6ZWBVs");

// Enhanced classification based on extracted entities and content
const classifyDocumentContent = async (extractedText, entities, fileName) => {
  let docType = "Unknown";
  let confidence = 0.5;
  let contentToClassify = extractedText && extractedText.trim() ? extractedText : fileName;
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
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
    docType = "Unknown";
    confidence = 0.5;
  }
  return { docType, confidence };
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

    // Classify based on extracted content and entities
    const { docType, confidence } = await classifyDocumentContent(
      extractedText || doc.extractedText || "",
      doc.entities || {},
      doc.name || ""
    );

    const userMessages = {
      Invoice: "📄 Invoice - Ready for accounting",
      Contract: "📋 Contract - Ready for legal review",
      Report: "📊 Report - Ready for analysis",
      Receipt: "🧾 Receipt - Ready for expense tracking",
      Statement: "📈 Statement - Ready for review",
      Budget: "💰 Budget - Ready for financial review",
      Payment: "💳 Payment - Ready for accounting",
      Legal: "⚖️ Legal - Ready for compliance review",
      Analysis: "📊 Analysis - Ready for insights",
      Expense: "🧾 Expense - Ready for tracking",
      Financial: "📈 Financial - Ready for review",
    };

    // Update document
    const ingestor = require("./ingestor");
    const updatedDoc = ingestor.updateDocument(id, {
      type: docType,
      confidence,
      status: "Classified",
      messages: {
        ...(ingestor.documents.find((d) => d.id === id)?.messages || {}),
        classify: userMessages[docType] || `✅ Classified as: ${docType}`,
      },
    });

    res.json({
      success: true,
      type: docType,
      confidence,
      status: "Classified",
      message: "Classified successfully",
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
