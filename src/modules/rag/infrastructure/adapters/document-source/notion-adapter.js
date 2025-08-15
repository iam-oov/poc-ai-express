const { Client } = require('@notionhq/client');
const path = require('path');
const { loadEnvironment } = require(path.join(
  __dirname,
  '../../../../../config/environment'
));

class NotionAdapter {
  constructor() {
    this.config = loadEnvironment();
    this.notion = new Client({
      auth: this.config.notionApiKey,
    });
  }

  /**
   * Search all pages the integration has access to
   * @returns {Promise<Array>} Array of page objects
   */
  async searchPages() {
    try {
      console.log('🔍 Searching for accessible pages in Notion...');

      const response = await this.notion.search({
        filter: {
          property: 'object',
          value: 'page',
        },
        sort: {
          direction: 'descending',
          timestamp: 'last_edited_time',
        },
      });

      console.log(`📄 Found ${response.results.length} accessible pages`);
      return response.results;
    } catch (error) {
      console.error('❌ Error searching Notion pages:', error.message);
      throw error;
    }
  }

  /**
   * Get page content with blocks
   * @param {string} pageId - Notion page ID
   * @returns {Promise<Object>} Page with content
   */
  async getPageContent(pageId) {
    try {
      // Get page metadata
      const page = await this.notion.pages.retrieve({ page_id: pageId });

      // Get page blocks (content)
      const blocks = await this.notion.blocks.children.list({
        block_id: pageId,
        page_size: 100,
      });

      // Extract text content from blocks
      const content = await this.extractTextFromBlocks(blocks.results);

      // Get page title
      const title = this.extractTitle(page);

      return {
        id: pageId,
        title,
        content,
        url: page.url,
        lastEditedTime: page.last_edited_time,
        createdTime: page.created_time,
      };
    } catch (error) {
      console.error(`❌ Error fetching page ${pageId}:`, error.message);
      throw error;
    }
  }

  /**
   * Extract title from page properties
   * @param {Object} page - Notion page object
   * @returns {string} Page title
   */
  extractTitle(page) {
    const titleProperty = Object.values(page.properties).find(
      (prop) => prop.type === 'title'
    );

    if (titleProperty && titleProperty.title.length > 0) {
      return titleProperty.title[0].plain_text;
    }

    return 'Untitled';
  }

  /**
   * Extract text content from Notion blocks
   * @param {Array} blocks - Array of Notion blocks
   * @returns {Promise<string>} Extracted text content
   */
  async extractTextFromBlocks(blocks) {
    let content = '';

    for (const block of blocks) {
      const text = await this.extractTextFromBlock(block);
      if (text) {
        content += text + '\n';
      }

      // Handle blocks with children (nested content)
      if (block.has_children) {
        try {
          const childBlocks = await this.notion.blocks.children.list({
            block_id: block.id,
          });
          const childContent = await this.extractTextFromBlocks(
            childBlocks.results
          );
          content += childContent;
        } catch (error) {
          console.warn(`⚠️ Could not fetch children for block ${block.id}`);
        }
      }
    }

    return content.trim();
  }

  /**
   * Extract text from a single block
   * @param {Object} block - Notion block
   * @returns {string} Text content
   */
  async extractTextFromBlock(block) {
    switch (block.type) {
      case 'paragraph':
        return this.extractRichText(block.paragraph.rich_text);

      case 'heading_1':
        return '# ' + this.extractRichText(block.heading_1.rich_text);

      case 'heading_2':
        return '## ' + this.extractRichText(block.heading_2.rich_text);

      case 'heading_3':
        return '### ' + this.extractRichText(block.heading_3.rich_text);

      case 'bulleted_list_item':
        return '• ' + this.extractRichText(block.bulleted_list_item.rich_text);

      case 'numbered_list_item':
        return '1. ' + this.extractRichText(block.numbered_list_item.rich_text);

      case 'code':
        return '```\n' + this.extractRichText(block.code.rich_text) + '\n```';

      case 'quote':
        return '> ' + this.extractRichText(block.quote.rich_text);

      default:
        return '';
    }
  }

  /**
   * Extract plain text from rich text array
   * @param {Array} richText - Notion rich text array
   * @returns {string} Plain text
   */
  extractRichText(richText) {
    return richText.map((text) => text.plain_text).join('');
  }

  /**
   * Process and chunk document content
   * @param {Object} document - Document object
   * @returns {Array} Array of text chunks
   */
  chunkDocument(document) {
    const chunkSize = 1000;
    const overlap = 200;
    const chunks = [];

    const fullText = `${document.title}\n\n${document.content}`;

    for (let i = 0; i < fullText.length; i += chunkSize - overlap) {
      const chunk = fullText.slice(i, i + chunkSize);
      if (chunk.trim().length > 50) {
        chunks.push({
          text: chunk.trim(),
          metadata: {
            source: 'notion',
            pageId: document.id,
            title: document.title,
            url: document.url,
            lastEditedTime: document.lastEditedTime,
            chunkIndex: chunks.length,
          },
        });
      }
    }

    return chunks;
  }
}

module.exports = NotionAdapter;
