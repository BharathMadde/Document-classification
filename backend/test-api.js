const fs = require('fs');
const path = require('path');

// Test the backend APIs
async function testAPIs() {
  console.log('🧪 Testing Backend APIs...\n');
  
  try {
    // Test 1: Check if server is running
    console.log('1. Testing server connection...');
    const response = await fetch('http://localhost:3000/api/documents');
    if (response.ok) {
      console.log('✅ Server is running');
    } else {
      console.log('❌ Server not responding');
      return;
    }
    
    // Test 2: List documents
    console.log('\n2. Testing list documents...');
    const listResponse = await fetch('http://localhost:3000/api/documents');
    const listData = await listResponse.json();
    console.log(`✅ Found ${listData.count || 0} documents`);
    
    // Test 3: Upload a test document
    console.log('\n3. Testing document upload...');
    const testFile = Buffer.from('Test document content');
    const formData = new FormData();
    formData.append('document', new Blob([testFile], { type: 'text/plain' }), 'test-document.txt');
    
    const uploadResponse = await fetch('http://localhost:3000/api/documents/upload', {
      method: 'POST',
      body: formData
    });
    
    if (uploadResponse.ok) {
      const uploadData = await uploadResponse.json();
      console.log(`✅ Document uploaded: ${uploadData.id}`);
      
      // Test 4: Extract text
      console.log('\n4. Testing text extraction...');
      const extractResponse = await fetch('http://localhost:3000/api/documents/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: uploadData.id })
      });
      
      if (extractResponse.ok) {
        const extractData = await extractResponse.json();
        console.log(`✅ Text extracted: ${extractData.entities ? Object.keys(extractData.entities).length : 0} entities found`);
        
        // Test 5: Classify document
        console.log('\n5. Testing document classification...');
        const classifyResponse = await fetch('http://localhost:3000/api/documents/classify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: uploadData.id, extractedText: extractData.extractedText })
        });
        
        if (classifyResponse.ok) {
          const classifyData = await classifyResponse.json();
          console.log(`✅ Document classified as: ${classifyData.type} (${(classifyData.confidence * 100).toFixed(1)}% confidence)`);
          
          // Test 6: Route document
          console.log('\n6. Testing document routing...');
          const routeResponse = await fetch('http://localhost:3000/api/documents/route', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: uploadData.id, type: classifyData.type })
          });
          
          if (routeResponse.ok) {
            const routeData = await routeResponse.json();
            console.log(`✅ Document routed to: ${routeData.destination}`);
          } else {
            console.log('❌ Routing failed');
          }
        } else {
          console.log('❌ Classification failed');
        }
      } else {
        console.log('❌ Extraction failed');
      }
    } else {
      console.log('❌ Upload failed');
    }
    
    // Test 7: Final document list
    console.log('\n7. Final document list...');
    const finalResponse = await fetch('http://localhost:3000/api/documents');
    const finalData = await finalResponse.json();
    console.log(`✅ Final count: ${finalData.count || 0} documents`);
    
    console.log('\n🎉 All tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testAPIs();
}

module.exports = { testAPIs }; 