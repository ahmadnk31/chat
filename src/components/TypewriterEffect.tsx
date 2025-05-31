"use client";

import React, { useState, useEffect } from 'react';
import MessageRenderer from './MessageRenderer';

interface TypewriterEffectProps {
  content: string;
  role: 'USER' | 'ASSISTANT';
  speed?: number; // characters per interval
  interval?: number; // milliseconds between characters
  onCharacterTyped?: () => void; // callback for each character typed
}

const TypewriterEffect: React.FC<TypewriterEffectProps> = ({ 
  content, 
  role, 
  speed = 2, 
  interval = 30,
  onCharacterTyped
}) => {
  const [displayedContent, setDisplayedContent] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (role === 'USER') {
      // Show user messages immediately
      setDisplayedContent(content);
      setIsComplete(true);
      return;
    }

    // Typewriter effect for AI messages
    let currentIndex = 0;
    setDisplayedContent('');
    setIsComplete(false);

    const timer = setInterval(() => {
      if (currentIndex < content.length) {
        const nextIndex = Math.min(currentIndex + speed, content.length);
        setDisplayedContent(content.slice(0, nextIndex));
        currentIndex = nextIndex;
        
        // Trigger callback for scrolling
        if (onCharacterTyped) {
          onCharacterTyped();
        }
      } else {
        setIsComplete(true);
        clearInterval(timer);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [content, role, speed, interval, onCharacterTyped]);

  return (
    <div className="relative">
      <MessageRenderer content={displayedContent} role={role} />
      {/* Blinking cursor for AI messages */}
      {role === 'ASSISTANT' && !isComplete && (
        <span className="inline-block w-0.5 h-4 bg-white bg-opacity-70 animate-pulse ml-1" />
      )}
    </div>
  );
};

export default TypewriterEffect;
