import React, { useState } from 'react'
import { 
  Page, 
  PageHeader, 
  PageTitle, 
  PageDescription, 
  PageBody, 
  PageActions,
  Button,
  DataTable,
  EmptyState,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Card,
  CardContent,
  Badge,
  Persona,
  PropertyList,
  PropertyItem
} from '@blinkdotnew/ui'
import { Plus, ClipboardList, Syringe, Calendar, MapPin, Trash2, Edit } from 'lucide-react'
import { useInjections } from '@/hooks/useInjections'
import { usePeptides } from '@/hooks/usePeptides'
import { InjectionForm } from '@/components/log/InjectionForm'
import { format } from 'date-fns'
import type { ColumnDef } from '@tanstack/react-table'
import { Injection } from '@/types'

export function Log() {
  const { injections, isLoading, addInjection, updateInjection, deleteInjection } = useInjections()
  const { peptides } = usePeptides()
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingInjection, setEditingInjection] = useState<Injection | null>(null)

  const columns: ColumnDef<Injection>[] = [
    {
      accessorKey: 'date',
      header: 'Date & Time',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{format(new Date(row.original.date), 'MMM d, yyyy')}</span>
          <span className="text-xs text-muted-foreground">{format(new Date(row.original.date), 'h:mm a')}</span>
        </div>
      )
    },
    {
      accessorKey: 'peptideId',
      header: 'Peptide',
      cell: ({ row }) => {
        const peptide = peptides.find(p => p.id === row.original.peptideId)
        return <Persona name={peptide?.name || 'Unknown'} subtitle={`${row.original.doseAmount} ${row.original.doseUnit}`} />
      }
    },
    {
      accessorKey: 'site',
      header: 'Site',
      cell: ({ row }) => (
        <Badge variant="outline" className="capitalize border-primary/30 text-primary">
          {row.original.site.replace('-', ' ')}
        </Badge>
      )
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 hover:text-primary"
            onClick={() => setEditingInjection(row.original)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 hover:text-destructive"
            onClick={() => deleteInjection(row.original.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ]

  return (
    <Page>
      <PageHeader>
        <div className="space-y-1">
          <PageTitle>Injection Log</PageTitle>
          <PageDescription>Track and manage your peptide history.</PageDescription>
        </div>
        <PageActions>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Injection
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] bg-card border-border">
              <DialogHeader>
                <DialogTitle>Log New Injection</DialogTitle>
              </DialogHeader>
              <InjectionForm 
                onSuccess={() => setIsAddOpen(false)} 
                onSubmit={(data) => {
                  addInjection({
                    ...data,
                    date: new Date().toISOString()
                  })
                  setIsAddOpen(false)
                }}
              />
            </DialogContent>
          </Dialog>
        </PageActions>
      </PageHeader>
      
      <PageBody>
        {injections.length === 0 && !isLoading ? (
          <EmptyState 
            icon={<ClipboardList />}
            title="No injections logged"
            description="Start tracking your peptide use today."
            action={{ label: 'Add First Injection', onClick: () => setIsAddOpen(true) }}
          />
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                    <Syringe className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{injections.length}</div>
                    <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Total Injections</div>
                  </div>
                </CardContent>
              </Card>
              {/* Add more stats here if needed */}
            </div>

            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <DataTable 
                columns={columns} 
                data={injections} 
                loading={isLoading}
              />
            </div>
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={!!editingInjection} onOpenChange={(open) => !open && setEditingInjection(null)}>
          <DialogContent className="sm:max-w-[500px] bg-card border-border">
            <DialogHeader>
              <DialogTitle>Edit Injection</DialogTitle>
            </DialogHeader>
            {editingInjection && (
              <InjectionForm 
                initialData={editingInjection}
                onSuccess={() => setEditingInjection(null)}
                onSubmit={(data) => {
                  updateInjection({ id: editingInjection.id, ...data })
                  setEditingInjection(null)
                }}
              />
            )}
          </DialogContent>
        </Dialog>
      </PageBody>
    </Page>
  )
}
