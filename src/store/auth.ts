import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Profile, UserRole } from '../types';

interface AuthState {
  session: import('@supabase/supabase-js').Session | null;
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  init: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (
    email: string,
    password: string,
    meta: { full_name: string; role: UserRole; agency?: string }
  ) => Promise<{ error: string | null }>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  profile: null,
  loading: true,
  error: null,

  init: async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    set({ session, loading: false });
    if (session) await get().refreshProfile();

    supabase.auth.onAuthStateChange((_event, session) => {
      set({ session });
      (async () => {
        if (session) {
          await get().refreshProfile();
        } else {
          set({ profile: null });
        }
      })();
    });
  },

  refreshProfile: async () => {
    const { session } = get();
    if (!session) return;
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .maybeSingle();
    if (error) {
      set({ error: error.message });
      return;
    }
    set({ profile: data as Profile | null });
  },

  signIn: async (email, password) => {
    set({ error: null });
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      set({ error: error.message });
      return { error: error.message };
    }
    return { error: null };
  },

  signUp: async (email, password, meta) => {
    set({ error: null });
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: meta },
    });
    if (error) {
      set({ error: error.message });
      return { error: error.message };
    }
    if (data.user) {
      await get().refreshProfile();
    }
    return { error: null };
  },

  signInWithGoogle: async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google' });
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, profile: null });
  },

  clearError: () => set({ error: null }),
}));
