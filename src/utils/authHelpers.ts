
import { supabase } from '@/integrations/supabase/client';

export interface SignUpData {
  email: string;
  password: string;
  fullName?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export const signUpUser = async ({ email, password, fullName }: SignUpData) => {
  const redirectUrl = `${window.location.origin}/`;
  
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: redirectUrl,
      data: fullName ? { full_name: fullName } : undefined
    }
  });
  
  return { error };
};

export const signInUser = async ({ email, password }: SignInData) => {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  return { error };
};

export const signOutUser = async () => {
  await supabase.auth.signOut();
};

export const getCurrentSession = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
};
