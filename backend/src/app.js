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

// ===================================================================
// === THIS IS THE CORRECTED SECTION ===
// ===================================================================
// Define the single, correct path for the Angular build output.
// We go up TWO directories ('..', '..') from /backend/src to reach the root /app
const frontendPath = path.join(__dirname, '..', '..', 'frontend', 'dist', 'browser');
const frontendExists = fs.existsSync(path.join(frontendPath, 'index.html'));

// Serve static files from the Angular app directory.
app.use(express.static(frontendPath));

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
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: config.server.nodeEnv,
    version: '1.0.0',
    uptime: process.uptime(),
    frontend: {
      path: frontendPath,
      exists: frontendExists,
    },
    config: {
      port: config.server.port,
      groqConfigured: !!config.groq.apiKey,
      pineconeConfigured: !!config.pinecone.apiKey,
    },
  });
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
    },
  });
});

// === FALLBACK: SERVE ANGULAR INDEX ===
// Any non-API route should serve the Angular app for client-side routing.
app.get('*', (req, res) => {
  // If the request starts with /api, it's an API call that wasn't caught by a route.
  if (req.originalUrl.startsWith('/api')) {
    return res.status(404).json({ error: 'API endpoint not found.' });
  }

  const indexPath = path.join(frontendPath, 'index.html');

  if (frontendExists) {
    res.sendFile(indexPath);
  } else {
    // If index.html doesn't exist, it means the frontend build failed or was skipped.
    res.status(404).json({
      error: 'Frontend Application Not Found',
      message:
        'The server is running, but the user interface is missing because the frontend build was not successful.',
      suggestion:
        'The path your server is checking is now correct. This error means the frontend build process itself failed inside Docker. Review your Docker build logs for any errors during the "RUN npm run build:frontend" step.',
      checkedPath: frontendPath,
      indexExists: false,
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
  });

  const errorResponse = {
    error: config.server.nodeEnv === 'production' ? 'Internal Server Error' : err.message,
  };

  if (config.server.nodeEnv !== 'production') {
    errorResponse.stack = err.stack;
  }

  res.status(err.status || 500).json(errorResponse);
});

// === GRACEFUL SHUTDOWN ===
const shutdown = signal => {
  console.log(`\n🛑 Received ${signal}, shutting down gracefully...`);
  process.exit(0);
};
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// === START SERVER ===
const PORT = config.server.port;
app.listen(PORT, '0.0.0.0', () => {
  console.log('\n🚀 ================================');
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${config.server.nodeEnv}`);
  console.log(`🗂️  Expecting frontend at: ${frontendPath}`);
  console.log(`🔍 Frontend found: ${frontendExists ? '✅ Yes' : '❌ No'}`);
  if (!frontendExists) {
    console.warn('⚠️  The UI will not be available until the frontend is built successfully.');
  }
  console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
  console.log('🚀 ================================\n');
});
