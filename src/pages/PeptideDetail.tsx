import React from 'react'
import { useParams, Link } from '@tanstack/react-router'
import { 
  Page, 
  PageHeader, 
  PageTitle, 
  PageDescription, 
  PageBody, 
  Button, 
  Card, 
  CardContent, 
  Badge 
} from '@blinkdotnew/ui'
import { ChevronLeft, Info, Thermometer, FlaskConical, Beaker, Heart } from 'lucide-react'
import { usePeptide, usePeptides } from '@/hooks/usePeptides'
import { cn } from '@blinkdotnew/ui'

export function PeptideDetail() {
  const { id } = useParams({ from: '/library/$id' })
  const { data: peptide, isLoading } = usePeptide(id)
  const { toggleFavorite } = usePeptides()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (!peptide) {
    return <div>Peptide not found</div>
  }

  const isFav = Number(peptide.isFavorite) > 0

  return (
    <Page>
      <PageHeader>
        <div className="flex items-center gap-4 mb-2">
          <Link href="/library">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
          <Badge variant="outline" className="border-primary/50 text-primary">Peptide Library</Badge>
        </div>
        <div className="flex justify-between items-center">
          <PageTitle className="text-3xl font-bold">{peptide.name}</PageTitle>
          <Button 
            variant="ghost" 
            size="icon" 
            className={cn("h-10 w-10", isFav && "text-primary")}
            onClick={() => toggleFavorite({ id: peptide.id, isFavorite: !isFav })}
          >
            <Heart className={cn("h-6 w-6", isFav && "fill-current")} />
          </Button>
        </div>
      </PageHeader>
      
      <PageBody className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="bg-card/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-primary font-semibold mb-3">
                <Info className="h-5 w-5" />
                Description
              </div>
              <p className="text-muted-foreground leading-relaxed">
                {peptide.description}
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="bg-card/50">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 text-primary font-semibold mb-3">
                  <Thermometer className="h-5 w-5" />
                  Storage Guidance
                </div>
                <p className="text-sm text-muted-foreground">
                  {peptide.storageGuidance}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 text-primary font-semibold mb-3">
                  <FlaskConical className="h-5 w-5" />
                  Typical Dosing
                </div>
                <p className="text-sm text-muted-foreground">
                  {peptide.typicalDosing}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-card/50 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-primary font-semibold mb-3">
                <Beaker className="h-5 w-5" />
                Reconstitution Examples
              </div>
              <p className="text-sm text-muted-foreground">
                {peptide.reconstitutionExamples}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-primary/5 border-primary/20 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <FlaskConical size={80} className="text-primary" />
            </div>
            <CardContent className="p-6">
              <h4 className="font-bold mb-4">Quick Links</h4>
              <div className="space-y-3">
                <Link href="/calculator">
                  <Button className="w-full justify-start gap-2 bg-primary/20 hover:bg-primary/30 text-primary border-none">
                    <FlaskConical className="h-4 w-4" />
                    Open Dose Calculator
                  </Button>
                </Link>
                <Link href="/log">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <ChevronLeft className="h-4 w-4 rotate-180" />
                    Log Injection
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageBody>
    </Page>
  )
}
