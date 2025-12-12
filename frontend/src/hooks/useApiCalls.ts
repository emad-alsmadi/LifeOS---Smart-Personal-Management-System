import { useCallback } from 'react';
import { getStructureSuggestions } from '@lib/ai';
import { parseAIStructure } from '@lib/ai/aiParsing';

export interface AIStructureSuggestion {
  templateName?: string;
  name?: string;
  levels: string[];
}

export function useApiCalls() {
  const suggestStructure = useCallback(
    async (prompt: string): Promise<AIStructureSuggestion | null> => {
      const raw = await getStructureSuggestions(prompt);
      const parsed = parseAIStructure(raw);
      if (!parsed) {
        if (
          import.meta.env &&
          (import.meta as any).env &&
          (import.meta as any).env.DEV
        ) {
          console.debug('AI raw response:', raw);
        }
        return null;
      }
      if (Array.isArray(parsed.levels) && parsed.levels.length) {
        const levels: string[] = parsed.levels
          .map((v: any) =>
            typeof v === 'string'
              ? v
              : typeof v === 'number'
              ? String(v)
              : v && typeof v === 'object' && 'name' in v
              ? String((v as any).name)
              : ''
          )
          .map((s: string) => s.trim())
          .filter(Boolean)
          .slice(0, 6);
        if (levels.length) {
          return {
            templateName: parsed.templateName,
            name: parsed.name || parsed.templateName,
            levels,
          };
        }
      }
      return null;
    },
    []
  );

  return { suggestStructure };
}
