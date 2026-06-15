import React from 'react'
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
  Separator,
  Switch,
  Label,
  toast
} from '@blinkdotnew/ui'
import { 
  Settings as SettingsIcon, 
  Download, 
  Upload, 
  Trash2, 
  Moon, 
  Sun, 
  Shield, 
  Database,
  Smartphone
} from 'lucide-react'
import { blink } from '@/blink/client'
import { useInjections } from '@/hooks/useInjections'
import { usePeptides } from '@/hooks/usePeptides'

export function Settings() {
  const { injections } = useInjections()
  const { peptides } = usePeptides()

  const handleExport = () => {
    const data = {
      injections,
      peptides,
      exportedAt: new Date().toISOString()
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `peppies-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    toast.success('Backup downloaded')
  }

  const handleClearData = async () => {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      try {
        await Promise.all(injections.map(i => blink.db.injections.delete(i.id)))
        toast.success('All data cleared')
        window.location.reload()
      } catch (e) {
        toast.error('Failed to clear data')
      }
    }
  }

  return (
    <Page>
      <PageHeader>
        <div className="space-y-1">
          <PageTitle>Settings</PageTitle>
          <PageDescription>Manage your preferences and data security.</PageDescription>
        </div>
      </PageHeader>
      
      <PageBody className="max-w-2xl mx-auto w-full space-y-8">
        <section className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-1">Display & Interface</h3>
          <Card className="bg-card/50">
            <CardContent className="p-0 divide-y divide-border/50">
              <div className="p-6 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-semibold">
                    <Moon className="h-4 w-4" />
                    Appearance
                  </div>
                  <p className="text-xs text-muted-foreground">Force dark mode for a sleek PWA experience.</p>
                </div>
                <Switch checked disabled />
              </div>
              <div className="p-6 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-semibold">
                    <Smartphone className="h-4 w-4" />
                    Mobile Optimized
                  </div>
                  <p className="text-xs text-muted-foreground">Interface adjusts for mobile tracking.</p>
                </div>
                <Badge variant="secondary" className="bg-primary/10 text-primary border-none">Active</Badge>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-1">Data Management</h3>
          <Card className="bg-card/50">
            <CardContent className="p-6 space-y-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <Button variant="outline" className="flex-1 gap-2 py-8" onClick={handleExport}>
                  <Download className="h-5 w-5 text-primary" />
                  <div className="text-left">
                    <div className="font-bold">Export Backup</div>
                    <div className="text-[10px] text-muted-foreground">Download your full history</div>
                  </div>
                </Button>
                <Button variant="outline" className="flex-1 gap-2 py-8" onClick={() => toast('Import coming soon')}>
                  <Upload className="h-5 w-5 text-primary" />
                  <div className="text-left">
                    <div className="font-bold">Import Data</div>
                    <div className="text-[10px] text-muted-foreground">Restore from a JSON file</div>
                  </div>
                </Button>
              </div>

              <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/20 space-y-4">
                <div className="flex items-start gap-3">
                  <Trash2 className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-destructive text-sm">Danger Zone</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Permanently delete all your injection logs and settings. This action is irreversible.
                    </p>
                  </div>
                </div>
                <Button variant="destructive" className="w-full font-bold" onClick={handleClearData}>
                  Clear All Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-1">Privacy & Security</h3>
          <Card className="bg-card/50 border-primary/20">
            <CardContent className="p-6 flex items-start gap-4">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Shield className="h-5 w-5" />
              </div>
              <div className="space-y-2">
                <h4 className="font-bold text-sm">Zero-Account Privacy</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Peppies is designed to be fully functional without an account. 
                  Your data is stored locally in your browser's secure storage. 
                  No personal information is ever sent to our servers.
                </p>
                <div className="flex items-center gap-2 pt-2">
                  <Database className="h-3 w-3 text-primary" />
                  <span className="text-[10px] font-mono text-muted-foreground">BLINK_SDK_SECURE_STORAGE: ACTIVE</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <div className="text-center py-8 opacity-40">
          <div className="font-black text-2xl tracking-tighter italic">PEPPIES</div>
          <div className="text-[10px] font-bold uppercase tracking-widest">Version 1.0.0 (BETA)</div>
        </div>
      </PageBody>
    </Page>
  )
}

function Badge({ children, className, variant }: any) {
  return (
    <div className={cn("px-2 py-0.5 rounded text-[10px] font-bold uppercase", className)}>
      {children}
    </div>
  )
}
