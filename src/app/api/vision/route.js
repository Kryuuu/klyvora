import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req) {
  try {
    // 1. Authenticate Request
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please login.' }, { status: 401 })
    }

    // 2. Access Guard (Pro | Developer | Free Limit: 3)
    const isDeveloper = user.email === (process.env.DEVELOPER_EMAIL || 'admin@klyvora.com')
    let isFreeLimited = false;

    if (!isDeveloper) {
      // Check subscription
      const { data: sub } = await supabase.from('subscriptions').select('plan, status').eq('user_id', user.id).maybeSingle()
      
      if (!sub || sub.plan !== 'pro' || sub.status !== 'active') {
         // Count vision history for free users
         const { count, error: countError } = await supabase.from('vision_history')
             .select('*', { count: 'exact', head: true })
             .eq('user_id', user.id)
             
         if (countError) {
             console.error('[DATABASE SHIELD ERR] Failed querying vision history:', countError)
             // Allow pass if db missing table during migrations, but warn
         } else if (count >= 3) {
             isFreeLimited = true;
         }
      }
    }

    if (isFreeLimited) {
       return NextResponse.json({ 
          error: 'Matrix Cluster Full. Your free tier is limited to 3 Vision arrays. Please upgrade to Pro.' 
       }, { status: 403 })
    }

    const { prompt } = await req.json()

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required for image generation.' }, { status: 400 })
    }

    // 2. Obtain Gemini API Credentials from Environment
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ''

    if (!GEMINI_API_KEY) {
      return NextResponse.json({ 
        error: 'Terminal Error: GEMINI_API_KEY is not configured in environment variables (.env).' 
      }, { status: 500 })
    }

    // 3. Construct payload for Gemini "Nano Banana" (gemini-2.5-flash-image) API
    // Gemini models accept prompt context conventionally via generateContent
    const geminiPayload = {
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt }
          ]
        }
      ]
    }

    console.log(`[NANO BANANA DEBUG] Sending image synthesis to Gemini (flash-image) for user ${user.id}...`)

    // 4. Send Request to Google Generative Language API
    // Pointing directly to the newly branded gemini-2.5-flash-image model
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(geminiPayload)
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error("[NANO BANANA ERROR] API Error Response:", errText)
      throw new Error(`Gemini API Error (${response.status}): ${errText}`)
    }

    const data = await response.json()

    // 5. Parse Output
    // Gemini Image Generation models typically return the image inside inlineData
    // e.g., data.candidates[0].content.parts[0].inlineData.data
    
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error("Gemini returned success but no candidates. Output was blocked or empty.")
    }

    const parts = data.candidates[0]?.content?.parts || []
    let imageBase64 = null
    
    // Scan parts for inlineData containing an image
    for (const part of parts) {
      if (part.inlineData && part.inlineData.data) {
        imageBase64 = part.inlineData.data
        break
      }
    }

    if (!imageBase64) {
      // Fallback if the endpoint returns a raw URI or different schema temporarily
      console.warn("[NANO BANANA WARN] Could not find explicit inlineData. Returning raw output.")
      
      // Still log attempt on fallback success
      if (!isDeveloper) {
          await supabase.from('vision_history').insert([{ user_id: user.id, prompt: `[RAW FALLBACK] ${prompt.substring(0,50)}` }])
      }

      return NextResponse.json({ 
        success: true, 
        isRaw: true,
        rawOutput: data 
      }, { status: 200 })
    }

    // 6. Log successful attempt to Database for Free Users
    if (!isDeveloper) {
      await supabase.from('vision_history').insert([{ user_id: user.id, prompt: prompt.substring(0, 100) }])
    }

    // Return the clean Base64 to Frontend
    return NextResponse.json({ 
      success: true, 
      imageBase64: imageBase64 
    }, { status: 200 })

  } catch (err) {
    console.error('[VISION ROUTE ERROR]', err)
    return NextResponse.json({ error: err.message || 'Unknown server error.' }, { status: 500 })
  }
}
