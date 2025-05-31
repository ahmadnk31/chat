// Test script for URL crawling functionality
const { extractTextFromWebsite } = require('./src/lib/text-processing.ts');

async function testUrlCrawling() {
  const testUrls = [
    'https://example.com',
    'https://docs.github.com/en/get-started/quickstart/hello-world',
    'https://www.wikipedia.org',
    'https://httpbin.org/html'
  ];

  for (const url of testUrls) {
    console.log(`\n--- Testing URL: ${url} ---`);
    try {
      const text = await extractTextFromWebsite(url);
      console.log(`✅ Success! Extracted ${text.length} characters`);
      console.log(`First 200 chars: ${text.substring(0, 200)}...`);
    } catch (error) {
      console.log(`❌ Failed: ${error.message}`);
    }
  }
}

if (require.main === module) {
  testUrlCrawling().catch(console.error);
}

module.exports = { testUrlCrawling };
