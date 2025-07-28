const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');
const { chatLimiter } = require('../middleware/rateLimit');
const vectorService = require('../services/vectorService');
const config = require('../config');

const groq = new Groq({
  apiKey: config.groq.apiKey,
});

// Chat with documents
router.post('/', chatLimiter, async (req, res) => {
  try {
    const { message, documentId } = req.body;

    if (!message) {
      return res.status(400).json({
        error: 'Missing message',
        message: 'Please provide a message to chat with',
      });
    }

    // Search for relevant chunks
    const searchResults = await vectorService.searchChunks(message, documentId, 5);

    // Build context from search results
    const context = searchResults.map(result => result.metadata.text).join('\n\n');

    // Create chat completion
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are a helpful assistant that answers questions based on the provided document context. Use the context to provide accurate and relevant answers. If the answer cannot be found in the context, say so clearly.

Context from documents:
${context}`,
        },
        {
          role: 'user',
          content: message,
        },
      ],
      model: config.groq.model,
      max_tokens: config.groq.maxTokens,
      temperature: config.groq.temperature,
    });

    const response = chatCompletion.choices[0]?.message?.content || 'No response generated';

    res.json({
      response: response,
      sources: searchResults.map(result => ({
        page: result.metadata.page,
        documentId: result.metadata.documentId,
        score: result.score,
      })),
      model: config.groq.model,
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      error: 'Chat failed',
      message: error.message,
    });
  }
});

module.exports = router;
