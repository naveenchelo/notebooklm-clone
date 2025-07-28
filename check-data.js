const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

async function checkData() {
  console.log('🔍 Checking NotebookLM Clone Data...\n');

  try {
    // Check backend health
    const health = await fetch('http://localhost:3000/health').then(r => r.json());
    console.log('✅ Backend Status:', health.status);

    // Get all documents
    const docs = await fetch('http://localhost:3000/api/documents').then(r => r.json());
    console.log(`📄 Total Documents: ${docs.total}`);

    if (docs.documents && docs.documents.length > 0) {
      console.log('\n📋 Documents:');
      docs.documents.forEach((doc, index) => {
        console.log(`${index + 1}. ${doc.filename} (${doc.pages} pages, ${doc.chunks} chunks)`);
        console.log(`   ID: ${doc.id}`);
        console.log(`   Status: ${doc.status}`);
        console.log(`   Uploaded: ${new Date(doc.uploadedAt).toLocaleString()}`);
        console.log('');
      });

      // Test chat with first document
      const firstDoc = docs.documents[0];
      console.log(`💬 Testing chat with "${firstDoc.filename}"...`);

      const chat = await fetch(`http://localhost:3000/api/chat/${firstDoc.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'What is this document about?',
          history: [],
        }),
      }).then(r => r.json());

      if (chat.success) {
        console.log('🤖 AI Response:', chat.response.content.substring(0, 200) + '...');
        console.log(`📚 Citations: ${chat.response.citations.length}`);
      } else {
        console.log('❌ Chat failed:', chat.message);
      }
    } else {
      console.log('📭 No documents uploaded yet');
      console.log('💡 Upload a PDF file to get started!');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('💡 Make sure the backend server is running on http://localhost:3000');
  }
}

checkData();
