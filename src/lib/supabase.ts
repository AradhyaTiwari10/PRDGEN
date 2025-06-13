import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      prds: {
        Row: {
          id: string
          user_id: string
          title: string
          original_idea: string
          generated_prd: string
          category: string | null
          status: 'draft' | 'final' | 'archived'
          is_favorite: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          title: string
          original_idea: string
          generated_prd: string
          category?: string
          status?: 'draft' | 'final' | 'archived'
          is_favorite?: boolean
        }
        Update: {
          title?: string
          generated_prd?: string
          category?: string
          status?: 'draft' | 'final' | 'archived'
          is_favorite?: boolean
        }
      }
      idea_conversations: {
        Row: {
          id: string
          idea_id: string
          user_id: string
          message: string
          role: 'user' | 'assistant'
          created_at: string
        }
        Insert: {
          idea_id: string
          user_id: string
          message: string
          role: 'user' | 'assistant'
        }
        Update: {
          message?: string
          role?: 'user' | 'assistant'
        }
      }
    }
  }
}
