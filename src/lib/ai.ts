import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
    });
    
    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw new Error('Failed to generate embedding');
  }
}

export async function generateChatResponse(
  messages: { role: 'user' | 'assistant' | 'system'; content: string }[],
  context: string
): Promise<string> {
  try {
    const systemMessage = {
      role: 'system' as const,
      content: `You are a helpful assistant. You MUST answer questions using ONLY the information provided in the context below. Do not use any external knowledge.

KNOWLEDGE BASE CONTEXT:
${context}

CRITICAL INSTRUCTIONS:
- ONLY use information explicitly stated in the context above
- If the context contains relevant information, provide a detailed answer based on that information
- If the context doesn't contain information to answer the question, say: "I don't have information about that in my knowledge base. Please ask about topics covered in the provided documentation."
- Always reference the context when answering
- Be helpful and detailed when the information is available in the context

FORMATTING RULES:
- Use proper markdown formatting
- Use single bullet points (- or *) for lists, NOT multiple bullets
- Use **bold** for emphasis and headings
- Use proper line breaks between sections
- Structure your response clearly with headings and lists
- Example of good formatting:

**Job Title**
- Location: City, Country
- Type: Full-time/Part-time
- Description: Job details here

When you can answer from the context, start your response with phrases like:
- "Based on the information in my knowledge base..."
- "According to the documentation..."
- "The provided information indicates..."

Remember: You can ONLY answer questions using the context provided above. Format your response with clean markdown.`
    };

    console.log('Generating response with context length:', context.length);

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [systemMessage, ...messages],
      max_tokens: 800,
      temperature: 0.2, // Lower temperature for more focused responses
    });

    const rawResponse = response.choices[0]?.message?.content || 'I apologize, but I cannot provide a response at the moment.';
    
    console.log('Raw AI response:', rawResponse.substring(0, 200));
    
    // Clean up the response to fix common formatting issues
    const cleanedResponse = cleanMarkdownFormatting(rawResponse);
    
    // Format the response for better readability
    return formatChatResponse(cleanedResponse);
  } catch (error) {
    console.error('Error generating chat response:', error);
    throw new Error('Failed to generate response');
  }
}

export function splitTextIntoChunks(text: string, maxChunkSize: number = 1000): string[] {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const chunks: string[] = [];
  let currentChunk = '';

  for (const sentence of sentences) {
    const trimmedSentence = sentence.trim();
    if (currentChunk.length + trimmedSentence.length + 1 <= maxChunkSize) {
      currentChunk += (currentChunk ? '. ' : '') + trimmedSentence;
    } else {
      if (currentChunk) {
        chunks.push(currentChunk + '.');
      }
      currentChunk = trimmedSentence;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk + '.');
  }

  return chunks;
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same length');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export async function findRelevantChunks(
  query: string,
  chunks: { content: string; embedding: string }[],
  limit: number = 3,
  minSimilarity: number = 0.3
): Promise<string[]> {
  console.log(`Finding relevant chunks for query: "${query.substring(0, 100)}..."`);
  console.log(`Total chunks available: ${chunks.length}`);
  
  const queryEmbedding = await generateEmbedding(query);
  
  const similarities = chunks.map((chunk, index) => {
    let embedding: number[];
    try {
      embedding = JSON.parse(chunk.embedding);
    } catch (error) {
      console.warn(`Failed to parse embedding for chunk ${index}:`, error);
      return { index, similarity: 0, content: chunk.content };
    }
    
    const similarity = cosineSimilarity(queryEmbedding, embedding);
    return {
      index,
      similarity,
      content: chunk.content
    };
  });

  similarities.sort((a, b) => b.similarity - a.similarity);
  
  // Log top similarities for debugging
  console.log('Top 5 similarities:', similarities.slice(0, 5).map(s => ({
    similarity: s.similarity.toFixed(3),
    preview: s.content.substring(0, 100)
  })));
  
  // Filter by minimum similarity and apply limit
  const relevantChunks = similarities
    .filter(item => item.similarity >= minSimilarity)
    .slice(0, limit);
  
  console.log(`Found ${relevantChunks.length} relevant chunks with similarity >= ${minSimilarity}`);
  
  if (relevantChunks.length === 0) {
    console.log('No chunks found above similarity threshold, returning top chunks anyway');
    return similarities.slice(0, Math.min(limit, similarities.length)).map(item => item.content);
  }
  
  return relevantChunks.map(item => item.content);
}

