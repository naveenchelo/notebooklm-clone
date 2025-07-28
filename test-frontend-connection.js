const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

async function testFrontendConnection() {
  console.log('🧪 Testing Frontend-Backend Connection...\n');

  try {
    // Test the exact API call the frontend makes
    console.log('1. Testing documents API (frontend call)...');
    const response = await fetch('http://localhost:3000/api/documents', {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ API Response Structure:');
      console.log(`   Success: ${data.success}`);
      console.log(`   Total Documents: ${data.total}`);
      console.log(`   Documents Array: ${Array.isArray(data.documents)}`);

      if (data.documents && data.documents.length > 0) {
        const doc = data.documents[0];
        console.log('\n📄 First Document Properties:');
        console.log(`   ID: ${doc.id}`);
        console.log(`   Filename: ${doc.filename}`);
        console.log(`   Original Name: ${doc.originalName}`);
        console.log(`   File Path: ${doc.filePath}`);
        console.log(`   Pages: ${doc.pages}`);
        console.log(`   Chunks: ${doc.chunks}`);
        console.log(`   File Size: ${doc.fileSize}`);
        console.log(`   Status: ${doc.status}`);
        console.log(`   Has Metadata: ${!!doc.metadata}`);
        console.log(`   Has Processing Info: ${!!doc.processingInfo}`);
        console.log(`   Has Vector Info: ${!!doc.vectorInfo}`);

        // Check if all required properties are present
        const requiredProps = [
          'id',
          'filename',
          'originalName',
          'filePath',
          'pages',
          'chunks',
          'fileSize',
          'uploadedAt',
          'metadata',
          'processingInfo',
          'vectorInfo',
          'status',
        ];
        const missingProps = requiredProps.filter(prop => !(prop in doc));

        if (missingProps.length === 0) {
          console.log('\n✅ All required properties are present!');
        } else {
          console.log('\n❌ Missing properties:', missingProps);
        }
      }
    } else {
      console.error('❌ API call failed:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testFrontendConnection();
