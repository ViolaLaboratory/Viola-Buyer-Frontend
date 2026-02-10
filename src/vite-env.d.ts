/// <reference types="vite/client" />

declare module "*.mp4" {
  const src: string;
  export default src;
}

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_CHATBOT_API_URL: string;
  readonly VITE_CLAP_API_URL: string;
  readonly VITE_CHROMA_API_KEY: string;
  readonly VITE_CHROMA_TENANT: string;
  readonly VITE_CHROMA_DATABASE: string;
  readonly VITE_CHROMA_COLLECTION_NAME: string;
  readonly VITE_MONGODB_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
