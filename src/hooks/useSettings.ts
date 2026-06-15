import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { blink } from '@/blink/client'
import { Settings, Macros } from '@/types'

const SETTINGS_ID = 'user_settings'

export function useSettings() {
  const queryClient = useQueryClient()

  const settingsQuery = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      let data = await blink.db.settings.get(SETTINGS_ID)
      if (!data) {
        data = await blink.db.settings.create({
          id: SETTINGS_ID,
          theme: 'dark',
          bodyMapGender: 'female'
        })
      }
      return data as Settings
    }
  })

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: Partial<Settings>) => {
      return await blink.db.settings.update(SETTINGS_ID, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
    }
  })

  const updateMacrosMutation = useMutation({
    mutationFn: async (macros: Macros) => {
      return await blink.db.settings.update(SETTINGS_ID, {
        macros: JSON.stringify(macros)
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
    }
  })

  return {
    settings: settingsQuery.data,
    isLoading: settingsQuery.isLoading,
    updateSettings: updateSettingsMutation.mutate,
    updateMacros: updateMacrosMutation.mutate
  }
}
