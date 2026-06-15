import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { blink } from '@/blink/client'
import { Peptide } from '@/types'

export function usePeptides() {
  const queryClient = useQueryClient()

  const peptidesQuery = useQuery({
    queryKey: ['peptides'],
    queryFn: async () => {
      const data = await blink.db.peptides.list({
        orderBy: { name: 'asc' }
      })
      return data as Peptide[]
    }
  })

  const toggleFavoriteMutation = useMutation({
    mutationFn: async ({ id, isFavorite }: { id: string, isFavorite: boolean }) => {
      return await blink.db.peptides.update(id, {
        isFavorite: isFavorite ? '1' : '0'
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['peptides'] })
    }
  })

  return {
    peptides: peptidesQuery.data || [],
    isLoading: peptidesQuery.isLoading,
    toggleFavorite: toggleFavoriteMutation.mutate
  }
}

export function usePeptide(id: string) {
  return useQuery({
    queryKey: ['peptides', id],
    queryFn: async () => {
      const data = await blink.db.peptides.get(id)
      return data as Peptide
    },
    enabled: !!id
  })
}
