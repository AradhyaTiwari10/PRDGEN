
import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { prdUpdateSchema } from '@/lib/validations'
import { Database } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    
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
    
    return NextResponse.json(prd)
    
  } catch (error) {
    console.error('Error fetching PRD:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Validate request body
    const body = await request.json()
    const validatedData = prdUpdateSchema.parse(body)
    
    // Update PRD
    const { data: prd, error } = await supabase
      .from('prds')
      .update(validatedData)
      .eq('id', params.id)
      .eq('user_id', user.id)
      .select()
      .single()
    
    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to update PRD' }, { status: 500 })
    }
    
    return NextResponse.json(prd)
    
  } catch (error) {
    console.error('Error updating PRD:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Delete PRD
    const { error } = await supabase
      .from('prds')
      .delete()
      .eq('id', params.id)
      .eq('user_id', user.id)
    
    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to delete PRD' }, { status: 500 })
    }
    
    return NextResponse.json({ success: true })
    
  } catch (error) {
    console.error('Error deleting PRD:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
