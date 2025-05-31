import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateEmbedding, splitTextIntoChunks } from '@/lib/ai';
import { extractTextFromWebsite } from '@/lib/text-processing';
import { getUserPlan } from '@/lib/subscription';
import FirecrawlApp from '@mendable/firecrawl-js';

interface DocCrawlRequest {
  chatbotId: string;
  baseUrl: string;
  urls: string[];
  name: string;
  description?: string;
}

// Initialize Firecrawl (will only be used for Pro/Enterprise users)
const firecrawlApp = process.env.FIRECRAWL_API_KEY 
  ? new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY })
  : null;

// Firecrawl crawling method for Pro/Enterprise users
async function crawlWithFirecrawl(url: string): Promise<{ content: string; title?: string }> {
  if (!firecrawlApp) {
    throw new Error('Firecrawl not available');
  }

  const result = await firecrawlApp.scrapeUrl(url, {
    formats: ['markdown', 'html'],
    onlyMainContent: true,
    includeTags: ['title', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'li', 'code', 'pre'],
    excludeTags: ['nav', 'footer', 'aside', 'script', 'style', 'header']
  });

  if (!result.success) {
    throw new Error('Failed to crawl with Firecrawl');
  }

  const content = result.markdown || result.html || '';
  const title = result.metadata?.title;

  return { content, title };
}

// Basic crawling method for Free users
async function crawlWithBasicMethod(url: string): Promise<{ content: string; title?: string }> {
  const content = await extractTextFromWebsite(url);
  return { content };
}

