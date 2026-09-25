const OPENROUTER_BASE = 'https://openrouter.ai/api/v1';

const OPENROUTER_TIMEOUT = 60_000;

type OpenRouterMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

type OpenRouterResponse = {
  id?: string;
  model?: string;
  choices?: Array<{
    message?: {
      role?: string;
      content?: string | null;
    };
  }>;
  error?: {
    message?: string;
    code?: number | string;
    metadata?: unknown;
  };
};

function getFallbackModels(primaryModel: string): string[] {
  const configuredFallbacks =
    process.env.OPENROUTER_FALLBACK_MODELS
      ?.split(',')
      .map((model) => model.trim())
      .filter(Boolean) || [];

  const models = [
    primaryModel,
    ...configuredFallbacks,
  ];

  // Remove duplicates while preserving order.
  return [...new Set(models)];
}

function extractErrorMessage(
  data: OpenRouterResponse | null,
  rawText: string
): string {
  if (data?.error?.message) {
    return data.error.message;
  }

  if (rawText.trim()) {
    return rawText.slice(0, 1000);
  }

  return 'OpenRouter returned an empty response.';
}

export async function generateOpenRouterCompletion(
  model: string,
  prompt: string,
  systemInstruction?: string
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error(
      'OPENROUTER_API_KEY is not configured on the server.'
    );
  }

  if (!model || !model.trim()) {
    throw new Error(
      'No OpenRouter model was configured.'
    );
  }

  if (!prompt || !prompt.trim()) {
    throw new Error(
      'OpenRouter prompt cannot be empty.'
    );
  }

  const models = getFallbackModels(model.trim());

  const messages: OpenRouterMessage[] = [
    ...(systemInstruction
      ? [
          {
            role: 'system' as const,
            content: systemInstruction,
          },
        ]
      : []),

    {
      role: 'user',
      content: prompt,
    },
  ];

  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, OPENROUTER_TIMEOUT);

  try {
    const response = await fetch(
      `${OPENROUTER_BASE}/chat/completions`,
      {
        method: 'POST',

        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',

          // Optional OpenRouter attribution.
          ...(process.env.NEXT_PUBLIC_APP_URL
            ? {
                'HTTP-Referer':
                  process.env.NEXT_PUBLIC_APP_URL,
              }
            : {}),

          'X-Title': 'CreatorPulse',
        },

        body: JSON.stringify({
          /*
           * OpenRouter accepts a `models` array for automatic
           * model fallback.
           *
           * The first model is the requested model.
           * Additional models come from:
           *
           * OPENROUTER_FALLBACK_MODELS
           */
          models,

          messages,

          max_tokens: 1024,

          temperature: 0.7,

          stream: false,
        }),

        signal: controller.signal,
      }
    );

    const rawText = await response.text();

    let data: OpenRouterResponse | null = null;

    if (rawText.trim()) {
      try {
        data = JSON.parse(rawText);
      } catch {
        throw new Error(
          `OpenRouter returned invalid JSON (HTTP ${response.status}): ${rawText.slice(
            0,
            1000
          )}`
        );
      }
    }

    if (!response.ok) {
      throw new Error(
        `OpenRouter error ${response.status}: ${extractErrorMessage(
          data,
          rawText
        )}`
      );
    }

    if (!data) {
      throw new Error(
        'OpenRouter returned an empty response.'
      );
    }

    if (data.error) {
      throw new Error(
        `OpenRouter API error: ${extractErrorMessage(
          data,
          rawText
        )}`
      );
    }

    const content =
      data.choices?.[0]?.message?.content;

    if (typeof content !== 'string') {
      throw new Error(
        `OpenRouter returned no message content. Model: ${
          data.model || model
        }`
      );
    }

    const result = content.trim();

    if (!result) {
      throw new Error(
        `OpenRouter returned an empty message. Model: ${
          data.model || model
        }`
      );
    }

    console.log(
      `[OpenRouter] Success: requested=${model}, used=${
        data.model || 'unknown'
      }`
    );

    return result;
  } catch (error: any) {
    if (error?.name === 'AbortError') {
      throw new Error(
        `OpenRouter request timed out after ${
          OPENROUTER_TIMEOUT / 1000
        } seconds.`
      );
    }

    console.error('[OpenRouter] Request failed:', error);

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}