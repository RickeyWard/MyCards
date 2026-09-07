declare const __VERSION__: string;

interface CustomCard {
  type: string;
  name: string;
  description?: string;
  preview?: boolean;
  documentationURL?: string;
}

interface Window {
  customCards?: CustomCard[];
  loadCardHelpers?: () => Promise<unknown>;
}

declare module "*.json" {
  const value: Record<string, unknown>;
  export default value;
}
