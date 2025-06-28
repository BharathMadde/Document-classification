const { updateDocument } = require('./ingestor');

// Enhanced routing logic based on document classification
const routeDocumentByType = (docType, fileName, entities, extractedText = '') => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let destination = 'Slack'; // Default to Slack
      const fileNameLower = (fileName || '').toLowerCase();
      const contentLower = (extractedText || '').toLowerCase();
      
      // Enhanced routing based on document type
      if (docType) {
        const typeLower = docType.toLowerCase();
        
        // Financial documents
        if (typeLower.includes('invoice') || typeLower.includes('bill') || typeLower.includes('payment')) {
          destination = 'Accounting ERP';
        }
        // Legal documents
        else if (typeLower.includes('contract') || typeLower.includes('legal') || typeLower.includes('compliance')) {
          destination = 'Legal DMS';
        }
        // Reports and analytics
        else if (typeLower.includes('report') || typeLower.includes('analysis') || typeLower.includes('analytics')) {
          destination = 'Analytics Dashboard';
        }
        // Receipts and expenses
        else if (typeLower.includes('receipt') || typeLower.includes('expense')) {
          destination = 'Expense Tracker';
        }
        // Financial statements and budgets
        else if (typeLower.includes('statement') || typeLower.includes('budget') || typeLower.includes('financial')) {
          destination = 'Financial Review';
        }
        // Unknown or unclear document types
        else if (typeLower.includes('unknown') || typeLower.includes('unclear') || typeLower.includes('unclassified')) {
          destination = 'Human Intervention';
        }
        // Default routing based on common document types
        else if (fileNameLower.includes('dashboard')) {
          destination = 'Analytics Dashboard';
        } else {
          // If the file name or content suggests dashboard, analytics, or report, prefer Analytics Dashboard
          if (fileNameLower.includes('dashboard') || contentLower.includes('dashboard')) {
            destination = 'Analytics Dashboard';
          } else {
            destination = 'Slack';
          }
        }
      } else {
        // No type provided - send to Human Intervention
        destination = 'Human Intervention';
      }
      
      resolve(destination);
    }, 5); // 5ms for instant response
  });
};

exports.routeDocument = async (req, res) => {
  const { type, id } = req.body;

  try {
    // Get document details for better routing
    const documents = require('./ingestor').documents || [];
    const doc = documents.find(d => d.id === id);
    
    if (!doc) {
      return res.status(404).json({ 
        success: false,
        error: 'Document not found',
        userMessage: '❌ Document not found. Please try again.'
      });
    }

    // Use the provided type or get from document
    const docType = type || doc.type;
    
    // Route based on document type and content
    const destination = await routeDocumentByType(docType, doc.name, doc.entities, doc.extractedText);
    
    // Update document
    const updatedDoc = updateDocument(id, {
      status: destination === 'Human Intervention' ? 'Human Intervention' : 'Routed',
      destination,
    });

    const userMessages = {
      'Accounting ERP': '💰 Routed to Accounting',
      'Legal DMS': '⚖️ Routed to Legal',
      'Analytics Dashboard': '📊 Routed to Analytics',
      'Expense Tracker': '🧾 Routed to Expenses',
      'Financial Review': '📈 Routed to Finance',
      'Slack': '💬 Sent to Slack for review',
      'Human Intervention': '👀 Sent for human intervention',
      'Manual Review': '👀 Sent for manual review'
    };

    res.json({ 
      success: true,
      message: destination === 'Human Intervention' ? 'Sent for human intervention' : 'Routed successfully', 
      destination, 
      status: destination === 'Human Intervention' ? 'Human Intervention' : 'Routed',
      userMessage: userMessages[destination] || `✅ Routed to: ${destination}`,
      documentId: id,
      fileName: doc.name,
      documentType: docType
    });
  } catch (err) {
    console.error('Routing error:', err);
    res.status(500).json({ 
      success: false,
      error: 'Routing failed', 
      userMessage: '❌ Failed to route. Please try again.'
    });
  }
};