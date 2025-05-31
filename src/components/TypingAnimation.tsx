"use client";

import React from 'react';

interface TypingAnimationProps {
  primaryColor: string;
}

const TypingAnimation: React.FC<TypingAnimationProps> = ({ primaryColor }) => {
  return (
    <div className="flex items-center space-x-1 px-3 py-2">
      {/* Typing indicator dots */}
      <div className="flex space-x-1">
        <div 
          className="w-2 h-2 rounded-full animate-pulse"
          style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            animationDelay: '0ms',
            animationDuration: '1.4s'
          }}
        />
        <div 
          className="w-2 h-2 rounded-full animate-pulse"
          style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.6)',
            animationDelay: '200ms',
            animationDuration: '1.4s'
          }}
        />
        <div 
          className="w-2 h-2 rounded-full animate-pulse"
          style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.4)',
            animationDelay: '400ms',
            animationDuration: '1.4s'
          }}
        />
      </div>
      
      {/* Typing text */}
      <span className="text-white text-opacity-80 text-xs ml-2 animate-pulse">
        AI is typing...
      </span>
    </div>
  );
};

export default TypingAnimation;
