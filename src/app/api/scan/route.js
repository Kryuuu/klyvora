import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    // Auth Validation
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { mediaUrl, type, workflowId } = await req.json()

    if (!mediaUrl || !workflowId) {
      return NextResponse.json({ error: 'Source media or workflow ID missing' }, { status: 400 })
    }

    // AI SIMULATION: Simulate delay
    await new Promise(resolve => setTimeout(resolve, 2500))

    let generatedInsight = ''
    let proposedTaskTitle = ''

    if (type === 'youtube') {
      generatedInsight = `[YouTube Scan Report]\n\nTarget Video: ${mediaUrl}\n\nKey Topics Detected:\n• Intro to AI Automations\n• Setting up Webhooks\n• Database Triggers\n\nActionable Extract:\n"Ensure webhook endpoints are secured with a token header before deployment."\n\nSuggested Task: Add security check step to workflow.`
      proposedTaskTitle = `Review YouTube Extract for Workflow Automation`
    } else {
      generatedInsight = `[Vision/Document Extraction]\n\nFile Path: ${mediaUrl}\nConfidence Score: 0.98\n\nParsed Content:\nInvoice #INV-204892\nDate: Oct 12, 2026\nVendor: Vercel Inc.\nAmount Due: $150.00\n\nAI Suggestion: Ready to map these variables to your active workflow "${workflowId}".`
      proposedTaskTitle = `Verify Extracted Values (Invoice #INV-204892)`
    }

    // INTEGRATION PHASE 3: Automatically insert a smart Task based on AI findings!
    const { error: taskError } = await supabase
      .from('tasks')
      .insert([
        { 
          workflow_id: workflowId,
          tittle: proposedTaskTitle,
          status: 'todo'
        }
      ])
      
    if (taskError) {
      console.warn("Could not insert automated task to DB:", taskError.message)
      // We don't fail the scan if task fails, but in production we might handle it strictly
    } else {
      // Append success notification to the insight text
      generatedInsight += `\n\n✅ KlyVora Engine generated a new pending task: "${proposedTaskTitle}" in your Tasks Dashboard.`
    }

    return NextResponse.json({ data: generatedInsight }, { status: 200 })
    
  } catch (error) {
    console.error('Scanner Route Error:', error)
    return NextResponse.json(
      { error: 'Failed to process AI extraction on this media' }, 
      { status: 500 }
    )
  }
}
