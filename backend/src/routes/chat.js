const express = require('express');
const Groq = require('groq-sdk');
const config = require('../config');
const vectorService = require('../services/vectorService');

const router = express.Router();
const groq = new Groq({
  apiKey: config.groq.apiKey,
});

// In-memory storage for chat history (replace with database in production)
const chatHistory = new Map();

/**
 * @route POST /api/chat/:documentId
 * @desc Send chat message and get AI response
 * @access Public
 */
router.post('/:documentId', async (req, res) => {
  try {
    const { documentId } = req.params;
    const { message, history = [] } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        error: 'Invalid message',
        message: 'Message cannot be empty',
      });
    }

    // Search for relevant chunks
    const searchResults = await vectorService.searchChunks(message, documentId, 5);

    if (searchResults.length === 0) {
      return res.status(404).json({
        error: 'No relevant content found',
        message: 'No relevant content found in the document for your question',
      });
    }

    // Build context from search results
    const context = searchResults
      .map(result => `Page ${result.metadata.page}: ${result.metadata.text}`)
      .join('\n\n');

    // Build conversation history
    const conversationHistory = history.map(msg => ({
      role: msg.role,
      content: msg.content,
    }));

    // Create system prompt
    const systemPrompt = `You are an AI assistant that helps users understand documents. 
    You have access to the following context from the document:
    
    ${context}
    
    Instructions:
    1. Answer questions based ONLY on the provided context
    2. If the answer cannot be found in the context, say so
    3. Always cite the page numbers when referencing information
    4. Be helpful, accurate, and concise
    5. If asked about something not in the document, politely redirect to the document content`;

    // Prepare messages for Groq
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: message },
    ];

    // Get AI response
    const completion = await groq.chat.completions.create({
      model: config.groq.model,
      messages: messages,
      max_tokens: config.groq.maxTokens,
      temperature: config.groq.temperature,
      stream: false,
    });

    const aiResponse = completion.choices[0].message.content;

    // Extract citations from search results
    const citations = searchResults.map(result => ({
      page: result.metadata.page,
      text: result.metadata.text.substring(0, 200) + '...',
      score: result.score,
    }));

    // Create response object
    const response = {
      id: Date.now().toString(),
      role: 'assistant',
      content: aiResponse,
      citations: citations,
      timestamp: new Date().toISOString(),
      searchResults: searchResults.length,
    };

    // Store in chat history
    if (!chatHistory.has(documentId)) {
      chatHistory.set(documentId, []);
    }
    chatHistory.get(documentId).push({
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    });
    chatHistory.get(documentId).push(response);

    res.json({
      success: true,
      response: response,
      context: {
        chunksFound: searchResults.length,
        averageScore: searchResults.reduce((sum, r) => sum + r.score, 0) / searchResults.length,
      },
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      error: 'Chat failed',
      message: error.message,
    });
  }
});

/**
 * @route GET /api/chat/:documentId/history
 * @desc Get chat history for a document
 * @access Public
 */
router.get('/:documentId/history', async (req, res) => {
  try {
    const { documentId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const history = chatHistory.get(documentId) || [];
    const paginatedHistory = history
      .slice(parseInt(offset), parseInt(offset) + parseInt(limit))
      .reverse(); // Most recent first

    res.json({
      success: true,
      history: paginatedHistory,
      total: history.length,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({
      error: 'Failed to retrieve chat history',
      message: error.message,
    });
  }
});

/**
 * @route DELETE /api/chat/:documentId
 * @desc Clear chat history for a document
 * @access Public
 */
router.delete('/:documentId', async (req, res) => {
  try {
    const { documentId } = req.params;

    if (chatHistory.has(documentId)) {
      chatHistory.delete(documentId);
    }

    res.json({
      success: true,
      message: 'Chat history cleared successfully',
      documentId: documentId,
    });
  } catch (error) {
    console.error('Clear chat history error:', error);
    res.status(500).json({
      error: 'Failed to clear chat history',
      message: error.message,
    });
  }
});

/**
 * @route POST /api/chat/:documentId/stream
 * @desc Stream chat response (for real-time chat)
 * @access Public
 */
router.post('/:documentId/stream', async (req, res) => {
  try {
    const { documentId } = req.params;
    const { message, history = [] } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        error: 'Invalid message',
        message: 'Message cannot be empty',
      });
    }

    // Set headers for streaming
    res.writeHead(200, {
      'Content-Type': 'text/plain',
      'Transfer-Encoding': 'chunked',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    });

    // Search for relevant chunks
    const searchResults = await vectorService.searchChunks(message, documentId, 5);

    if (searchResults.length === 0) {
      res.write(
        JSON.stringify({
          error: 'No relevant content found',
          message: 'No relevant content found in the document for your question',
        })
      );
      res.end();
      return;
    }

    // Build context
    const context = searchResults
      .map(result => `Page ${result.metadata.page}: ${result.metadata.text}`)
      .join('\n\n');

    // Create system prompt
    const systemPrompt = `You are an AI assistant that helps users understand documents. 
    You have access to the following context from the document:
    
    ${context}
    
    Instructions:
    1. Answer questions based ONLY on the provided context
    2. If the answer cannot be found in the context, say so
    3. Always cite the page numbers when referencing information
    4. Be helpful, accurate, and concise
    5. If asked about something not in the document, politely redirect to the document content`;

    // Prepare messages
    const conversationHistory = history.map(msg => ({
      role: msg.role,
      content: msg.content,
    }));

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: message },
    ];

    // Stream response
    const stream = await groq.chat.completions.create({
      model: config.groq.model,
      messages: messages,
      max_tokens: config.groq.maxTokens,
      temperature: config.groq.temperature,
      stream: true,
    });

    let fullResponse = '';

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        fullResponse += content;
        res.write(JSON.stringify({ content: content, done: false }));
      }
    }

    // Send final response with citations
    const citations = searchResults.map(result => ({
      page: result.metadata.page,
      text: result.metadata.text.substring(0, 200) + '...',
      score: result.score,
    }));

    res.write(
      JSON.stringify({
        content: '',
        done: true,
        citations: citations,
        searchResults: searchResults.length,
      })
    );

    res.end();
  } catch (error) {
    console.error('Stream chat error:', error);
    res.write(
      JSON.stringify({
        error: 'Chat failed',
        message: error.message,
      })
    );
    res.end();
  }
});

/**
 * @route GET /api/chat/:documentId/suggestions
 * @desc Get suggested questions for a document
 * @access Public
 */
router.get('/:documentId/suggestions', async (req, res) => {
  try {
    const { documentId } = req.params;

    // Get document stats to generate relevant suggestions
    const vectorStats = await vectorService.getDocumentStats(documentId);

    const suggestions = [
      'What are the main findings in this document?',
      'Can you summarize the key points?',
      'What methodology was used?',
      'What are the conclusions?',
      'What are the main arguments presented?',
      'Can you explain the background context?',
      'What are the implications of this research?',
      'What are the limitations mentioned?',
      'What future work is suggested?',
      'What are the main recommendations?',
    ];

    res.json({
      success: true,
      suggestions: suggestions,
      documentStats: vectorStats,
    });
  } catch (error) {
    console.error('Get suggestions error:', error);
    res.status(500).json({
      error: 'Failed to get suggestions',
      message: error.message,
    });
  }
});

module.exports = router;
