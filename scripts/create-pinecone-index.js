const { Pinecone } = require('@pinecone-database/pinecone');
const path = require('path');
const { loadEnvironment } = require(path.join(
  __dirname,
  '../src/config/environment'
));

async function createPineconeIndex() {
  const config = loadEnvironment();
  const indexName = config.pineconeIndexName || 'rag-index';

  try {
    console.log('🔌 Connecting to Pinecone...');
    const pinecone = new Pinecone({
      apiKey: config.pineconeApiKey,
    });

    console.log(`🏗️ Creating index: ${indexName}`);
    console.log('   📐 Dimension: 768 (Google embedding-001)');
    console.log('   📏 Metric: cosine');
    console.log('   ☁️ Cloud: AWS us-east-1');

    // Create index with proper configuration
    await pinecone.createIndex({
      name: indexName,
      dimension: 768, // Google embedding-001 dimension
      metric: 'cosine',
      spec: {
        serverless: {
          cloud: 'aws',
          region: 'us-east-1',
        },
      },
      waitUntilReady: true,
    });

    console.log('✅ Index created successfully!');
    console.log(`🔗 Index name: ${indexName}`);
    console.log('\n💡 Next steps:');
    console.log(
      '   1. Wait a few minutes for the index to be fully initialized'
    );
    console.log('   2. Run: npm run load-notion-data');
    console.log('   3. Test your RAG system with queries');
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log(`✅ Index '${indexName}' already exists`);
      console.log('🔍 Checking index status...');

      try {
        const indexStats = await pinecone.index(indexName).describeIndexStats();
        console.log(`📊 Index statistics:`);
        console.log(`   • Total vectors: ${indexStats.totalVectorCount || 0}`);
        console.log(`   • Dimension: ${indexStats.dimension || 'unknown'}`);
        console.log(
          `   • Index fullness: ${(
            (indexStats.indexFullness || 0) * 100
          ).toFixed(1)}%`
        );
      } catch (statsError) {
        console.log('⚠️ Could not fetch index statistics');
      }

      console.log('\n💡 Index is ready for use!');
    } else {
      throw error;
    }
  }
}

// Handle script execution
if (require.main === module) {
  console.log('🚀 Starting Pinecone index creation...\n');
  createPineconeIndex()
    .then(() => {
      console.log('\n✅ Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Script failed:', error.message);
      console.error('\n🔧 Troubleshooting:');
      console.error('   1. Check your PINECONE_API_KEY in .env file');
      console.error('   2. Verify your Pinecone project settings');
      console.error('   3. Ensure you have sufficient quota');
      process.exit(1);
    });
}
