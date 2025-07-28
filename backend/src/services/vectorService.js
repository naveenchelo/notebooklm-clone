const { Pinecone } = require('@pinecone-database/pinecone');
const OpenAI = require('openai');
const config = require('../config');

class VectorService {
  constructor() {
    this.pinecone = new Pinecone({
      apiKey: config.pinecone.apiKey,
      environment: config.pinecone.environment,
    });

    this.openai = new OpenAI({
      apiKey: config.openai.apiKey,
    });

    this.index = this.pinecone.index(config.pinecone.indexName);
  }

  /**
   * Generate embeddings for text using OpenAI
   * @param {string} text - Text to embed
   * @returns {Promise<Array>} - Embedding vector
   */
  async generateEmbedding(text) {
    try {
      const response = await this.openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: text,
        encoding_format: 'float',
      });

      return response.data[0].embedding;
    } catch (error) {
      throw new Error(`Failed to generate embedding: ${error.message}`);
    }
  }

  /**
   * Generate embeddings for multiple texts
   * @param {Array<string>} texts - Array of texts to embed
   * @returns {Promise<Array>} - Array of embedding vectors
   */
  async generateEmbeddings(texts) {
    try {
      const response = await this.openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: texts,
        encoding_format: 'float',
      });

      return response.data.map(item => item.embedding);
    } catch (error) {
      throw new Error(`Failed to generate embeddings: ${error.message}`);
    }
  }

  /**
   * Store document chunks in vector database
   * @param {string} documentId - Unique document identifier
   * @param {Array} chunks - Array of text chunks with metadata
   * @returns {Promise<Object>} - Storage result
   */
  async storeDocumentChunks(documentId, chunks) {
    try {
      const vectors = [];

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];

        // Generate embedding for chunk text
        const embedding = await this.generateEmbedding(chunk.text);

        // Create vector record
        const vector = {
          id: `${documentId}_chunk_${i}`,
          values: embedding,
          metadata: {
            documentId: documentId,
            chunkIndex: i,
            page: chunk.page,
            text: chunk.text.substring(0, 500), // Store first 500 chars for preview
            startPosition: chunk.startPosition,
            endPosition: chunk.endPosition,
            totalChunks: chunks.length,
            timestamp: new Date().toISOString(),
          },
        };

        vectors.push(vector);
      }

      // Upsert vectors in batches
      const batchSize = 100;
      const results = [];

      for (let i = 0; i < vectors.length; i += batchSize) {
        const batch = vectors.slice(i, i + batchSize);
        const result = await this.index.upsert(batch);
        results.push(result);
      }

      return {
        documentId: documentId,
        totalChunks: chunks.length,
        vectorsStored: vectors.length,
        results: results,
      };
    } catch (error) {
      throw new Error(`Failed to store document chunks: ${error.message}`);
    }
  }

  /**
   * Search for similar chunks
   * @param {string} query - Search query
   * @param {string} documentId - Optional document ID to filter results
   * @param {number} topK - Number of results to return
   * @returns {Promise<Array>} - Search results
   */
  async searchChunks(query, documentId = null, topK = 5) {
    try {
      // Generate embedding for query
      const queryEmbedding = await this.generateEmbedding(query);

      // Build filter
      const filter = documentId ? { documentId: { $eq: documentId } } : {};

      // Search in vector database
      const searchResponse = await this.index.query({
        vector: queryEmbedding,
        topK: topK,
        filter: filter,
        includeMetadata: true,
      });

      return searchResponse.matches.map(match => ({
        id: match.id,
        score: match.score,
        metadata: match.metadata,
      }));
    } catch (error) {
      throw new Error(`Failed to search chunks: ${error.message}`);
    }
  }

  /**
   * Delete document from vector database
   * @param {string} documentId - Document ID to delete
   * @returns {Promise<Object>} - Deletion result
   */
  async deleteDocument(documentId) {
    try {
      // Delete all vectors for this document
      const deleteResponse = await this.index.deleteMany({
        filter: { documentId: { $eq: documentId } },
      });

      return {
        documentId: documentId,
        deleted: true,
        response: deleteResponse,
      };
    } catch (error) {
      throw new Error(`Failed to delete document: ${error.message}`);
    }
  }

  /**
   * Get document statistics from vector database
   * @param {string} documentId - Document ID
   * @returns {Promise<Object>} - Document statistics
   */
  async getDocumentStats(documentId) {
    try {
      const statsResponse = await this.index.describeIndexStats({
        filter: { documentId: { $eq: documentId } },
      });

      return {
        documentId: documentId,
        totalVectors: statsResponse.totalVectorCount,
        dimension: statsResponse.dimension,
        namespaces: statsResponse.namespaces,
      };
    } catch (error) {
      throw new Error(`Failed to get document stats: ${error.message}`);
    }
  }

  /**
   * Update chunk metadata
   * @param {string} vectorId - Vector ID to update
   * @param {Object} metadata - New metadata
   * @returns {Promise<Object>} - Update result
   */
  async updateChunkMetadata(vectorId, metadata) {
    try {
      const updateResponse = await this.index.update({
        id: vectorId,
        setMetadata: metadata,
      });

      return {
        vectorId: vectorId,
        updated: true,
        response: updateResponse,
      };
    } catch (error) {
      throw new Error(`Failed to update chunk metadata: ${error.message}`);
    }
  }

  /**
   * Get index statistics
   * @returns {Promise<Object>} - Index statistics
   */
  async getIndexStats() {
    try {
      const statsResponse = await this.index.describeIndexStats();

      return {
        totalVectors: statsResponse.totalVectorCount,
        dimension: statsResponse.dimension,
        namespaces: statsResponse.namespaces,
        indexFullness: statsResponse.indexFullness,
      };
    } catch (error) {
      throw new Error(`Failed to get index stats: ${error.message}`);
    }
  }

  /**
   * Health check for vector database
   * @returns {Promise<boolean>} - Health status
   */
  async healthCheck() {
    try {
      await this.index.describeIndexStats();
      return true;
    } catch (error) {
      console.error('Vector database health check failed:', error.message);
      return false;
    }
  }
}

module.exports = new VectorService();
