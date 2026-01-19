/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useEffect, useState } from 'react';
import { Loader2, BrainCircuit, BookOpen, Atom, Lightbulb, ScrollText, Database, Dna, Microscope, Globe, Compass } from 'lucide-react';

interface LoadingProps {
  status: string;
  step: number;
  facts?: string[];
}

interface FlyingItemProps {
  delay: number;
  type: 'icon' | 'text';
  content: any;
  index: number;
  total: number;
}

const FlyingItem: React.FC<FlyingItemProps> = ({ delay, type, content, index, total }) => {
  // Enhanced "Implode" Animation Math
  
  // 1. Distribution: Use Golden Angle (137.5 deg) for organic non-overlapping placement
  const angle = index * 137.5; 
  
  // 2. Distance: Vary distance pseudo-randomly so they don't form a perfect circle ring
  // Range: 55vw to 95vw from center
  const distance = 55 + (index * 7 % 40); 
  
  // 3. Scale: Mix of small particles and larger chunks
  const startScale = 0.4 + (index % 4) * 0.25; // 0.4 to 1.15
  
  // Convert polar to cartesian for the starting position
  const angleRad = angle * (Math.PI / 180);
  const startX = Math.cos(angleRad) * distance;
  const startY = Math.sin(angleRad) * distance;

  // 4. Physics: Randomize rotation direction and speed
  const spinDirection = index % 2 === 0 ? 1 : -1;
  const rotationSpeed = 1 + (index % 3) * 0.5;

  // 5. Timing: Vary duration slightly so they don't loop in perfect sync
  const duration = 4 + (index % 3) * 0.5; // 4s to 5s

  return (
    <div 
      className={`absolute flex items-center justify-center font-bold opacity-0 select-none ${type === 'text' ? 'text-cyan-600 dark:text-cyan-400 text-[10px] md:text-xs tracking-[0.2em] bg-white/80 dark:bg-slate-900/80 border border-cyan-500/30 px-2 py-0.5 md:px-3 md:py-1 rounded shadow-[0_0_10px_rgba(6,182,212,0.3)] backdrop-blur-sm' : 'text-amber-500 dark:text-amber-400'}`}
      style={{
        // Use a custom bezier to emphasize the "Suck" effect at the end
        animation: `implode-${index} ${duration}s cubic-bezier(0.4, 0, 0.2, 1) infinite ${delay}s`,
        zIndex: 10,
      }}
    >
      <style>{`
        @keyframes implode-${index} {
          0% { 
            /* Start: Far out, invisible */
            transform: translate(${startX}vw, ${startY}vh) scale(${startScale}) rotate(${angle}deg); 
            opacity: 0; 
          }
          10% { 
            /* Entry: Fade in quickly, still far out */
            opacity: 1; 
            transform: translate(${startX * 0.95}vw, ${startY * 0.95}vh) scale(${startScale}) rotate(${angle + 10}deg);
          }
          55% {
            /* HANG TIME: The "Suspension" Phase. 
               Element drifts very slowly inward, creating tension. */
            opacity: 1;
            transform: translate(${startX * 0.75}vw, ${startY * 0.75}vh) scale(${startScale * 0.9}) rotate(${angle + (45 * spinDirection)}deg);
          }
          100% { 
            /* IMPLOSION: Rapid suction to the center (0,0) */
            transform: translate(0, 0) scale(0) rotate(${angle + (720 * spinDirection * rotationSpeed)}deg); 
            opacity: 0; 
          }
        }
      `}</style>
      {type === 'icon' ? React.createElement(content, { className: "w-5 h-5 md:w-6 md:h-6 filter drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" }) : content}
    </div>
  );
};

