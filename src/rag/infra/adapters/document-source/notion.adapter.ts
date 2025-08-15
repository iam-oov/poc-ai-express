import { Injectable } from '@nestjs/common';
import { Client } from '@notionhq/client';
import {
  PageObjectResponse,
  PartialPageObjectResponse,
} from '@notionhq/client/build/src/api-endpoints';

import { envs } from '../../../../configs';

@Injectable()
export class NotionAdapter {
  private notion: Client;

  constructor() {
    this.notion = new Client({
      auth: envs.notionApiKey,
    });
  }

  async searchPages(): Promise<
    (PageObjectResponse | PartialPageObjectResponse)[]
  > {
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

      const pages = response.results.filter(
        (result): result is PageObjectResponse | PartialPageObjectResponse =>
          result.object === 'page',
      );

      console.log(`📄 Found ${pages.length} accessible pages`);
      return pages;
    } catch (error) {
      console.error('❌ Error searching Notion pages:', error.message);
      throw error;
    }
  }

  async getPageContent(pageId: string): Promise<any> {
    try {
      const page = await this.notion.pages.retrieve({ page_id: pageId });

      const blocks = await this.notion.blocks.children.list({
        block_id: pageId,
        page_size: 100,
      });

      const content = await this.extractTextFromBlocks(blocks.results);

      const title = this.extractTitle(page);

      return {
        id: pageId,
        title,
        content,
        url: (page as PageObjectResponse).url,
        lastEditedTime: (page as PageObjectResponse).last_edited_time,
        createdTime: (page as PageObjectResponse).created_time,
      };
    } catch (error) {
      console.error(`❌ Error fetching page ${pageId}:`, error.message);
      throw error;
    }
  }

  extractTitle(page: PageObjectResponse | PartialPageObjectResponse): string {
    if ('properties' in page) {
      const titleProperty = Object.values(page.properties).find(
        (prop) => prop.type === 'title',
      ) as { title: { plain_text: string }[] } | undefined;

      if (titleProperty && titleProperty.title.length > 0) {
        return titleProperty.title[0].plain_text;
      }
    }

    return 'Untitled';
  }

  async extractTextFromBlocks(blocks: any[]): Promise<string> {
    let content = '';

    for (const block of blocks) {
      const text = await this.extractTextFromBlock(block);
      if (text) {
        content += text + '\n';
      }

      if (block.has_children) {
        try {
          const childBlocks = await this.notion.blocks.children.list({
            block_id: block.id,
          });
          const childContent = await this.extractTextFromBlocks(
            childBlocks.results,
          );
          content += childContent;
        } catch (error) {
          console.warn(`⚠️ Could not fetch children for block ${block.id}`);
        }
      }
    }

    return content.trim();
  }

  async extractTextFromBlock(block: any): Promise<string> {
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

  extractRichText(richText: any[]): string {
    return richText.map((text) => text.plain_text).join('');
  }

  chunkDocument(document: any): any[] {
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
