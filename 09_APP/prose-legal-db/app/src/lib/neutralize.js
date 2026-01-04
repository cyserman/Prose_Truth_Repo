/**
 * Text Neutralization
 * 
 * Converts emotional phrasing → neutral phrasing (separate field).
 * 
 * CRITICAL ARCHITECTURAL RULES:
 * 1. original_text is NEVER modified (immutable)
 * 2. neutral_text is stored as a SEPARATE field
 * 3. AI is OPTIONAL - app must work without it
 * 4. AI output is stored with provenance (neutralized_by, neutralized_at, model_used)
 * 5. Human can always override AI neutralization
 */

const DEFAULT_MODEL = 'gemini-flash-latest';
const GEMINI_KEY = import.meta?.env?.VITE_GEMINI_API_KEY || '';
const GEMINI_MODEL = import.meta?.env?.VITE_GEMINI_MODEL || DEFAULT_MODEL;

/**
 * Neutralization result with provenance
 */
export type NeutralizationResult = {
  neutral_text: string;
  neutralized_by: 'human' | 'ai';
  neutralized_at: string;
  model_used?: string;
  prompt_version?: string;
};

/**
 * Check if AI neutralization is available
 */
export function isAIAvailable(): boolean {
  return !!GEMINI_KEY;
}

/**
 * Rules-based neutralization (deterministic, no AI required)
 * 
 * Simple pattern replacements for common emotional phrases.
 * This is a fallback when AI is disabled.
 */
export function rulesBasedNeutralize(text: string): string {
  if (!text) return '';
  
  let neutralized = text;
  
  // Common emotional → neutral patterns
  const patterns = [
    // Accusations → neutral statements
    [/she\s+refused/gi, 'the request was declined'],
    [/he\s+refused/gi, 'the request was declined'],
    [/they\s+refused/gi, 'the request was declined'],
    [/she\s+won't/gi, 'access was not provided'],
    [/he\s+won't/gi, 'access was not provided'],
    [/they\s+won't/gi, 'access was not provided'],
    
    // Emotional reactions → neutral observations
    [/i\s+was\s+angry/gi, 'concern was expressed'],
    [/i\s+was\s+frustrated/gi, 'concern was expressed'],
    [/i\s+was\s+upset/gi, 'concern was expressed'],
    
    // Accusatory language → neutral facts
    [/she\s+lied/gi, 'the statement was inconsistent'],
    [/he\s+lied/gi, 'the statement was inconsistent'],
    [/they\s+lied/gi, 'the statement was inconsistent'],
  ];
  
  for (const [pattern, replacement] of patterns) {
    neutralized = neutralized.replace(pattern, replacement);
  }
  
  return neutralized.trim();
}

/**
 * AI-powered neutralization using Gemini API
 * 
 * @param {string} originalText - Original emotional text
 * @param {string} context - Optional context (date, event type, etc.)
 * @returns {Promise<NeutralizationResult>} Neutralized text with provenance
 */
export async function aiNeutralize(
  originalText: string,
  context?: string
): Promise<NeutralizationResult> {
  if (!GEMINI_KEY) {
    throw new Error('AI neutralization requires VITE_GEMINI_API_KEY environment variable');
  }
  
  const systemPrompt = `You are a legal document assistant. Convert emotional or accusatory language into neutral, court-ready statements. Preserve all factual content. Do not add information not present in the original. Do not remove important details.`;
  
  const userPrompt = context
    ? `Context: ${context}\n\nOriginal text: ${originalText}\n\nConvert to neutral, court-ready language:`
    : `Convert this text to neutral, court-ready language:\n\n${originalText}`;
  
  const model = GEMINI_MODEL || DEFAULT_MODEL;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    model
  )}:generateContent?key=${encodeURIComponent(GEMINI_KEY)}`;
  
  const body = {
    contents: [
      {
        role: 'user',
        parts: [
          { text: `SYSTEM:\n${systemPrompt}\n\n` },
          { text: userPrompt },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 650,
    },
  };
  
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${errorText}`);
  }
  
  const data = await res.json();
  const neutralText =
    data?.candidates?.[0]?.content?.parts
      ?.map(p => p?.text)
      .filter(Boolean)
      .join('') || '';
  
  return {
    neutral_text: neutralText.trim() || originalText,
    neutralized_by: 'ai',
    neutralized_at: new Date().toISOString(),
    model_used: model,
    prompt_version: '1.0',
  };
}

/**
 * Neutralize text (with AI if available, otherwise rules-based)
 * 
 * @param {string} originalText - Original text
 * @param {object} options - Options
 * @param {boolean} options.useAI - Force AI usage (default: auto-detect)
 * @param {string} options.context - Optional context
 * @returns {Promise<NeutralizationResult>} Neutralized text with provenance
 */
export async function neutralize(
  originalText: string,
  options: { useAI?: boolean; context?: string } = {}
): Promise<NeutralizationResult> {
  const { useAI, context } = options;
  
  // If AI is requested and available, use it
  if (useAI && isAIAvailable()) {
    try {
      return await aiNeutralize(originalText, context);
    } catch (error) {
      console.warn('AI neutralization failed, falling back to rules-based:', error);
      // Fall through to rules-based
    }
  }
  
  // Rules-based neutralization (always available)
  return {
    neutral_text: rulesBasedNeutralize(originalText),
    neutralized_by: 'human',
    neutralized_at: new Date().toISOString(),
  };
}

