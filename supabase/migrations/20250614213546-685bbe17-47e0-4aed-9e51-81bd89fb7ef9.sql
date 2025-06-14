
-- Create table to store WhatsApp messages
CREATE TABLE public.whatsapp_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  phone_number TEXT NOT NULL,
  message_content TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text', -- text, image, document, etc.
  whatsapp_message_id TEXT UNIQUE,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table to store WhatsApp webhook events
CREATE TABLE public.whatsapp_webhooks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  webhook_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  phone_number TEXT,
  raw_payload JSONB NOT NULL,
  processed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table to store user WhatsApp registrations
CREATE TABLE public.user_whatsapp_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL UNIQUE,
  phone_number TEXT NOT NULL UNIQUE,
  verification_code TEXT,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS) policies
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_whatsapp_registrations ENABLE ROW LEVEL SECURITY;

-- WhatsApp messages policies
CREATE POLICY "Users can view their own WhatsApp messages" 
  ON public.whatsapp_messages 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own WhatsApp messages" 
  ON public.whatsapp_messages 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- WhatsApp registrations policies
CREATE POLICY "Users can view their own WhatsApp registration" 
  ON public.user_whatsapp_registrations 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own WhatsApp registration" 
  ON public.user_whatsapp_registrations 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own WhatsApp registration" 
  ON public.user_whatsapp_registrations 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Webhook policies (admin access only for processing)
CREATE POLICY "Service role can manage webhooks" 
  ON public.whatsapp_webhooks 
  FOR ALL 
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Create indexes for performance
CREATE INDEX idx_whatsapp_messages_user_id ON public.whatsapp_messages(user_id);
CREATE INDEX idx_whatsapp_messages_phone_number ON public.whatsapp_messages(phone_number);
CREATE INDEX idx_whatsapp_messages_processed ON public.whatsapp_messages(processed);
CREATE INDEX idx_whatsapp_webhooks_processed ON public.whatsapp_webhooks(processed);
CREATE INDEX idx_user_whatsapp_registrations_phone ON public.user_whatsapp_registrations(phone_number);