export function formatChatResponse(text: string): string {
  if (!text || typeof text !== 'string') {
    return 'I apologize, but I cannot provide a response at the moment.';
  }

  // Clean up the response
  let formatted = text
    // Remove excessive whitespace
    .replace(/\s+/g, ' ')
    // Fix line breaks around bullet points
    .replace(/\s*[\*\-\+]\s*/g, '\n• ')
    // Fix numbered lists
    .replace(/\s*(\d+)\.\s*/g, '\n$1. ')
    // Add proper spacing after periods
    .replace(/\.(?=[A-Z])/g, '. ')
    // Fix paragraph spacing
    .replace(/\n\s*\n/g, '\n\n')
    // Clean up beginning and end
    .trim();

  // Apply markdown-like formatting
  formatted = formatMarkdownLike(formatted);

  // Ensure proper sentence structure
  if (formatted && !formatted.match(/[.!?]$/)) {
    formatted += '.';
  }

  // Add proper line breaks for better readability
  formatted = formatted
    // Break up long paragraphs
    .replace(/([.!?])\s+([A-Z])/g, '$1\n\n$2')
    // Fix bullet point formatting
    .replace(/^\s*•/gm, '• ')
    // Ensure consistent spacing
    .replace(/\n{3,}/g, '\n\n');

  return formatted;
}

export function truncateResponse(text: string, maxLength: number = 1000): string {
  if (text.length <= maxLength) return text;
  
  // Find the last complete sentence within the limit
  const truncated = text.substring(0, maxLength);
  const lastSentenceEnd = Math.max(
    truncated.lastIndexOf('.'),
    truncated.lastIndexOf('!'),
    truncated.lastIndexOf('?')
  );
  
  if (lastSentenceEnd > maxLength * 0.7) {
    return truncated.substring(0, lastSentenceEnd + 1);
  }
  
  return truncated + '...';
}

export function formatMarkdownLike(text: string): string {
  return text
    // Convert **bold** to HTML-like formatting indicators
    .replace(/\*\*(.*?)\*\*/g, '**$1**')
    // Convert *italic* to formatting indicators  
    .replace(/\*(.*?)\*/g, '*$1*')
    // Ensure code blocks are properly formatted
    .replace(/`(.*?)`/g, '`$1`')
    // Format headers
    .replace(/^#+\s*(.*$)/gm, '**$1**')
    // Clean up extra formatting
    .replace(/\*\*\s*\*\*/g, '')
    .replace(/\*\s*\*/g, '');
}

export function cleanMarkdownFormatting(text: string): string {
  return text
    // Fix excessive bullet points
    .replace(/[•\*\-]\s*[•\*\-]\s*[•\*\-]+/g, '-')
    .replace(/[•\*\-]\s*[•\*\-]/g, '-')
    // Normalize bullet points
    .replace(/^\s*[•\*\+]\s+/gm, '- ')
    // Fix numbered lists
    .replace(/^\s*(\d+)\.\s+/gm, '$1. ')
    // Clean up excessive spacing
    .replace(/\s{3,}/g, ' ')
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    // Fix bold formatting
    .replace(/\*\*\s+/g, '**')
    .replace(/\s+\*\*/g, '**')
    // Clean up line breaks around formatting
    .replace(/\n+(\*\*[^*]+\*\*)/g, '\n\n$1')
    .replace(/(\*\*[^*]+\*\*)\n+/g, '$1\n\n')
    .trim();
}

export function formatForChatDisplay(text: string): {
  content: string;
  hasFormatting: boolean;
  type: 'text' | 'list' | 'structured';
} {
  const formatted = formatChatResponse(text);
  
  // Detect content type
  const hasLists = /^[\s]*[•\-\*]|\d+\./m.test(formatted);
  const hasStructuredContent = /\*\*.*?\*\*/.test(formatted) || /```[\s\S]*?```/.test(formatted);
  
  let type: 'text' | 'list' | 'structured' = 'text';
  if (hasLists) type = 'list';
  if (hasStructuredContent) type = 'structured';
  
  return {
    content: formatted,
    hasFormatting: hasLists || hasStructuredContent,
    type
  };
}
