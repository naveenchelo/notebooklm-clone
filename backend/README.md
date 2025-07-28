# NotebookLM Backend API

A powerful backend API for processing PDF documents and providing AI-powered chat functionality, similar to Google's NotebookLM.

## 🚀 Features

- **PDF Processing**: Upload, parse, and extract text from PDF documents
- **Vector Search**: Store document chunks in Pinecone vector database
- **AI Chat**: Interactive chat with documents using OpenAI GPT models
- **Search**: Semantic search within documents with page-level results
- **Citations**: Automatic citation extraction and page references
- **Real-time Streaming**: Stream AI responses for better UX

## 🛠 Technology Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Multer** - File upload handling
- **PDF-Parse** - PDF text extraction
- **OpenAI API** - Text embeddings and chat completions
- **Pinecone** - Vector database for embeddings
- **LangChain** - RAG pipeline implementation

## 📋 Prerequisites

- Node.js 18+ 
- OpenAI API key
- Pinecone API key and environment
- PDF files for testing

## 🔧 Installation

1. **Clone the repository**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` with your API keys:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   PINECONE_API_KEY=your_pinecone_api_key_here
   PINECONE_ENVIRONMENT=your_pinecone_environment
   ```

4. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

The server will start on `http://localhost:3000`

## 📚 API Endpoints

### Document Management

#### Upload Document
```http
POST /api/documents/upload
Content-Type: multipart/form-data

file: [PDF file]
```

#### Get All Documents
```http
GET /api/documents
```

#### Get Document by ID
```http
GET /api/documents/:id
```

#### Get Document Content
```http
GET /api/documents/:id/content
```

#### Get Page Content
```http
GET /api/documents/:id/page/:pageNumber
```

#### Delete Document
```http
DELETE /api/documents/:id
```

#### Get Document Statistics
```http
GET /api/documents/:id/stats
```

### Chat System

#### Send Chat Message
```http
POST /api/chat/:documentId
Content-Type: application/json

{
  "message": "What are the main findings?",
  "history": []
}
```

#### Get Chat History
```http
GET /api/chat/:documentId/history?limit=50&offset=0
```

#### Clear Chat History
```http
DELETE /api/chat/:documentId
```

#### Stream Chat Response
```http
POST /api/chat/:documentId/stream
Content-Type: application/json

{
  "message": "What are the main findings?",
  "history": []
}
```

#### Get Chat Suggestions
```http
GET /api/chat/:documentId/suggestions
```

### Search System

#### Search Within Document
```http
POST /api/search/:documentId
Content-Type: application/json

{
  "query": "machine learning",
  "topK": 10,
  "threshold": 0.7
}
```

#### Global Search
```http
POST /api/search/global
Content-Type: application/json

{
  "query": "artificial intelligence",
  "topK": 10,
  "threshold": 0.7
}
```

#### Get Search Suggestions
```http
GET /api/search/:documentId/suggestions?query=machine
```

#### Get Page Highlights
```http
GET /api/search/:documentId/highlights?query=algorithm&page=5
```

#### Get Search Statistics
```http
GET /api/search/stats
```

## 🔍 Response Formats

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
```

### Error Response
```json
{
  "error": "Error type",
  "message": "Detailed error message"
}
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration management
│   ├── middleware/      # Express middleware
│   ├── models/          # Data models
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   └── utils/           # Utility functions
├── uploads/             # PDF file storage
├── server.js           # Main server file
├── package.json        # Dependencies
└── README.md          # This file
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment | `development` |
| `OPENAI_API_KEY` | OpenAI API key | Required |
| `PINECONE_API_KEY` | Pinecone API key | Required |
| `PINECONE_ENVIRONMENT` | Pinecone environment | Required |
| `UPLOAD_DIR` | Upload directory | `./uploads` |
| `MAX_FILE_SIZE` | Max file size | `50mb` |
| `CHUNK_SIZE` | Text chunk size | `1000` |
| `CHUNK_OVERLAP` | Chunk overlap | `200` |

### File Upload Limits

- **File Size**: 50MB maximum
- **File Types**: PDF only
- **Multiple Files**: Up to 10 files per request

## 🚀 Deployment

### Local Development
```bash
npm run dev
```

### Production
```bash
npm start
```

### Docker (Optional)
```bash
docker build -t notebooklm-backend .
docker run -p 3000:3000 notebooklm-backend
```

## 🔒 Security

- **Helmet.js** - Security headers
- **CORS** - Cross-origin resource sharing
- **File Validation** - Type and size validation
- **Rate Limiting** - API rate limiting
- **Input Sanitization** - Request validation

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Health check
curl http://localhost:3000/health
```

## 📊 Monitoring

### Health Check
```http
GET /health
```

### Logs
The server uses Morgan for HTTP request logging.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the API documentation
- Review the error logs

## 🔄 Changelog

### v1.0.0
- Initial release
- PDF upload and processing
- Vector search with Pinecone
- AI chat with OpenAI
- Document management API 