
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import { GeneratedImage } from '../types';
import { logError, interpretError } from '../services/errorService';
import { Download, Sparkles, Edit3, Maximize2, X, ZoomIn, ZoomOut, SplitSquareHorizontal, Copy, Check, Info, Share2 } from 'lucide-react';

interface InfographicProps {
  image: GeneratedImage;
  previousImage?: GeneratedImage; // Optional previous version for comparison
  onEdit: (prompt: string) => void;
  isEditing: boolean;
}

const Infographic: React.FC<InfographicProps> = ({ image, previousImage, onEdit, isEditing }) => {
  const [editPrompt, setEditPrompt] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isComparing, setIsComparing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState<{show: boolean, message: string}>({show: false, message: ''});

  const showToast = (msg: string) => {
    setToast({show: true, message: msg});
    setTimeout(() => setToast({show: false, message: ''}), 3000);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editPrompt.trim()) return;
    onEdit(editPrompt);
    setEditPrompt('');
  };

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.5, 4));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.5, 0.5));
  const handleResetZoom = () => setZoomLevel(1);

  const handleCloseFullscreen = () => {
    setIsFullscreen(false);
    setZoomLevel(1);
  }

  const handleCopy = async () => {
    try {
        const response = await fetch(image.data);
        const blob = await response.blob();
        await navigator.clipboard.write([
            new ClipboardItem({
                [blob.type]: blob
            })
        ]);
        setCopied(true);
        showToast("Image copied to clipboard");
        setTimeout(() => setCopied(false), 2000);
    } catch (err) {
        logError(err, 'Infographic.handleCopy');
        const appError = interpretError(err);
        showToast(`Copy Failed: ${appError.title}`);
    }
  };

  const handleDownload = async () => {
    try {
        showToast("Starting download...");
        const response = await fetch(image.data);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `infographic-${image.id}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    } catch (err) {
        logError(err, 'Infographic.handleDownload');
        const appError = interpretError(err);
        showToast(`Download Failed: ${appError.title}`);
    }
  };

  const handleShare = async () => {
    try {
        const response = await fetch(image.data);
        const blob = await response.blob();
        const file = new File([blob], `infographic-${image.id}.png`, { type: blob.type });

        if (navigator.share && navigator.canShare({ files: [file] })) {
            await navigator.share({
                title: 'InfoGenius Infographic',
                text: `Check out this infographic about: ${image.prompt}`,
                files: [file]
            });
            showToast("Shared successfully!");
        } else {
             // Fallback for desktop or unsupported browsers
            await handleCopy();
            showToast("Sharing not supported on this device. Image copied instead.");
        }
    } catch (err) {
        logError(err, 'Infographic.handleShare');
        // Don't show toast for user cancellation
        if ((err as Error).name !== 'AbortError') {
             showToast("Share failed.");
        }
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-6xl mx-auto animate-in fade-in zoom-in duration-700 mt-8 relative">
      
      {/* Toast Notification */}
      {toast.show && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 text-white px-4 py-2 rounded-full shadow-xl flex items-center gap-2 text-sm font-medium animate-in slide-in-from-top-4 fade-in duration-300 pointer-events-none">
            <Info className="w-4 h-4 text-cyan-400" />
            {toast.message}
        </div>
      )}

      {/* Image Container */}
      <div className="relative group w-full bg-slate-100 dark:bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700/50">
        {/* Decorative Corner Markers */}
        <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-cyan-500/30 rounded-tl-2xl z-20 pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-cyan-500/30 rounded-tr-2xl z-20 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-cyan-500/30 rounded-bl-2xl z-20 pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-cyan-500/30 rounded-br-2xl z-20 pointer-events-none"></div>

        {/* Image Display Area with Comparison Logic */}
        <div className="relative w-full overflow-hidden">
            {previousImage && (
                <div 
                    className={`absolute inset-0 z-10 transition-opacity duration-200 ${isComparing ? 'opacity-100' : 'opacity-0'}`}
                >
                    <img 
                        src={previousImage.data} 
                        alt="Original"
                        className="w-full h-auto object-contain bg-checkered max-h-[80vh]"
                    />
                     <div className="absolute top-4 left-4 bg-black/70 text-white text-xs font-bold px-3 py-1 rounded-full pointer-events-none">
                        ORIGINAL
                    </div>
                </div>
            )}
            
            <img 
              src={image.data} 
              alt={image.prompt} 
              onClick={() => setIsFullscreen(true)}
              className="w-full h-auto object-contain max-h-[80vh] bg-checkered relative z-0 cursor-zoom-in"
            />
            
            {previousImage && !isComparing && (
                <div className="absolute top-4 left-4 bg-cyan-600/90 text-white text-xs font-bold px-3 py-1 rounded-full pointer-events-none shadow-lg z-10">
                    EDITED
                </div>
            )}
        </div>
        
        {/* Hover Overlay for Quick Actions */}
        <div className="absolute top-6 right-6 flex flex-col sm:flex-row gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity z-30 pointer-events-none md:pointer-events-auto">
          <button 
            onClick={() => setIsFullscreen(true)}
            className="pointer-events-auto bg-black/60 backdrop-blur-md text-white p-3 rounded-xl shadow-lg hover:bg-cyan-600 transition-colors border border-white/10 block"
            title="Fullscreen View"
          >
            <Maximize2 className="w-5 h-5" />
          </button>
          
          <button 
            onClick={handleCopy}
            className="pointer-events-auto bg-black/60 backdrop-blur-md text-white p-3 rounded-xl shadow-lg hover:bg-cyan-600 transition-colors border border-white/10 block"
            title="Copy Image"
          >
            {copied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
          </button>

          <button 
            onClick={handleDownload}
            className="pointer-events-auto bg-black/60 backdrop-blur-md text-white p-3 rounded-xl shadow-lg hover:bg-cyan-600 transition-colors border border-white/10 block"
            title="Download Image"
          >
            <Download className="w-5 h-5" />
          </button>

          <button 
            onClick={handleShare}
            className="pointer-events-auto bg-black/60 backdrop-blur-md text-white p-3 rounded-xl shadow-lg hover:bg-cyan-600 transition-colors border border-white/10 block"
            title="Share"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>

        {/* Compare Button (Only if previous image exists) */}
        {previousImage && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30">
                <button
                    onMouseDown={() => setIsComparing(true)}
                    onMouseUp={() => setIsComparing(false)}
                    onMouseLeave={() => setIsComparing(false)}
                    onTouchStart={() => setIsComparing(true)}
                    onTouchEnd={() => setIsComparing(false)}
                    className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md border border-white/20 text-white px-5 py-2.5 rounded-full shadow-xl hover:bg-slate-800 transition-all active:scale-95 select-none"
                >
                    <SplitSquareHorizontal className="w-4 h-4" />
                    <span className="text-sm font-bold">Hold to Compare</span>
                </button>
            </div>
        )}
      </div>

      {/* Edit Bar */}
      <div className="w-full max-w-3xl -mt-6 sm:-mt-8 relative z-40 px-4">
        <div className="bg-white/90 dark:bg-slate-800/80 backdrop-blur-xl p-3 sm:p-2 sm:pr-3 rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 flex flex-col sm:flex-row gap-2 items-center ring-1 ring-black/5 dark:ring-white/5">
            <div className="pl-4 text-cyan-600 dark:text-cyan-400 hidden sm:block">
                <Edit3 className="w-5 h-5" />
            </div>
            <form onSubmit={handleSubmit} className="flex-1 w-full flex flex-col sm:flex-row gap-2">
                <input
                    type="text"
                    value={editPrompt}
                    onChange={(e) => setEditPrompt(e.target.value)}
                    placeholder="Refine the visual (e.g., 'Make the background stars')..."
                    className="flex-1 bg-slate-50 dark:bg-slate-950/50 sm:bg-transparent border border-slate-200 dark:border-white/5 sm:border-none rounded-xl sm:rounded-none focus:ring-0 text-slate-900 dark:text-white placeholder:text-slate-400 px-4 py-3 sm:px-2 sm:py-2 font-medium text-base"
                    disabled={isEditing}
                />
                <div className="w-full sm:w-auto" title={!editPrompt.trim() ? "Please enter a prompt to enhance" : "Enhance image"}>
                    <button
                        type="submit"
                        disabled={isEditing || !editPrompt.trim()}
                        className={`w-full sm:w-auto px-5 py-3 sm:py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                            isEditing || !editPrompt.trim() 
                            ? 'bg-slate-200 dark:bg-slate-700/50 text-slate-400 dark:text-slate-500 cursor-not-allowed' 
                            : 'bg-cyan-600 text-white hover:bg-cyan-500 shadow-lg shadow-cyan-500/20'
                        }`}
                    >
                        {isEditing ? (
                            <span className="animate-spin w-5 h-5 block border-2 border-white/30 border-t-white rounded-full"></span>
                        ) : (
                            <>
                                <span>Enhance</span>
                                <Sparkles className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
      </div>
      
      <div className="mt-8 text-center space-y-2 px-4">
        <p className="text-xs text-slate-500 dark:text-slate-500 font-mono max-w-xl mx-auto truncate opacity-60">
            PROMPT: {image.prompt}
        </p>
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-[100] bg-slate-100/95 dark:bg-slate-950/95 backdrop-blur-xl flex flex-col animate-in fade-in duration-300">
            {/* Toolbar */}
            <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-50 pointer-events-none">
                <div className="flex gap-2 pointer-events-auto bg-white/10 backdrop-blur-md p-1 rounded-lg border border-black/5 dark:border-white/10">
                    <button onClick={handleZoomOut} className="p-2 hover:bg-black/10 dark:hover:bg-white/10 rounded-md text-slate-800 dark:text-slate-200 transition-colors" title="Zoom Out">
                        <ZoomOut className="w-5 h-5" />
                    </button>
                    <button onClick={handleResetZoom} className="p-2 hover:bg-black/10 dark:hover:bg-white/10 rounded-md text-slate-800 dark:text-slate-200 transition-colors" title="Reset Zoom">
                        <span className="text-xs font-bold">{Math.round(zoomLevel * 100)}%</span>
                    </button>
                    <button onClick={handleZoomIn} className="p-2 hover:bg-black/10 dark:hover:bg-white/10 rounded-md text-slate-800 dark:text-slate-200 transition-colors" title="Zoom In">
                        <ZoomIn className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex gap-2 pointer-events-auto">
                    <button 
                        onClick={handleCopy}
                        className="p-3 bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white rounded-full hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors shadow-lg"
                        title="Copy Image"
                    >
                         {copied ? <Check className="w-6 h-6 text-green-500" /> : <Copy className="w-6 h-6" />}
                    </button>
                    <button 
                        onClick={handleDownload}
                        className="p-3 bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white rounded-full hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors shadow-lg"
                        title="Download"
                    >
                        <Download className="w-6 h-6" />
                    </button>
                    <button 
                        onClick={handleShare}
                        className="p-3 bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white rounded-full hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors shadow-lg"
                        title="Share"
                    >
                        <Share2 className="w-6 h-6" />
                    </button>
                    <button 
                        onClick={handleCloseFullscreen}
                        className="p-3 bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white rounded-full hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors shadow-lg"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-auto flex items-center justify-center p-4 sm:p-8">
                <img 
                    src={image.data} 
                    alt={image.prompt}
                    style={{ 
                        transform: `scale(${zoomLevel})`,
                        transition: 'transform 0.2s ease-out'
                    }}
                    className="max-w-full max-h-full object-contain shadow-2xl rounded-lg origin-center"
                />
            </div>
        </div>
      )}
    </div>
  );
};

export default Infographic;
