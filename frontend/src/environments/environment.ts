export const environment = {
  production: false,
  apiUrl: 'https://notebooklm-backend-91ap.onrender.com/api',
  maxFileSize: 50 * 1024 * 1024, // 50MB
  supportedFormats: ['pdf'],
  chunkSize: 1000,
  chunkOverlap: 200,
  openaiModel: 'gpt-3.5-turbo',
  maxTokens: 2000,
  temperature: 0.7,
};
