/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useRef } from 'react';
import { GeneratedImage, ComplexityLevel, VisualStyle, Language, SearchResultItem, ImageQuality, AspectRatio } from './types';
import { 
  researchTopicForPrompt, 
  generateInfographicImage, 
  editInfographicImage,
  generateNarration
} from './services/geminiService';
import { AppError, interpretError, logError } from './services/errorService';
import Infographic from './components/Infographic';
import Loading from './components/Loading';
import IntroScreen from './components/IntroScreen';
import SearchResults from './components/SearchResults';
import { Search, AlertTriangle, History, GraduationCap, Palette, Microscope, Atom, Compass, Globe, Sun, Moon, Settings, Volume2, PlayCircle, PauseCircle, Lightbulb, Trash2, BookOpen, Maximize, RefreshCcw, Camera, Smile, Feather, Zap, Box, PenTool, Grid, File, Droplet, Monitor, Square, Clock, RotateCcw, RectangleHorizontal, Info, Save, Edit3, Layers, Ghost, Hexagon, Cog, Mountain, MoonStar, Aperture, Paintbrush, Copy, LayoutGrid } from 'lucide-react';

// Style Options Definition with Colors
const STYLE_OPTIONS: { value: VisualStyle, icon: any, label: string, color: string }[] = [
  { value: 'Default', icon: Square, label: 'Standard', color: 'text-slate-600 bg-slate-100' },
  { value: 'Minimalist', icon: Compass, label: 'Minimalist', color: 'text-slate-500 bg-slate-50' },
  { value: 'Realistic', icon: Camera, label: 'Realistic', color: 'text-blue-600 bg-blue-50' },
  { value: '3D Render', icon: Box, label: '3D Render', color: 'text-indigo-600 bg-indigo-50' },
  { value: 'Isometric', icon: Layers, label: 'Isometric', color: 'text-sky-600 bg-sky-50' },
  { value: 'Claymation', icon: Ghost, label: 'Claymation', color: 'text-orange-500 bg-orange-50' },
  { value: 'Low Poly', icon: Hexagon, label: 'Low Poly', color: 'text-emerald-500 bg-emerald-50' },
  { value: 'Pixel Art', icon: Grid, label: 'Pixel Art', color: 'text-purple-500 bg-purple-50' },
  { value: 'Cartoon', icon: Smile, label: 'Cartoon', color: 'text-yellow-600 bg-yellow-50' },
  { value: 'Pop Art', icon: Zap, label: 'Pop Art', color: 'text-pink-500 bg-pink-50' },
  { value: 'Graffiti', icon: Paintbrush, label: 'Graffiti', color: 'text-fuchsia-600 bg-fuchsia-50' },
  { value: 'Neon', icon: Lightbulb, label: 'Neon', color: 'text-cyan-500 bg-slate-900' },
  { value: 'Steampunk', icon: Cog, label: 'Steampunk', color: 'text-amber-700 bg-amber-100' },
  { value: 'Vintage', icon: Feather, label: 'Vintage', color: 'text-amber-800 bg-orange-100' },
  { value: 'Ukiyo-e', icon: Mountain, label: 'Ukiyo-e', color: 'text-teal-700 bg-teal-50' },
  { value: 'Watercolor', icon: Droplet, label: 'Watercolor', color: 'text-indigo-400 bg-indigo-50' },
  { value: 'Origami', icon: File, label: 'Origami', color: 'text-rose-500 bg-rose-50' },
  { value: 'Stained Glass', icon: Aperture, label: 'Stained Glass', color: 'text-red-600 bg-yellow-50' },
  { value: 'Noir', icon: MoonStar, label: 'Film Noir', color: 'text-slate-800 bg-slate-200' },
  { value: 'Sketch', icon: PenTool, label: 'Blueprint', color: 'text-blue-800 bg-blue-100' },
  { value: 'Flat Art', icon: Monitor, label: 'Flat Design', color: 'text-green-600 bg-green-50' },
  { value: 'Futuristic', icon: Atom, label: 'Cyberpunk', color: 'text-violet-500 bg-slate-900' },
];

