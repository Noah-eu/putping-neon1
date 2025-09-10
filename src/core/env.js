export function hasFirebaseEnv(){
  const e = import.meta.env;
  const need = ['VITE_API_KEY','VITE_AUTH_DOMAIN','VITE_DATABASE_URL','VITE_PROJECT_ID','VITE_STORAGE_BUCKET','VITE_MESSAGING_SENDER_ID','VITE_APP_ID'];
  return need.every(k => !!e[k]);
}
export function hasMapbox(){ return !!import.meta.env.VITE_MAPBOX_TOKEN }
// Server-only OpenAI key reader. On client it must return undefined.
export function getOpenAIKey(){
  try{
    if (typeof process !== 'undefined' && process?.env && typeof process.env.OPENAI_API_KEY === 'string') return process.env.OPENAI_API_KEY;
  }catch{}
  return undefined;
}
export function hasOpenAI(){ return !!getOpenAIKey() }
export function mockEnabled(){ return !(hasFirebaseEnv() && hasMapbox()) }
