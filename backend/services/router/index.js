const { updateDocument, documents } = require('../ingestor');
const { routeToERP } = require('./erp');
const { routeToDMS } = require('./dms');
const { routeToSlack } = require('./slack');

exports.routeDocument = async (req, res) => {
  const { type, id } = req.body;
  const io = req.app ? req.app.get('io') : null;
  
  try {
    const doc = documents.find(d => d.id === id);
    
    if (!doc) {
      throw new Error('Document not found');
    }
    
    if (!type) {
      throw new Error('Document type not provided for routing');
    }
    
    let result;
    if (type && type.toLowerCase().includes('invoice')) {
      result = routeToERP(doc);
    } else if (type && type.toLowerCase().includes('contract')) {
      result = routeToDMS(doc);
    } else {
      result = routeToSlack(doc);
    }
    
    // Update document
    const updatedDoc = updateDocument(id, {
      status: 'Routed',
      destination: result.destination,
    });
    
    // Emit real-time update
    if (io) {
      io.emit('documentUpdated', updatedDoc);
    }
    
    res.json({ 
      ...result, 
      status: 'Routed', 
      timestamps: updatedDoc ? updatedDoc.timestamps : {},
      success: true,
      message: 'Document routing completed successfully'
    });
    
  } catch (err) {
    console.error('Routing error:', err);
    
    // Update document status to Human Intervention
    if (id) {
      const doc = updateDocument(id, { status: 'Human Intervention' });
      if (io) {
        io.emit('documentUpdated', doc);
      }
    }
    
    res.status(500).json({ 
      error: 'Document routing failed', 
      details: err.message,
      success: false
    });
  }
}; 