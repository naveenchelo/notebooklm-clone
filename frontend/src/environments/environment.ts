export const environment = {
  production: true,
  apiUrl: '/api',
  maxFileSize: 50 * 1024 * 1024, // 50MB
  supportedFormats: ['pdf'],
  chunkSize: 1000,
  chunkOverlap: 200,
  groqModel: 'llama3-8b-8192',
  maxTokens: 2000,
  temperature: 0.7,
};
