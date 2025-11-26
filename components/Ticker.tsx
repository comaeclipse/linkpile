import React, { useEffect, useState } from 'react';
import { generateTickerHeadlines } from '../services/geminiService';

export const Ticker: React.FC = () => {
  const [headlines, setHeadlines] = useState<string[]>([
    "Loading local forecast...", 
    "Checking hay markets...", 
    "Syncing satellites..."
  ]);

  useEffect(() => {
    const fetchHeadlines = async () => {
      try {
        const data = await generateTickerHeadlines();
        setHeadlines(data);
      } catch (e) {
        console.error("Failed to load ticker", e);
      }
    };
    fetchHeadlines();
  }, []);

  return (
    <div className="w-full bg-blue-900 text-white text-xs overflow-hidden py-1 border-b border-blue-800">
      <div className="whitespace-nowrap animate-ticker inline-block">
        {headlines.map((item, i) => (
          <span key={i} className="mx-8">
            <span className="text-blue-300 mr-2">::</span>
            {item}
          </span>
        ))}
        {/* Duplicate for smooth loop */}
        {headlines.map((item, i) => (
          <span key={`dup-${i}`} className="mx-8">
            <span className="text-blue-300 mr-2">::</span>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
};