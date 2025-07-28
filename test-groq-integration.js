const fs = require('fs');
const FormData = require('form-data');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

async function testGroqIntegration() {
  try {
    console.log('🚀 Testing Groq Integration...');

    // Test 1: Check backend health
    console.log('\n1. Checking backend health...');
    const healthResponse = await fetch('http://localhost:3000/health');
    const healthData = await healthResponse.json();
    console.log('✅ Backend health:', healthData);

    // Test 2: Check current documents
    console.log('\n2. Checking current documents...');
    const docsResponse = await fetch('http://localhost:3000/api/documents/debug');
    const docsData = await docsResponse.json();
    console.log('📄 Current documents:', docsData);

    // Test 3: Upload a test PDF
    console.log('\n3. Uploading test PDF...');
    const formData = new FormData();
    formData.append(
      'file',
      fs.createReadStream('./backend/node_modules/pdf-parse/test/data/01-valid.pdf')
    );

    const uploadResponse = await fetch('http://localhost:3000/api/documents/upload', {
      method: 'POST',
      body: formData,
    });

    const uploadData = await uploadResponse.json();
    console.log('📤 Upload result:', uploadData);

    if (uploadData.success) {
      const documentId = uploadData.document.id;

      // Test 4: Test chat with Groq
      console.log('\n4. Testing chat with Groq...');
      const chatResponse = await fetch(`http://localhost:3000/api/chat/${documentId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'What is this document about?',
          history: [],
        }),
      });

      const chatData = await chatResponse.json();
      console.log('💬 Chat response:', chatData);

      // Test 5: Test streaming chat
      console.log('\n5. Testing streaming chat...');
      const streamResponse = await fetch(`http://localhost:3000/api/chat/${documentId}/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'Summarize the key points',
          history: [],
        }),
      });

      console.log('📡 Streaming response status:', streamResponse.status);

      // Test 6: Get chat suggestions
      console.log('\n6. Getting chat suggestions...');
      const suggestionsResponse = await fetch(
        `http://localhost:3000/api/chat/${documentId}/suggestions`
      );
      const suggestionsData = await suggestionsResponse.json();
      console.log('💡 Suggestions:', suggestionsData);

      // Test 7: Get document content
      console.log('\n7. Getting document content...');
      const contentResponse = await fetch(
        `http://localhost:3000/api/documents/${documentId}/content`
      );
      const contentData = await contentResponse.json();
      console.log(
        '📖 Document content chunks:',
        contentData.chunks ? contentData.chunks.length : 0
      );

      // Test 8: Final documents check
      console.log('\n8. Final documents check...');
      const finalDocsResponse = await fetch('http://localhost:3000/api/documents/debug');
      const finalDocsData = await finalDocsResponse.json();
      console.log('📄 Final documents state:', finalDocsData);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Function to check data in different ways
async function checkData() {
  console.log('\n🔍 Data Checking Methods:');

  // Method 1: Debug endpoint
  console.log('\nMethod 1: Debug endpoint');
  const debugResponse = await fetch('http://localhost:3000/api/documents/debug');
  const debugData = await debugResponse.json();
  console.log('Debug data:', JSON.stringify(debugData, null, 2));

  // Method 2: All documents
  console.log('\nMethod 2: All documents');
  const allDocsResponse = await fetch('http://localhost:3000/api/documents');
  const allDocsData = await allDocsResponse.json();
  console.log('All documents:', JSON.stringify(allDocsData, null, 2));

  // Method 3: Specific document
  if (debugData.documents && debugData.documents.length > 0) {
    const docId = debugData.documents[0].id;
    console.log(`\nMethod 3: Specific document (${docId})`);
    const docResponse = await fetch(`http://localhost:3000/api/documents/${docId}`);
    const docData = await docResponse.json();
    console.log('Document details:', JSON.stringify(docData, null, 2));
  }
}

// Run tests
testGroqIntegration()
  .then(() => {
    return checkData();
  })
  .catch(console.error);
