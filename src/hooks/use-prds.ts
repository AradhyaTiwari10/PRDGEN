import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { PRD } from '@/types'
import { toast } from '@/components/ui/use-toast'
import { useAuth } from './use-auth'

export function usePRDs() {
  const [prds, setPrds] = useState<PRD[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const { user, isAuthenticated } = useAuth()

  const fetchPRDs = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError) throw userError
      if (!user) throw new Error('You must be logged in to view PRDs')

      const { data, error: fetchError } = await supabase
        .from('prds')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      setPrds(data || [])
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch PRDs'))
      toast({
        title: 'Error',
        description: 'Failed to fetch PRDs',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const deletePRD = async (id: string) => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError) {
        console.error('User error:', userError)
        throw userError
      }
      if (!user) {
        console.error('No user found')
        throw new Error('You must be logged in to delete PRDs')
      }

      console.log('Attempting to delete PRD:', id, 'for user:', user.id)

      // First verify the PRD belongs to the user
      const { data: prd, error: fetchError } = await supabase
        .from('prds')
        .select('id, user_id')
        .eq('id', id)
        .single()

      console.log('PRD fetch result:', { prd, fetchError })

      if (fetchError) {
        console.error('Error fetching PRD:', fetchError)
        throw fetchError
      }
      if (!prd) {
        console.error('PRD not found')
        throw new Error('PRD not found')
      }
      if (prd.user_id !== user.id) {
        console.error('User mismatch:', { prdUserId: prd.user_id, currentUserId: user.id })
        throw new Error('You do not have permission to delete this PRD')
      }

      // Then delete it using a direct query
      const { error: deleteError } = await supabase
        .rpc('delete_prd', { prd_id: id })

      console.log('Delete result:', { deleteError })

      if (deleteError) {
        console.error('Error deleting PRD:', deleteError)
        throw deleteError
      }

      // Update local state immediately
      setPrds(prev => prev.filter(prd => prd.id !== id))
      
      toast({
        title: 'Success',
        description: 'PRD deleted successfully',
      })

      // Refresh the list to ensure consistency
      await fetchPRDs()
    } catch (err) {
      console.error('Full error in deletePRD:', err)
      
      // Revert the local state change if the deletion failed
      await fetchPRDs()
      
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to delete PRD',
        variant: 'destructive',
      })
      throw err
    }
  }

  useEffect(() => {
    // Only fetch data if user is authenticated
    if (isAuthenticated && user) {
      fetchPRDs()
    } else {
      // Clear data when user is not authenticated
      setPrds([])
      setLoading(false)
    }
  }, [isAuthenticated, user])

  return { prds, loading, error, refreshPRDs: fetchPRDs, deletePRD }
} 