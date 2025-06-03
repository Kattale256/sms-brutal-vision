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
  try {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: undefined, // Remove email redirect
        data: fullName ? { full_name: fullName } : undefined
      }
    });
    
    return { error };
  } catch (error) {
    console.error('SignUp helper error:', error);
    return { error };
  }
};

export const signInUser = async ({ email, password }: SignInData) => {
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    return { error };
  } catch (error) {
    console.error('SignIn helper error:', error);
    return { error };
  }
};

export const signOutUser = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('SignOut error:', error);
    }
  } catch (error) {
    console.error('SignOut helper error:', error);
  }
};

export const getCurrentSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Get session error:', error);
      return null;
    }
    return session;
  } catch (error) {
    console.error('Get session helper error:', error);
    return null;
  }
};
