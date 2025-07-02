# Enhanced Document Classification Backend

This backend provides intelligent document processing with advanced OCR, AI-powered classification, and smart routing capabilities.

## 🚀 Features

### Enhanced Text Extraction
- **Multi-format Support**: PDF, DOCX, DOC, TXT, Images (PNG, JPG, JPEG, GIF, BMP, TIFF)
- **Advanced OCR**: Tesseract.js for image-based documents
- **Gemini Vision API**: Fallback AI-powered text extraction for images
- **Confidence Scoring**: Tracks extraction quality and reliability
- **Fallback Strategies**: Multiple extraction methods for maximum success

### Intelligent Classification
- **Content-Based**: Uses extracted text and entities, not just filenames
- **AI-Powered**: Gemini 1.5 Flash API for accurate document type detection
- **Entity Extraction**: Identifies amounts, dates, companies, invoice numbers, etc.
- **Confidence Assessment**: Provides confidence scores for classification decisions
- **Smart Fallbacks**: Routes to human intervention when confidence is low

### Smart Routing
- **Content-Driven**: Routes based on classified content and extracted entities
- **Confidence-Based**: Adjusts routing based on classification and extraction confidence
- **AI Analysis**: Uses Gemini API for unknown document types
- **Human Intervention**: Automatic fallback for unclear or low-confidence documents

## 📁 Service Architecture

### 1. Ingestor Service (`services/ingestor.js`)
- Handles file uploads and validation
- Manages document metadata and workflow
- Triggers automated processing pipeline
- Supports multiple file uploads

### 2. Extractor Service (`services/extractor.js`)
- **Enhanced OCR**: Tesseract.js for image processing
- **PDF Processing**: Text extraction with OCR fallback
- **Word Documents**: Mammoth.js with OCR fallback
- **Gemini Vision**: AI-powered image analysis
- **Entity Extraction**: Identifies key document elements

### 3. Classifier Service (`services/classifier.js`)
- **Content Analysis**: Uses extracted text and entities
- **AI Classification**: Gemini 1.5 Flash API
- **Document Types**: Invoice, Receipt, Contract, Report, Statement, Budget, Payment, Legal, Analysis, Expense, Financial
- **Confidence Scoring**: Provides reliability metrics
- **Smart Fallbacks**: Routes to human intervention when uncertain

### 4. Router Service (`services/router.js`)
- **Intelligent Routing**: Based on classification and content
- **Destination Mapping**: Accounting ERP, Legal DMS, Analytics Dashboard, Expense Tracker, Financial Review, Slack
- **AI Analysis**: For unknown document types
- **Confidence Thresholds**: Automatic human intervention for low confidence

## 🔧 API Endpoints

### Document Management
- `POST /api/documents/upload` - Upload single document
- `POST /api/documents/upload-multiple` - Upload multiple documents
- `GET /api/documents` - List all documents
- `GET /api/documents/:id` - Get document details
- `GET /api/documents/download/:filename` - Download document file

### Processing Services
- `POST /api/extract` - Extract text from document
- `POST /api/classify` - Classify document content
- `POST /api/route` - Route document to appropriate destination

### Manual Actions
- `POST /api/documents/:id/extract` - Re-trigger extraction
- `POST /api/documents/:id/classify` - Re-trigger classification
- `POST /api/documents/:id/route` - Re-trigger routing

## 🎯 Document Types & Routing

| Document Type | Destination | Use Case |
|---------------|-------------|----------|
| Report | Dashboard | Analytics dashboards, quarterly reports, business intelligence |
| Receipt | Expense Tracker | Purchase receipts, expense reports, office supplies |
| Statement | Financial Review | Financial statements, annual reports, income statements |
| Budget | Financial Review | Budget analysis, financial planning, forecasts |
| Contract | Legal DMS | Service agreements, compliance policies, legal documents |
| Communication | Slack | Team collaboration, meeting notes, client feedback |
| Invoice | Financial Review | Bills, payment requests, commercial invoices |
| Analysis | Dashboard | Data analysis, market analysis, research reports |
| Expense | Expense Tracker | Expense reports, cost analysis, spending reports |
| Financial | Financial Review | Financial documents, accounting records |
| Unknown | Unclassified | Manual review required |

## 🔍 Extraction Methods

### Text-Based Documents
- **Plain Text (.txt)**: Direct file reading (100% confidence)
- **PDF**: Text extraction with OCR fallback (90% confidence)
- **Word Documents (.docx/.doc)**: Mammoth.js with OCR fallback (90% confidence)

### Image-Based Documents
- **OCR (Tesseract.js)**: Primary method for images (80% confidence)
- **Gemini Vision API**: AI-powered fallback for unclear images (80% confidence)

### Confidence Levels
- **High (0.8-1.0)**: Reliable extraction, proceed with classification
- **Medium (0.5-0.7)**: Limited confidence, may need review
- **Low (0.0-0.4)**: Poor extraction, route to human intervention

## 🚦 Workflow Process

1. **Upload**: Document uploaded and validated
2. **Extraction**: Text extracted using appropriate method(s)
3. **Classification**: Document classified based on content
4. **Routing**: Document routed to appropriate destination
5. **Fallback**: Human intervention for unclear documents

## 🛠️ Configuration

### Environment Variables
- `PORT`: Server port (default: 3000)
- `BACKEND_URL`: Backend URL for internal calls (default: http://localhost:3000)

### Dependencies
- **OCR**: Tesseract.js for image processing
- **PDF**: pdf-parse for PDF text extraction
- **Word**: Mammoth.js for Word document processing
- **AI**: Google Generative AI (Gemini 1.5 Flash)
- **File Upload**: express-fileupload
- **HTTP Client**: axios for internal API calls

## 🧪 Testing

Run the enhanced services test:
```bash
node backend/test-enhanced-services.js
```

This will test:
- File upload and processing
- Text extraction methods
- Classification accuracy
- Routing decisions
- API endpoints

## 📊 Monitoring

The system provides detailed logging for:
- Extraction methods and confidence scores
- Classification decisions and reasoning
- Routing decisions and confidence
- Error handling and fallbacks
- Processing times and performance

## 🔒 Security

- File type validation
- File size limits (20MB)
- Secure file serving
- Input validation and sanitization
- Error handling without information leakage

## 🚀 Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

3. The server will be available at `http://localhost:3000`

4. Upload documents and watch the intelligent processing pipeline in action!

## 📈 Performance

- **Processing Time**: 8-12 seconds per document
- **Concurrent Processing**: Supports multiple document uploads
- **Memory Efficient**: Streams large files
- **Scalable**: Modular architecture for easy scaling

## 🔄 Error Handling

- **Extraction Failures**: Automatic fallback to alternative methods
- **Classification Uncertainties**: Routes to human intervention
- **Routing Issues**: Defaults to Slack for team review
- **File Errors**: Graceful error messages and recovery

The enhanced backend provides a robust, intelligent document processing system that maximizes automation while ensuring quality through human intervention when needed. 