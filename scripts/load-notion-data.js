const NotionAdapter = require('../src/modules/rag/infrastructure/adapters/document-source/notion-adapter');
const PineconeAdapter = require('../src/modules/rag/infrastructure/adapters/vector-store/pinecone-adapter');
const GoogleEmbeddingsAdapter = require('../src/modules/rag/infrastructure/adapters/embeddings/google-embeddings-adapter');

async function loadNotionData() {
  const notion = new NotionAdapter();
  const pinecone = new PineconeAdapter();
  const embeddings = new GoogleEmbeddingsAdapter();

  try {
    console.log('🔌 Connecting to Pinecone...');
    await pinecone.connect();

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
          `\n📖 Processing page ${processedPages + 1}/${pages.length}`
        );
        console.log(`   ID: ${page.id}`);

        // Fetch full content
        const fullPage = await notion.getPageContent(page.id);
        console.log(`   📝 Title: "${fullPage.title}"`);
        console.log(
          `   📄 Content length: ${fullPage.content.length} characters`
        );

        // Skip if no meaningful content
        if (!fullPage.content || fullPage.content.length < 50) {
          console.log(`   ⏭️ Skipping page (insufficient content)`);
          continue;
        }

        // Chunk the document
        const chunks = notion.chunkDocument(fullPage);
        console.log(`   📝 Created ${chunks.length} chunks`);

        if (chunks.length === 0) {
          console.log(`   ⏭️ Skipping page (no valid chunks created)`);
          continue;
        }

        // Process chunks in batches
        const batchSize = 5; // Smaller batches to avoid rate limits
        for (let i = 0; i < chunks.length; i += batchSize) {
          const batch = chunks.slice(i, i + batchSize);

          console.log(
            `   🔄 Processing batch ${
              Math.floor(i / batchSize) + 1
            }/${Math.ceil(chunks.length / batchSize)}`
          );

          // Generate embeddings for batch
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
                `    ❌ Error creating embedding: ${embedError.message}`
              );
            }
          }

          // Upload to Pinecone
          if (vectors.length > 0) {
            await pinecone.upsert(vectors);
            console.log(
              `    ✅ Uploaded ${vectors.length} vectors to Pinecone`
            );
          }

          // Small delay to respect rate limits
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }

        totalChunks += chunks.length;
        processedPages++;

        // Progress update every 5 pages
        if (processedPages % 5 === 0) {
          console.log(
            `\n📊 Progress: ${processedPages}/${pages.length} pages processed, ${totalChunks} total chunks`
          );
        }
      } catch (pageError) {
        console.error(
          `❌ Error processing page ${page.id}:`,
          pageError.message
        );
        continue; // Skip this page and continue with others
      }
    }

    console.log(`\n🎉 Data loading completed!`);
    console.log(`📊 Summary:`);
    console.log(`   • Processed: ${processedPages}/${pages.length} pages`);
    console.log(`   • Total chunks: ${totalChunks}`);
    console.log(
      `   • Average chunks per page: ${
        processedPages > 0 ? Math.round(totalChunks / processedPages) : 0
      }`
    );

    if (processedPages === 0) {
      console.log(`\n💡 Tips to get started:`);
      console.log(
        `   1. Make sure your Notion integration has access to pages`
      );
      console.log(`   2. Share specific pages with your integration`);
      console.log(`   3. Check that pages have meaningful content`);
    }
  } catch (error) {
    console.error('❌ Error loading Notion data:', error.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('   1. Check your NOTION_API_KEY in .env file');
    console.error('   2. Verify your Pinecone connection');
    console.error(
      '   3. Ensure your Notion integration has proper permissions'
    );
  }
}

// Handle script execution
if (require.main === module) {
  console.log('🚀 Starting Notion data loading process...\n');
  loadNotionData()
    .then(() => {
      console.log('\n✅ Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Script failed:', error.message);
      process.exit(1);
    });
}
