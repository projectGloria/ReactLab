// Model ids each cloud provider is called with. electron/main.cjs is the code
// that actually sends them; this table exists so the UI can name the model the
// learner is talking to without every component hardcoding its own copy.
export const CLOUD_MODELS = {
  gemini: 'gemini-3.6-flash',
  groq: 'llama-3.3-70b-versatile',
  openai: 'gpt-4o-mini',
};

export const PROVIDER_LABELS = {
  gemini: 'Google Gemini',
  groq: 'Groq Cloud',
  openai: 'OpenAI',
  ollama: 'Offline Ollama',
};

export function getCloudModel(providerId) {
  return CLOUD_MODELS[providerId] || '';
}
