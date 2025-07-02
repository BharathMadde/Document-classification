const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

const BACKEND_URL = 'http://localhost:3000';

// Test different file types and extraction methods
async function testEnhancedServices() {
  console.log('🧪 Testing Enhanced Backend Services...\n');

  try {
    // Test 1: Upload a text file
    console.log('📝 Test 1: Uploading text file...');
    const textContent = `INVOICE
Invoice Number: INV-2024-001
Date: 2024-01-15
Amount: $1,250.00
Company: TechCorp Solutions
Description: Software licensing and consulting services

This is a sample invoice for testing the enhanced classification and routing system.`;
    
    const textFilePath = path.join(__dirname, '..', 'uploaded_docs', 'test_invoice.txt');
    fs.writeFileSync(textFilePath, textContent);
    
    const formData1 = new FormData();
    formData1.append('document', fs.createReadStream(textFilePath));
    
    const uploadResponse1 = await axios.post(`${BACKEND_URL}/api/documents/upload`, formData1, {
      headers: formData1.getHeaders()
    });
    
    console.log('✅ Text file uploaded:', uploadResponse1.data.id);
    console.log('Status:', uploadResponse1.data.metadata.status);
    
    // Wait for processing
    await new Promise(resolve => setTimeout(resolve, 15000));
    
    // Check results
    const doc1 = await axios.get(`${BACKEND_URL}/api/documents/${uploadResponse1.data.id}`);
    console.log('📊 Results:');
    console.log('- Status:', doc1.data.document.status);
    console.log('- Type:', doc1.data.document.type);
    console.log('- Confidence:', doc1.data.document.confidence);
    console.log('- Destination:', doc1.data.document.destination);
    console.log('- Extraction Method:', doc1.data.document.extractionMethod);
    console.log('- Extracted Text Length:', doc1.data.document.extractedText?.length || 0);
    console.log('');

    // Test 2: Test manual extraction
    console.log('🔍 Test 2: Testing manual extraction...');
    const extractResponse = await axios.post(`${BACKEND_URL}/api/extract`, {
      id: uploadResponse1.data.id
    });
    
    console.log('✅ Extraction completed:');
    console.log('- Status:', extractResponse.data.status);
    console.log('- Method:', extractResponse.data.extractionMethod);
    console.log('- Confidence:', extractResponse.data.extractionConfidence);
    console.log('- Text Length:', extractResponse.data.extractedText?.length || 0);
    console.log('');

    // Test 3: Test manual classification
    console.log('🏷️ Test 3: Testing manual classification...');
    const classifyResponse = await axios.post(`${BACKEND_URL}/api/classify`, {
      id: uploadResponse1.data.id
    });
    
    console.log('✅ Classification completed:');
    console.log('- Type:', classifyResponse.data.type);
    console.log('- Confidence:', classifyResponse.data.confidence);
    console.log('- Reason:', classifyResponse.data.reason);
    console.log('- Status:', classifyResponse.data.status);
    console.log('');

    // Test 4: Test manual routing
    console.log('🛣️ Test 4: Testing manual routing...');
    const routeResponse = await axios.post(`${BACKEND_URL}/api/route`, {
      id: uploadResponse1.data.id
    });
    
    console.log('✅ Routing completed:');
    console.log('- Destination:', routeResponse.data.destination);
    console.log('- Confidence:', routeResponse.data.confidence);
    console.log('- Reason:', routeResponse.data.reason);
    console.log('- Status:', routeResponse.data.status);
    console.log('');

    // Test 5: List all documents
    console.log('📋 Test 5: Listing all documents...');
    const listResponse = await axios.get(`${BACKEND_URL}/api/documents`);
    console.log(`✅ Found ${listResponse.data.count} documents`);
    
    listResponse.data.documents.forEach((doc, index) => {
      console.log(`${index + 1}. ${doc.name}`);
      console.log(`   Status: ${doc.status}`);
      console.log(`   Type: ${doc.type || 'Unknown'}`);
      console.log(`   Destination: ${doc.destination || 'Not routed'}`);
      console.log(`   Extraction: ${doc.extractionMethod || 'Unknown'} (${Math.round((doc.extractionConfidence || 0) * 100)}%)`);
      console.log('');
    });

    console.log('🎉 All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the tests
testEnhancedServices(); 