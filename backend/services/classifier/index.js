const { GoogleGenerativeAI } = require('@google/generative-ai');
const { updateDocument } = require('../ingestor');

const genAI = new GoogleGenerativeAI('AIzaSyBrA0LGtMg26-vYg_6qKTxyQK2cn6ZWBVs');

exports.classifyDocument = async (req, res) => {
  const { extractedText, id } = req.body;

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const prompt = `Classify this document text: ${extractedText.slice(0, 2000)}`;
    const result = await model.generateContent(prompt);
    const docType = result.response.text().trim();
    // For demo, set confidence to 0.98
    const confidence = 0.98;
    // Update document
    const doc = updateDocument(id, {
      type: docType,
      confidence,
      status: 'Classified',
    });
    res.json({ type: docType, confidence, status: 'Classified', timestamps: doc ? doc.timestamps : {} });
  } catch (err) {
    res.status(500).json({ error: 'Classification failed', details: err.message });
  }
}; 