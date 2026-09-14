const OLLAMA_BASE = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
export async function generateOllamaCompletion(model: string, prompt: string, systemInstruction?: string) {
  const res = await fetch(`${OLLAMA_BASE}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      prompt,
      system: systemInstruction,
      stream: false,
      options: { temperature: 0.7, top_p: 0.9 },
    }),
  });
  if (!res.ok) throw new Error(`Ollama error: ${res.status}`);
  const data = await res.json();
  return data.response || '';
}
