export const environment = {
  production: true,
  apiUrl: 'https://notebooklm-clone-production.up.railway.app/api',
  maxFileSize: 50 * 1024 * 1024, // 50MB
  supportedFormats: ['pdf'],
  chunkSize: 1000,
  chunkOverlap: 200,
  openaiModel: 'gpt-3.5-turbo',
  maxTokens: 2000,
  temperature: 0.7,
};
