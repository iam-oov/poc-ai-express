import 'dotenv/config';
import { Pinecone } from '@pinecone-database/pinecone';

async function createPineconeIndex() {
  const indexName = process.env.PINECONE_INDEX_NAME || 'rag-index';

  try {
    console.log('🔌 Connecting to Pinecone...');
    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });

    console.log(`🏗️ Creating index: ${indexName}`);
    console.log('   📐 Dimension: 768 (Google embedding-001)');
    console.log('   📏 Metric: cosine');
    console.log('   ☁️ Cloud: AWS us-east-1');

    await pinecone.createIndex({
      name: indexName,
      dimension: 768,
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
    console.log('💡 Next steps:');
    console.log(
      '   1. Wait a few minutes for the index to be fully initialized'
    );
    console.log('   2. Run: yarn load-notion-data');
    console.log('   3. Test your RAG system with queries');
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log(`✅ Index '${indexName}' already exists`);
    } else {
      throw error;
    }
  }
}

(async () => {
  console.log('🚀 Starting Pinecone index creation...\n');
  try {
    await createPineconeIndex();
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Script failed:', error.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('   1. Check your PINECONE_API_KEY in .env file');
    console.error('   2. Verify your Pinecone project settings');
    console.error('   3. Ensure you have sufficient quota');
    process.exit(1);
  }
})();
