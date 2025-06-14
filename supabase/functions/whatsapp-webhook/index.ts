
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    if (req.method === 'POST') {
      const payload = await req.json()
      console.log('WhatsApp webhook received:', JSON.stringify(payload, null, 2))

      // Store the raw webhook payload
      const { error: webhookError } = await supabase
        .from('whatsapp_webhooks')
        .insert({
          webhook_id: payload.entry?.[0]?.id || crypto.randomUUID(),
          event_type: payload.object || 'unknown',
          phone_number: payload.entry?.[0]?.changes?.[0]?.value?.metadata?.phone_number_id,
          raw_payload: payload,
          processed: false
        })

      if (webhookError) {
        console.error('Error storing webhook:', webhookError)
        return new Response(JSON.stringify({ error: 'Failed to store webhook' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Process incoming messages
      if (payload.entry?.[0]?.changes?.[0]?.value?.messages) {
        const messages = payload.entry[0].changes[0].value.messages
        const metadata = payload.entry[0].changes[0].value.metadata

        for (const message of messages) {
          // Find user by phone number
          const { data: registration } = await supabase
            .from('user_whatsapp_registrations')
            .select('user_id')
            .eq('phone_number', message.from)
            .eq('verified', true)
            .single()

          if (registration) {
            // Store the message
            const { error: messageError } = await supabase
              .from('whatsapp_messages')
              .insert({
                user_id: registration.user_id,
                phone_number: message.from,
                message_content: message.text?.body || message.type,
                message_type: message.type,
                whatsapp_message_id: message.id,
                timestamp: new Date(parseInt(message.timestamp) * 1000).toISOString(),
                processed: false
              })

            if (messageError) {
              console.error('Error storing message:', messageError)
            } else {
              console.log('Message stored successfully for user:', registration.user_id)
            }
          } else {
            console.log('No verified registration found for phone number:', message.from)
          }
        }
      }

      // Respond with 200 to acknowledge receipt
      return new Response(JSON.stringify({ status: 'received' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Handle webhook verification (GET request)
    if (req.method === 'GET') {
      const url = new URL(req.url)
      const mode = url.searchParams.get('hub.mode')
      const token = url.searchParams.get('hub.verify_token')
      const challenge = url.searchParams.get('hub.challenge')

      const verifyToken = Deno.env.get('WHATSAPP_VERIFY_TOKEN') || 'your_verify_token'

      if (mode === 'subscribe' && token === verifyToken) {
        console.log('Webhook verified successfully')
        return new Response(challenge, {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
        })
      } else {
        console.log('Webhook verification failed')
        return new Response('Forbidden', {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
        })
      }
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
