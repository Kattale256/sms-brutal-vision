
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
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Get user from request
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (req.method === 'POST') {
      const { phone_number } = await req.json()

      if (!phone_number) {
        return new Response(JSON.stringify({ error: 'Phone number is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Generate verification code
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()

      // Store registration
      const { data, error } = await supabase
        .from('user_whatsapp_registrations')
        .upsert({
          user_id: user.id,
          phone_number: phone_number,
          verification_code: verificationCode,
          verified: false
        }, {
          onConflict: 'user_id'
        })
        .select()

      if (error) {
        console.error('Registration error:', error)
        return new Response(JSON.stringify({ error: 'Failed to register phone number' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      return new Response(JSON.stringify({ 
        message: 'Registration initiated',
        verification_code: verificationCode,
        instructions: `Send the verification code "${verificationCode}" via WhatsApp to complete registration.`
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (req.method === 'PUT') {
      const { verification_code } = await req.json()

      if (!verification_code) {
        return new Response(JSON.stringify({ error: 'Verification code is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Verify the code
      const { data, error } = await supabase
        .from('user_whatsapp_registrations')
        .update({ verified: true })
        .eq('user_id', user.id)
        .eq('verification_code', verification_code)
        .select()

      if (error || !data || data.length === 0) {
        return new Response(JSON.stringify({ error: 'Invalid verification code' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      return new Response(JSON.stringify({ 
        message: 'Phone number verified successfully',
        verified: true
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (req.method === 'GET') {
      // Get current registration status
      const { data, error } = await supabase
        .from('user_whatsapp_registrations')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error) {
        return new Response(JSON.stringify({ registered: false }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      return new Response(JSON.stringify({ 
        registered: true,
        verified: data.verified,
        phone_number: data.phone_number
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Registration error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
