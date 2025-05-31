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
      content: `You are a helpful customer support assistant. Use the following context to answer questions accurately and helpfully. If the context doesn't contain relevant information, politely say you don't have that information.

Context:
${context}

Guidelines:
- Be helpful and friendly
- Answer based on the provided context
- If you don't know something, say so
- Keep responses concise but informative
- Use bullet points or numbered lists when appropriate
- Format your response clearly with proper spacing`
    };

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [systemMessage, ...messages],
      max_tokens: 500,
      temperature: 0.7,
    });

    const rawResponse = response.choices[0]?.message?.content || 'I apologize, but I cannot provide a response at the moment.';
    
    // Format the response for better readability
    return formatChatResponse(rawResponse);
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
  limit: number = 3
): Promise<string[]> {
  const queryEmbedding = await generateEmbedding(query);
  
  const similarities = chunks.map((chunk, index) => {
    let embedding: number[];
    try {
      embedding = JSON.parse(chunk.embedding);
    } catch {
      return { index, similarity: 0, content: chunk.content };
    }
    
    return {
      index,
      similarity: cosineSimilarity(queryEmbedding, embedding),
      content: chunk.content
    };
  });

  similarities.sort((a, b) => b.similarity - a.similarity);
  
  return similarities.slice(0, limit).map(item => item.content);
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
