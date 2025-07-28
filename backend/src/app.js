require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');
const config = require('./config');

const app = express();

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: false, // Disable CSP for now (adjust in production if needed)
  })
);

// Logging, compression, body parsing, CORS
app.use(compression());
app.use(morgan('combined'));
app.use(
  cors({
    origin: '*', // Accept all origins; adjust if needed for security
    credentials: true,
  })
);

app.use(express.json({ limit: config.upload.maxFileSize || '50mb' }));
app.use(express.urlencoded({ extended: true, limit: config.upload.maxFileSize || '50mb' }));

// Serve Angular static files from frontend/dist
const frontendPath = path.join(__dirname, '../../frontend/dist/browser');
app.use(express.static(frontendPath));

// === API ROUTES ===
const uploadRoutes = require('./routes/upload');
const chatRoutes = require('./routes/chat');
const documentRoutes = require('./routes/documents');

app.use('/api/upload', uploadRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/documents', documentRoutes);

// === HEALTH CHECK ===
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: config.server.nodeEnv,
  });
});

// === FALLBACK: SERVE ANGULAR INDEX ===
// Any non-API route should serve Angular app (for deep linking)
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// === GLOBAL ERROR HANDLER ===
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(err.status || 500).json({
    error: config.server.nodeEnv === 'production' ? 'Internal Server Error' : err.message,
  });
});

// === START SERVER ===
const PORT = config.server.port;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${config.server.nodeEnv}`);
});
