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
  // Use Golden Angle (approx 137.5 degrees) for beautiful organic distribution
  const goldenAngle = 137.508;
  const angle = index * goldenAngle;
  
  // Vary radius to create a cloud effect
  const radius = 65 + (index * 17) % 40; // Variation in distance
  
  // Convert polar to cartesian
  const angleRad = (angle * Math.PI) / 180;
  const startX = Math.cos(angleRad) * radius;
  const startY = Math.sin(angleRad) * radius;

  // Varied sizes and speeds
  const startScale = 0.4 + (index % 5) * 0.15;
  const duration = 4.5 + (index % 4) * 0.5;
  const rotationDir = index % 2 === 0 ? 1 : -1;
  const finalRotation = 720 * rotationDir;

  return (
    <div 
      className={`absolute flex items-center justify-center font-bold opacity-0 select-none ${
        type === 'text' 
          ? 'text-cyan-600 dark:text-cyan-400 text-[9px] md:text-xs tracking-[0.2em] bg-white/60 dark:bg-slate-900/60 border border-cyan-500/20 px-2 py-0.5 md:px-3 md:py-1 rounded shadow-xl backdrop-blur-[2px]' 
          : 'text-amber-500 dark:text-amber-400'
      }`}
      style={{
        // Custom keyframe name per index to allow varied angles
        animation: `implode-${index} ${duration}s cubic-bezier(0.7, 0, 0.2, 1) infinite ${delay}s`,
        zIndex: 10,
        pointerEvents: 'none'
      }}
    >
      <style>{`
        @keyframes implode-${index} {
          0% { 
            transform: translate(${startX}vw, ${startY}vh) scale(${startScale}) rotate(${angle}deg); 
            opacity: 0; 
          }
          10% { 
            opacity: 1; 
            transform: translate(${startX * 0.85}vw, ${startY * 0.85}vh) scale(${startScale}) rotate(${angle + 10}deg);
          }
          /* HANG TIME - Elements drift slowly while slowly rotating */
          65% {
            opacity: 1;
            transform: translate(${startX * 0.75}vw, ${startY * 0.75}vh) scale(${startScale * 1.1}) rotate(${angle + 45 * rotationDir}deg);
          }
          /* RAPID SUCTION START */
          88% {
            opacity: 1;
            transform: translate(${startX * 0.1}vw, ${startY * 0.1}vh) scale(${startScale * 0.2}) rotate(${angle + 360 * rotationDir}deg);
          }
          /* FULL ABSORPTION */
          100% { 
            transform: translate(0, 0) scale(0) rotate(${angle + finalRotation}deg); 
            opacity: 0; 
          }
        }
      `}</style>
      {type === 'icon' ? React.createElement(content, { className: "w-5 h-5 md:w-7 md:h-7 filter drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]" }) : content}
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

  // Expanded set of items for a more dense implode cloud
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
      { content: Database, type: 'icon' },
      { content: "INSIGHT", type: 'text' },
      { content: Atom, type: 'icon' },
      { content: Lightbulb, type: 'icon' },
      { content: "RESEARCH", type: 'text' }
  ];

  return (
    <div className="relative flex flex-col items-center justify-center w-full max-w-4xl mx-auto mt-8 min-h-[350px] md:min-h-[500px] overflow-hidden rounded-3xl bg-white/40 dark:bg-slate-900/40 border border-slate-200 dark:border-white/10 shadow-2xl backdrop-blur-md transition-colors">
      <style>{`
        @keyframes pulse-core {
          0% { box-shadow: 0 0 0 0 rgba(6, 182, 212, 0.6); transform: scale(1); }
          70% { box-shadow: 0 0 0 35px rgba(6, 182, 212, 0); transform: scale(1.04); }
          100% { box-shadow: 0 0 0 0 rgba(6, 182, 212, 0); transform: scale(1); }
        }
        @keyframes orbit-outer {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
      `}</style>

      {/* Animation Core Container */}
      <div className="relative z-20 mb-10 md:mb-16 scale-[0.7] md:scale-125 mt-4 md:mt-10">
        <div className="absolute top-1/2 left-1/2 w-64 h-64 border border-dashed border-cyan-700/20 dark:border-cyan-500/20 rounded-full animate-[orbit-outer_25s_linear_infinite]"></div>
        <div className="absolute top-1/2 left-1/2 w-48 h-48 border-2 border-dotted border-cyan-500/10 rounded-full animate-[orbit-outer_15s_linear_infinite_reverse]"></div>
        
        <div className="relative bg-white/40 dark:bg-white/5 p-1.5 rounded-full shadow-[0_0_50px_rgba(6,182,212,0.3)] animate-[pulse-core_2s_ease-in-out_infinite]">
           <div className="bg-white dark:bg-slate-950 p-5 rounded-full flex items-center justify-center w-24 h-24 relative overflow-hidden border border-cyan-500/40">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-indigo-600 opacity-20"></div>
              <BrainCircuit className="w-12 h-12 text-cyan-600 dark:text-cyan-400 animate-pulse relative z-10" />
           </div>
        </div>

        {/* Flying Items distributed around the center */}
        <div className="absolute top-1/2 left-1/2 pointer-events-none">
           {items.map((item, idx) => (
             <FlyingItem 
                key={idx}
                content={item.content} 
                type={item.type} 
                delay={idx * 0.18} 
                index={idx}
                total={items.length}
             />
           ))}
        </div>
      </div>

      {/* Status Card */}
      <div className="relative z-30 w-full max-w-lg bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl rounded-2xl p-6 md:p-8 shadow-2xl border border-slate-200 dark:border-white/10 text-center flex flex-col items-center transition-all duration-500 min-h-[140px] md:min-h-[160px]">
        <div className="flex items-center gap-3 mb-4">
            {step === 1 ? <Globe className="w-4 h-4 text-amber-500 animate-spin" /> : <Atom className="w-4 h-4 text-cyan-500 animate-spin" />}
            <h3 className="text-cyan-700 dark:text-cyan-400 font-bold text-[10px] md:text-xs tracking-[0.25em] uppercase font-display">{status}</h3>
        </div>
        <div className="flex-1 flex items-center justify-center px-4">
            {facts.length > 0 ? (
            <div key={currentFactIndex} className="animate-in slide-in-from-bottom-3 fade-in duration-700">
                <p className="text-base md:text-xl text-slate-800 dark:text-slate-200 font-serif-display leading-relaxed italic drop-shadow-sm">"{facts[currentFactIndex]}"</p>
            </div>
            ) : (
            <div className="flex items-center gap-2 text-slate-500 italic font-light text-sm md:text-base">
                <Loader2 className="w-4 h-4 animate-spin text-cyan-500" />
                <span>Harvesting relevant data points...</span>
            </div>
            )}
        </div>
        
        {/* Animated Progress Bar */}
        <div className="w-full h-1 bg-slate-200 dark:bg-slate-800 mt-6 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-amber-400 via-cyan-500 to-indigo-500 transition-all duration-1000 ease-out relative" 
              style={{ width: `${step * 33 + 10}%` }}
            >
                <div className="absolute inset-0 bg-white/40 animate-[shimmer_1.5s_infinite]"></div>
            </div>
        </div>
      </div>

      <style>{`
          @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
      `}</style>
    </div>
  );
};

export default Loading;