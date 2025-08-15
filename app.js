const express = require('express');

const { validateEnvironmentOrExit } = require('./src/config/environment');

// Validate configuration before continuing
const config = validateEnvironmentOrExit();

const app = express();

// Import module controllers
const ragController = require('./src/modules/rag/infrastructure/rag-controller');

// Middleware
app.use(express.json());

// Mount controllers on their routes
app.use('/ai', ragController);

async function init() {
  try {
    const { vectorStore } = require('./src/modules/rag/infrastructure/config');

    console.log('🔌 Connecting to vector database...');
    await vectorStore.connect();
    console.log('✅ Vector database connection successful');

    app.listen(config.port, () => {
      console.log(`🚀 Server listening on http://localhost:${config.port}`);
    });
  } catch (error) {
    console.error('❌ Error initializing application:', error.message);
    process.exit(1);
  }
}

init();
