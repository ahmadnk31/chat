import * as cheerio from 'cheerio';
import axios from 'axios';

export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  // Check if we're on the server side
  if (typeof window !== 'undefined') {
    throw new Error('PDF processing is only available on the server side');
  }

  try {
    // Use dynamic require to avoid webpack bundling issues
    const pdfParse = eval('require')('pdf-parse');
    const data = await pdfParse(buffer);
    
    if (!data.text || data.text.trim().length === 0) {
      throw new Error('No text content found in PDF');
    }
    
    // Clean and validate the extracted text
    const cleanedText = cleanText(data.text);
    
    if (cleanedText.length < 10) {
      throw new Error('Insufficient text content extracted from PDF');
    }
    
    return cleanedText;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to extract text from PDF: ${error.message}`);
    }
    throw new Error('Failed to extract text from PDF');
  }
}

export async function extractTextFromWebsite(url: string): Promise<string> {
  try {
    console.log('Starting website extraction for URL:', url);
    
    // Validate URL
    const urlObject = new URL(url);
    if (!['http:', 'https:'].includes(urlObject.protocol)) {
      throw new Error('Invalid URL protocol. Only HTTP and HTTPS are supported.');
    }

    console.log('Making request to:', url);
    const response = await axios.get(url, {
      timeout: 30000,
      maxRedirects: 5,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      },
      validateStatus: function (status) {
        return status >= 200 && status < 400; // Accept redirects as well
      }
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers['content-type']);

    if (!response.data) {
      throw new Error('No data received from the website');
    }

    const $ = cheerio.load(response.data);
    
    // Remove unwanted elements
    $('script, style, nav, footer, header, aside, .navigation, .sidebar, .ads, .advertisement').remove();
    
    // Extract text from common content areas with priority
    let text = '';
    
    // Try to get main content first (in order of preference)
    const contentSelectors = [
      'main',
      'article', 
      '[role="main"]',
      '.main-content',
      '.content',
      '.post-content',
      '.entry-content',
      '.article-content',
      '.page-content',
      '#content',
      '#main',
      '.post',
      '.entry'
    ];
    
    for (const selector of contentSelectors) {
      const element = $(selector).first();
      if (element.length > 0) {
        text = element.text();
        console.log(`Found content using selector: ${selector}, length: ${text.length}`);
        break;
      }
    }
    
    // If no specific content area found, fallback to body but exclude common non-content areas
    if (!text || text.length < 100) {
      console.log('Using fallback body extraction');
      $('nav, footer, header, aside, .menu, .sidebar, .navigation, .ads').remove();
      text = $('body').text();
    }

    // Clean up the text
    text = text
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, '\n')
      .replace(/\t+/g, ' ')
      .trim();

    console.log('Extracted text length:', text.length);
    console.log('First 200 characters:', text.substring(0, 200));

    if (!text || text.length < 50) {
      throw new Error(`Insufficient content extracted from website. Only ${text.length} characters found.`);
    }

    return text;
  } catch (error) {
    console.error('Error extracting text from website:', error);
    
    if (axios.isAxiosError(error)) {
      if (error.code === 'ENOTFOUND') {
        throw new Error(`Website not found: ${url}. Please check if the URL is correct.`);
      } else if (error.code === 'ECONNREFUSED') {
        throw new Error(`Connection refused: ${url}. The website may be down or blocking requests.`);
      } else if (error.code === 'ETIMEDOUT') {
        throw new Error(`Request timeout: ${url}. The website took too long to respond.`);
      } else if (error.response) {
        throw new Error(`HTTP ${error.response.status}: ${error.response.statusText} for ${url}`);
      }
    }
    
    if (error instanceof Error) {
      throw new Error(`Failed to extract text from website: ${error.message}`);
    }
    throw new Error('Failed to extract text from website: Unknown error');
  }
}

export function cleanText(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .replace(/\n+/g, '\n')
    .replace(/[^\w\s\.\,\!\?\-\:\;]/g, '')
    .trim();
}

export function validateUrl(url: string): boolean {
  try {
    const urlObject = new URL(url);
    return ['http:', 'https:'].includes(urlObject.protocol);
  } catch {
    return false;
  }
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}
