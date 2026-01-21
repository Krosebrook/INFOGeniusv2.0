/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { X, Cpu, Globe, Zap, Shield, Code, Atom } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="p-6 md:p-8 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-600 rounded-xl shadow-lg shadow-cyan-600/20">
              <Atom className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold font-display text-slate-900 dark:text-white">About InfoGenius</h2>
              <p className="text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-widest mt-0.5">Knowledge Visualized</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 md:p-8 overflow-y-auto max-h-[70vh] space-y-8">
          
          <section>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4" /> Purpose
            </h3>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              InfoGenius Vision is a visual knowledge engine designed to bridge the gap between complex information and clear understanding. By leveraging state-of-the-art AI and real-time Google search grounding, it creates verified diagrams, infographics, and conceptual art tailored to any audience complexity level.
            </p>
          </section>

          <section>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Cpu className="w-4 h-4" /> Neural Architecture
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">Gemini 3 Pro</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Powering core research, data extraction, and search grounding logic.</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">Gemini 3 Pro Image</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Advanced visual synthesis for high-fidelity technical diagrams and infographics.</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">Gemini 2.5 Flash TTS</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">High-fidelity text-to-speech engine for audio knowledge summaries.</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">Google Search Tool</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Real-time web grounding to ensure factual accuracy in all generated content.</p>
              </div>
            </div>
          </section>

          <section className="pt-4 border-t border-slate-100 dark:border-white/5">
             <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-slate-400">
                    <Code className="w-4 h-4" />
                    <span className="text-xs font-mono">v2.1.0 "Lumina"</span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full text-[10px] font-bold border border-green-200 dark:border-green-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                        SYSTEM ACTIVE
                    </div>
                </div>
             </div>
          </section>

        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-white/5 flex flex-col md:flex-row gap-4 items-center justify-between text-center md:text-left">
           <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 italic">"Visualizing the unknown, verifying the known."</p>
           </div>
           <button 
             onClick={onClose}
             className="px-6 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full font-bold text-sm shadow-xl hover:scale-105 active:scale-95 transition-all"
           >
             Close Modal
           </button>
        </div>

      </div>
    </div>
  );
};

export default AboutModal;