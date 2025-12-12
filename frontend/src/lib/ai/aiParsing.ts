export const parseAIStructure = (aiText: string) => {
  try {
    if (!aiText) return null;
    const text = String(aiText);
    const fenceMatch = text.match(/```(?:json|JSON)?\s*([\s\S]*?)```/);
    let candidate = fenceMatch && fenceMatch[1] ? fenceMatch[1] : text;
    if (!fenceMatch) {
      const findBalanced = (s: string, open: string, close: string) => {
        const start = s.indexOf(open);
        if (start === -1) return null;
        let depth = 0;
        let inStr = false;
        let strCh = '';
        for (let i = start; i < s.length; i++) {
          const ch = s[i];
          const prev = s[i - 1];
          if (inStr) {
            if (ch === strCh && prev !== '\\') inStr = false;
          } else {
            if (ch === '"' || ch === "'") {
              inStr = true;
              strCh = ch;
            } else if (ch === open) {
              depth++;
            } else if (ch === close) {
              depth--;
              if (depth === 0) return s.slice(start, i + 1);
            }
          }
        }
        return null;
      };
      candidate = findBalanced(text, '{', '}') || findBalanced(text, '[', ']') || candidate;
    }
    candidate = candidate.replace(/^[\s`]+|[\s`]+$/g, '');
    candidate = candidate.replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"');
    candidate = candidate.replace(/,\s*([}\]])/g, '$1');
    return JSON.parse(candidate);
  } catch (error) {
    console.error('Error parsing AI structure:', error);
    return null;
  }
};
