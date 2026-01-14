/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FIREBASE_APIKEY: string
  readonly VITE_FIREBASE_AUTHDOMAIN: string
  readonly VITE_FIREBASE_PROJECTID: string
  readonly VITE_FIREBASE_STORAGEBUCKET: string
  readonly VITE_FIREBASE_MESSAGINGSENDERID: string
  readonly VITE_FIREBASE_APPID: string
  readonly VITE_FIREBASE_MEASUREMENTID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module "*.yaml" {
  const value: any;
  export default value;
}