const Loading: React.FC<LoadingProps> = ({ status, step, facts = [] }) => {
  const [currentFactIndex, setCurrentFactIndex] = useState(0);
  
  useEffect(() => {
    if (facts.length > 0) {
      const interval = setInterval(() => {
        setCurrentFactIndex((prev) => (prev + 1) % facts.length);
      }, 3500);
      return () => clearInterval(interval);
    }
  }, [facts]);

  const items: { content: any, type: 'icon' | 'text' }[] = [
      { content: BookOpen, type: 'icon' },
      { content: "HISTORY", type: 'text' },
      { content: Microscope, type: 'icon' },
      { content: "SCIENCE", type: 'text' },
      { content: Dna, type: 'icon' },
      { content: "FACTS", type: 'text' },
      { content: Globe, type: 'icon' },
      { content: "DATA", type: 'text' },
      { content: Compass, type: 'icon' },
      { content: ScrollText, type: 'icon' },
      { content: "ANALYSIS", type: 'text' },
      { content: Database, type: 'icon' }
  ];

  return (
    <div className="relative flex flex-col items-center justify-center w-full max-w-4xl mx-auto mt-8 min-h-[350px] md:min-h-[500px] overflow-hidden rounded-3xl bg-white/40 dark:bg-slate-900/40 border border-slate-200 dark:border-white/10 shadow-2xl backdrop-blur-md transition-colors">
      
      <style>{`
        @keyframes spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes spin-reverse {
          0% { transform: rotate(360deg); }
          100% { transform: rotate(0deg); }
        }
        @keyframes pulse-core {
          0% { box-shadow: 0 0 0 0 rgba(6, 182, 212, 0.7); transform: scale(1); }
          70% { box-shadow: 0 0 0 30px rgba(6, 182, 212, 0); transform: scale(1.05); }
          100% { box-shadow: 0 0 0 0 rgba(6, 182, 212, 0); transform: scale(1); }
        }
      `}</style>

      {/* THE REACTOR CORE */}
      <div className="relative z-20 mb-10 md:mb-16 scale-[0.65] md:scale-125 mt-4 md:mt-10">
        {/* Outer Rings */}
        <div className="absolute inset-0 w-64 h-64 -translate-x-[4.5rem] -translate-y-[4.5rem] border border-dashed border-cyan-700/30 dark:border-cyan-900/50 rounded-full animate-[spin-slow_20s_linear_infinite]"></div>
        <div className="absolute inset-0 w-48 h-48 -translate-x-12 -translate-y-12 border-2 border-dashed border-cyan-500/20 rounded-full animate-[spin-slow_10s_linear_infinite]"></div>
        <div className="absolute inset-0 w-40 h-40 -translate-x-8 -translate-y-8 border border-indigo-500/30 rounded-full animate-[spin-reverse_8s_linear_infinite]"></div>
        
        {/* Glowing Center */}
        <div className="relative bg-white/50 dark:bg-white/10 p-1 rounded-full shadow-[0_0_60px_rgba(6,182,212,0.4)] animate-[pulse-core_2s_infinite]">
           <div className="bg-white dark:bg-slate-950 p-4 rounded-full flex items-center justify-center w-24 h-24 relative overflow-hidden border border-cyan-500/50">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-blue-600 opacity-10 dark:opacity-30"></div>
              <BrainCircuit className="w-12 h-12 text-cyan-600 dark:text-cyan-300 animate-pulse relative z-10" />
              {/* Inner beams */}
              <div className="absolute top-0 left-1/2 w-[1px] h-full bg-cyan-400/50 animate-[spin-slow_2s_linear_infinite]"></div>
              <div className="absolute top-1/2 left-0 h-[1px] w-full bg-cyan-400/50 animate-[spin-slow_2s_linear_infinite]"></div>
           </div>
        </div>

        {/* Flying Particles IN to the core */}
        <div className="absolute top-1/2 left-1/2 pointer-events-none">
           {items.map((item, idx) => (
             <FlyingItem 
                key={idx}
                content={item.content} 
                type={item.type} 
                delay={idx * 0.25} 
                index={idx}
                total={items.length}
             />
           ))}
        </div>
      </div>

      {/* Fact Display */}
      <div className="relative z-30 w-full max-w-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 md:p-8 shadow-2xl border border-slate-200 dark:border-white/10 text-center flex flex-col items-center transition-all duration-500 min-h-[140px] md:min-h-[160px]">
        
        <div className="flex items-center gap-3 mb-4">
            {step === 1 && <Globe className="w-4 h-4 text-amber-500 dark:text-amber-400 animate-spin" />}
            {step === 2 && <Atom className="w-4 h-4 text-cyan-600 dark:text-cyan-400 animate-spin" />}
            {step >= 3 && <Microscope className="w-4 h-4 text-emerald-500 dark:text-emerald-400 animate-bounce" />}
            <h3 className="text-cyan-700 dark:text-cyan-400 font-bold text-[10px] md:text-xs tracking-[0.2em] uppercase font-display">
            {status}
            </h3>
        </div>

        <div className="flex-1 flex items-center justify-center px-4">
            {facts.length > 0 ? (
            <div key={currentFactIndex} className="animate-in slide-in-from-bottom-2 fade-in duration-500">
                <p className="text-base md:text-xl text-slate-800 dark:text-slate-200 font-serif-display leading-relaxed italic">
                "{facts[currentFactIndex]}"
                </p>
            </div>
            ) : (
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-500 italic font-light text-sm md:text-base">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Establishing connection...</span>
            </div>
            )}
        </div>
        
        {/* Progress Bar */}
        <div className="w-full h-1 bg-slate-200 dark:bg-slate-800 mt-6 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-amber-400 via-cyan-500 to-emerald-500 transition-all duration-1000 ease-out relative overflow-hidden shadow-[0_0_10px_rgba(6,182,212,0.8)]"
              style={{ width: `${step * 20 + 10}%` }}
            >
                <div className="absolute inset-0 bg-white/50 animate-[shimmer_1s_infinite]"></div>
            </div>
        </div>
      </div>

      <style>{`
          @keyframes shimmer {
              0% { transform: translateX(-100%); }
              100% { transform: translateX(100%); }
          }
      `}</style>

    </div>
  );
};

export default Loading;