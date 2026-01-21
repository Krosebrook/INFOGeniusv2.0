/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import { X, ChevronRight, ChevronLeft, Search, Layers, Sparkles, Volume2, Maximize, MousePointer2, Keyboard, Zap, Info } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const steps = [
  {
    title: "Discover & Research",
    icon: Search,
    color: "text-cyan-600 bg-cyan-50 dark:text-cyan-400 dark:bg-cyan-900/30",
    content: "Type any topic into the search bar. InfoGenius uses Google Search grounding to verify facts before generating your visual. It's not just an image; it's researched knowledge.",
    image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&q=80&w=400&h=250"
  },
  {
    title: "Tailor Your Output",
    icon: Layers,
    color: "text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-900/30",
    content: "Customize the Audience (from Elementary to Expert), Visual Style (over 20 options), and Dimensions. Use the Batch selector to generate up to 4 variations at once.",
    image: "https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&q=80&w=400&h=250"
  },
  {
    title: "Enhance & Compare",
    icon: Sparkles,
    color: "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/30",
    content: "Refine your visuals using the Enhance bar. If you've made an edit, hold the 'Compare' button to see the original. Use Director Mode in Settings to review AI prompts before generation.",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=400&h=250"
  },
  {
    title: "Pro Tools & Shortcuts",
    icon: Zap,
    color: "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/30",
    content: "Listen to AI narrations of key insights. Download individual PNGs or batch variation ZIPs. Pro Tip: Press 'D' to toggle Dark Mode, and use Arrow keys to navigate your history.",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=400&h=250"
  }
];

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const activeStep = steps[currentStep];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 duration-300">
        
        {/* Left Side: Image/Illustration (Hidden on Mobile) */}
        <div className="hidden md:block w-5/12 relative">
            <img 
                src={activeStep.image} 
                alt={activeStep.title} 
                className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
            <div className="absolute bottom-6 left-6 right-6">
                <div className={`inline-flex p-3 rounded-2xl mb-4 ${activeStep.color}`}>
                    {React.createElement(activeStep.icon, { className: "w-6 h-6" })}
                </div>
                <h4 className="text-white font-bold font-display text-xl leading-tight">
                    {activeStep.title}
                </h4>
            </div>
        </div>

        {/* Right Side: Content */}
        <div className="flex-1 p-8 flex flex-col min-h-[400px]">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                    <span>Tutorial</span>
                    <span className="w-1 h-1 rounded-full bg-slate-400"></span>
                    <span>Step {currentStep + 1} of {steps.length}</span>
                </div>
                <button 
                    onClick={onClose}
                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            <div className="md:hidden mb-6">
                <div className={`inline-flex p-2.5 rounded-xl mb-4 ${activeStep.color}`}>
                    {React.createElement(activeStep.icon, { className: "w-5 h-5" })}
                </div>
                <h4 className="text-slate-900 dark:text-white font-bold font-display text-xl">
                    {activeStep.title}
                </h4>
            </div>

            <div className="flex-1">
                <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed mb-8">
                    {activeStep.content}
                </p>

                {/* Quick Shortcuts List for the last step */}
                {currentStep === steps.length - 1 && (
                    <div className="grid grid-cols-2 gap-3 mb-8">
                        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-white/5 p-2.5 rounded-xl border border-slate-100 dark:border-white/5">
                            <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white">D</kbd>
                            <span>Dark Mode</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-white/5 p-2.5 rounded-xl border border-slate-100 dark:border-white/5">
                            <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white">←/→</kbd>
                            <span>Navigate</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex items-center justify-between mt-auto pt-6 border-t border-slate-100 dark:border-white/5">
                <div className="flex gap-1.5">
                    {steps.map((_, i) => (
                        <div 
                            key={i} 
                            className={`h-1.5 rounded-full transition-all duration-300 ${currentStep === i ? 'w-6 bg-cyan-500' : 'w-1.5 bg-slate-200 dark:bg-slate-700'}`}
                        />
                    ))}
                </div>

                <div className="flex gap-2">
                    {currentStep > 0 && (
                        <button 
                            onClick={handlePrev}
                            className="p-3 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                    )}
                    <button 
                        onClick={handleNext}
                        className="bg-slate-900 dark:bg-white text-white dark:text-slate-950 px-6 py-2.5 rounded-full font-bold shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                    >
                        <span>{currentStep === steps.length - 1 ? 'Get Started' : 'Next'}</span>
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;