export async function POST(request: NextRequest) {
  try {
    const body: DocCrawlRequest = await request.json();
    const { chatbotId, baseUrl, urls, name, description } = body;

    console.log('Starting documentation crawl:', { chatbotId, name, urlCount: urls.length });

    if (!chatbotId || !urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json(
        { error: 'chatbotId and urls array are required' },
        { status: 400 }
      );
    }

    // Check if chatbot exists and get user plan
    const chatbot = await prisma.chatbot.findUnique({
      where: { id: chatbotId },
      include: {
        user: {
          select: {
            id: true,
            subscriptionStatus: true,
            subscriptionPlan: true,
            subscriptionExpiry: true,
          },
        },
      },
    });

    if (!chatbot) {
      return NextResponse.json(
        { error: 'Chatbot not found' },
        { status: 404 }
      );
    }

    // Get user plan and check limits
    const userPlan = await getUserPlan(chatbot.user.id);
    
    // Check URL limit based on plan
    if (urls.length > userPlan.features.maxUrlsPerCrawl) {
      return NextResponse.json(
        { 
          error: `URL limit exceeded. Your ${userPlan.plan} plan allows up to ${userPlan.features.maxUrlsPerCrawl} URLs per crawl.` 
        },
        { status: 400 }
      );
    }

    console.log(`User plan: ${userPlan.plan}, Firecrawl access: ${userPlan.hasFirecrawlAccess}`);

    const results = [];
    let totalChunks = 0;
    let totalSources = 0;
    let failedSources = 0;    for (const url of urls) {
      try {
        console.log(`\nProcessing URL: ${url}`);
        
        // Use appropriate crawling method based on user plan
        let crawlResult: { content: string; title?: string };
        let crawlMethod: string;
        
        if (userPlan.hasFirecrawlAccess && firecrawlApp) {
          try {
            console.log('Using Firecrawl (Pro/Enterprise)');
            crawlResult = await crawlWithFirecrawl(url);
            crawlMethod = 'firecrawl';
          } catch (firecrawlError) {
            console.log('Firecrawl failed, falling back to basic method:', firecrawlError);
            crawlResult = await crawlWithBasicMethod(url);
            crawlMethod = 'basic-fallback';
          }
        } else {
          console.log('Using basic crawling method (Free plan)');
          crawlResult = await crawlWithBasicMethod(url);
          crawlMethod = 'basic';
        }
        
        const { content, title } = crawlResult;
        
        if (!content || content.length < 50) {
          console.log(`Skipping ${url} - insufficient content`);
          failedSources++;
          results.push({
            url,
            success: false,
            error: 'Insufficient content extracted',
            chunks: 0,
            method: crawlMethod
          });
          continue;
        }

        console.log(`Extracted ${content.length} characters from ${url} using ${crawlMethod}`);

        // Generate a name for this specific page
        const urlPath = new URL(url).pathname;
        const pageName = urlPath.split('/').filter(Boolean).pop() || 'index';
        const sourceName = title ? `${name} - ${title}` : `${name} - ${pageName}`;

        // Create data source
        const dataSource = await prisma.dataSource.create({
          data: {
            chatbotId,
            type: 'WEBSITE',
            name: sourceName,
            url,
            content,
            status: 'PROCESSING',
          },
        });

        console.log(`Created data source: ${sourceName}`);

        // Split into chunks
        const chunks = splitTextIntoChunks(content, 1000);
        console.log(`Split into ${chunks.length} chunks`);

        // Generate embeddings for each chunk
        let successfulChunks = 0;
        for (let i = 0; i < chunks.length; i++) {
          try {
            const chunk = chunks[i];
            const embedding = await generateEmbedding(chunk);
              await prisma.contentChunk.create({
              data: {
                dataSourceId: dataSource.id,
                content: chunk,
                embedding: JSON.stringify(embedding),
                metadata: JSON.stringify({
                  source: sourceName,
                  type: 'WEBSITE',
                  url: url,
                  chunkIndex: i,
                  baseUrl: baseUrl || url,
                  pageName: title || pageName,
                  crawlMethod,
                  title,
                }),
              },
            });
            
            successfulChunks++;
          } catch (embeddingError) {
            console.error(`Error generating embedding for chunk ${i}:`, embeddingError);
          }
        }

        // Update data source status
        await prisma.dataSource.update({
          where: { id: dataSource.id },
          data: { 
            status: successfulChunks > 0 ? 'COMPLETED' : 'FAILED',
            errorMessage: successfulChunks === 0 ? 'Failed to generate embeddings' : null
          },
        });

        totalSources++;
        totalChunks += successfulChunks;        results.push({
          url,
          success: true,
          dataSourceId: dataSource.id,
          chunks: successfulChunks,
          totalChunks: chunks.length,
          contentLength: content.length,
          method: crawlMethod,
          title: title || pageName
        });

        console.log(`✅ Completed ${url}: ${successfulChunks}/${chunks.length} chunks (${crawlMethod})`);

        // Add delay between requests to be respectful
        if (urls.indexOf(url) < urls.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

      } catch (error) {
        console.error(`Error processing ${url}:`, error);
        failedSources++;
        
        results.push({
          url,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          chunks: 0
        });
      }
    }    console.log('\n🎉 Documentation crawl completed!');
    console.log(`✅ Successful sources: ${totalSources}`);
    console.log(`❌ Failed sources: ${failedSources}`);
    console.log(`📦 Total chunks created: ${totalChunks}`);

    return NextResponse.json({
      success: true,
      summary: {
        totalUrls: urls.length,
        successfulSources: totalSources,
        failedSources,
        totalChunks,
        userPlan: userPlan.plan,
        crawlingMethod: userPlan.hasFirecrawlAccess ? 'firecrawl' : 'basic',
        firecrawlAvailable: userPlan.hasFirecrawlAccess && !!firecrawlApp,
      },
      results,
      message: `Successfully processed ${totalSources}/${urls.length} URLs with ${totalChunks} total chunks using ${userPlan.hasFirecrawlAccess ? 'advanced' : 'basic'} crawling`
    });

  } catch (error) {
    console.error('Error in documentation crawl:', error);
    return NextResponse.json(
      { error: 'Failed to crawl documentation' },
      { status: 500 }
    );
  }
}
