import 'dotenv/config';
import { NotionAdapter } from '../src/rag/infra/adapters/document-source/notion.adapter';
import { PineconeAdapter } from '../src/rag/infra/adapters/vector-store/pinecone.adapter';
import { GoogleEmbeddingsAdapter } from '../src/rag/infra/adapters/embeddings/google-embeddings.adapter';

async function loadNotionData() {
  const notion = new NotionAdapter();
  const embeddings = new GoogleEmbeddingsAdapter();
  const pinecone = new PineconeAdapter(embeddings);

  try {
    console.log('🔌 Connecting to Pinecone...');
    await (pinecone as any).onModuleInit();

    console.log('📚 Fetching pages from Notion...');
    const pages = await notion.searchPages();
    console.log(`📄 Found ${pages.length} accessible pages`);

    if (pages.length === 0) {
      console.log('⚠️ No pages found. Make sure you have:');
      console.log('  1. Created a Notion integration');
      console.log('  2. Added the integration to your pages/databases');
      console.log('  3. Set the NOTION_API_KEY in your .env file');
      return;
    }

    let totalChunks = 0;
    let processedPages = 0;

    for (const page of pages) {
      try {
        console.log(
          `\n📖 Processing page ${processedPages + 1}/${pages.length}`,
        );
        console.log(`   ID: ${page.id}`);

        const fullPage = await notion.getPageContent(page.id);
        console.log(`   📝 Title: "${fullPage.title}"`);
        console.log(
          `   📄 Content length: ${fullPage.content.length} characters`,
        );

        if (!fullPage.content || fullPage.content.length < 50) {
          console.log(`   ⏭️ Skipping page (insufficient content)`);
          continue;
        }

        const chunks = notion.chunkDocument(fullPage);
        console.log(`   📝 Created ${chunks.length} chunks`);

        if (chunks.length === 0) {
          console.log(`   ⏭️ Skipping page (no valid chunks created)`);
          continue;
        }

        const batchSize = 5;
        for (let i = 0; i < chunks.length; i += batchSize) {
          const batch = chunks.slice(i, i + batchSize);

          console.log(
            `   🔄 Processing batch ${
              Math.floor(i / batchSize) + 1
            }/${Math.ceil(chunks.length / batchSize)}`,
          );

          const vectors = [];
          for (const chunk of batch) {
            try {
              const embedding = await embeddings.embedText(chunk.text);
              vectors.push({
                id: `notion_${chunk.metadata.pageId}_chunk_${chunk.metadata.chunkIndex}`,
                values: embedding,
                metadata: {
                  ...chunk.metadata,
                  text: chunk.text,
                },
              });
            } catch (embedError) {
              console.error(
                `    ❌ Error creating embedding: ${embedError.message}`,
              );
            }
          }

          if (vectors.length > 0) {
            await (pinecone as any).pineconeIndex.upsert(vectors);
            console.log(
              `    ✅ Uploaded ${vectors.length} vectors to Pinecone`,
            );
          }

          await new Promise((resolve) => setTimeout(resolve, 1000));
        }

        totalChunks += chunks.length;
        processedPages++;

        if (processedPages % 5 === 0) {
          console.log(
            `\n📊 Progress: ${processedPages}/${pages.length} pages processed, ${totalChunks} total chunks`,
          );
        }
      } catch (pageError) {
        console.error(
          `❌ Error processing page ${page.id}:`,
          pageError.message,
        );
        continue;
      }
    }

    console.log(`\n🎉 Data loading completed!`);
    console.log(`📊 Summary:`);
    console.log(`   • Processed: ${processedPages}/${pages.length} pages`);
    console.log(`   • Total chunks: ${totalChunks}`);
    console.log(
      `   • Average chunks per page: ${
        processedPages > 0 ? Math.round(totalChunks / processedPages) : 0
      }`,
    );

    if (processedPages === 0) {
      console.log(`\n💡 Tips to get started:`);
      console.log(
        `   1. Make sure your Notion integration has access to pages`,
      );
      console.log(`   2. Share specific pages with your integration`);
      console.log(`   3. Check that pages have meaningful content`);
    }
  } catch (error) {
    console.error('❌ Error loading Notion data:', error.message);
    console.error('🔧 Troubleshooting:');
    console.error('   1. Check your NOTION_API_KEY in .env file');
    console.error('   2. Verify your Pinecone connection');
    console.error(
      '   3. Ensure your Notion integration has proper permissions',
    );
  }
}

(async () => {
  console.log('🚀 Starting Notion data loading process...\n');
  try {
    await loadNotionData();
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Script failed:', error.message);
    process.exit(1);
  }
})();
