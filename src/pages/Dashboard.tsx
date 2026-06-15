import React from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { 
  Page, 
  PageHeader, 
  PageTitle, 
  PageDescription, 
  PageBody, 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  Button,
  Badge,
  Persona,
  Stat,
  StatGroup
} from '@blinkdotnew/ui'
import { 
  Plus, 
  ChevronRight, 
  Syringe, 
  Calendar, 
  Heart, 
  History, 
  TrendingUp,
  FlaskConical,
  Activity
} from 'lucide-react'
import { useInjections } from '@/hooks/useInjections'
import { usePeptides } from '@/hooks/usePeptides'
import { useSettings } from '@/hooks/useSettings'
import { format, isAfter, subDays } from 'date-fns'
import { cn } from '@blinkdotnew/ui'

export function Dashboard() {
  const { injections, isLoading: injectionsLoading } = useInjections()
  const { peptides, isLoading: peptidesLoading } = usePeptides()
  const { settings } = useSettings()
  const navigate = useNavigate()

  const favorites = peptides.filter(p => Number(p.isFavorite) > 0)
  const recentInjections = injections.slice(0, 3)
  const totalInjectionsLast7Days = injections.filter(i => isAfter(new Date(i.date), subDays(new Date(), 7))).length

  return (
    <Page>
      <PageHeader>
        <div className="space-y-1">
          <PageTitle className="text-3xl font-black tracking-tight">Dashboard</PageTitle>
          <PageDescription>Overview of your peptide therapy and health metrics.</PageDescription>
        </div>
      </PageHeader>
      
      <PageBody className="space-y-8">
        <StatGroup className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Stat 
            label="Total Injections" 
            value={injections.length.toString()} 
            icon={<Syringe />}
          />
          <Stat 
            label="Last 7 Days" 
            value={totalInjectionsLast7Days.toString()} 
            trend={totalInjectionsLast7Days > 0 ? 10 : 0}
            trendLabel="active therapy"
          />
          <Stat 
            label="Peptides in Use" 
            value={new Set(injections.map(i => i.peptideId)).size.toString()} 
            icon={<FlaskConical />}
          />
        </StatGroup>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quick Actions & Favorites */}
          <div className="space-y-8">
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Heart className="h-5 w-5 text-primary" />
                  Favorite Peptides
                </h3>
                <Link href="/library">
                  <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10">
                    View Library
                  </Button>
                </Link>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                {favorites.length === 0 ? (
                  <Card className="bg-card/50 border-dashed">
                    <CardContent className="p-8 text-center text-muted-foreground text-sm">
                      Mark peptides as favorites to see them here.
                    </CardContent>
                  </Card>
                ) : (
                  favorites.map(p => (
                    <Card 
                      key={p.id} 
                      className="bg-card/50 hover:bg-card transition-colors cursor-pointer"
                      onClick={() => navigate({ to: `/library/$id`, params: { id: p.id } })}
                    >
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                            {p.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold">{p.name}</div>
                            <div className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]">{p.description}</div>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </section>

            <Card className="bg-primary border-none shadow-xl shadow-primary/20 overflow-hidden relative group">
              <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:scale-110 transition-transform duration-500">
                <Plus size={100} className="text-white" />
              </div>
              <CardContent className="p-8 space-y-4 relative z-10">
                <h3 className="text-2xl font-black text-white">Log Injection</h3>
                <p className="text-white/80 text-sm max-w-[200px]">
                  Keep your tracking up to date by logging your latest dose.
                </p>
                <Link href="/log">
                  <Button className="bg-white text-primary hover:bg-white/90 border-none font-bold gap-2">
                    <Plus className="h-5 w-5" />
                    Quick Add
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* History */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <History className="h-5 w-5 text-primary" />
                Recent Activity
              </h3>
              <Link href="/log">
                <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10">
                  Full History
                </Button>
              </Link>
            </div>

            <div className="space-y-3">
              {recentInjections.length === 0 ? (
                <Card className="bg-card/50 border-dashed">
                  <CardContent className="p-12 text-center text-muted-foreground text-sm">
                    No activity yet.
                  </CardContent>
                </Card>
              ) : (
                recentInjections.map(i => {
                  const p = peptides.find(p => p.id === i.peptideId)
                  return (
                    <Card key={i.id} className="bg-card/50">
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground">
                          <Syringe className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <span className="font-bold">{p?.name || 'Unknown Peptide'}</span>
                            <span className="text-[10px] text-muted-foreground font-mono">
                              {format(new Date(i.date), 'MMM d, h:mm a')}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary border-none">
                              {i.doseAmount} {i.doseUnit}
                            </Badge>
                            <Badge variant="outline" className="text-[10px] opacity-70">
                              {i.site.replace('-', ' ')}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })
              )}
            </div>

            <Card className="bg-card/30 border-border/50">
              <CardContent className="p-6 flex items-center gap-6">
                <div className="h-12 w-12 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                  <Activity className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-sm">Macros & Health</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Your current target is <strong>{Math.round(JSON.parse(settings?.macros || '{}').goal === 'fat_loss' ? 1800 : 2500)} kcal</strong>.
                  </p>
                </div>
                <Link href="/macros">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </section>
        </div>
      </PageBody>
    </Page>
  )
}
