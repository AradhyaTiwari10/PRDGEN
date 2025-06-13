
import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { generatePRD } from '@/lib/gemini'
import { prdGenerationSchema } from '@/lib/validations'
import { Database } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Validate request body
    const body = await request.json()
    const validatedData = prdGenerationSchema.parse(body)
    
    // Generate PRD using Gemini
    const generatedContent = await generatePRD(
      validatedData.idea,
      validatedData.category,
      validatedData.targetAudience
    )
    
    // Extract title from the generated content (first line after "Product Name:")
    let title = 'Untitled PRD'
    const titleMatch = generatedContent.match(/Product Name:\s*(.+)/i)
    if (titleMatch) {
      title = titleMatch[1].trim()
    } else {
      // Fallback: use first few words of the idea
      title = validatedData.idea.split(' ').slice(0, 5).join(' ')
    }
    
    // Save to database
    const { data: prd, error: dbError } = await supabase
      .from('prds')
      .insert({
        user_id: user.id,
        title,
        original_idea: validatedData.idea,
        generated_prd: generatedContent,
        category: validatedData.category,
        status: 'draft',
      })
      .select()
      .single()
    
    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json({ error: 'Failed to save PRD' }, { status: 500 })
    }
    
    return NextResponse.json(prd)
    
  } catch (error) {
    console.error('Error generating PRD:', error)
    
    if (error instanceof Error && error.message.includes('API key')) {
      return NextResponse.json(
        { error: 'AI service configuration error' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to generate PRD' },
      { status: 500 }
    )
  }
}
