import React, { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { 
  Page, 
  PageHeader, 
  PageTitle, 
  PageDescription, 
  PageBody, 
  Input, 
  Card, 
  CardContent, 
  Badge, 
  Button, 
  EmptyState 
} from '@blinkdotnew/ui'
import { Search, Star, Heart, ArrowRight } from 'lucide-react'
import { usePeptides } from '@/hooks/usePeptides'
import { cn } from '@blinkdotnew/ui'

export function Library() {
  const { peptides, isLoading, toggleFavorite } = usePeptides()
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  const filteredPeptides = peptides.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.description.toLowerCase().includes(search.toLowerCase())
  )

  const favorites = filteredPeptides.filter(p => Number(p.isFavorite) > 0)
  const others = filteredPeptides.filter(p => Number(p.isFavorite) === 0)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <Page>
      <PageHeader>
        <div className="space-y-1">
          <PageTitle>Peptide Library</PageTitle>
          <PageDescription>Explore dosing, storage, and reconstitution guidance.</PageDescription>
        </div>
      </PageHeader>
      
      <PageBody className="space-y-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input 
            placeholder="Search peptides..." 
            className="pl-10 h-12 bg-card border-none ring-1 ring-border focus-visible:ring-primary"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {filteredPeptides.length === 0 ? (
          <EmptyState 
            icon={<Search />}
            title="No peptides found"
            description="Try a different search term."
          />
        ) : (
          <div className="space-y-8">
            {favorites.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-primary font-semibold uppercase tracking-wider text-xs">
                  <Heart className="h-3 w-3 fill-current" />
                  Favorites
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {favorites.map(p => (
                    <PeptideCard 
                      key={p.id} 
                      peptide={p} 
                      onToggleFavorite={() => toggleFavorite({ id: p.id, isFavorite: false })}
                      onClick={() => navigate({ to: `/library/$id`, params: { id: p.id } })}
                    />
                  ))}
                </div>
              </section>
            )}

            <section className="space-y-4">
              <div className="flex items-center gap-2 text-muted-foreground font-semibold uppercase tracking-wider text-xs">
                All Peptides
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {others.map(p => (
                  <PeptideCard 
                    key={p.id} 
                    peptide={p} 
                    onToggleFavorite={() => toggleFavorite({ id: p.id, isFavorite: true })}
                    onClick={() => navigate({ to: `/library/$id`, params: { id: p.id } })}
                  />
                ))}
              </div>
            </section>
          </div>
        )}
      </PageBody>
    </Page>
  )
}

function PeptideCard({ peptide, onToggleFavorite, onClick }: { 
  peptide: any, 
  onToggleFavorite: () => void,
  onClick: () => void
}) {
  return (
    <Card 
      className="group hover:ring-1 hover:ring-primary/50 transition-all cursor-pointer bg-card/50 backdrop-blur-sm"
      onClick={onClick}
    >
      <CardContent className="p-5 flex flex-col h-full">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{peptide.name}</h3>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-muted-foreground hover:text-primary"
            onClick={(e) => {
              e.stopPropagation()
              onToggleFavorite()
            }}
          >
            <Heart className={cn("h-4 w-4", Number(peptide.isFavorite) > 0 && "fill-primary text-primary")} />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
          {peptide.description}
        </p>
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <Badge variant="secondary" className="bg-primary/10 text-primary border-none">
            {peptide.typicalDosing.split(' ')[0]}
          </Badge>
          <div className="text-primary opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowRight className="h-4 w-4" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
