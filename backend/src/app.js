require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');
const fs = require('fs');
const config = require('./config');

const app = express();

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: false, // Disable CSP for now (adjust in production if needed)
    crossOriginEmbedderPolicy: false, // Allow Angular assets to load
  })
);

// Request logging middleware (for debugging)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Logging, compression, body parsing, CORS
app.use(compression());
app.use(morgan('combined'));
app.use(
  cors({
    origin: '*', // Accept all origins; adjust if needed for security
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

app.use(express.json({ limit: config.upload.maxFileSize || '50mb' }));
app.use(express.urlencoded({ extended: true, limit: config.upload.maxFileSize || '50mb' }));

// === STATIC FILES SETUP ===
// Check multiple possible frontend build locations
const possibleFrontendPaths = [
  path.join(__dirname, '../../frontend/dist/browser'),
  path.join(__dirname, '../../frontend/dist'),
  path.join(__dirname, '../public'), // fallback
];

let frontendPath = null;
let frontendExists = false;

for (const testPath of possibleFrontendPaths) {
  console.log(`Checking frontend path: ${testPath}`);
  if (fs.existsSync(testPath)) {
    frontendPath = testPath;
    frontendExists = true;
    console.log(`✅ Found frontend files at: ${frontendPath}`);
    break;
  } else {
    console.log(`❌ Frontend not found at: ${testPath}`);
  }
}

if (!frontendExists) {
  console.warn('⚠️  No frontend build found. Creating minimal fallback.');
  frontendPath = path.join(__dirname, '../public');

  // Create public directory and basic index.html if it doesn't exist
  if (!fs.existsSync(frontendPath)) {
    fs.mkdirSync(frontendPath, { recursive: true });
  }

  const fallbackHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NotebookLM Clone</title>
    <style>
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            margin: 0; 
            padding: 40px; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
        }
        .container { 
            max-width: 800px; 
            margin: 0 auto; 
            background: rgba(255, 255, 255, 0.1);
            padding: 40px;
            border-radius: 20px;
            backdrop-filter: blur(10px);
        }
        .status { 
            padding: 20px; 
            border-radius: 10px; 
            margin: 20px 0;
            background: rgba(255, 255, 255, 0.2);
        }
        .success { background: rgba(76, 175, 80, 0.3); }
        .error { background: rgba(244, 67, 54, 0.3); }
        button {
            background: rgba(255, 255, 255, 0.2);
            border: 2px solid white;
            color: white;
            padding: 12px 24px;
            border-radius: 25px;
            cursor: pointer;
            font-size: 16px;
            transition: all 0.3s ease;
        }
        button:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: translateY(-2px);
        }
        .upload-area {
            border: 2px dashed rgba(255, 255, 255, 0.5);
            padding: 40px;
            text-align: center;
            border-radius: 15px;
            margin: 20px 0;
            transition: all 0.3s ease;
        }
        .upload-area:hover {
            border-color: white;
            background: rgba(255, 255, 255, 0.1);
        }
        h1 { text-align: center; font-size: 2.5em; margin-bottom: 10px; }
        h3 { color: #fff; }
        .info { font-size: 1.1em; text-align: center; margin-bottom: 30px; opacity: 0.9; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🤖 NotebookLM Clone</h1>
        <p class="info">Backend is running! Frontend will be available once built successfully.</p>
        
        <div class="upload-area">
            <h3>🔍 System Status</h3>
            <div class="status" id="status">
                <p>API Health: <strong id="health">Checking...</strong></p>
                <p>Environment: <strong id="env">Loading...</strong></p>
                <p>Timestamp: <strong id="timestamp">Loading...</strong></p>
            </div>
            <button onclick="checkHealth()">🔄 Refresh Status</button>
        </div>

        <div class="upload-area">
            <h3>📋 Available Endpoints</h3>
            <p><code>GET /api/health</code> - Health check</p>
            <p><code>POST /api/upload</code> - Upload PDF files</p>
            <p><code>POST /api/chat</code> - Chat with documents</p>
            <p><code>GET /api/documents/:id/stats</code> - Document statistics</p>
        </div>
    </div>

    <script>
        async function checkHealth() {
            const statusEl = document.getElementById('status');
            const healthEl = document.getElementById('health');
            const envEl = document.getElementById('env');
            const timestampEl = document.getElementById('timestamp');
            
            try {
                statusEl.className = 'status';
                healthEl.textContent = 'Checking...';
                
                const response = await fetch('/api/health');
                const data = await response.json();
                
                if (response.ok) {
                    statusEl.className = 'status success';
                    healthEl.textContent = data.status || 'OK';
                    envEl.textContent = data.environment || 'Unknown';
                    timestampEl.textContent = new Date(data.timestamp).toLocaleString();
                } else {
                    throw new Error('API returned error status');
                }
            } catch (error) {
                statusEl.className = 'status error';
                healthEl.textContent = 'Error: ' + error.message;
                envEl.textContent = 'Unknown';
                timestampEl.textContent = new Date().toLocaleString();
            }
        }
        
        // Check health on page load
        checkHealth();
        
        // Auto-refresh every 30 seconds
        setInterval(checkHealth, 30000);
    </script>
</body>
</html>`;

  const indexPath = path.join(frontendPath, 'index.html');
  if (!fs.existsSync(indexPath)) {
    fs.writeFileSync(indexPath, fallbackHtml);
    console.log('✅ Created fallback HTML at:', indexPath);
  }
}

// Serve static files
app.use(
  express.static(frontendPath, {
    maxAge: '1h', // Cache static files for 1 hour
    etag: true,
    lastModified: true,
  })
);

// === API ROUTES ===
const uploadRoutes = require('./routes/upload');
const chatRoutes = require('./routes/chat');
const documentRoutes = require('./routes/documents');

// API routes with error handling
try {
  app.use('/api/upload', uploadRoutes);
  console.log('✅ Upload routes loaded');
} catch (error) {
  console.error('❌ Failed to load upload routes:', error.message);
}

try {
  app.use('/api/chat', chatRoutes);
  console.log('✅ Chat routes loaded');
} catch (error) {
  console.error('❌ Failed to load chat routes:', error.message);
}

try {
  app.use('/api/documents', documentRoutes);
  console.log('✅ Document routes loaded');
} catch (error) {
  console.error('❌ Failed to load document routes:', error.message);
}

// === HEALTH CHECK ===
app.get('/api/health', (req, res) => {
  const healthData = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: config.server.nodeEnv,
    version: '1.0.0',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    pid: process.pid,
    frontend: {
      path: frontendPath,
      exists: frontendExists,
    },
    config: {
      port: config.server.port,
      maxFileSize: config.upload.maxFileSize,
      groqConfigured: !!config.groq.apiKey,
      pineconeConfigured: !!config.pinecone.apiKey,
    },
  };

  res.json(healthData);
});

// === API DOCUMENTATION ===
app.get('/api', (req, res) => {
  res.json({
    name: 'NotebookLM Clone API',
    version: '1.0.0',
    description: 'PDF processing and AI chat API',
    endpoints: {
      'GET /api/health': 'Health check and system status',
      'POST /api/upload': 'Upload PDF files for processing',
      'POST /api/chat': 'Chat with uploaded documents',
      'GET /api/documents/:id/stats': 'Get document statistics',
      'DELETE /api/documents/:id': 'Delete a document',
    },
    documentation: 'Visit the root URL for the web interface',
  });
});

// === FALLBACK: SERVE ANGULAR INDEX ===
// Any non-API route should serve Angular app (for client-side routing)
app.get('*', (req, res) => {
  const indexPath = path.join(frontendPath, 'index.html');

  // Check if index.html exists
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    // If no index.html, return a JSON response for API-like behavior
    res.status(404).json({
      error: 'Frontend not found',
      message: 'The frontend application is not built or deployed.',
      suggestion: 'Run "npm run build:frontend" to build the Angular application.',
      availableEndpoints: [
        'GET /api/health - System health check',
        'GET /api - API documentation',
        'POST /api/upload - Upload PDF files',
        'POST /api/chat - Chat with documents',
      ],
      frontendPath: frontendPath,
      indexExists: fs.existsSync(indexPath),
    });
  }
});

// === GLOBAL ERROR HANDLER ===
app.use((err, req, res, next) => {
  console.error('❌ Global Error Handler:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString(),
  });

  // Don't leak error details in production
  const errorResponse = {
    error: config.server.nodeEnv === 'production' ? 'Internal Server Error' : err.message,
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method,
  };

  // Add stack trace in development
  if (config.server.nodeEnv !== 'production') {
    errorResponse.stack = err.stack;
  }

  res.status(err.status || 500).json(errorResponse);
});

// === GRACEFUL SHUTDOWN ===
process.on('SIGINT', () => {
  console.log('\n🛑 Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

// === START SERVER ===
const PORT = config.server.port;
app.listen(PORT, '0.0.0.0', () => {
  console.log('\n🚀 ================================');
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${config.server.nodeEnv}`);
  console.log(`🗂️  Frontend path: ${frontendPath}`);
  console.log(`🔍 Frontend exists: ${frontendExists}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📚 API docs: http://localhost:${PORT}/api`);
  console.log(`🔑 Groq configured: ${!!config.groq.apiKey}`);
  console.log(`📌 Pinecone configured: ${!!config.pinecone.apiKey}`);
  console.log('🚀 ================================\n');
});
