import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { 
  Button, 
  Input, 
  Label, 
  Select, 
  SelectTrigger, 
  SelectValue, 
  SelectContent, 
  SelectItem,
  Textarea
} from '@blinkdotnew/ui'
import { usePeptides } from '@/hooks/usePeptides'
import { Injection } from '@/types'

const schema = z.object({
  peptideId: z.string().min(1, 'Please select a peptide'),
  doseAmount: z.number().min(0.1, 'Dose required'),
  doseUnit: z.enum(['mcg', 'mg']),
  site: z.string().min(1, 'Please select a site'),
  notes: z.string().optional()
})

type FormData = z.infer<typeof schema>

interface Props {
  initialData?: Injection
  onSuccess: () => void
  onSubmit: (data: FormData) => void
}

const SITES = [
  'abdomen-left', 'abdomen-right', 'abdomen-center',
  'thigh-left', 'thigh-right',
  'glute-left', 'glute-right',
  'arm-left', 'arm-right'
]

export function InjectionForm({ initialData, onSuccess, onSubmit }: Props) {
  const { peptides } = usePeptides()
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: initialData ? {
      peptideId: initialData.peptideId,
      doseAmount: initialData.doseAmount,
      doseUnit: initialData.doseUnit,
      site: initialData.site,
      notes: initialData.notes
    } : {
      doseUnit: 'mcg',
      site: 'abdomen-left'
    }
  })

  const selectedPeptideId = watch('peptideId')
  const selectedSite = watch('site')
  const selectedDoseUnit = watch('doseUnit')

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
      <div className="space-y-2">
        <Label>Peptide</Label>
        <Select 
          value={selectedPeptideId} 
          onValueChange={(v) => setValue('peptideId', v)}
        >
          <SelectTrigger className="bg-background border-border">
            <SelectValue placeholder="Select peptide" />
          </SelectTrigger>
          <SelectContent>
            {peptides.map(p => (
              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.peptideId && <p className="text-xs text-destructive">{errors.peptideId.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Dose Amount</Label>
          <Input 
            type="number" 
            {...register('doseAmount', { valueAsNumber: true })}
            className="bg-background border-border"
          />
          {errors.doseAmount && <p className="text-xs text-destructive">{errors.doseAmount.message}</p>}
        </div>
        <div className="space-y-2">
          <Label>Unit</Label>
          <Select 
            value={selectedDoseUnit} 
            onValueChange={(v: any) => setValue('doseUnit', v)}
          >
            <SelectTrigger className="bg-background border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mcg">mcg</SelectItem>
              <SelectItem value="mg">mg</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Injection Site</Label>
        <Select 
          value={selectedSite} 
          onValueChange={(v) => setValue('site', v)}
        >
          <SelectTrigger className="bg-background border-border capitalize">
            <SelectValue placeholder="Select site" />
          </SelectTrigger>
          <SelectContent>
            {SITES.map(s => (
              <SelectItem key={s} value={s} className="capitalize">{s.replace('-', ' ')}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.site && <p className="text-xs text-destructive">{errors.site.message}</p>}
      </div>

      <div className="space-y-2">
        <Label>Notes (Optional)</Label>
        <Textarea 
          {...register('notes')}
          placeholder="How did it feel?"
          className="bg-background border-border min-h-[80px]"
        />
      </div>

      <div className="flex gap-2 pt-2">
        <Button variant="outline" type="button" className="flex-1" onClick={onSuccess}>
          Cancel
        </Button>
        <Button type="submit" className="flex-1">
          {initialData ? 'Save Changes' : 'Log Injection'}
        </Button>
      </div>
    </form>
  )
}
