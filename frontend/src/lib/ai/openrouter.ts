import { OpenRouter } from '@openrouter/sdk';

const openRouter = new OpenRouter({
  apiKey: import.meta.env.VITE_OPENROUTER_API_KEY,
});

const MODEL_SLUG =
  (import.meta as any)?.env?.VITE_OPENROUTER_MODEL || 'deepseek/deepseek-chat';

export const getAISuggestions = async (
  userInput: string
): Promise<string | null> => {
  try {
    const completion = await openRouter.chat.send({
      model: MODEL_SLUG,
      messages: [
        {
          role: 'system',
          content: `You are an assistant specialized in life and goal management.
          Always operate in English. If the user input is not in English, translate it internally to English before proceeding.
          Create logical organizational structures and ensure all outputs (including labels) are in English. Return only what is asked for.`,
        },
        {
          role: 'user',
          content: userInput,
        },
      ],
      stream: false,
    });

    const content = completion?.choices?.[0]?.message?.content as unknown;
    let text = '';
    if (Array.isArray(content)) {
      text = content
        .map((item: any) =>
          typeof item === 'string' ? item : item?.text ?? ''
        )
        .join(' ')
        .trim();
    } else if (typeof content === 'string') {
      text = content;
    }
    return text || null;
  } catch (error: any) {
    const msg =
      typeof error === 'string' ? error : error?.message || String(error);
    console.error('Error calling OpenRouter:', msg);
    return null;
  }
};
