/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import { SearchResultItem } from '../types';
import { ExternalLink, BookOpen, Link as LinkIcon, Copy, Check, Globe } from 'lucide-react';

interface SearchResultsProps {
  results: SearchResultItem[];
}

const SearchResults: React.FC<SearchResultsProps> = ({ results }) => {
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  if (!results || results.length === 0) return null;

  // Group by hostname
  const groupedResults = results.reduce((acc, item) => {
    let hostname = 'External Source';
    try {
      hostname = new URL(item.url).hostname.replace('www.', '');
    } catch {}
    if (!acc[hostname]) acc[hostname] = [];
    acc[hostname].push(item);
    return acc;
  }, {} as Record<string, SearchResultItem[]>);

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  return (
    <div className="w-full max-w-6xl mx-auto mt-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="flex items-center gap-3 mb-8 border-t border-slate-200 dark:border-white/10 pt-8 transition-colors">
        <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-white/10 text-cyan-600 dark:text-cyan-400 shadow-sm">
            < BookOpen className="w-5 h-5" />
        </div>
        <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Verified Sources</h3>
      </div>
      
      <div className="space-y-8">
        {(Object.entries(groupedResults) as [string, SearchResultItem[]][]).map(([hostname, items]) => (
          <div key={hostname} className="space-y-4">
             <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800"></div>
                <div className="flex items-center gap-2 px-4 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-full">
                    <Globe className="w-3.5 h-3.5 text-cyan-500" />
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{hostname}</span>
                </div>
                <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800"></div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((result, index) => (
                <div 
                    key={index}
                    className="group relative flex flex-col p-5 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 rounded-xl hover:border-cyan-500/30 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all duration-300 overflow-hidden shadow-sm hover:shadow-md"
                >
                    <div className="flex items-start justify-between gap-3 mb-4">
                        <h4 className="font-display font-bold text-slate-800 dark:text-slate-200 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors line-clamp-3 leading-tight text-sm">
                            {result.title}
                        </h4>
                    </div>
                    
                    <div className="mt-auto flex items-center justify-between border-t border-slate-100 dark:border-white/5 pt-3">
                        <button 
                            onClick={() => handleCopy(result.url)}
                            className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 hover:text-cyan-500 dark:text-slate-500 dark:hover:text-cyan-400 transition-colors uppercase tracking-wider"
                        >
                            {copiedUrl === result.url ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedUrl === result.url ? 'Copied' : 'Copy URL'}</span>
                        </button>

                        <a 
                            href={result.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-[10px] font-bold text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300 transition-colors uppercase tracking-wider"
                        >
                            <span>Visit Site</span>
                            <ExternalLink className="w-3 h-3" />
                        </a>
                    </div>
                </div>
                ))}
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchResults;