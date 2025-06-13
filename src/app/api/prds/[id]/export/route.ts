
import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'markdown'
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Get specific PRD
    const { data: prd, error } = await supabase
      .from('prds')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()
    
    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'PRD not found' }, { status: 404 })
    }
    
    // Prepare export content
    let content = ''
    let contentType = ''
    let fileExtension = ''
    
    if (format === 'markdown') {
      content = `# ${prd.title}\n\n## Original Idea\n\n${prd.original_idea}\n\n## Product Requirements Document\n\n${prd.generated_prd}`
      contentType = 'text/markdown'
      fileExtension = 'md'
    } else {
      // Plain text format
      content = `${prd.title}\n\nOriginal Idea:\n${prd.original_idea}\n\nProduct Requirements Document:\n${prd.generated_prd}`
      contentType = 'text/plain'
      fileExtension = 'txt'
    }
    
    return new NextResponse(content, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${prd.title}.${fileExtension}"`,
      },
    })
    
  } catch (error) {
    console.error('Error exporting PRD:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