const App: React.FC = () => {
  const [showIntro, setShowIntro] = useState(true);
  const [topic, setTopic] = useState('');
  const [complexityLevel, setComplexityLevel] = useState<ComplexityLevel>('High School');
  const [visualStyle, setVisualStyle] = useState<VisualStyle>('Default');
  const [language, setLanguage] = useState<Language>('English');
  const [imageQuality, setImageQuality] = useState<ImageQuality>('1K');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [variationCount, setVariationCount] = useState<number>(1); // New: Number of images to generate
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);
  const [isStyleMenuOpen, setIsStyleMenuOpen] = useState(false);
  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false);
  
  // Generation State
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [loadingStep, setLoadingStep] = useState<number>(0);
  const [loadingFacts, setLoadingFacts] = useState<string[]>([]);
  
  // Error State
  const [error, setError] = useState<AppError | null>(null);
  const [retryAction, setRetryAction] = useState<(() => void) | null>(null);
  
  // Data State
  const [imageHistory, setImageHistory] = useState<GeneratedImage[]>([]);
  const [currentSearchResults, setCurrentSearchResults] = useState<SearchResultItem[]>([]);
  const [currentSuggestions, setCurrentSuggestions] = useState<string[]>([]);
  const [pendingPrompt, setPendingPrompt] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Audio State
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const styleMenuRef = useRef<HTMLDivElement>(null);
  const settingsMenuRef = useRef<HTMLDivElement>(null);

  // Toast State
  const [toast, setToast] = useState<{show: boolean, message: string}>({show: false, message: ''});

  // --- Effects ---

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        const target = e.target as HTMLElement;
        const isInput = ['INPUT', 'TEXTAREA'].includes(target.tagName);

        // Global Shortcut: Ctrl+Enter or Cmd+Enter to Generate
        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
            e.preventDefault(); // Prevent default if inside a text area
            if (!isLoading && topic.trim()) {
                initiateGeneration(topic);
            }
            return;
        }

        // The following shortcuts are disabled when typing in an input
        if (isInput) return;

        // Toggle Dark Mode
        if (e.key.toLowerCase() === 'd') {
            setIsDarkMode(prev => !prev);
        }
        
        // History Navigation Shortcuts
        if (imageHistory.length > 1 && !isLoading) {
            if (e.key === 'ArrowRight') {
               // Move older item (index 1) to top
               restoreImage(imageHistory[1]);
            } else if (e.key === 'ArrowLeft') {
               // Move oldest item (last) to top, allowing cyclic navigation
               restoreImage(imageHistory[imageHistory.length - 1]);
            }
        }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDarkMode, imageHistory, isLoading, topic]); // Added topic to dependencies

  // Click Outside to close Menus
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (styleMenuRef.current && !styleMenuRef.current.contains(event.target as Node)) {
        setIsStyleMenuOpen(false);
      }
      if (settingsMenuRef.current && !settingsMenuRef.current.contains(event.target as Node)) {
        setIsSettingsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Dark Mode Application
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Load from Local Storage (History, Advanced Mode, and User Settings)
  useEffect(() => {
    // Load History
    const savedHistory = localStorage.getItem('infoGeniusHistory');
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        setImageHistory(parsed);
      } catch (e) {
        logError(e, 'LocalStorageLoadHistory');
      }
    }

    // Load Advanced Mode
    const savedMode = localStorage.getItem('infoGeniusAdvanced');
    if (savedMode) setIsAdvancedMode(savedMode === 'true');

    // Load User Preferences/Settings
    const savedSettings = localStorage.getItem('infoGeniusSettings');
    if (savedSettings) {
        try {
            const parsed = JSON.parse(savedSettings);
            if (parsed.complexityLevel) setComplexityLevel(parsed.complexityLevel);
            if (parsed.visualStyle) setVisualStyle(parsed.visualStyle);
            if (parsed.language) setLanguage(parsed.language);
            if (parsed.imageQuality) setImageQuality(parsed.imageQuality);
            if (parsed.aspectRatio) setAspectRatio(parsed.aspectRatio);
            if (parsed.isDarkMode !== undefined) setIsDarkMode(parsed.isDarkMode);
            if (parsed.variationCount) setVariationCount(parsed.variationCount);
        } catch (e) {
            logError(e, 'LocalStorageLoadSettings');
        }
    }
  }, []);

  // Save Settings to Local Storage whenever they change
  useEffect(() => {
    const settings = {
        complexityLevel,
        visualStyle,
        language,
        imageQuality,
        aspectRatio,
        isDarkMode,
        variationCount
    };
    try {
        localStorage.setItem('infoGeniusSettings', JSON.stringify(settings));
    } catch (e) {
        console.warn("Failed to save settings to localStorage");
    }
  }, [complexityLevel, visualStyle, language, imageQuality, aspectRatio, isDarkMode, variationCount]);

  // Save to Local Storage with Quota Handling
  useEffect(() => {
    const saveToStorage = (items: GeneratedImage[]) => {
      try {
        localStorage.setItem('infoGeniusHistory', JSON.stringify(items));
      } catch (e) {
        logError(e, 'LocalStorageSave');
        console.warn("LocalStorage quota exceeded. Attempting to save fewer items.");
        if (items.length > 1) {
          saveToStorage(items.slice(0, Math.ceil(items.length / 2)));
        } else {
          console.error("Cannot save even a single item to LocalStorage.");
        }
      }
    };

    // Limit to 10 initially to accommodate larger thumbnails history
    const limitedHistory = imageHistory.slice(0, 10);
    saveToStorage(limitedHistory);
  }, [imageHistory]);

  useEffect(() => {
    localStorage.setItem('infoGeniusAdvanced', String(isAdvancedMode));
  }, [isAdvancedMode]);

  // --- Handlers ---

  const showToast = (message: string) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: '' }), 3000);
  };

  const handleSaveSettings = () => {
    // Trigger manual save confirmation (data is already synced by useEffect)
    const settings = {
        complexityLevel,
        visualStyle,
        language,
        imageQuality,
        aspectRatio,
        isDarkMode,
        variationCount
    };
    localStorage.setItem('infoGeniusSettings', JSON.stringify(settings));
    showToast("Preferences saved as default.");
    setIsSettingsMenuOpen(false);
  };

  const handleLoadDefaults = () => {
    if (window.confirm("Reset all generation options to default?")) {
        setComplexityLevel('High School');
        setVisualStyle('Default');
        setLanguage('English');
        setImageQuality('1K');
        setAspectRatio('1:1');
        setVariationCount(1);
        showToast("Default settings loaded.");
    }
    setIsSettingsMenuOpen(false);
  };

  const handleGenerateClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    if (!topic.trim()) {
      showToast("Please enter a topic to visualize.");
      return;
    }
    initiateGeneration(topic);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setTopic(suggestion);
    initiateGeneration(suggestion);
  }

  const handleOperationError = (err: any, context: string, retry?: () => void) => {
    logError(err, context);
    const interpreted = interpretError(err);
    setError(interpreted);
    setRetryAction(() => retry || null);
    setIsLoading(false);
  };

  const initiateGeneration = async (searchTopic: string) => {
    setIsLoading(true);
    setError(null);
    setRetryAction(null);
    setLoadingStep(1);
    setLoadingFacts([]);
    setCurrentSearchResults([]);
    setCurrentSuggestions([]);
    setPendingPrompt(null);
    setAudioBase64(null);
    stopAudio();
    setLoadingMessage(`Researching "${searchTopic}"...`);

    try {
      // Step 1: Research
      const researchResult = await researchTopicForPrompt(searchTopic, complexityLevel, visualStyle, language);
      
      setLoadingFacts(researchResult.facts);
      setCurrentSearchResults(researchResult.searchResults);
      setCurrentSuggestions(researchResult.suggestions);

      // Generate Audio in background if facts exist
      if (researchResult.facts.length > 0) {
        generateNarration(researchResult.facts.join(". "), language)
          .then(audio => setAudioBase64(audio))
          .catch(e => logError(e, 'AudioBackgroundGeneration'));
      }

      if (isAdvancedMode) {
        // Stop here and let user edit prompt
        setPendingPrompt(researchResult.imagePrompt);
        setLoadingMessage("Waiting for user approval...");
        setIsLoading(false); // Temporarily stop loading state
      } else {
        // Continue directly
        await executeImageGeneration(researchResult.imagePrompt, searchTopic, researchResult.suggestions, researchResult.facts);
      }
    } catch (err: any) {
      handleOperationError(err, 'ResearchPhase', () => initiateGeneration(searchTopic));
    }
  };

  const executeImageGeneration = async (finalPrompt: string, originalTopic: string, suggestions: string[] = [], facts: string[] = []) => {
    setIsLoading(true);
    setError(null);
    setLoadingStep(2);
    setLoadingMessage(variationCount > 1 ? `Designing ${variationCount} Variations...` : `Designing Infographic...`);
    setPendingPrompt(null);

    const batchId = Date.now().toString();

    try {
      // Generate multiple variations if requested
      const promises = Array.from({ length: variationCount }).map(() => 
        generateInfographicImage(finalPrompt, imageQuality, aspectRatio)
      );

      const results = await Promise.all(promises);
      
      const newImages: GeneratedImage[] = results.map((base64Data, index) => ({
        id: `${batchId}-${index}`,
        data: base64Data,
        prompt: originalTopic,
        timestamp: Date.now(),
        level: complexityLevel,
        style: visualStyle,
        language: language,
        quality: imageQuality,
        relatedTopics: suggestions.length > 0 ? suggestions : currentSuggestions,
        facts: facts.length > 0 ? facts : loadingFacts,
        audioUrl: audioBase64 || undefined,
        batchId: batchId // Group ID
      }));

      // Add all to history (newest first)
      setImageHistory([...newImages.reverse(), ...imageHistory]);
      setIsLoading(false);
      setLoadingStep(0);
    } catch (err: any) {
      handleOperationError(err, 'ImageGeneration', () => executeImageGeneration(finalPrompt, originalTopic, suggestions, facts));
    }
  };

  const handleEdit = async (editPrompt: string) => {
    if (imageHistory.length === 0) return;
    const currentImage = imageHistory[0];
    setIsLoading(true);
    setError(null);
    setLoadingStep(2);
    setLoadingMessage(`Processing Modification: "${editPrompt}"...`);

    try {
      // Use current imageQuality for the edit, allowing upgrade/downgrade
      const base64Data = await editInfographicImage(currentImage.data, editPrompt, imageQuality, aspectRatio);
      const newImage: GeneratedImage = {
        id: Date.now().toString(),
        data: base64Data,
        prompt: editPrompt,
        timestamp: Date.now(),
        level: currentImage.level,
        style: currentImage.style,
        language: currentImage.language,
        quality: imageQuality,
        parentImageId: currentImage.id, // Track parent for comparison
        relatedTopics: currentImage.relatedTopics,
        facts: currentImage.facts, // Preserve facts on edit
        audioUrl: currentImage.audioUrl,
        batchId: Date.now().toString() // New edit is its own batch
      };
      setImageHistory([newImage, ...imageHistory]);
      setIsLoading(false);
      setLoadingStep(0);
    } catch (err: any) {
      handleOperationError(err, 'ImageEdit', () => handleEdit(editPrompt));
    }
  };

  const restoreImage = (img: GeneratedImage) => {
     stopAudio();
     // Move to top without creating new entry
     const newHistory = imageHistory.filter(i => i.id !== img.id);
     setImageHistory([img, ...newHistory]);
     // Restore context
     if (img.relatedTopics) setCurrentSuggestions(img.relatedTopics);
     if (img.audioUrl) setAudioBase64(img.audioUrl);
  };

  const deleteHistoryItem = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const newHistory = imageHistory.filter(img => img.id !== id);
    setImageHistory(newHistory);
    // If we deleted the currently viewed image (index 0), stop audio
    if (imageHistory[0] && imageHistory[0].id === id) {
        stopAudio();
        setAudioBase64(null);
    }
  };

  const clearHistory = () => {
    if (window.confirm("Are you sure you want to clear your entire history? This cannot be undone.")) {
      setImageHistory([]);
      localStorage.removeItem('infoGeniusHistory');
      setAudioBase64(null);
      stopAudio();
      showToast("History cleared.");
    }
  };

  // --- Audio Logic ---
  const toggleAudio = async () => {
    if (isPlayingAudio) {
      stopAudio();
    } else if (audioBase64) {
      playAudio(audioBase64);
    }
  };

  const playAudio = async (base64: string) => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
      }
      const ctx = audioContextRef.current;
      
      const binaryString = atob(base64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      const buffer = await decodeAudioData(bytes, ctx);
      
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.onended = () => setIsPlayingAudio(false);
      source.start();
      
      audioSourceRef.current = source;
      setIsPlayingAudio(true);
    } catch (e) {
      logError(e, 'AudioPlayback');
    }
  };

  const stopAudio = () => {
    if (audioSourceRef.current) {
      try {
        audioSourceRef.current.stop();
      } catch(e) {}
      audioSourceRef.current = null;
    }
    setIsPlayingAudio(false);
  };

  async function decodeAudioData(data: Uint8Array, ctx: AudioContext): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const numChannels = 1;
    const sampleRate = 24000;
    const frameCount = dataInt16.length;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i] / 32768.0;
    }
    return buffer;
  }

  // --- Components ---

  const PromptReviewModal = () => (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400">
             <Settings className="w-5 h-5" />
             <h3 className="font-bold font-display text-lg">Director Mode: Prompt Review</h3>
          </div>
          <button onClick={() => setPendingPrompt(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">Close</button>
        </div>
        <div className="p-6 space-y-4">
           <p className="text-sm text-slate-600 dark:text-slate-400">
             Gemini has researched your topic and constructed the following image prompt. You may edit it before generation.
           </p>
           <textarea 
             value={pendingPrompt || ''} 
             onChange={(e) => setPendingPrompt(e.target.value)}
             className="w-full h-48 p-4 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-cyan-500 outline-none resize-none"
           />
        </div>
        <div className="p-6 pt-0 flex justify-end gap-3">
          <button 
            onClick={() => setPendingPrompt(null)}
            className="px-4 py-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-sm font-medium transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={() => executeImageGeneration(pendingPrompt || "", topic, currentSuggestions, loadingFacts)}
            className="px-6 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg font-bold shadow-lg hover:shadow-cyan-500/20 transition-all transform active:scale-95"
          >
            Approve & Generate
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
    {pendingPrompt && <PromptReviewModal />}

    {/* Toast Notification */}
    {toast.show && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[60] bg-slate-900/95 dark:bg-white/95 text-white dark:text-slate-900 px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 text-sm font-medium animate-in slide-in-from-top-4 fade-in duration-300 pointer-events-none border border-slate-700 dark:border-slate-200">
            <Info className="w-4 h-4 text-cyan-400 dark:text-cyan-600" />
            {toast.message}
        </div>
    )}

    {showIntro ? (
      <IntroScreen onComplete={() => setShowIntro(false)} />
    ) : (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 font-sans selection:bg-cyan-500 selection:text-white pb-20 relative overflow-x-hidden animate-in fade-in duration-1000 transition-colors">
      
      {/* Background Elements */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100 via-slate-50 to-white dark:from-indigo-900 dark:via-slate-950 dark:to-black z-0 transition-colors"></div>
      <div className="fixed inset-0 opacity-5 dark:opacity-20 z-0 pointer-events-none" style={{
          backgroundImage: `radial-gradient(currentColor 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
      }}></div>

      {/* Navbar */}
      <header className="border-b border-slate-200 dark:border-white/10 sticky top-0 z-40 backdrop-blur-md bg-white/70 dark:bg-slate-950/60 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 md:h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 md:gap-4 group">
            <div className="relative scale-90 md:scale-100">
                <div className="absolute inset-0 bg-cyan-500 blur-lg opacity-20 dark:opacity-40 group-hover:opacity-60 transition-opacity"></div>
                <div className="bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-white/10 relative z-10 shadow-sm dark:shadow-none">
                   <Atom className="w-6 h-6 text-cyan-600 dark:text-cyan-400 animate-[spin_10s_linear_infinite]" />
                </div>
            </div>
            <div className="flex flex-col">
                <span className="font-display font-bold text-lg md:text-2xl tracking-tight text-slate-900 dark:text-white leading-none">
                InfoGenius <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-indigo-600 dark:from-cyan-400 dark:to-amber-400">Vision</span>
                </span>
                <span className="text-[8px] md:text-[10px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 font-medium">Visual Knowledge Engine</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsAdvancedMode(!isAdvancedMode)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all border ${
                  isAdvancedMode 
                    ? 'bg-cyan-50 dark:bg-cyan-900/30 border-cyan-200 dark:border-cyan-500/50 text-cyan-700 dark:text-cyan-300' 
                    : 'bg-transparent border-transparent text-slate-500 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                title="Enable Director Mode (Prompt Review)"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Director Mode</span>
              </button>

              <div className="relative" ref={settingsMenuRef}>
                <button 
                    onClick={() => setIsSettingsMenuOpen(!isSettingsMenuOpen)}
                    className={`p-2 rounded-full transition-colors border shadow-sm group ${
                        isSettingsMenuOpen
                        ? 'bg-cyan-50 dark:bg-slate-800 border-cyan-200 dark:border-white/20 text-cyan-600 dark:text-white'
                        : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-300'
                    }`}
                    title="Settings"
                >
                    <Settings className="w-5 h-5 transition-transform duration-300 group-hover:rotate-90" />
                </button>
                {isSettingsMenuOpen && (
                    <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-white/10 p-1.5 z-50 animate-in fade-in zoom-in-95 duration-200">
                        <button 
                            onClick={handleSaveSettings} 
                            className="flex items-center gap-2 w-full p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 transition-colors"
                        >
                            <Save className="w-4 h-4 text-cyan-500" /> 
                            Save Preferences
                        </button>
                        <div className="h-px bg-slate-100 dark:bg-white/5 my-1"></div>
                        <button 
                            onClick={handleLoadDefaults} 
                            className="flex items-center gap-2 w-full p-2.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 transition-colors"
                        >
                            <RotateCcw className="w-4 h-4" /> 
                            Load Defaults
                        </button>
                    </div>
                )}
              </div>

              <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-300 transition-colors border border-slate-200 dark:border-white/10 shadow-sm group"
                title="Toggle Dark Mode (D)"
              >
                {isDarkMode ? <Sun className="w-5 h-5 group-hover:rotate-45 transition-transform" /> : <Moon className="w-5 h-5 group-hover:-rotate-12 transition-transform" />}
              </button>
          </div>
        </div>
      </header>

      <main className="px-3 sm:px-6 py-4 md:py-8 relative z-10">
        
        {/* Search Container */}
        <div className={`max-w-6xl mx-auto transition-all duration-500 ${imageHistory.length > 0 ? 'mb-4 md:mb-8' : 'min-h-[50vh] md:min-h-[70vh] flex flex-col justify-center'}`}>
          
          {!imageHistory.length && (
            <div className="text-center mb-6 md:mb-16 space-y-3 md:space-y-8 animate-in slide-in-from-bottom-8 duration-700 fade-in">
              <div className="inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-amber-600 dark:text-amber-300 text-[10px] md:text-xs font-bold tracking-widest uppercase shadow-sm dark:shadow-[0_0_20px_rgba(251,191,36,0.1)] backdrop-blur-sm">
                <Compass className="w-3 h-3 md:w-4 md:h-4" /> Explore vast subjects like history, science, and more.
              </div>
              <h1 className="text-3xl sm:text-5xl md:text-8xl font-display font-bold text-slate-900 dark:text-white tracking-tight leading-[0.95] md:leading-[0.9]">
                Visualize <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 dark:from-cyan-400 dark:via-indigo-400 dark:to-purple-400">The Unknown.</span>
              </h1>
              <p className="text-sm md:text-2xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-light leading-relaxed px-4">
                Generate diagrams and infographics powered by Google search grounding.
              </p>
            </div>
          )}

          {/* Search Form */}
          <form onSubmit={handleGenerateClick} className={`relative z-20 transition-all duration-300 ${isLoading ? 'opacity-50 pointer-events-none scale-95 blur-sm' : 'scale-100'}`}>
            
            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-amber-500 rounded-3xl opacity-10 dark:opacity-20 group-hover:opacity-30 dark:group-hover:opacity-40 transition duration-500 blur-xl"></div>
                
                <div className="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 p-2 rounded-3xl shadow-2xl">
                    
                    {/* Main Input */}
                    <div className="relative flex items-center">
                        <Search className="absolute left-4 md:left-6 w-5 h-5 md:w-6 md:h-6 text-slate-400 group-focus-within:text-cyan-500 transition-colors" />
                        <input
                            type="text"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="What do you want to visualize?"
                            className="w-full pl-12 md:pl-16 pr-4 md:pr-6 py-3 md:py-6 bg-transparent border-none outline-none text-base md:text-2xl placeholder:text-slate-400 font-medium text-slate-900 dark:text-white"
                        />
                    </div>

                    {/* Controls Bar - Responsive Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-2 p-2 mt-2 relative">
                    
                    {/* Level Selector */}
                    <div className="col-span-1 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-200 dark:border-white/5 px-3 py-2 flex items-center gap-2 hover:border-cyan-500/30 transition-colors relative overflow-hidden group/item">
                        <div className="p-1.5 bg-white dark:bg-slate-800 rounded-lg text-cyan-600 dark:text-cyan-400 shrink-0 shadow-sm">
                            <GraduationCap className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex flex-col z-10 w-full overflow-hidden">
                            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Audience</label>
                            <select 
                                value={complexityLevel} 
                                onChange={(e) => setComplexityLevel(e.target.value as ComplexityLevel)}
                                className="bg-transparent border-none text-sm font-bold text-slate-900 dark:text-slate-100 focus:ring-0 cursor-pointer p-0 w-full hover:text-cyan-600 dark:hover:text-cyan-300 transition-colors truncate [&>option]:bg-white [&>option]:text-slate-900 dark:[&>option]:bg-slate-900 dark:[&>option]:text-slate-100"
                            >
                                <option value="Elementary">Elementary</option>
                                <option value="High School">High School</option>
                                <option value="College">College</option>
                                <option value="Expert">Expert</option>
                            </select>
                        </div>
                    </div>

                    {/* Custom Style Selector */}
                    <div className="col-span-1 relative" ref={styleMenuRef}>
                      <button
                        type="button"
                        onClick={() => setIsStyleMenuOpen(!isStyleMenuOpen)}
                        className="w-full h-full bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-200 dark:border-white/5 px-3 py-2 flex items-center gap-2 hover:border-purple-500/30 transition-colors relative overflow-hidden text-left"
                      >
                         <div className="p-1.5 bg-white dark:bg-slate-800 rounded-lg text-purple-600 dark:text-purple-400 shrink-0 shadow-sm">
                            <Palette className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex flex-col z-10 w-full overflow-hidden">
                            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Style</label>
                            <div className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                                {STYLE_OPTIONS.find(s => s.value === visualStyle)?.label || visualStyle}
                            </div>
                        </div>
                      </button>

                      {isStyleMenuOpen && (
                        <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/10 shadow-2xl p-2 max-h-[400px] overflow-y-auto grid grid-cols-1 md:w-[320px] md:grid-cols-2 gap-2">
                             {STYLE_OPTIONS.map((option) => (
                               <button
                                 key={option.value}
                                 type="button"
                                 onClick={() => { setVisualStyle(option.value); setIsStyleMenuOpen(false); }}
                                 className={`flex items-center gap-3 p-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                                    visualStyle === option.value 
                                      ? 'ring-2 ring-cyan-500 ring-offset-1 dark:ring-offset-slate-900' 
                                      : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                                 }`}
                               >
                                  <div className={`p-2 rounded-lg ${option.color} shrink-0`}>
                                      {React.createElement(option.icon, { className: "w-4 h-4" })}
                                  </div>
                                  <span className="text-slate-700 dark:text-slate-300">{option.label}</span>
                               </button>
                             ))}
                        </div>
                      )}
                    </div>

                    {/* Language Selector */}
                     <div className="col-span-1 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-200 dark:border-white/5 px-3 py-2 flex items-center gap-2 hover:border-green-500/30 transition-colors relative overflow-hidden group/item">
                         <div className="p-1.5 bg-white dark:bg-slate-800 rounded-lg text-green-600 dark:text-green-400 shrink-0 shadow-sm">
                            <Globe className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex flex-col z-10 w-full overflow-hidden">
                            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Language</label>
                            <select 
                                value={language} 
                                onChange={(e) => setLanguage(e.target.value as Language)}
                                className="bg-transparent border-none text-sm font-bold text-slate-900 dark:text-slate-100 focus:ring-0 cursor-pointer p-0 w-full hover:text-green-600 dark:hover:text-green-300 transition-colors truncate [&>option]:bg-white [&>option]:text-slate-900 dark:[&>option]:bg-slate-900 dark:[&>option]:text-slate-100"
                            >
                                <option value="English">English</option>
                                <option value="Spanish">Spanish</option>
                                <option value="French">French</option>
                                <option value="German">German</option>
                                <option value="Mandarin">Chinese</option>
                                <option value="Japanese">Japanese</option>
                                <option value="Hindi">Hindi</option>
                                <option value="Arabic">Arabic</option>
                                <option value="Portuguese">Portuguese</option>
                                <option value="Russian">Russian</option>
                            </select>
                        </div>
                    </div>

                    {/* Quality Selector */}
                    <div className="col-span-1 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-200 dark:border-white/5 px-3 py-2 flex items-center gap-2 hover:border-pink-500/30 transition-colors relative overflow-hidden group/item">
                         <div className="p-1.5 bg-white dark:bg-slate-800 rounded-lg text-pink-600 dark:text-pink-400 shrink-0 shadow-sm">
                            <Maximize className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex flex-col z-10 w-full overflow-hidden">
                            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Quality</label>
                            <select 
                                value={imageQuality} 
                                onChange={(e) => setImageQuality(e.target.value as ImageQuality)}
                                className="bg-transparent border-none text-sm font-bold text-slate-900 dark:text-slate-100 focus:ring-0 cursor-pointer p-0 w-full hover:text-pink-600 dark:hover:text-pink-300 transition-colors truncate [&>option]:bg-white [&>option]:text-slate-900 dark:[&>option]:bg-slate-900 dark:[&>option]:text-slate-100"
                            >
                                <option value="1K">Standard (1K)</option>
                                <option value="2K">High Def (2K)</option>
                                <option value="4K">Ultra HD (4K)</option>
                            </select>
                        </div>
                    </div>

                     {/* Aspect Ratio Selector (Modified Label) */}
                     <div className="col-span-1 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-200 dark:border-white/5 px-3 py-2 flex items-center gap-2 hover:border-orange-500/30 transition-colors relative overflow-hidden group/item">
                         <div className="p-1.5 bg-white dark:bg-slate-800 rounded-lg text-orange-600 dark:text-orange-400 shrink-0 shadow-sm">
                            <RectangleHorizontal className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex flex-col z-10 w-full overflow-hidden">
                            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Dimensions</label>
                            <select 
                                value={aspectRatio} 
                                onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
                                className="bg-transparent border-none text-sm font-bold text-slate-900 dark:text-slate-100 focus:ring-0 cursor-pointer p-0 w-full hover:text-orange-600 dark:hover:text-orange-300 transition-colors truncate [&>option]:bg-white [&>option]:text-slate-900 dark:[&>option]:bg-slate-900 dark:[&>option]:text-slate-100"
                            >
                                <option value="1:1">Square (1:1)</option>
                                <option value="16:9">Wide (16:9)</option>
                                <option value="9:16">Mobile (9:16)</option>
                                <option value="4:3">Standard (4:3)</option>
                                <option value="3:4">Portrait (3:4)</option>
                            </select>
                        </div>
                    </div>

                    {/* Variations Count Selector (New) */}
                    <div className="col-span-1 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-200 dark:border-white/5 px-3 py-2 flex items-center gap-2 hover:border-indigo-500/30 transition-colors relative overflow-hidden group/item">
                         <div className="p-1.5 bg-white dark:bg-slate-800 rounded-lg text-indigo-600 dark:text-indigo-400 shrink-0 shadow-sm">
                            <LayoutGrid className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex flex-col z-10 w-full overflow-hidden">
                            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Count</label>
                            <select 
                                value={variationCount} 
                                onChange={(e) => setVariationCount(Number(e.target.value))}
                                className="bg-transparent border-none text-sm font-bold text-slate-900 dark:text-slate-100 focus:ring-0 cursor-pointer p-0 w-full hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors truncate [&>option]:bg-white [&>option]:text-slate-900 dark:[&>option]:bg-slate-900 dark:[&>option]:text-slate-100"
                            >
                                <option value={1}>Single (1)</option>
                                <option value={2}>Double (2)</option>
                                <option value={3}>Triple (3)</option>
                                <option value={4}>Quad (4)</option>
                            </select>
                        </div>
                    </div>

                    </div>
                    
                    {/* Generate Button (Full Width below selectors) */}
                    <div className="mt-2">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-14 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-2xl font-bold font-display tracking-wide hover:brightness-110 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                        >
                            {isLoading ? <span className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full"></span> : <Microscope className="w-5 h-5" />}
                            <span>INITIATE {variationCount > 1 ? `BATCH (${variationCount})` : 'SEQUENCE'}</span>
                        </button>
                    </div>

                </div>
            </div>
          </form>
        </div>

        {isLoading && <Loading status={loadingMessage} step={loadingStep} facts={loadingFacts} />}

        {error && (
            <div className="max-w-2xl mx-auto mt-8 p-6 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-500/30 rounded-2xl flex flex-col sm:flex-row gap-4 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 shadow-sm">
                <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full h-fit w-fit shrink-0">
                    <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div className="flex-1 space-y-2">
                    <h3 className="font-bold text-lg text-red-900 dark:text-red-200">{error.title}</h3>
                    <p className="text-red-800 dark:text-red-300/80 leading-relaxed text-sm md:text-base">{error.message}</p>
                    {error.code && <p className="text-xs font-mono text-red-400 dark:text-red-500/50 pt-2">Error Code: {error.code}</p>}
                </div>
                {retryAction && (
                    <button 
                        onClick={() => { setError(null); retryAction(); }}
                        className="self-start sm:self-center px-6 py-3 bg-red-100 hover:bg-red-200 dark:bg-red-900/40 dark:hover:bg-red-900/60 text-red-800 dark:text-red-200 rounded-xl font-bold transition-colors flex items-center gap-2 shadow-sm"
                    >
                        <RefreshCcw className="w-4 h-4" />
                        Retry
                    </button>
                )}
            </div>
        )}

        {imageHistory.length > 0 && !isLoading && !error && (
            <>
                <Infographic 
                    image={imageHistory[0]} 
                    previousImage={imageHistory.find(img => img.id === imageHistory[0].parentImageId)}
                    // Pass all images from history that share the same batch ID as the current image
                    variations={imageHistory.filter(img => img.batchId && img.batchId === imageHistory[0].batchId)}
                    onEdit={handleEdit} 
                    onSelectVariation={restoreImage}
                    isEditing={isLoading}
                />
                
                <div className="max-w-6xl mx-auto mt-6 flex flex-col lg:flex-row gap-6 px-3">
                   
                    {/* KEY INSIGHTS / FACTS DISPLAY */}
                    {(imageHistory[0].facts && imageHistory[0].facts.length > 0) && (
                        <div className="flex-1 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-white/10 p-6 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
                             <div className="flex items-center gap-2 mb-4 text-amber-600 dark:text-amber-400">
                                <BookOpen className="w-5 h-5" />
                                <h3 className="font-bold font-display text-sm uppercase tracking-wider">Key Insights</h3>
                             </div>
                             <ul className="space-y-3">
                                {imageHistory[0].facts.map((fact, idx) => (
                                    <li key={idx} className="text-sm md:text-base text-slate-700 dark:text-slate-300 leading-relaxed flex items-start gap-3">
                                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-cyan-500 shrink-0"></span>
                                        <span>{fact}</span>
                                    </li>
                                ))}
                             </ul>
                        </div>
                    )}

                    {/* Audio Player Card & Suggestions */}
                    <div className="flex-1 flex flex-col gap-4">
                        {audioBase64 && (
                            <div className="w-full p-6 bg-indigo-50 dark:bg-indigo-950/20 rounded-2xl border border-indigo-100 dark:border-indigo-500/20 flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4 delay-100">
                                <button 
                                    onClick={toggleAudio}
                                    className="w-14 h-14 rounded-full bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/30 shrink-0"
                                >
                                    {isPlayingAudio ? <PauseCircle className="w-7 h-7" /> : <PlayCircle className="w-7 h-7" />}
                                </button>
                                <div>
                                    <h4 className="font-bold text-slate-900 dark:text-white">Audio Summary</h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Listen to the AI generated narration of key insights.</p>
                                </div>
                                <div className="ml-auto">
                                    <Volume2 className={`w-6 h-6 ${isPlayingAudio ? 'text-indigo-500 animate-pulse' : 'text-slate-400'}`} />
                                </div>
                            </div>
                        )}

                        {/* Suggestions Chips */}
                        {currentSuggestions.length > 0 && (
                        <div className="flex flex-wrap gap-2 items-center">
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mr-2 w-full mb-1">
                                <Lightbulb className="w-4 h-4" />
                                <span>Explore Related Topics:</span>
                            </div>
                            {currentSuggestions.map((suggestion, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleSuggestionClick(suggestion)}
                                className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-full text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-cyan-50 dark:hover:bg-cyan-900/30 hover:border-cyan-300 dark:hover:border-cyan-700 hover:text-cyan-700 dark:hover:text-cyan-300 transition-all shadow-sm"
                            >
                                {suggestion}
                            </button>
                            ))}
                        </div>
                        )}
                    </div>
                </div>

                <SearchResults results={currentSearchResults} />
            </>
        )}

        {/* Previous History List (Refined Card Layout) */}
        {imageHistory.length > 1 && (
            <div className="max-w-6xl mx-auto mt-20 px-4">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <History className="w-5 h-5 text-slate-400" />
                        <h2 className="text-lg font-bold text-slate-500 uppercase tracking-widest">Session History</h2>
                    </div>
                    <button 
                        onClick={clearHistory}
                        className="text-xs font-bold text-red-500 hover:text-red-600 uppercase tracking-wider flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                        Clear All
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {imageHistory.slice(1).map((img) => (
                        <div 
                           key={img.id} 
                           className="group flex flex-col bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-slate-200 dark:border-white/5 transition-all hover:-translate-y-1 cursor-pointer"
                           onClick={() => restoreImage(img)}
                        >
                            <div className="relative aspect-video overflow-hidden bg-slate-100 dark:bg-slate-800">
                                <img src={img.data} alt={img.prompt} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                
                                {/* New Hover Overlay - Modal Style */}
                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                                    <div className="w-[90%] bg-slate-900/95 backdrop-blur-md rounded-xl p-4 border border-white/10 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 shadow-xl flex flex-col gap-2">
                                        <div className="flex items-center gap-2 text-cyan-400 text-[10px] font-bold uppercase tracking-wider border-b border-white/5 pb-2 mb-1">
                                            <Clock className="w-3 h-3" />
                                            <span>{new Date(img.timestamp).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                        <p className="text-white text-xs leading-relaxed line-clamp-4 font-medium">
                                            {img.prompt}
                                        </p>
                                    </div>
                                </div>

                                {/* Actions Overlay - Top Right */}
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 z-20">
                                     {/* Variation Indicator Badge */}
                                     {img.batchId && (
                                         <div className="absolute top-0 right-10 -mr-2 bg-indigo-500/80 backdrop-blur-sm text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full pointer-events-none shadow-sm">
                                             VAR
                                         </div>
                                     )}
                                     <button
                                        onClick={(e) => { e.stopPropagation(); restoreImage(img); }}
                                        className="p-2 bg-slate-900/50 hover:bg-white text-white hover:text-cyan-600 rounded-full backdrop-blur-md transition-all shadow-lg border border-white/10"
                                        title="Restore this version"
                                     >
                                        <RotateCcw className="w-4 h-4" />
                                     </button>
                                     <button
                                        onClick={(e) => deleteHistoryItem(e, img.id)}
                                        className="p-2 bg-slate-900/50 hover:bg-red-500 text-white rounded-full backdrop-blur-md transition-all shadow-lg border border-white/10"
                                        title="Delete from history"
                                     >
                                        <Trash2 className="w-4 h-4" />
                                     </button>
                                </div>
                            </div>
                            <div className="p-4 flex flex-col gap-2">
                                <div className="flex items-start justify-between gap-2">
                                     <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 line-clamp-1 leading-tight">{img.prompt}</h4>
                                </div>
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-slate-400 font-mono">
                                    <div className="flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-500"></div>
                                        <span className="capitalize">{img.style || 'Default'}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                                        <span className="capitalize">{img.quality || '1K'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

      </main>
    </div>
    )}
    </>
  );
};

export default App;