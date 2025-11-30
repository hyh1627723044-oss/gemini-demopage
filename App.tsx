import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Message, AppState } from './types';
import { INITIAL_MESSAGES, PASTEL_COLORS } from './constants';
import { fetchHeartwarmingMessages } from './services/geminiService';
import MessageBubble from './components/MessageBubble';
import { Play, Pause, RefreshCw, Volume2, VolumeX, Sparkles, Heart } from 'lucide-react';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [buffer, setBuffer] = useState<string[]>([]);
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [isMuted, setIsMuted] = useState(true);
  
  // Using refs for interval management to avoid dependency loop pitfalls
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fetchingRef = useRef(false);

  // Generate a random message object
  const createMessage = useCallback((text: string): Message => {
    return {
      id: Math.random().toString(36).substr(2, 9),
      text,
      // Random position with some padding from edges (10% to 80%)
      x: 10 + Math.random() * 70,
      y: 30 + Math.random() * 60,
      color: PASTEL_COLORS[Math.floor(Math.random() * PASTEL_COLORS.length)],
      rotation: Math.random() * 10 - 5, // Slight tilt -5 to 5 deg
      delay: Math.random() * 0.5,
    };
  }, []);

  // Initial buffer population
  useEffect(() => {
    setBuffer(INITIAL_MESSAGES.sort(() => 0.5 - Math.random()));
  }, []);

  // Background fetcher to keep buffer full
  useEffect(() => {
    const checkBuffer = async () => {
      if (buffer.length < 10 && !fetchingRef.current && appState === AppState.RUNNING) {
        fetchingRef.current = true;
        const newMessages = await fetchHeartwarmingMessages();
        if (newMessages.length > 0) {
          setBuffer(prev => [...prev, ...newMessages]);
        }
        fetchingRef.current = false;
      }
    };

    const bufferInterval = setInterval(checkBuffer, 5000);
    return () => clearInterval(bufferInterval);
  }, [buffer.length, appState]);

  // Main game loop: Add messages to screen
  useEffect(() => {
    if (appState === AppState.RUNNING) {
      intervalRef.current = setInterval(() => {
        setBuffer(prevBuffer => {
          if (prevBuffer.length === 0) return prevBuffer; // Empty buffer, wait for refill

          const [nextText, ...rest] = prevBuffer;
          const newMessage = createMessage(nextText);

          setMessages(prevMessages => {
            // Limit total messages on screen to prevent DOM overload
            // Increased limit to 40 for denser feel
            if (prevMessages.length > 40) {
              const [, ...remaining] = prevMessages;
              return [...remaining, newMessage];
            }
            return [...prevMessages, newMessage];
          });
          
          // Sound effect logic (simulated)
          if (!isMuted) {
             // Realistically, we'd play a soft 'pop' sound here
          }

          // If buffer is running low, recycle initial messages immediately to prevent dry spell
          // while waiting for API
          if (rest.length === 0) {
             return INITIAL_MESSAGES.sort(() => 0.5 - Math.random());
          }

          return rest;
        });
      }, 600); // New message every 600ms (0.6 seconds) for higher density
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [appState, isMuted, createMessage]);

  const handleRemoveMessage = useCallback((id: string) => {
    setMessages(prev => prev.filter(m => m.id !== id));
  }, []);

  const togglePlay = () => {
    setAppState(prev => prev === AppState.RUNNING ? AppState.PAUSED : AppState.RUNNING);
  };

  const handleStart = () => {
    setAppState(AppState.RUNNING);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      
      {/* Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-200/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-pink-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Intro Screen */}
      {appState === AppState.IDLE && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/30 backdrop-blur-md transition-opacity duration-500">
          <div className="bg-white/90 p-10 rounded-3xl shadow-2xl text-center max-w-md mx-4 border border-white/50">
            <div className="mb-6 flex justify-center">
              <div className="p-4 bg-pink-100 rounded-full text-pink-500">
                <Sparkles size={48} />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">暖心时刻</h1>
            <p className="text-gray-600 mb-8 leading-relaxed">
              在这个快节奏的世界里，给自己片刻的宁静。<br/>
              接收来自宇宙的温柔讯息。
            </p>
            <button 
              onClick={handleStart}
              className="group relative px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                开始疗愈 <Heart size={20} className="fill-current" />
              </span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            </button>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="absolute top-6 right-6 z-50 flex gap-3">
        <button 
          onClick={() => setIsMuted(!isMuted)}
          className="p-3 bg-white/80 backdrop-blur rounded-full shadow-sm hover:bg-white text-gray-600 transition-colors"
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
        <button 
          onClick={togglePlay}
          className="p-3 bg-white/80 backdrop-blur rounded-full shadow-sm hover:bg-white text-gray-600 transition-colors"
          title={appState === AppState.RUNNING ? "Pause" : "Resume"}
        >
          {appState === AppState.RUNNING ? <Pause size={20} /> : <Play size={20} />}
        </button>
      </div>
·
      {/* Main Message Layer */}
      <div className="relative w-full h-full pointer-events-none">
        {messages.map(msg => (
          <div key={msg.id} className="pointer-events-auto">
             <MessageBubble message={msg} onComplete={handleRemoveMessage} />
          </div>
        ))}
      </div>

      {/* Manual Trigger (Bottom Center) - Only visible when running */}
      {appState === AppState.RUNNING && (
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-40">
           <button 
             onClick={() => {
                const text = buffer[0] || "抱抱你";
                const newMsg = createMessage(text);
                setMessages(prev => [...prev, newMsg]);
             }}
             className="flex items-center gap-2 px-6 py-3 bg-white/80 backdrop-blur-md text-purple-600 font-medium rounded-full shadow-md hover:bg-white hover:scale-105 transition-all active:scale-95"
           >
             <RefreshCw size={18} />
             再来一条
           </button>
        </div>
      )}
      
      {/* Footer / Attribution */}
      <div className="absolute bottom-4 right-6 text-gray-400 text-xs z-30 opacity-50">
        Powered by Gemini
      </div>

    </div>
  );
};

export default App;