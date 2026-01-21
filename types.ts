/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
export type AspectRatio = '16:9' | '9:16' | '1:1' | '4:3' | '3:4';

export type ComplexityLevel = 'Elementary' | 'High School' | 'College' | 'Expert';

export type VisualStyle = 
  | 'Default' 
  | 'Minimalist' 
  | 'Realistic' 
  | 'Cartoon' 
  | 'Vintage' 
  | 'Futuristic' 
  | '3D Render' 
  | 'Sketch'
  | 'Pixel Art'
  | 'Origami'
  | 'Watercolor'
  | 'Neon'
  | 'Flat Art'
  | 'Isometric'
  | 'Low Poly'
  | 'Pop Art'
  | 'Steampunk'
  | 'Ukiyo-e'
  | 'Graffiti'
  | 'Noir'
  | 'Stained Glass'
  | 'Claymation'
  | 'Blueprint'
  | 'Oil Painting'
  | 'Art Deco'
  | 'Psychedelic'
  | 'Papercut';

export type Language = 'English' | 'Spanish' | 'French' | 'German' | 'Mandarin' | 'Japanese' | 'Hindi' | 'Arabic' | 'Portuguese' | 'Russian';

export type ImageQuality = '1K' | '2K' | '4K';

export interface GeneratedImage {
  id: string;
  data: string; // Base64 data URL
  prompt: string;
  timestamp: number;
  level?: ComplexityLevel;
  style?: VisualStyle;
  language?: Language;
  quality?: ImageQuality;
  // Fixed: Added missing aspectRatio property to resolve TypeScript errors in App.tsx
  aspectRatio?: AspectRatio;
  relatedTopics?: string[];
  facts?: string[]; // New: Store the researched facts
  audioUrl?: string;
  parentImageId?: string;
  batchId?: string; // New: Group ID for multiple variations generated together
}

export interface SearchResultItem {
  title: string;
  url: string;
}

export interface ResearchResult {
  imagePrompt: string;
  facts: string[];
  searchResults: SearchResultItem[];
  suggestions: string[];
}