const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

const BACKEND_URL = 'http://localhost:3000';

// Test with actual sample files
async function testSampleFiles() {
  console.log('🧪 Testing Enhanced Services with Sample Files...\n');

  const sampleFiles = [
    {
      name: 'quarterly-report.txt',
      path: '../sample_files/Dashboard/quarterly-report.txt',
      expectedType: 'Report',
      expectedDestination: 'Dashboard'
    },
    {
      name: 'analytics-dashboard.txt',
      path: '../sample_files/Dashboard/analytics-dashboard.txt',
      expectedType: 'Report',
      expectedDestination: 'Dashboard'
    },
    {
      name: 'office-supplies-receipt.txt',
      path: '../sample_files/Expense Tracker/office-supplies-receipt.txt',
      expectedType: 'Receipt',
      expectedDestination: 'Expense Tracker'
    },
    {
      name: 'travel-expense-report.txt',
      path: '../sample_files/Expense Tracker/travel-expense-report.txt',
      expectedType: 'Receipt',
      expectedDestination: 'Expense Tracker'
    },
    {
      name: 'annual-financial-statement.txt',
      path: '../sample_files/Financial Review/annual-financial-statement.txt',
      expectedType: 'Statement',
      expectedDestination: 'Financial Review'
    },
    {
      name: 'budget-analysis.txt',
      path: '../sample_files/Financial Review/budget-analysis.txt',
      expectedType: 'Budget',
      expectedDestination: 'Financial Review'
    },
    {
      name: 'contract-agreement.txt',
      path: '../sample_files/Legal DMS/contract-agreement.txt',
      expectedType: 'Contract',
      expectedDestination: 'Legal DMS'
    },
    {
      name: 'compliance-policy.txt',
      path: '../sample_files/Legal DMS/compliance-policy.txt',
      expectedType: 'Contract',
      expectedDestination: 'Legal DMS'
    },
    {
      name: 'team-collaboration-notes.txt',
      path: '../sample_files/Slack/team-collaboration-notes.txt',
      expectedType: 'Communication',
      expectedDestination: 'Slack'
    },
    {
      name: 'client-feedback-summary.txt',
      path: '../sample_files/Slack/client-feedback-summary.txt',
      expectedType: 'Communication',
      expectedDestination: 'Slack'
    }
  ];

  const results = [];

  for (let i = 0; i < sampleFiles.length; i++) {
    const file = sampleFiles[i];
    console.log(`📄 Test ${i + 1}: Testing ${file.name}`);
    console.log(`   Expected: ${file.expectedType} → ${file.expectedDestination}`);
    
    try {
      // Check if file exists
      const filePath = path.join(__dirname, file.path);
      if (!fs.existsSync(filePath)) {
        console.log(`   ❌ File not found: ${filePath}`);
        results.push({
          file: file.name,
          success: false,
          error: 'File not found'
        });
        continue;
      }

      // Upload file
      const formData = new FormData();
      formData.append('document', fs.createReadStream(filePath));
      
      const uploadResponse = await axios.post(`${BACKEND_URL}/api/documents/upload`, formData, {
        headers: formData.getHeaders()
      });
      
      console.log(`   ✅ Uploaded: ${uploadResponse.data.id}`);
      
      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 15000));
      
      // Check results
      const docResponse = await axios.get(`${BACKEND_URL}/api/documents/${uploadResponse.data.id}`);
      const doc = docResponse.data.document;
      
      const typeMatch = doc.type === file.expectedType;
      const destinationMatch = doc.destination === file.expectedDestination;
      const confidence = doc.confidence || 0;
      const extractionConfidence = doc.extractionConfidence || 0;
      
      console.log(`   📊 Results:`);
      console.log(`      Type: ${doc.type} (expected: ${file.expectedType}) ${typeMatch ? '✅' : '❌'}`);
      console.log(`      Destination: ${doc.destination} (expected: ${file.expectedDestination}) ${destinationMatch ? '✅' : '❌'}`);
      console.log(`      Classification Confidence: ${Math.round(confidence * 100)}%`);
      console.log(`      Extraction Confidence: ${Math.round(extractionConfidence * 100)}%`);
      console.log(`      Status: ${doc.status}`);
      console.log(`      Extraction Method: ${doc.extractionMethod || 'Unknown'}`);
      
      results.push({
        file: file.name,
        success: typeMatch && destinationMatch && confidence > 0.7,
        type: doc.type,
        expectedType: file.expectedType,
        destination: doc.destination,
        expectedDestination: file.expectedDestination,
        confidence: confidence,
        extractionConfidence: extractionConfidence,
        status: doc.status,
        typeMatch,
        destinationMatch
      });
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.response?.data?.error || error.message}`);
      results.push({
        file: file.name,
        success: false,
        error: error.response?.data?.error || error.message
      });
    }
    
    console.log('');
  }

  // Summary
  console.log('📋 TEST SUMMARY');
  console.log('===============');
  
  const successful = results.filter(r => r.success).length;
  const total = results.length;
  
  console.log(`Total Tests: ${total}`);
  console.log(`Successful: ${successful}`);
  console.log(`Success Rate: ${Math.round((successful / total) * 100)}%`);
  console.log('');
  
  results.forEach((result, index) => {
    const status = result.success ? '✅' : '❌';
    console.log(`${index + 1}. ${status} ${result.file}`);
    if (!result.success) {
      console.log(`   Type: ${result.type} (expected: ${result.expectedType})`);
      console.log(`   Destination: ${result.destination} (expected: ${result.expectedDestination})`);
      console.log(`   Confidence: ${Math.round((result.confidence || 0) * 100)}%`);
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
    }
  });
  
  console.log('');
  console.log('🎉 Sample files testing completed!');
}

// Run the tests
testSampleFiles(); 