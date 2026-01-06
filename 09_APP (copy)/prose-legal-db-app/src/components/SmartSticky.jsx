// src/components/SmartSticky.jsx
import React, { useState, useRef, useEffect } from 'react';

const SmartSticky = ({ id, initialText = '', text: textProp, x = 100, y = 100, targetFile, onSave, onClose }) => {
  const [text, setText] = useState(textProp || initialText);
  const [listening, setListening] = useState(false);
  const [pos, setPos] = useState({ x, y });
  const stickyRef = useRef(null);
  const recognizerRef = useRef(null);

  // Initialize SpeechRecognition once on mount
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        recognizerRef.current = new SpeechRecognition();
        recognizerRef.current.continuous = false;
        recognizerRef.current.interimResults = false;
        
        recognizerRef.current.onresult = (event) => {
          try {
            const transcript = event.results[0][0].transcript;
            setText((prev) => `${prev} ${transcript}`);
            setListening(false);
          } catch (e) {
            console.error('Speech recognition error:', e);
            setListening(false);
          }
        };
        
        recognizerRef.current.onerror = (e) => {
          console.error('Speech recognition error:', e);
          setListening(false);
        };
        
        recognizerRef.current.onend = () => {
          setListening(false);
        };
      } catch (e) {
        console.warn('SpeechRecognition not available:', e);
        recognizerRef.current = null;
      }
    } else {
      recognizerRef.current = null;
    }
    
    return () => {
      if (recognizerRef.current) {
        try {
          recognizerRef.current.stop();
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    };
  }, []); // Empty deps - only run on mount

  const startListening = () => {
    if (!recognizerRef.current) return;
    try {
      setListening(true);
      recognizerRef.current.start();
    } catch (e) {
      console.error('Failed to start listening:', e);
      setListening(false);
    }
  };

  const stopListening = () => {
    if (!recognizerRef.current) return;
    try {
      recognizerRef.current.stop();
      setListening(false);
    } catch (e) {
      console.error('Failed to stop listening:', e);
      setListening(false);
    }
  };

  const handleMouseDown = (e) => {
    const startX = e.clientX - pos.x;
    const startY = e.clientY - pos.y;
    const onMouseMove = (ev) => {
      setPos({ x: ev.clientX - startX, y: ev.clientY - startY });
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', () => {
      window.removeEventListener('mousemove', onMouseMove);
    }, { once: true });
  };

  const handleSave = () => {
    onSave({ id, text, x: pos.x, y: pos.y, targetFile });
  };

  return (
    <div
      ref={stickyRef}
      onMouseDown={handleMouseDown}
      style={{ position: 'fixed', top: pos.y, left: pos.x, width: '240px', zIndex: 999 }}
      className="bg-yellow-100 border border-yellow-400 rounded-lg shadow-lg p-3 cursor-move"
    >
      <p className="text-xs text-gray-600 font-bold">🗒️ {targetFile || 'Note'}</p>
      <textarea
        className="w-full h-20 p-1 text-sm font-mono bg-yellow-50 border border-yellow-300 rounded"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type or speak..."
      />
      <div className="flex justify-between items-center mt-1 text-xs">
        <button
          onClick={() => (listening ? stopListening() : startListening())}
          className={`px-2 py-1 rounded ${
            listening ? 'bg-red-400 text-white' : 'bg-green-500 text-black'
          }`}
        >
          {listening ? '🛑 Stop' : '🎤 Speak'}
        </button>
        <div className="flex gap-1">
          <button onClick={handleSave} className="text-blue-700 font-bold">💾</button>
          <button onClick={() => onClose(id)} className="text-gray-700">✖️</button>
        </div>
      </div>
    </div>
  );
};

export default SmartSticky;

