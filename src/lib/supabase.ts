import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_TOKEN

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
  auth: {
    redirectTo: `${window.location.origin}/auth/callback`,
  },
})

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
      collaboration_requests: {
        Row: {
          id: string
          idea_id: string
          requester_id: string
          recipient_id: string
          requester_email: string
          recipient_email: string
          status: 'pending' | 'accepted' | 'declined'
          message: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          idea_id: string
          requester_id: string
          recipient_id: string
          requester_email: string
          recipient_email: string
          status?: 'pending' | 'accepted' | 'declined'
          message?: string | null
        }
        Update: {
          status?: 'pending' | 'accepted' | 'declined'
          message?: string | null
          updated_at?: string
        }
      }
      shared_ideas: {
        Row: {
          id: string
          idea_id: string
          owner_id: string
          collaborator_id: string
          permission_level: 'read' | 'write'
          created_at: string
        }
        Insert: {
          idea_id: string
          owner_id: string
          collaborator_id: string
          permission_level?: 'read' | 'write'
        }
        Update: {
          permission_level?: 'read' | 'write'
        }
      }
    }
  }
}
