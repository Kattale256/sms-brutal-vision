
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

export interface WhatsAppMessage {
  id: string;
  user_id: string;
  phone_number: string;
  message_content: string;
  message_type: string;
  whatsapp_message_id?: string;
  timestamp: string;
  processed: boolean;
  created_at: string;
  updated_at: string;
}

export interface WhatsAppRegistration {
  id: string;
  user_id: string;
  phone_number: string;
  verification_code?: string;
  verified: boolean;
  created_at: string;
  updated_at: string;
}

export const registerWhatsAppNumber = async (
  user: User,
  phoneNumber: string
): Promise<{ success: boolean; error?: any; verificationCode?: string }> => {
  try {
    const { data, error } = await supabase.functions.invoke('whatsapp-register', {
      body: { phone_number: phoneNumber },
      headers: {
        Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
      },
    });

    if (error) {
      console.error('Error registering WhatsApp number:', error);
      return { success: false, error };
    }

    return { 
      success: true, 
      verificationCode: data.verification_code 
    };
  } catch (error) {
    console.error('Error registering WhatsApp number:', error);
    return { success: false, error };
  }
};

export const verifyWhatsAppNumber = async (
  user: User,
  verificationCode: string
): Promise<{ success: boolean; error?: any }> => {
  try {
    const { data, error } = await supabase.functions.invoke('whatsapp-register', {
      body: { verification_code: verificationCode },
      headers: {
        Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
      },
    });

    if (error) {
      console.error('Error verifying WhatsApp number:', error);
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    console.error('Error verifying WhatsApp number:', error);
    return { success: false, error };
  }
};

export const getWhatsAppRegistrationStatus = async (
  user: User
): Promise<{ registered: boolean; verified: boolean; phoneNumber?: string }> => {
  try {
    const { data, error } = await supabase.functions.invoke('whatsapp-register', {
      headers: {
        Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
      },
    });

    if (error) {
      console.error('Error getting registration status:', error);
      return { registered: false, verified: false };
    }

    return {
      registered: data.registered,
      verified: data.verified,
      phoneNumber: data.phone_number
    };
  } catch (error) {
    console.error('Error getting registration status:', error);
    return { registered: false, verified: false };
  }
};

export const getUnprocessedWhatsAppMessages = async (
  user: User
): Promise<WhatsAppMessage[]> => {
  try {
    const { data, error } = await supabase.functions.invoke('whatsapp-process', {
      headers: {
        Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
      },
    });

    if (error) {
      console.error('Error fetching WhatsApp messages:', error);
      return [];
    }

    return data.messages || [];
  } catch (error) {
    console.error('Error fetching WhatsApp messages:', error);
    return [];
  }
};

export const markWhatsAppMessagesAsProcessed = async (
  user: User,
  messageIds: string[]
): Promise<{ success: boolean; error?: any }> => {
  try {
    const { data, error } = await supabase.functions.invoke('whatsapp-process', {
      body: { message_ids: messageIds },
      headers: {
        Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
      },
    });

    if (error) {
      console.error('Error marking messages as processed:', error);
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    console.error('Error marking messages as processed:', error);
    return { success: false, error };
  }
};
