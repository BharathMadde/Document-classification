const { updateDocument } = require("./ingestor");
const path = require('path');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');

const genAI = new GoogleGenerativeAI("AIzaSyBrA0LGtMg26-vYg_6qKTxyQK2cn6ZWBVs");

// Enhanced routing logic based on document classification and content
const routeDocumentByContent = async (
  docType,
  fileName,
  entities,
  extractedText = "",
  filePath = "",
  confidence = 0.5,
  extractionConfidence = 0.5
) => {
  // If classification confidence is very low or no text extracted, route to human intervention
  if (confidence < 0.3 || extractionConfidence < 0.3 || !extractedText || extractedText.trim().length < 5) {
    return {
      destination: "Manual Review",
      reason: "Low confidence in classification or text extraction",
      confidence: Math.min(confidence, extractionConfidence)
    };
  }

  // Enhanced routing based on document type with specific folder mapping
  let destination = "Slack"; // Default
  let reason = "Default routing";
  let routingConfidence = confidence;

      if (docType) {
        const typeLower = docType.toLowerCase();

    // Map to specific folders based on sample files structure
    if (typeLower === "report" || typeLower.includes("analytics") || typeLower.includes("dashboard")) {
      destination = "Dashboard";
      reason = "Analytics/Reporting document for dashboard";
      routingConfidence = Math.min(confidence, 0.95);
    } else if (typeLower === "receipt" || typeLower.includes("expense") || typeLower.includes("travel")) {
          destination = "Expense Tracker";
      reason = "Receipt/Expense document for tracking";
      routingConfidence = Math.min(confidence, 0.95);
    } else if (typeLower === "statement" || typeLower === "budget" || typeLower.includes("financial")) {
          destination = "Financial Review";
      reason = "Financial document for review";
      routingConfidence = Math.min(confidence, 0.95);
    } else if (typeLower === "contract" || typeLower.includes("legal") || typeLower.includes("compliance")) {
      destination = "Legal DMS";
      reason = "Legal/Contract document for DMS";
      routingConfidence = Math.min(confidence, 0.95);
    } else if (typeLower === "communication" || typeLower.includes("team") || typeLower.includes("collaboration") || 
               typeLower.includes("meeting") || typeLower.includes("feedback")) {
      destination = "Slack";
      reason = "Team communication for Slack";
      routingConfidence = Math.min(confidence, 0.9);
    } else if (typeLower === "invoice" || typeLower.includes("bill") || typeLower.includes("payment")) {
      destination = "Financial Review"; // Could also go to Accounting ERP if you have that folder
      reason = "Invoice/Payment document for financial review";
      routingConfidence = Math.min(confidence, 0.9);
    } else if (typeLower === "unknown" || typeLower.includes("unclear") || typeLower.includes("unclassified")) {
      destination = "Unclassified";
      reason = "Unclear document type";
      routingConfidence = 0.3;
          } else {
            destination = "Slack";
      reason = "General document for team review";
      routingConfidence = Math.min(confidence, 0.6);
        }
      } else {
    destination = "Unclassified";
    reason = "No document type determined";
    routingConfidence = 0.2;
  }

  // If routing confidence is too low, send to manual review
  if (routingConfidence < 0.4) {
    destination = "Manual Review";
    reason = "Low confidence in routing decision";
    routingConfidence = 0.3;
  }

  return { destination, reason, confidence: routingConfidence };
};

exports.routeDocument = async (req, res) => {
  const { type, id, confidence } = req.body;

  try {
    // Get document details for better routing
    const documents = require("./ingestor").documents || [];
    const doc = documents.find((d) => d.id === id);

    if (!doc) {
      return res.status(404).json({
        success: false,
        error: "Document not found",
        userMessage: "\u274c Document not found. Please try again.",
      });
    }

    // Use the provided type or get from document
    const docType = type || doc.type;
    const routingConfidence = confidence || doc.confidence || 0.5;
    const extractionConfidence = doc.extractionConfidence || 0.5;

    // Route based on document type, content, and confidence
    const { destination, reason, confidence: finalRoutingConfidence } = await routeDocumentByContent(
      docType,
      doc.name,
      doc.entities,
      doc.extractedText,
      doc.filePath,
      routingConfidence,
      extractionConfidence
    );

    const userMessages = {
      "Dashboard": "\ud83d\udcca Routed to Dashboard for analytics and reporting",
      "Expense Tracker": "\ud83e\uddfe Routed to Expense Tracker for receipt tracking",
      "Financial Review": "\ud83d\udcc8 Routed to Financial Review for financial documents",
      "Legal DMS": "\u2696\ufe0f Routed to Legal DMS for contracts and compliance",
      "Slack": "\ud83d\udcac Sent to Slack for team collaboration",
      "Manual Review": "\ud83d\udc40 Sent for manual review and intervention",
      "Unclassified": "\u2753 Sent to Unclassified for further review",
    };

    // Determine routing status
    let status = "Routed";
    if (destination === "Manual Review" || destination === "Unclassified" || finalRoutingConfidence < 0.5) {
      status = "Human Intervention";
    } else if (finalRoutingConfidence < 0.7) {
      status = "Low Confidence Routing";
    }

    // Move file to destination folder if routed (not human intervention)
    let newPath = doc.path;
    if (status === "Routed" && destination && ["Dashboard", "Expense Tracker", "Financial Review", "Legal DMS", "Slack"].includes(destination)) {
      const destDir = path.join(__dirname, "..", "..", "uploaded_docs", destination);
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }
      const newFilePath = path.join(destDir, path.basename(doc.path));
      if (doc.path !== newFilePath) {
        try {
          fs.renameSync(doc.path, newFilePath);
          newPath = newFilePath;
        } catch (err) {
          console.error("File move error:", err);
        }
      }
    }

    // Update document
    const ingestor = require("./ingestor");
    const updatedDoc = ingestor.updateDocument(id, {
      status,
      destination,
      routingConfidence: finalRoutingConfidence,
      routingReason: reason,
      path: newPath,
      filePath: newPath,
      messages: {
        ...(ingestor.documents.find((d) => d.id === id)?.messages || {}),
        route: userMessages[destination] || `\u2705 Routed to: ${destination} (${Math.round(finalRoutingConfidence * 100)}% confidence)`,
      },
    });

    res.json({
      success: true,
      message: status === "Human Intervention" ? "Sent for human intervention" : "Routed successfully",
      destination,
      reason,
      confidence: finalRoutingConfidence,
      status,
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
      userMessage: "\u274c Failed to route. Please try again.",
    });
  }
};