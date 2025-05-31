# Embedding Generation for Chatbot Content

## Current Issue
The shadcn documentation was successfully crawled but doesn't have embeddings generated. This means the chatbot can't properly search and match user queries to the content.

## Solution 1: Fix Existing Content (Generate Missing Embeddings)

### Step 1: Set up OpenAI API Key
You need to set your OpenAI API key as an environment variable. Create a `.env.local` file in your project root:

```bash
# .env.local
OPENAI_API_KEY=your_openai_api_key_here
```

### Step 2: Start the Development Server
The embedding generation now uses API routes, so you need the server running:

```bash
npm run dev
```

### Step 3: Run the Embedding Generator
Choose one of these options:

**Option A: Batch Processing (Recommended - Faster)**
```bash
node generate-embeddings-batch.js
```

**Option B: Individual Processing (Slower but more detailed feedback)**
```bash
node generate-embeddings.js
```

This will:
- Check if the development server is running
- Find all content chunks without embeddings  
- Generate embeddings using the `/api/embeddings` or `/api/embeddings/batch` endpoint
- Update the database with proper embeddings
- Add rate limiting to avoid API limits

## Solution 2: Normal Flow (How It Should Work for New Chatbots)

The normal chatbot creation flow already has embedding generation built-in:

### 1. User Creates Chatbot via UI
- User goes to `/dashboard/new`
- Selects chatbot type (DOCS_SEARCH_ENGINE or CUSTOMER_SUPPORT)
- Adds data sources (PDF, URL, or TEXT)

### 2. Data Source Processing (Automatic)
When adding a website URL, the system:

```typescript
// 1. Extract text from website
const content = await extractTextFromWebsite(url);

// 2. Split into chunks
const chunks = splitTextIntoChunks(content, 1000);

// 3. Generate embeddings for each chunk
for (const chunk of chunks) {
  const embedding = await generateEmbedding(chunk);
  await prisma.contentChunk.create({
    data: {
      dataSourceId: dataSource.id,
      content: chunk,
      embedding: JSON.stringify(embedding), // ✅ Proper embedding
      metadata: JSON.stringify({
        source: name,
        type: type,
      }),
    },
  });
}
```

### 3. Key Functions Used
- `extractTextFromWebsite()` - Crawls and cleans web content
- `splitTextIntoChunks()` - Breaks text into manageable pieces
- `generateEmbedding()` - Creates vector embeddings using OpenAI
- Database stores both content and embeddings

### 4. Search Functionality
When user searches:
```typescript
// 1. Generate embedding for user query
const queryEmbedding = await generateEmbedding(query);

// 2. Find similar content using cosine similarity
const relevantChunks = await findRelevantChunks(
  chatbotId, 
  queryEmbedding, 
  threshold
);

// 3. Return relevant content to user
```

## Why Embeddings Are Essential

Without embeddings:
- ❌ No semantic search capability
- ❌ Can't match user queries to relevant content
- ❌ Chatbot returns empty or irrelevant results

With embeddings:
- ✅ Semantic understanding of content
- ✅ Accurate matching of queries to relevant chunks
- ✅ Smart search results based on meaning, not just keywords

## Current Status

**Database Content:**
- 56 total content chunks
- 32 chunks WITH embeddings (PDF files)
- 24 chunks WITHOUT embeddings (shadcn documentation)

**Next Steps:**
1. Set OPENAI_API_KEY in .env.local
2. Run `node generate-embeddings.js`
3. Test chatbot functionality

**Files Modified for Proper Flow:**
- `/api/datasources/route.ts` - Handles embedding generation
- `/api/embeddings/route.ts` - New: Single embedding generation API
- `/api/embeddings/batch/route.ts` - New: Batch embedding generation API
- `/lib/ai.ts` - Core AI functions
- `/lib/text-processing.ts` - Web crawling and text extraction
- Frontend forms - Use datasources API endpoint
- `generate-embeddings.js` - Updated to use API routes
- `generate-embeddings-batch.js` - New: Efficient batch processing

The normal flow through the UI will automatically generate embeddings, but since we used a manual script to add the shadcn docs, we need to backfill the missing embeddings using the new API-based scripts.
