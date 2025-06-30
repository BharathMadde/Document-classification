const express = require('express');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const routes = require('./routes/documents');

const app = express();
app.use(cors());
app.use(express.json());
app.use(fileUpload());
app.use('/api/documents', routes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));