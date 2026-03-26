import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    // Auth Validation 
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please login.' }, { status: 401 })
    }

    const { prompt } = await req.json()

    if (!prompt) {
      return NextResponse.json({ error: 'Please provide a goal.' }, { status: 400 })
    }

    // Connect to specific Active Gemini API securely on backend
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini API key is not configured.' }, { status: 500 })
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`
    
    // Secure Master Prompt instructing Gemini to output pure JSON
    const masterPrompt = `
      You are an elite SaaS workflow generation AI.
      User Goal: "${prompt}"
      
      Output ONLY valid JSON matching exactly this structure:
      {
        "title": "A short, professional 2-5 word title for this workflow",
        "tasks": [
           "Actionable step 1",
           "Actionable step 2",
           "Actionable step 3"
        ]
      }
      Do NOT wrap in markdown \`\`\`json. Return strictly the raw JSON object.
    `

    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: masterPrompt }] }],
            generationConfig: {
               responseMimeType: "application/json"
            }
        })
    })

    if (!response.ok) {
       const errJson = await response.json()
       throw new Error(`Google API Error: ${errJson.error?.message || 'Unknown error'}`)
    }

    const aiData = await response.json()
    const contentText = aiData.candidates[0].content.parts[0].text
    
    // Safely parse JSON result
    let output;
    try {
        output = JSON.parse(contentText)
    } catch (parseError) {
        console.error("Gemini failed returning strict JSON:", contentText)
        return NextResponse.json({ error: 'AI output format was invalid.' }, { status: 500 })
    }

    // Validate the schema presence
    if (!output.title || !Array.isArray(output.tasks)) {
        return NextResponse.json({ error: 'AI missed required fields in output.' }, { status: 500 })
    }

    // Return structured payload back to frontend (which handles DB Save)
    return NextResponse.json({ 
       title: output.title, 
       tasks: output.tasks 
    }, { status: 200 })
    
  } catch (error) {
    console.error('AI Backend Route Error:', error)
    return NextResponse.json({ error: error.message || 'Failed to generate workflow securely' }, { status: 500 })
  }
}
