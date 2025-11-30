import React, { useState, useEffect } from 'react';
import { Message } from '../types';
import { Heart } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
  onComplete: (id: string) => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, onComplete }) => {
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    // Determine the animation duration from the CSS class (approx 8000ms)
    // We add a small buffer to ensure the animation completes visually
    const timer = setTimeout(() => {
      onComplete(message.id);
    }, 8000);

    return () => clearTimeout(timer);
  }, [message.id, onComplete]);

  return (
    <div
      className={`absolute animate-float-up px-6 py-4 rounded-2xl shadow-lg border backdrop-blur-sm cursor-pointer transition-transform hover:scale-105 select-none z-10 ${message.color}`}
      style={{
        left: `${message.x}%`,
        top: `${message.y}%`,
        transform: `rotate(${message.rotation}deg)`,
      }}
      onClick={() => setIsLiked(true)}
    >
      <div className="flex items-center gap-2">
        <span className="font-medium text-lg tracking-wide whitespace-nowrap">
          {message.text}
        </span>
        <Heart 
          size={16} 
          className={`transition-colors duration-300 ${isLiked ? 'fill-red-500 text-red-500 scale-125' : 'text-current opacity-40'}`} 
        />
      </div>
    </div>
  );
};

export default React.memo(MessageBubble);