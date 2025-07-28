const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

async function testFrontendAPI() {
  console.log('🧪 Testing Frontend API Access...\n');

  try {
    // Test 1: Check if backend is accessible
    console.log('1. Testing backend accessibility...');
    const healthResponse = await fetch('http://localhost:3000/health');
    const healthData = await healthResponse.json();
    console.log('✅ Backend health:', healthData);

    // Test 2: Test documents API with frontend-like headers
    console.log('\n2. Testing documents API with frontend headers...');
    const docsResponse = await fetch('http://localhost:3000/api/documents', {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Origin: 'http://localhost:4200',
      },
    });

    if (docsResponse.ok) {
      const docsData = await docsResponse.json();
      console.log('✅ Documents API response:', docsData);
      console.log(`📄 Found ${docsData.total} documents`);

      if (docsData.documents && docsData.documents.length > 0) {
        console.log('📋 Document details:');
        docsData.documents.forEach((doc, index) => {
          console.log(`   ${index + 1}. ${doc.filename} (ID: ${doc.id})`);
        });
      }
    } else {
      console.error('❌ Documents API failed:', docsResponse.status, docsResponse.statusText);
    }

    // Test 3: Test CORS headers
    console.log('\n3. Testing CORS headers...');
    const corsResponse = await fetch('http://localhost:3000/api/documents', {
      method: 'OPTIONS',
      headers: {
        Origin: 'http://localhost:4200',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type',
      },
    });

    console.log('✅ CORS headers:', {
      'Access-Control-Allow-Origin': corsResponse.headers.get('Access-Control-Allow-Origin'),
      'Access-Control-Allow-Methods': corsResponse.headers.get('Access-Control-Allow-Methods'),
      'Access-Control-Allow-Headers': corsResponse.headers.get('Access-Control-Allow-Headers'),
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testFrontendAPI();
