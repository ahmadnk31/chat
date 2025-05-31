"use client";

import React from 'react';
import { richTextFromMarkdown } from '@contentful/rich-text-from-markdown';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import { BLOCKS, INLINES, MARKS } from '@contentful/rich-text-types';
import type { Options } from '@contentful/rich-text-react-renderer';

interface MessageRendererProps {
  content: string;
  role: 'USER' | 'ASSISTANT';
}

const MessageRenderer: React.FC<MessageRendererProps> = ({ content, role }) => {
  const [renderedContent, setRenderedContent] = React.useState<React.ReactNode>(null);
  // Rich text rendering options
  const options: Options = {
    renderMark: {
      [MARKS.BOLD]: (text) => <strong className="font-semibold">{text}</strong>,
      [MARKS.ITALIC]: (text) => <em className="italic">{text}</em>,
      [MARKS.CODE]: (text) => (
        <code className={`px-1 py-0.5 rounded text-sm font-mono ${
          role === 'ASSISTANT' 
            ? 'bg-white bg-opacity-20 text-white' 
            : 'bg-gray-200 text-gray-800'
        }`}>
          {text}
        </code>
      ),
    },
    renderNode: {
      [BLOCKS.PARAGRAPH]: (node, children) => (
        <p className="mb-2 last:mb-0">{children}</p>
      ),
      [BLOCKS.UL_LIST]: (node, children) => (
        <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>
      ),
      [BLOCKS.OL_LIST]: (node, children) => (
        <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>
      ),
      [BLOCKS.LIST_ITEM]: (node, children) => (
        <li className="ml-2">{children}</li>
      ),
      [BLOCKS.HEADING_1]: (node, children) => (
        <h1 className="text-lg font-bold mb-2">{children}</h1>
      ),
      [BLOCKS.HEADING_2]: (node, children) => (
        <h2 className="text-base font-bold mb-2">{children}</h2>
      ),
      [BLOCKS.HEADING_3]: (node, children) => (
        <h3 className="text-sm font-bold mb-2">{children}</h3>
      ),      [BLOCKS.QUOTE]: (node, children) => (
        <blockquote className={`border-l-4 pl-4 italic mb-2 ${
          role === 'ASSISTANT' 
            ? 'border-white border-opacity-50 text-white text-opacity-90' 
            : 'border-gray-300 text-gray-600'
        }`}>
          {children}
        </blockquote>
      ),
      [BLOCKS.HR]: () => <hr className={`my-3 ${
        role === 'ASSISTANT' ? 'border-white border-opacity-30' : 'border-gray-300'
      }`} />,
    },
  };

  // Effect to handle async rendering
  React.useEffect(() => {
    const renderContent = async () => {
      try {
        // For user messages, just display as plain text
        if (role === 'USER') {
          setRenderedContent(<span>{content}</span>);
          return;
        }        // For assistant messages, try to parse as markdown and render with rich text
        // First, preprocess the content to ensure proper markdown formatting
        let processedContent = content
          // Fix common markdown issues
          .replace(/\*\s+/g, '* ') // Fix bullet points with extra spaces
          .replace(/^\s*[\*\-\+]\s+/gm, '* ') // Normalize bullet points
          .replace(/^\s*(\d+)\.\s+/gm, '$1. ') // Normalize numbered lists
          // Ensure proper line breaks
          .replace(/\n{3,}/g, '\n\n') // Limit excessive line breaks
          .replace(/([.!?])\s*\n(?!\n)/g, '$1\n\n') // Add paragraph breaks after sentences
          // Fix bold/italic formatting
          .replace(/\*\*([^*\n]+)\*\*/g, '**$1**') // Fix bold
          .replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, '*$1*') // Fix italic (not part of bold)
          // Fix code formatting
          .replace(/`([^`\n]+)`/g, '`$1`')
          // Handle headers
          .replace(/^(#{1,6})\s*(.+)$/gm, '$1 $2')
          // Clean up whitespace
          .trim();

        // Convert markdown to rich text document (this is async)
        const richTextDocument = await richTextFromMarkdown(processedContent);
        
        // Render the rich text document
        const rendered = documentToReactComponents(richTextDocument, options);
        setRenderedContent(rendered);
      } catch (error) {
        console.warn('Failed to parse rich text, falling back to plain text:', error);
        // Fallback to plain text with basic formatting
        setRenderedContent(renderFallbackFormatting(content));
      }
    };

    renderContent();
  }, [content, role]);

  // Fallback formatting for when rich text parsing fails
  const renderFallbackFormatting = (text: string) => {
    // Split by double newlines to create paragraphs
    const paragraphs = text.split('\n\n').filter(p => p.trim());
    
    return (
      <div>
        {paragraphs.map((paragraph, index) => {
          // Check if paragraph is a list
          if (paragraph.includes('•') || /^\d+\./.test(paragraph)) {
            const listItems = paragraph.split('\n').filter(item => item.trim());
            return (
              <ul key={index} className="list-disc list-inside mb-2 space-y-1">
                {listItems.map((item, itemIndex) => (
                  <li key={itemIndex} className="ml-2">
                    {item.replace(/^[•\-\*]\s*/, '').replace(/^\d+\.\s*/, '')}
                  </li>
                ))}
              </ul>
            );
          }
          
          // Regular paragraph with inline formatting
          return (
            <p key={index} className="mb-2 last:mb-0">
              {formatInlineText(paragraph)}
            </p>
          );
        })}
      </div>
    );
  };

  // Format inline text with bold, italic, and code
  const formatInlineText = (text: string) => {
    const parts = [];
    let remaining = text;
    let key = 0;

    while (remaining.length > 0) {
      // Check for bold text
      const boldMatch = remaining.match(/\*\*([^*]+)\*\*/);
      if (boldMatch) {
        const beforeBold = remaining.substring(0, boldMatch.index);
        if (beforeBold) {
          parts.push(<span key={key++}>{beforeBold}</span>);
        }
        parts.push(<strong key={key++} className="font-semibold">{boldMatch[1]}</strong>);
        remaining = remaining.substring(boldMatch.index! + boldMatch[0].length);
        continue;
      }

      // Check for italic text
      const italicMatch = remaining.match(/\*([^*]+)\*/);
      if (italicMatch) {
        const beforeItalic = remaining.substring(0, italicMatch.index);
        if (beforeItalic) {
          parts.push(<span key={key++}>{beforeItalic}</span>);
        }
        parts.push(<em key={key++} className="italic">{italicMatch[1]}</em>);
        remaining = remaining.substring(italicMatch.index! + italicMatch[0].length);
        continue;
      }

      // Check for code text
      const codeMatch = remaining.match(/`([^`]+)`/);
      if (codeMatch) {
        const beforeCode = remaining.substring(0, codeMatch.index);
        if (beforeCode) {
          parts.push(<span key={key++}>{beforeCode}</span>);
        }        parts.push(
          <code key={key++} className={`px-1 py-0.5 rounded text-sm font-mono ${
            role === 'ASSISTANT' 
              ? 'bg-white bg-opacity-20 text-white' 
              : 'bg-gray-200 text-gray-800'
          }`}>
            {codeMatch[1]}
          </code>
        );
        remaining = remaining.substring(codeMatch.index! + codeMatch[0].length);
        continue;
      }

      // No more formatting found, add the rest as plain text
      parts.push(<span key={key++}>{remaining}</span>);
      break;
    }

    return parts;
  };
  return (
    <div className="text-sm leading-relaxed">
      {renderedContent || <span>Loading...</span>}
    </div>
  );
};

export default MessageRenderer;
