const { updateDocument, documents } = require('../ingestor');
const { routeToERP } = require('./erp');
const { routeToDMS } = require('./dms');
const { routeToSlack } = require('./slack');

exports.routeDocument = async (req, res) => {
  const { type, id } = req.body;
  const doc = documents.find(d => d.id === id);
  let result;
  if (type && type.toLowerCase().includes('invoice')) {
    result = routeToERP(doc);
  } else if (type && type.toLowerCase().includes('contract')) {
    result = routeToDMS(doc);
  } else {
    result = routeToSlack(doc);
  }
  // Update document
  updateDocument(id, {
    status: 'Routed',
    destination: result.destination,
  });
  res.json({ ...result, status: 'Routed', timestamps: doc ? doc.timestamps : {} });
}; 