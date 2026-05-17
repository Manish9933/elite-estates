import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// Polyfill atob and btoa for Android/iOS environments
if (typeof atob === 'undefined') {
  global.atob = (input: string) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let str = input.replace(/=+$/, '');
    let output = '';
    for (let bc = 0, bs = 0, buffer, i = 0;
      buffer = str.charAt(i++);
      ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer,
        bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0
    ) {
      buffer = chars.indexOf(buffer);
    }
    return output;
  };
}

if (typeof btoa === 'undefined') {
  global.btoa = (input: string) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let output = '';
    for (let block = 0, charCode, i = 0, map = chars;
      input.charAt(i | 0) || (map = '=', i % 1);
      output += map.charAt(63 & block >> 8 - i % 1 * 8)
    ) {
      charCode = input.charCodeAt(i += 3 / 4);
      if (charCode > 0xFF) {
        throw new Error("'btoa' failed: The string to be encoded contains characters outside of the Latin1 range.");
      }
      block = block << 8 | charCode;
    }
    return output;
  };
}

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing! Check your .env file and ensure they start with EXPO_PUBLIC_');
}

const ExpoSecureStoreAdapter = {
  getItem: async (key: string) => {
    try {
      const value = await SecureStore.getItemAsync(key);
      if (!value) return null;
      
      // If it's a chunked pointer, reconstruct the full value
      if (value.startsWith('chunked:')) {
        const totalChunks = parseInt(value.split(':')[1], 10);
        let fullValue = '';
        for (let i = 0; i < totalChunks; i++) {
          const chunk = await SecureStore.getItemAsync(`${key}_chunk_${i}`);
          fullValue += chunk || '';
        }
        return fullValue;
      }
      
      return value;
    } catch (e) {
      return null;
    }
  },
  setItem: async (key: string, value: string) => {
    try {
      // 2048 is the limit on Android. We use 2000 for safety.
      if (value.length < 2000) {
        return await SecureStore.setItemAsync(key, value);
      }
      
      const chunkSize = 2000;
      const chunks = [];
      for (let i = 0; i < value.length; i += chunkSize) {
        chunks.push(value.substring(i, i + chunkSize));
      }
      
      // Store pointer and then chunks
      await SecureStore.setItemAsync(key, `chunked:${chunks.length}`);
      for (let i = 0; i < chunks.length; i++) {
        await SecureStore.setItemAsync(`${key}_chunk_${i}`, chunks[i]);
      }
    } catch (e) {
      console.error('SecureStore error:', e);
    }
  },
  removeItem: async (key: string) => {
    try {
      const value = await SecureStore.getItemAsync(key);
      if (value?.startsWith('chunked:')) {
        const totalChunks = parseInt(value.split(':')[1], 10);
        for (let i = 0; i < totalChunks; i++) {
          await SecureStore.deleteItemAsync(`${key}_chunk_${i}`);
        }
      }
      return await SecureStore.deleteItemAsync(key);
    } catch (e) {
      return;
    }
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});


