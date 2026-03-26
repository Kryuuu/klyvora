'use client'

import { useState, useEffect } from 'react'
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { use } from 'react'

export default function EditWorkflowPage({ params }) {
  const unwrappedParams = use(params)
  const id = unwrappedParams.id
  
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState(null)
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function loadWorkflow() {
      const { data, error } = await supabase
        .from('workflows')
        .select('*')
        .eq('id', id)
        .single()
        
      if (data) {
        setTitle(data.tittle || '')
        setCategory(data.category || '')
      }
      setFetching(false)
    }
    loadWorkflow()
  }, [id, supabase])

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error: updateError } = await supabase
      .from('workflows')
      .update({ tittle: title, category })
      .eq('id', id)

    if (updateError) {
      setError(updateError.message)
      setLoading(false)
    } else {
      router.push('/workflows')
      router.refresh()
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
      <div className="flex items-center gap-4">
        <Link href="/workflows">
          <button className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Generated Workflow</h1>
          <p className="text-gray-400">Update your AI generated sequence specifics.</p>
        </div>
      </div>

      <Card glow className="p-8 border-[#272737]">
        {fetching ? (
          <div className="flex justify-center p-6"><span className="spinner border-purple-500/30 border-t-purple-500 w-8 h-8"></span></div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}
            
            <Input 
              label="Workflow Title" 
              placeholder="e.g. Invoice Extraction AI"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={100}
            />
            
            <Input 
              label="Category" 
              placeholder="e.g. Invoices, Social Media, Admin"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              maxLength={100}
            />
            
            <div className="pt-4 flex justify-end gap-3">
              <Link href="/workflows">
                <Button type="button" variant="ghost">Cancel</Button>
              </Link>
              <Button type="submit" isLoading={loading}>
                Save Changes
              </Button>
            </div>
          </form>
        )}
      </Card>
      
      {/* Missing complex OCR tools here on purpose, moved to unseen features layer per refactor specs */}
    </div>
  )
}
