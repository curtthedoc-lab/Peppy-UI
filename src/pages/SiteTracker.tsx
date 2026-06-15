import React, { useState } from 'react'
import { 
  Page, 
  PageHeader, 
  PageTitle, 
  PageDescription, 
  PageBody, 
  Tabs, 
  TabsList, 
  TabsTrigger, 
  TabsContent,
  Card,
  CardContent,
  Badge,
  Button,
  cn
} from '@blinkdotnew/ui'
import { MapPin, User, User2, MoveHorizontal } from 'lucide-react'
import { useInjections } from '@/hooks/useInjections'
import { useSettings } from '@/hooks/useSettings'
import { BodyMap } from '@/components/tracker/BodyMap'

export function SiteTracker() {
  const { injections } = useInjections()
  const { settings, updateSettings } = useSettings()
  const [view, setView] = useState<'front' | 'back'>('front')

  const gender = settings?.bodyMapGender || 'female'

  // Get most recent injection for each site to color code
  const siteStatus = injections.reduce((acc: any, curr) => {
    if (!acc[curr.site]) {
      acc[curr.site] = curr.date
    }
    return acc
  }, {})

  return (
    <Page>
      <PageHeader>
        <div className="space-y-1">
          <PageTitle>Injection Site Tracker</PageTitle>
          <PageDescription>Visualize and rotate injection locations to prevent tissue buildup.</PageDescription>
        </div>
      </PageHeader>
      
      <PageBody className="space-y-8">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <Card className="bg-card/50 border-border w-full md:w-auto overflow-hidden">
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex bg-muted rounded-lg p-1">
                  <Button 
                    variant={gender === 'male' ? 'secondary' : 'ghost'} 
                    size="sm" 
                    className="gap-2 h-8"
                    onClick={() => updateSettings({ bodyMapGender: 'male' })}
                  >
                    <User className="h-4 w-4" />
                    Male
                  </Button>
                  <Button 
                    variant={gender === 'female' ? 'secondary' : 'ghost'} 
                    size="sm" 
                    className="gap-2 h-8"
                    onClick={() => updateSettings({ bodyMapGender: 'female' })}
                  >
                    <User2 className="h-4 w-4" />
                    Female
                  </Button>
                </div>

                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2 h-8"
                  onClick={() => setView(v => v === 'front' ? 'back' : 'front')}
                >
                  <MoveHorizontal className="h-4 w-4" />
                  Flip to {view === 'front' ? 'Back' : 'Front'}
                </Button>
              </div>

              <div className="flex justify-center py-4 bg-muted/30 rounded-2xl relative min-h-[500px] min-w-[300px]">
                <BodyMap 
                  gender={gender} 
                  view={view} 
                  siteStatus={siteStatus} 
                />
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Legend</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2 text-xs">
                    <div className="h-3 w-3 rounded-full bg-primary/20 border border-primary/50" />
                    <span>Never Injected</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="h-3 w-3 rounded-full bg-primary shadow-[0_0_8px_rgba(167,139,250,0.8)]" />
                    <span>Recent (&lt; 24h)</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="h-3 w-3 rounded-full bg-primary/60" />
                    <span>Last 7 Days</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="h-3 w-3 rounded-full bg-primary/40" />
                    <span>Older</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex-1 space-y-6">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Rotation Guidance
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { title: 'Abdomen', desc: 'Inject 2 inches from navel. Highly common for sub-q.', sites: ['abdomen-left', 'abdomen-right', 'abdomen-center'] },
                { title: 'Thighs', desc: 'Outer, middle third of the thigh.', sites: ['thigh-left', 'thigh-right'] },
                { title: 'Glutes', desc: 'Upper outer quadrant of the buttock.', sites: ['glute-left', 'glute-right'] },
                { title: 'Arms', desc: 'Fatty area on the back of the upper arm.', sites: ['arm-left', 'arm-right'] },
              ].map(group => (
                <Card key={group.title} className="bg-card/50">
                  <CardContent className="p-4 space-y-2">
                    <h4 className="font-semibold text-sm">{group.title}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{group.desc}</p>
                    <div className="flex flex-wrap gap-1 pt-2">
                      {group.sites.map(s => {
                        const hasRecent = siteStatus[s]
                        return (
                          <Badge 
                            key={s} 
                            variant="secondary" 
                            className={cn(
                              "text-[10px] px-2 py-0 h-5 border-none",
                              hasRecent ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                            )}
                          >
                            {s.split('-').pop()}
                          </Badge>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4 text-sm text-muted-foreground leading-relaxed">
                <strong>Tip:</strong> Always rotate your injection sites. Using the same spot repeatedly can cause lipohypertrophy (buildup of fat under the skin), which slows peptide absorption.
              </CardContent>
            </Card>
          </div>
        </div>
      </PageBody>
    </Page>
  )
}
