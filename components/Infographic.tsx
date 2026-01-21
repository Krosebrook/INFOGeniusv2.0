/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Infographic.tsx
 * Displays the generated image with interactive features:
 * - Zoom & Pan (Fullscreen)
 * - Comparison slider (Before/After)
 * - Variation selection
 * - Editing/Enhancement input
 * - Export options (Copy, Download, Share)
 */

import React, { useState, useRef, useEffect } from 'react';
import { GeneratedImage } from '../types';
import { logError, interpretError } from '../services/errorService';
import { Download, Sparkles, Edit3, Maximize2, X, ZoomIn, ZoomOut, Copy, Check, Info, Share2, FileDown, Clipboard, Layers, Package, MoveHorizontal } from 'lucide-react';
import JSZip from 'jszip';

interface InfographicProps {
  image: GeneratedImage;
  previousImage?: GeneratedImage; // Optional previous version for comparison
  variations?: GeneratedImage[]; // New: Other images in the same batch
  onEdit: (prompt: string) => void;
  onSelectVariation?: (img: GeneratedImage) => void;
  isEditing: boolean;
}

const Infographic: React.FC<InfographicProps> = ({ image, previousImage, variations, onEdit, onSelectVariation, isEditing }) => {
  const [editPrompt, setEditPrompt] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState<{show: boolean, message: string}>({show: false, message: ''});
  const [isZipping, setIsZipping] = useState(false);

  // Comparison Slider State
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const showToast = (msg: string) => {
    setToast({show: true, message: msg});
    setTimeout(() => setToast({show: false, message: ''}), 3000);
  }

  const handleCopy = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
        const response = await fetch(image.data);
        const blob = await response.blob();
        await navigator.clipboard.write([
            new ClipboardItem({ [blob.type]: blob })
        ]);
        setCopied(true);
        showToast("Image copied to clipboard");
        setTimeout(() => setCopied(false), 2000);
    } catch (err) {
        logError(err, 'Infographic.handleCopy');
        showToast(`Copy Failed: ${interpretError(err).title}`);
    }
  };

  const handleDownload = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
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
        showToast(`Download Failed: ${interpretError(err).title}`);
    }
  };

  const handleDownloadBatch = async () => {
    if (!variations || variations.length === 0 || isZipping) return;
    try {
        setIsZipping(true);
        showToast("Preparing ZIP file...");
        const zip = new JSZip();
        await Promise.all(variations.map(async (v, index) => {
            const response = await fetch(v.data);
            const blob = await response.blob();
            zip.file(`variation-${index + 1}-${v.id}.png`, blob);
        }));
        const content = await zip.generateAsync({ type: "blob" });
        const url = window.URL.createObjectURL(content);
        const link = document.createElement('a');
        link.href = url;
        link.download = `infographic-batch-${image.batchId || Date.now()}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        showToast("Batch download complete");
    } catch (err) {
        logError(err, 'Infographic.handleDownloadBatch');
        showToast("Batch download failed");
    } finally {
        setIsZipping(false);
    }
  };

  const handleShare = async () => {
    try {
        const response = await fetch(image.data);
        const blob = await response.blob();
        const file = new File([blob], `infographic-${image.id}.png`, { type: blob.type });
        if (navigator.share && navigator.canShare({ files: [file] })) {
            await navigator.share({ title: 'InfoGenius Infographic', text: `Check out this infographic: ${image.prompt}`, files: [file] });
            showToast("Shared successfully!");
        } else {
            await handleCopy();
            showToast("Sharing not supported. Image copied.");
        }
    } catch (err) {
        logError(err, 'Infographic.handleShare');
    }
  };

  // Draggable logic for slider
  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setSliderPos((x / rect.width) * 100);
  };

  const onMouseDown = () => { isDragging.current = true; };
  const onMouseUp = () => { isDragging.current = false; };
  const onMouseMove = (e: React.MouseEvent) => { if (isDragging.current) handleMove(e.clientX); };
  const onTouchMove = (e: React.TouchEvent) => { if (e.touches[0]) handleMove(e.touches[0].clientX); };

  useEffect(() => {
    window.addEventListener('mouseup', onMouseUp);
    return () => window.removeEventListener('mouseup', onMouseUp);
  }, []);

  return (
    <div className="flex flex-col items-center w-full max-w-6xl mx-auto animate-in fade-in zoom-in duration-700 mt-8 relative">
      {toast.show && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 text-white px-4 py-2 rounded-full shadow-xl flex items-center gap-2 text-sm font-medium animate-in slide-in-from-top-4 fade-in duration-300 pointer-events-none border border-white/10">
            <Info className="w-4 h-4 text-cyan-400" />
            {toast.message}
        </div>
      )}

      <div className="relative group w-full bg-slate-100 dark:bg-slate-900 rounded-t-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700/50">
        
        {/* Loading Overlay for Editing */}
        {isEditing && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
             <div className="p-5 bg-white dark:bg-slate-800 rounded-full shadow-2xl animate-bounce mb-4 ring-4 ring-cyan-500/20">
                <Sparkles className="w-8 h-8 text-cyan-500 animate-spin" style={{ animationDuration: '3s' }} />
             </div>
             <p className="text-white font-bold tracking-[0.2em] text-sm uppercase animate-pulse drop-shadow-md">Enhancing Visual Intelligence...</p>
          </div>
        )}

        <div className="absolute top-4 right-4 z-40 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
           <button onClick={handleCopy} className="p-2.5 bg-black/60 hover:bg-black/80 backdrop-blur-md text-white rounded-full transition-all border border-white/10 shadow-lg hover:scale-110 active:scale-95" title="Copy to Clipboard">{copied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}</button>
           <button onClick={handleDownload} className="p-2.5 bg-black/60 hover:bg-black/80 backdrop-blur-md text-white rounded-full transition-all border border-white/10 shadow-lg hover:scale-110 active:scale-95" title="Download PNG"><Download className="w-5 h-5" /></button>
           <button onClick={() => setIsFullscreen(true)} className="p-2.5 bg-black/60 hover:bg-black/80 backdrop-blur-md text-white rounded-full transition-all border border-white/10 shadow-lg hover:scale-110 active:scale-95" title="Fullscreen"><Maximize2 className="w-5 h-5" /></button>
        </div>

        <div 
          ref={containerRef}
          onMouseMove={onMouseMove}
          onTouchMove={onTouchMove}
          className="relative w-full overflow-hidden min-h-[300px] flex items-center justify-center bg-checkered select-none touch-none"
        >
            {/* Base Image (Newer version) */}
            <img src={image.data} alt={image.prompt} onClick={() => !isDragging.current && setIsFullscreen(true)} className="w-full h-auto object-contain max-h-[75vh] relative z-0" />
            
            {/* Compare Version (Previous or First Variation) Overlay clipped by slider */}
            {previousImage && (
              <>
                <div 
                  className="absolute top-0 left-0 h-full overflow-hidden pointer-events-none z-10"
                  style={{ width: `${sliderPos}%` }}
                >
                  <img src={previousImage.data} alt="Before" className="h-full w-auto object-contain max-h-[75vh]" style={{ width: containerRef.current?.offsetWidth || '100vw', maxWidth: 'none' }} />
                  <div className="absolute top-4 left-4 bg-black/70 text-white text-[10px] font-bold px-3 py-1 rounded-full pointer-events-none border border-white/10">BEFORE (ORIGINAL)</div>
                </div>
                {/* Newer Image label */}
                <div className="absolute top-4 right-4 bg-cyan-600/90 text-white text-[10px] font-bold px-3 py-1 rounded-full pointer-events-none shadow-lg z-10 border border-white/10">AFTER (ENHANCED)</div>

                {/* Draggable Divider */}
                <div 
                  onMouseDown={onMouseDown}
                  className="absolute top-0 bottom-0 z-30 cursor-ew-resize group/slider flex items-center justify-center"
                  style={{ left: `${sliderPos}%` }}
                >
                   <div className="w-1 h-full bg-white/40 group-hover/slider:bg-white/80 backdrop-blur-sm transition-colors shadow-2xl"></div>
                   <div className="absolute w-10 h-10 rounded-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 shadow-2xl flex items-center justify-center transform transition-transform group-hover/slider:scale-110 active:scale-90">
                      <MoveHorizontal className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                   </div>
                </div>
              </>
            )}
        </div>
      </div>

      {variations && variations.length > 0 && (
          <div className="w-full bg-slate-100/50 dark:bg-slate-900/50 backdrop-blur-sm border-x border-slate-200 dark:border-slate-700/50 p-2 flex gap-4 overflow-x-auto items-center">
              <div className="flex flex-col gap-1.5 px-2 shrink-0 border-r border-slate-200/50 dark:border-white/10 pr-4 mr-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider"><Layers className="w-4 h-4" />Variations</div>
                  {variations.length > 1 && (<button onClick={handleDownloadBatch} disabled={isZipping} className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-700 px-2 py-1 rounded-md border border-slate-200/50 dark:border-white/5 transition-all disabled:opacity-50 disabled:cursor-wait" title="Download all variations as a ZIP file">{isZipping ? <span className="animate-spin w-3.5 h-3.5 border-2 border-slate-400 border-t-transparent rounded-full"></span> : <Package className="w-3.5 h-3.5" />}Download ZIP</button>)}
              </div>
              <div className="flex gap-2">
                 {variations.map((v) => (<button key={v.id} onClick={() => onSelectVariation && onSelectVariation(v)} className={`relative w-24 h-16 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${v.id === image.id ? 'border-cyan-500 ring-2 ring-cyan-500/30' : 'border-transparent hover:border-slate-300 dark:hover:border-slate-600 opacity-60 hover:opacity-100'}`}><img src={v.data} alt="Variation" className="w-full h-full object-cover" /></button>))}
              </div>
          </div>
      )}

      <div className="w-full bg-white dark:bg-slate-800 border-x border-b border-slate-200 dark:border-slate-700/50 p-2 flex flex-wrap items-center justify-between gap-2 shadow-sm rounded-b-2xl mb-4">
          <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 font-mono px-2 truncate max-w-[50%]"><span className="truncate">{image.prompt}</span></div>
          <div className="flex items-center gap-1">
              <button onClick={handleCopy} className="flex items-center gap-2 px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-xs font-bold uppercase tracking-wider group">{copied ? <Check className="w-4 h-4 text-green-500" /> : <Clipboard className="w-4 h-4 group-hover:text-cyan-500" />}<span className="hidden sm:inline">Copy</span></button>
              <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1"></div>
              <button onClick={handleDownload} className="flex items-center gap-2 px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-xs font-bold uppercase tracking-wider group"><FileDown className="w-4 h-4 group-hover:text-cyan-500" /><span className="hidden sm:inline">Download</span></button>
              <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1"></div>
              <button onClick={handleShare} className="flex items-center gap-2 px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-xs font-bold uppercase tracking-wider group"><Share2 className="w-4 h-4 group-hover:text-cyan-500" /><span className="hidden sm:inline">Share</span></button>
              <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1"></div>
              <button onClick={() => setIsFullscreen(true)} className="flex items-center gap-2 px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors text-xs font-bold uppercase tracking-wider group"><Maximize2 className="w-4 h-4 group-hover:text-cyan-500" /><span className="hidden sm:inline">View</span></button>
          </div>
      </div>

      <div className="w-full max-w-3xl relative z-40 px-4">
        <div className="bg-white/90 dark:bg-slate-800/80 backdrop-blur-xl p-3 sm:p-2 sm:pr-3 rounded-2xl shadow-xl border border-slate-200 dark:border-white/10 flex flex-col sm:flex-row gap-2 items-center ring-1 ring-black/5 dark:ring-white/5">
            <div className="pl-4 text-cyan-600 dark:text-cyan-400 hidden sm:block"><Edit3 className="w-5 h-5" /></div>
            <form onSubmit={(e) => { e.preventDefault(); if (editPrompt.trim()) onEdit(editPrompt); setEditPrompt(''); }} className="flex-1 w-full flex flex-col sm:flex-row gap-2">
                <input type="text" value={editPrompt} onChange={(e) => setEditPrompt(e.target.value)} placeholder="Refine the visual (e.g., 'Make the background stars')..." className="flex-1 bg-slate-50 dark:bg-slate-950/50 sm:bg-transparent border border-slate-200 dark:border-white/5 sm:border-none rounded-xl sm:rounded-none focus:ring-0 text-slate-900 dark:text-white placeholder:text-slate-400 px-4 py-3 sm:px-2 sm:py-2 font-medium text-base" disabled={isEditing} />
                <div className="w-full sm:w-auto"><button type="submit" disabled={isEditing || !editPrompt.trim()} className={`w-full sm:w-auto px-5 py-3 sm:py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${isEditing || !editPrompt.trim() ? 'bg-slate-200 dark:bg-slate-700/50 text-slate-400 dark:text-slate-500 cursor-not-allowed' : 'bg-cyan-600 text-white hover:bg-cyan-500 shadow-lg shadow-cyan-500/20'}`}>{isEditing ? (<span className="animate-spin w-5 h-5 block border-2 border-white/30 border-t-white rounded-full"></span>) : (<><span>Enhance</span><Sparkles className="w-4 h-4" /></>)}</button></div>
            </form>
        </div>
      </div>

      {isFullscreen && (
        <div className="fixed inset-0 z-[100] bg-slate-100/95 dark:bg-slate-950/95 backdrop-blur-xl flex flex-col animate-in fade-in duration-300">
            <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-50 pointer-events-none">
                <div className="flex gap-2 pointer-events-auto bg-white/10 backdrop-blur-md p-1 rounded-lg border border-black/5 dark:border-white/10">
                    <button onClick={() => setZoomLevel(prev => Math.max(prev - 0.5, 0.5))} className="p-2 hover:bg-black/10 dark:hover:bg-white/10 rounded-md text-slate-800 dark:text-slate-200 transition-colors" title="Zoom Out"><ZoomOut className="w-5 h-5" /></button>
                    <button onClick={() => setZoomLevel(1)} className="p-2 hover:bg-black/10 dark:hover:bg-white/10 rounded-md text-slate-800 dark:text-slate-200 transition-colors" title="Reset Zoom"><span className="text-xs font-bold">{Math.round(zoomLevel * 100)}%</span></button>
                    <button onClick={() => setZoomLevel(prev => Math.min(prev + 0.5, 4))} className="p-2 hover:bg-black/10 dark:hover:bg-white/10 rounded-md text-slate-800 dark:text-slate-200 transition-colors" title="Zoom In"><ZoomIn className="w-5 h-5" /></button>
                </div>
                <div className="flex gap-2 pointer-events-auto">
                    <button onClick={handleCopy} className="p-3 bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white rounded-full hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors shadow-lg" title="Copy Image">{copied ? <Check className="w-6 h-6 text-green-500" /> : <Copy className="w-6 h-6" />}</button>
                    <button onClick={handleDownload} className="p-3 bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white rounded-full hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors shadow-lg" title="Download"><Download className="w-6 h-6" /></button>
                    <button onClick={handleShare} className="p-3 bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white rounded-full hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors shadow-lg" title="Share"><Share2 className="w-6 h-6" /></button>
                    <button onClick={() => setIsFullscreen(false)} className="p-3 bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white rounded-full hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors shadow-lg"><X className="w-6 h-6" /></button>
                </div>
            </div>
            <div className="flex-1 overflow-auto flex items-center justify-center p-4 sm:p-8">
                <img src={image.data} alt={image.prompt} style={{ transform: `scale(${zoomLevel})`, transition: 'transform 0.2s ease-out' }} className="max-w-full max-h-full object-contain shadow-2xl rounded-lg origin-center" />
            </div>
        </div>
      )}
    </div>
  );
};

export default Infographic;