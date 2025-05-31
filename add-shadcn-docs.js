const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const cheerio = require('cheerio');

const prisma = new PrismaClient();

async function extractTextFromWebsite(url) {
  try {
    console.log('Fetching:', url);
    
    const response = await axios.get(url, {
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const $ = cheerio.load(response.data);
    
    // Remove unwanted elements
    $('script, style, nav, footer, header, aside, .navigation, .sidebar').remove();
    
    // Extract text from main content
    let text = '';
    const mainContent = $('main, article, .content, #content, .main-content').first();
    if (mainContent.length > 0) {
      text = mainContent.text();
    } else {
      text = $('body').text();
    }

    // Clean up the text
    text = text
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, '\n')
      .trim();

    return text;
  } catch (error) {
    console.error('Error fetching website:', error.message);
    return null;
  }
}

function splitTextIntoChunks(text, maxChunkSize = 1000) {
  const chunks = [];
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  let currentChunk = '';
  
  for (const sentence of sentences) {
    if (currentChunk.length + sentence.length > maxChunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = sentence;
    } else {
      currentChunk += (currentChunk ? '. ' : '') + sentence;
    }
  }
  
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks;
}

async function addShadcnDocs() {
  try {
    const chatbotId = 'cmbb6ayes0002mxccs9hdjej7';
    
    // Important shadcn/ui documentation pages
    const shadcnUrls = [
      'https://ui.shadcn.com/docs/installation',
      'https://ui.shadcn.com/docs/installation/next',
      'https://ui.shadcn.com/docs/installation/vite',
      'https://ui.shadcn.com/docs/components/button',
      'https://ui.shadcn.com/docs/components/input',
      'https://ui.shadcn.com/docs/components/form'
    ];

    for (const url of shadcnUrls) {
      console.log(`\nProcessing: ${url}`);
      
      const content = await extractTextFromWebsite(url);
      if (!content) {
        console.log('❌ Failed to extract content');
        continue;
      }

      console.log(`✅ Extracted ${content.length} characters`);

      // Create data source
      const dataSource = await prisma.dataSource.create({
        data: {
          chatbotId: chatbotId,
          type: 'WEBSITE',
          name: `shadcn/ui - ${url.split('/').pop()}`,
          url: url,
          content: content,
          status: 'PROCESSING',
        },
      });

      console.log('📝 Created data source:', dataSource.id);

      // Create chunks
      const chunks = splitTextIntoChunks(content, 1000);
      console.log(`📦 Creating ${chunks.length} chunks...`);

      for (let i = 0; i < chunks.length; i++) {
        await prisma.contentChunk.create({
          data: {
            dataSourceId: dataSource.id,
            content: chunks[i],
            embedding: JSON.stringify([]), // Empty for now
            metadata: JSON.stringify({
              source: `shadcn/ui - ${url.split('/').pop()}`,
              type: 'WEBSITE',
              url: url,
              chunkIndex: i
            }),
          },
        });
      }

      // Update status
      await prisma.dataSource.update({
        where: { id: dataSource.id },
        data: { status: 'COMPLETED' },
      });

      console.log('✅ Completed processing');
    }

    console.log('\n🎉 Successfully added shadcn/ui documentation!');
    console.log('The chatbot should now be able to answer questions about shadcn installation and usage.');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addShadcnDocs();
