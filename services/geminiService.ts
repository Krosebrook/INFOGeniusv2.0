/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { GoogleGenAI, Modality } from "@google/genai";
import { ComplexityLevel, VisualStyle, ResearchResult, SearchResultItem, Language, ImageQuality, AspectRatio } from "../types";
import { logError } from "./errorService";

// Create a fresh client for every request to ensure the latest API key from process.env.API_KEY is used
const getAi = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

// Models
const TEXT_MODEL = 'gemini-3-pro-preview';
const IMAGE_MODEL = 'gemini-3-pro-image-preview';
const AUDIO_MODEL = 'gemini-2.5-flash-preview-tts';

const getLevelInstruction = (level: ComplexityLevel): string => {
  switch (level) {
    case 'Elementary':
      return "Target Audience: Elementary School (Ages 6-10). Style: Bright, simple, fun. Use large clear icons and very minimal text labels.";
    case 'High School':
      return "Target Audience: High School. Style: Standard Textbook. Clean lines, clear labels, accurate maps or diagrams. Avoid cartoony elements.";
    case 'College':
      return "Target Audience: University. Style: Academic Journal. High detail, data-rich, precise cross-sections or complex schematics.";
    case 'Expert':
      return "Target Audience: Industry Expert. Style: Technical Blueprint/Schematic. Extremely dense detail, monochrome or technical coloring, precise annotations.";
    default:
      return "Target Audience: General Public. Style: Clear and engaging.";
  }
};

const getStyleInstruction = (style: VisualStyle): string => {
  switch (style) {
    case 'Minimalist': return "Aesthetic: Bauhaus Minimalist. Flat vector art, limited color palette (2-3 colors), reliance on negative space and simple geometric shapes.";
    case 'Realistic': return "Aesthetic: Photorealistic Composite. Cinematic lighting, 8k resolution, highly detailed textures. Looks like a photograph.";
    case 'Cartoon': return "Aesthetic: Educational Comic. Vibrant colors, thick outlines, expressive cel-shaded style.";
    case 'Vintage': return "Aesthetic: 19th Century Scientific Lithograph. Engraving style, sepia tones, textured paper background, fine hatch lines.";
    case 'Futuristic': return "Aesthetic: Cyberpunk HUD. Glowing neon blue/cyan lines on dark background, holographic data visualization, 3D wireframes.";
    case '3D Render': return "Aesthetic: 3D Isometric Render. Claymorphism or high-gloss plastic texture, studio lighting, soft shadows, looks like a physical model.";
    case 'Sketch': return "Aesthetic: Da Vinci Notebook. Ink on parchment sketch, handwritten annotations style, rough but accurate lines.";
    case 'Pixel Art': return "Aesthetic: 8-bit Pixel Art. Retro video game style, limited color palette, blocky pixels, sharp edges, nostalgic feel.";
    case 'Origami': return "Aesthetic: Paper folded art. Sharp creases, soft paper textures, simple geometric shapes, physical depth of field.";
    case 'Watercolor': return "Aesthetic: Soft Watercolor. Bleeding colors, paper texture, artistic and fluid, soft edges, pastel palette.";
    case 'Neon': return "Aesthetic: Neon Light Sign. Glowing tubes on black background, high contrast, vibrant saturated colors, electric feel.";
    case 'Flat Art': return "Aesthetic: Corporate Memphis / Flat Design. Solid colors, no gradients, clean vectors, playful proportions.";
    default: return "Aesthetic: High-quality digital scientific illustration. Clean, modern, highly detailed.";
  }
};

