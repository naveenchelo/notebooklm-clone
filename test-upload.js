const fs = require('fs');
const FormData = require('form-data');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

async function testUpload() {
  try {
    console.log('🚀 Testing document upload...');

    // Test 1: Check if backend is running
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

    // Test 4: Check documents after upload
    console.log('\n4. Checking documents after upload...');
    const docsAfterResponse = await fetch('http://localhost:3000/api/documents/debug');
    const docsAfterData = await docsAfterResponse.json();
    console.log('📄 Documents after upload:', docsAfterData);

    // Test 5: Get all documents
    console.log('\n5. Getting all documents...');
    const allDocsResponse = await fetch('http://localhost:3000/api/documents');
    const allDocsData = await allDocsResponse.json();
    console.log('📋 All documents:', allDocsData);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testUpload();
