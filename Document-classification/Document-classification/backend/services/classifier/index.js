const { GoogleGenerativeAI } = require('@google/generative-ai');
const { updateDocument } = require('../ingestor');

const genAI = new GoogleGenerativeAI('AIzaSyBrA0LGtMg26-vYg_6qKTxyQK2cn6ZWBVs');

exports.classifyDocument = async (req, res) => {
  const { extractedText, id } = req.body;
  const io = req.app ? req.app.get('io') : null;

  try {
    if (!extractedText || extractedText.trim().length === 0) {
      throw new Error('No text provided for classification');
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const prompt = `Classify this document text into one of these categories: Invoice, Contract, Purchase Order, Receipt, Report, Letter, or Other. Respond with just the category name: ${extractedText.slice(0, 2000)}`;
    
    const result = await model.generateContent(prompt);
    const docType = result.response.text().trim();
    
    // For demo, set confidence based on text length and content
    const confidence = Math.min(0.95, 0.7 + (extractedText.length > 100 ? 0.25 : 0.1));
    
    // Update document
    const doc = updateDocument(id, {
      type: docType,
      confidence,
      status: 'Classified',
    });
    
    // Emit real-time update
    if (io) {
      io.emit('documentUpdated', doc);
    }
    
    res.json({ 
      type: docType, 
      confidence, 
      status: 'Classified', 
      timestamps: doc ? doc.timestamps : {},
      success: true,
      message: 'Document classification completed successfully'
    });
    
  } catch (err) {
    console.error('Classification error:', err);
    
    // Update document status to Human Intervention
    if (id) {
      const doc = updateDocument(id, { status: 'Human Intervention' });
      if (io) {
        io.emit('documentUpdated', doc);
      }
    }
    
    res.status(500).json({ 
      error: 'Document classification failed', 
      details: err.message,
      success: false
    });
  }
}; 