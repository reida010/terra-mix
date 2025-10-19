declare module 'expo-file-system' {
  export const documentDirectory: string | null;
  export const cacheDirectory: string | null;
  export function getInfoAsync(uri: string): Promise<{ exists: boolean }>;
  export function writeAsStringAsync(uri: string, data: string): Promise<void>;
  export function readAsStringAsync(uri: string): Promise<string>;
}
