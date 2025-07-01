const { updateDocument } = require("./ingestor");
const path = require('path');

// Enhanced routing logic based on document classification
const routeDocumentByType = (
  docType,
  fileName,
  entities,
  extractedText = "",
  filePath = ""
) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let destination = "Slack"; // Default to Slack
      if (docType) {
        const typeLower = docType.toLowerCase();
        if (
          typeLower.includes("invoice") ||
          typeLower.includes("bill") ||
          typeLower.includes("payment")
        ) {
          destination = "Accounting ERP";
        } else if (
          typeLower.includes("contract") ||
          typeLower.includes("legal") ||
          typeLower.includes("compliance")
        ) {
          destination = "Legal DMS";
        } else if (
          typeLower.includes("report") ||
          typeLower.includes("analysis") ||
          typeLower.includes("analytics")
        ) {
          destination = "Analytics Dashboard";
        } else if (
          typeLower.includes("receipt") ||
          typeLower.includes("expense")
        ) {
          destination = "Expense Tracker";
        } else if (
          typeLower.includes("statement") ||
          typeLower.includes("budget") ||
          typeLower.includes("financial")
        ) {
          destination = "Financial Review";
        } else if (
          typeLower.includes("unknown") ||
          typeLower.includes("unclear") ||
          typeLower.includes("unclassified")
        ) {
          destination = "Human Intervention";
        } else {
          destination = "Slack";
        }
      } else {
        destination = "Human Intervention";
      }
      resolve(destination);
    }, 5);
  });
};

exports.routeDocument = async (req, res) => {
  const { type, id } = req.body;

  try {
    // Get document details for better routing
    const documents = require("./ingestor").documents || [];
    const doc = documents.find((d) => d.id === id);

    if (!doc) {
      return res.status(404).json({
        success: false,
        error: "Document not found",
        userMessage: "❌ Document not found. Please try again.",
      });
    }

    // Use the provided type or get from document
    const docType = type || doc.type;

    // Route based on document type and content
    const destination = await routeDocumentByType(
      docType,
      doc.name,
      doc.entities,
      doc.extractedText,
      doc.filePath
    );

    const userMessages = {
      "Accounting ERP": "💰 Routed to Accounting",
      "Legal DMS": "⚖️ Routed to Legal",
      "Analytics Dashboard": "📊 Routed to Analytics",
      "Expense Tracker": "🧾 Routed to Expenses",
      "Financial Review": "📈 Routed to Finance",
      Slack: "💬 Sent to Slack for review",
      "Human Intervention": "👀 Sent for human intervention",
      "Manual Review": "👀 Sent for manual review",
    };

    // Update document
    const ingestor = require("./ingestor");
    const updatedDoc = ingestor.updateDocument(id, {
      status:
        destination === "Human Intervention" ? "Human Intervention" : "Routed",
      destination,
      messages: {
        ...(ingestor.documents.find((d) => d.id === id)?.messages || {}),
        route: userMessages[destination] || `✅ Routed to: ${destination}`,
      },
    });

    res.json({
      success: true,
      message:
        destination === "Human Intervention"
          ? "Sent for human intervention"
          : "Routed successfully",
      destination,
      status:
        destination === "Human Intervention" ? "Human Intervention" : "Routed",
      userMessage: updatedDoc.messages.route,
      documentId: id,
      fileName: doc.name,
      documentType: docType,
      messages: updatedDoc.messages,
    });
  } catch (err) {
    console.error("Routing error:", err);
    res.status(500).json({
      success: false,
      error: "Routing failed",
      userMessage: "❌ Failed to route. Please try again.",
    });
  }
};
