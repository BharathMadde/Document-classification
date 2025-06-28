const express = require('express');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const routes = require('./routes/documents');
const extractor = require('./services/extractor');
const classifier = require('./services/classifier');
const routerService = require('./services/router');

const app = express();
app.use(cors());
app.use(express.json());
app.use(fileUpload());
app.use('/api/documents', routes);

app.post('/api/extract', extractor.extractText);
app.post('/api/classify', classifier.classifyDocument);
app.post('/api/route', routerService.routeDocument);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));