export const researchTopicForPrompt = async (
  topic: string, 
  level: ComplexityLevel, 
  style: VisualStyle,
  language: Language
): Promise<ResearchResult> => {
  try {
    const levelInstr = getLevelInstruction(level);
    const styleInstr = getStyleInstruction(style);

    const systemPrompt = `
      You are an expert visual researcher.
      Your goal is to research the topic: "${topic}" and create a plan for an infographic.
      
      **IMPORTANT: Use the Google Search tool to find the most accurate, up-to-date information about this topic.**
      
      Context:
      ${levelInstr}
      ${styleInstr}
      Language: ${language}
      
      Please provide your response in the following format EXACTLY:
      
      FACTS:
      - [Fact 1]
      - [Fact 2]
      - [Fact 3]
      - [Fact 4]
      - [Fact 5]

      SUGGESTIONS:
      - [Related Topic 1]
      - [Related Topic 2]
      - [Related Topic 3]
      
      IMAGE_PROMPT:
      [A highly detailed image generation prompt describing the visual composition, colors, and layout for the infographic. Do not include citations in the prompt.]
    `;

    const response = await getAi().models.generateContent({
      model: TEXT_MODEL,
      contents: systemPrompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "";
    
    // Refined Regex to handle markdown bolding or slight format variations
    const factsMatch = text.match(/(?:\*\*|\#\#)?\s*FACTS:?\s*(?:\*\*|\#\#)?\s*([\s\S]*?)(?=(?:\*\*|\#\#)?\s*SUGGESTIONS:|(?:\*\*|\#\#)?\s*IMAGE_PROMPT:|$)/i);
    const factsRaw = factsMatch ? factsMatch[1].trim() : "";
    const facts = factsRaw.split('\n')
      .map(f => f.replace(/^[-*•]\s*/, '').trim()) // Handle bullets like -, *, •
      .filter(f => f.length > 0)
      .slice(0, 5);

    const suggestionsMatch = text.match(/(?:\*\*|\#\#)?\s*SUGGESTIONS:?\s*(?:\*\*|\#\#)?\s*([\s\S]*?)(?=(?:\*\*|\#\#)?\s*IMAGE_PROMPT:|$)/i);
    const suggestionsRaw = suggestionsMatch ? suggestionsMatch[1].trim() : "";
    const suggestions = suggestionsRaw.split('\n')
      .map(s => s.replace(/^[-*•]\s*/, '').trim())
      .filter(s => s.length > 0 && s.length < 60) // Basic filtering
      .slice(0, 3);

    const promptMatch = text.match(/(?:\*\*|\#\#)?\s*IMAGE_PROMPT:?\s*(?:\*\*|\#\#)?\s*([\s\S]*?)$/i);
    const imagePrompt = promptMatch ? promptMatch[1].trim() : `Create a detailed infographic about ${topic}. ${levelInstr} ${styleInstr}`;

    // Extract Grounding (Search Results)
    const searchResults: SearchResultItem[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    
    if (chunks) {
      chunks.forEach(chunk => {
        if (chunk.web?.uri && chunk.web?.title) {
          searchResults.push({
            title: chunk.web.title,
            url: chunk.web.uri
          });
        }
      });
    }

    // Remove duplicates based on URL
    const uniqueResults = Array.from(new Map(searchResults.map(item => [item.url, item])).values());

    return {
      imagePrompt: imagePrompt,
      facts: facts,
      searchResults: uniqueResults,
      suggestions: suggestions
    };
  } catch (e) {
    logError(e, 'GeminiService.researchTopicForPrompt');
    throw e;
  }
};

export const generateNarration = async (text: string, language: Language): Promise<string> => {
  try {
    const response = await getAi().models.generateContent({
      model: AUDIO_MODEL,
      contents: {
        parts: [{ text: `Read these facts clearly: ${text}` }]
      },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      }
    });

    const part = response.candidates?.[0]?.content?.parts?.[0];
    if (part && part.inlineData && part.inlineData.data) {
      return part.inlineData.data;
    }
    throw new Error("Failed to generate audio content.");
  } catch (e) {
    logError(e, 'GeminiService.generateNarration');
    throw e;
  }
};

export const generateInfographicImage = async (prompt: string, quality: ImageQuality = '1K', aspectRatio: AspectRatio = '1:1'): Promise<string> => {
  try {
    const response = await getAi().models.generateContent({
      model: IMAGE_MODEL,
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        responseModalities: [Modality.IMAGE],
        imageConfig: {
          imageSize: quality,
          aspectRatio: aspectRatio
        }
      }
    });

    const part = response.candidates?.[0]?.content?.parts?.[0];
    if (part && part.inlineData && part.inlineData.data) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
    throw new Error("Failed to generate image content.");
  } catch (e) {
    logError(e, 'GeminiService.generateInfographicImage');
    throw e;
  }
};

export const editInfographicImage = async (currentImageBase64: string, editInstruction: string, quality: ImageQuality = '1K', aspectRatio: AspectRatio = '1:1'): Promise<string> => {
  try {
    const cleanBase64 = currentImageBase64.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');
    
    const response = await getAi().models.generateContent({
      model: IMAGE_MODEL,
      contents: {
        parts: [
           { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } },
           { text: editInstruction }
        ]
      },
      config: {
        responseModalities: [Modality.IMAGE],
        imageConfig: {
          imageSize: quality,
          aspectRatio: aspectRatio
        }
      }
    });
    
     const part = response.candidates?.[0]?.content?.parts?.[0];
    if (part && part.inlineData && part.inlineData.data) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
    throw new Error("Failed to edit image content.");
  } catch (e) {
    logError(e, 'GeminiService.editInfographicImage');
    throw e;
  }
};