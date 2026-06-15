import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { blink } from '@/blink/client'
import { Injection } from '@/types'
import { toast } from '@blinkdotnew/ui'

export function useInjections() {
  const queryClient = useQueryClient()

  const injectionsQuery = useQuery({
    queryKey: ['injections'],
    queryFn: async () => {
      const data = await blink.db.injections.list({
        orderBy: { date: 'desc' }
      })
      return data as Injection[]
    }
  })

  const addInjectionMutation = useMutation({
    mutationFn: async (injection: Omit<Injection, 'id' | 'createdAt'>) => {
      return await blink.db.injections.create(injection)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['injections'] })
      toast.success('Injection logged successfully')
    }
  })

  const updateInjectionMutation = useMutation({
    mutationFn: async ({ id, ...data }: Partial<Injection> & { id: string }) => {
      return await blink.db.injections.update(id, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['injections'] })
      toast.success('Injection updated')
    }
  })

  const deleteInjectionMutation = useMutation({
    mutationFn: async (id: string) => {
      return await blink.db.injections.delete(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['injections'] })
      toast.success('Injection deleted')
    }
  })

  return {
    injections: injectionsQuery.data || [],
    isLoading: injectionsQuery.isLoading,
    addInjection: addInjectionMutation.mutate,
    updateInjection: updateInjectionMutation.mutate,
    deleteInjection: deleteInjectionMutation.mutate
  }
}
