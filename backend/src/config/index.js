require('dotenv').config();

const config = {
  // Server Configuration
  server: {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:4200',
  },

  // Groq Configuration
  groq: {
    apiKey: process.env.GROQ_API_KEY,
    model: process.env.GROQ_MODEL || 'llama3-8b-8192',
    maxTokens: 2000,
    temperature: 0.7,
  },

  // Pinecone Configuration
  pinecone: {
    apiKey: process.env.PINECONE_API_KEY,
    environment: process.env.PINECONE_ENVIRONMENT,
    indexName: process.env.PINECONE_INDEX_NAME || 'notebooklm-documents',
  },

  // File Upload Configuration
  upload: {
    directory: process.env.UPLOAD_DIR || './uploads',
    maxFileSize: process.env.MAX_FILE_SIZE || '50mb',
    allowedTypes: (process.env.ALLOWED_FILE_TYPES || 'application/pdf').split(','),
  },

  // Text Processing Configuration
  textProcessing: {
    chunkSize: parseInt(process.env.CHUNK_SIZE) || 1000,
    chunkOverlap: parseInt(process.env.CHUNK_OVERLAP) || 200,
    maxChunksPerDocument: parseInt(process.env.MAX_CHUNKS_PER_DOCUMENT) || 1000,
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  },

  // Security
  security: {
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
    sessionSecret: process.env.SESSION_SECRET || 'your-session-secret',
  },

  // Database
  database: {
    url: process.env.DATABASE_URL || 'mongodb://localhost:27017/notebooklm',
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
};

// Validation
const requiredEnvVars = ['GROQ_API_KEY', 'PINECONE_API_KEY', 'PINECONE_ENVIRONMENT'];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0 && config.server.nodeEnv === 'production') {
  console.error('❌ Missing required environment variables:', missingVars);
  process.exit(1);
}

if (missingVars.length > 0) {
  console.warn('⚠️  Missing environment variables (development mode):', missingVars);
}

module.exports = config;
