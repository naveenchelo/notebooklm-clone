const fs = require('fs');
const FormData = require('form-data');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

async function uploadDummyFile() {
  try {
    console.log('📤 Uploading dummy PDF file...');

    // Check if the test PDF exists
    const testPdfPath = './backend/node_modules/pdf-parse/test/data/01-valid.pdf';

    if (!fs.existsSync(testPdfPath)) {
      console.error('❌ Test PDF not found at:', testPdfPath);
      console.log('💡 Creating a simple dummy PDF...');

      // Create a simple dummy PDF using a different approach
      const dummyPdfPath = './dummy-test.pdf';

      // Check if we have any PDF in the project
      const possiblePaths = [
        './backend/node_modules/pdf-parse/test/data/01-valid.pdf',
        './backend/node_modules/pdf-parse/test/data/02-valid.pdf',
        './backend/node_modules/pdf-parse/test/data/03-valid.pdf',
        './dummy-test.pdf',
      ];

      let pdfPath = null;
      for (const path of possiblePaths) {
        if (fs.existsSync(path)) {
          pdfPath = path;
          break;
        }
      }

      if (!pdfPath) {
        console.error('❌ No PDF files found. Please provide a PDF file to upload.');
        return;
      }

      console.log(`✅ Using PDF file: ${pdfPath}`);
    } else {
      console.log(`✅ Found test PDF: ${testPdfPath}`);
    }

    // Create form data
    const formData = new FormData();
    formData.append('file', fs.createReadStream(testPdfPath));

    console.log('🚀 Sending upload request...');

    // Upload the file
    const response = await fetch('http://localhost:3000/api/documents/upload', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (result.success) {
      console.log('✅ Upload successful!');
      console.log('📄 Document details:');
      console.log(`   ID: ${result.document.id}`);
      console.log(`   Filename: ${result.document.filename}`);
      console.log(`   Pages: ${result.document.pages}`);
      console.log(`   Chunks: ${result.document.chunks}`);
      console.log(`   File Size: ${(result.document.fileSize / 1024).toFixed(2)} KB`);
      console.log(`   Uploaded: ${new Date(result.document.uploadedAt).toLocaleString()}`);

      // Test chat with the uploaded document
      console.log('\n💬 Testing chat with uploaded document...');
      const chatResponse = await fetch(`http://localhost:3000/api/chat/${result.document.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'What is this document about?',
          history: [],
        }),
      });

      const chatResult = await chatResponse.json();

      if (chatResult.success) {
        console.log('🤖 AI Response:', chatResult.response.content.substring(0, 200) + '...');
        console.log(`📚 Citations: ${chatResult.response.citations.length}`);
      } else {
        console.log('❌ Chat failed:', chatResult.message);
      }
    } else {
      console.error('❌ Upload failed:', result.message);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the upload
uploadDummyFile();
