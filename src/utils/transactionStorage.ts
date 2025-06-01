
import { supabase } from '@/integrations/supabase/client';
import { Transaction } from '@/services/sms/types';
import { User } from '@supabase/supabase-js';

export const loadUserTransactions = async (user: User): Promise<Transaction[]> => {
  try {
    const { data, error } = await supabase
      .from('user_transactions')
      .select('transaction_data')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error loading transactions:', error);
      return [];
    }

    if (data && data.length > 0) {
      return data[0].transaction_data as unknown as Transaction[];
    }

    return [];
  } catch (error) {
    console.error('Error loading transactions:', error);
    return [];
  }
};

export const saveUserTransactions = async (
  user: User, 
  transactions: Transaction[]
): Promise<{ success: boolean; error?: any }> => {
  if (transactions.length === 0) {
    return { success: true };
  }

  try {
    const { error } = await supabase
      .from('user_transactions')
      .upsert({
        user_id: user.id,
        transaction_data: transactions as any,
      }, {
        onConflict: 'user_id'
      });

    if (error) {
      console.error('Error saving transactions:', error);
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    console.error('Error saving transactions:', error);
    return { success: false, error };
  }
};
