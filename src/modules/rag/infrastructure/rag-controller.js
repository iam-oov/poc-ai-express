const { Router } = require('express');

const RagApplicationService = require('../application/rag-service');
const { llmService, vectorStore } = require('./config');

const ragService = new RagApplicationService(llmService, vectorStore);
const router = Router();

router.post('/question', async (req, res) => {
  const { question } = req.body;
  try {
    const answer = await ragService.handleQuestion(question);
    res.json({ answer });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
