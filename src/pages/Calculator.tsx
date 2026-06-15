import React, { useState, useEffect } from 'react'
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
  Input, 
  Label, 
  Select, 
  SelectTrigger, 
  SelectValue, 
  SelectContent, 
  SelectItem,
  Badge,
  Button,
  Separator
} from '@blinkdotnew/ui'
import { Calculator as CalcIcon, FlaskConical, Droplets, Target, Syringe, Info } from 'lucide-react'
import { usePeptides } from '@/hooks/usePeptides'

export function Calculator() {
  const { peptides } = usePeptides()
  
  // Inputs
  const [peptideAmount, setPeptideAmount] = useState<number>(5) // mg
  const [bacWater, setBacWater] = useState<number>(2) // ml
  const [desiredDose, setDesiredDose] = useState<number>(250) // mcg
  const [doseUnit, setDoseUnit] = useState<'mcg' | 'mg'>('mcg')
  const [selectedPeptideId, setSelectedPeptideId] = useState<string>('')

  // Results
  const [units, setUnits] = useState<number>(0)
  const [mcgPerUnit, setMcgPerUnit] = useState<number>(0)
  const [totalDoses, setTotalDoses] = useState<number>(0)

  useEffect(() => {
    const totalMcg = peptideAmount * 1000
    const concentration = totalMcg / bacWater // mcg/ml
    const perUnit = concentration / 100 // assuming 100 unit syringe (1ml)
    
    const doseInMcg = doseUnit === 'mg' ? desiredDose * 1000 : desiredDose
    const unitsRequired = doseInMcg / perUnit
    const availableDoses = totalMcg / doseInMcg

    setMcgPerUnit(perUnit)
    setUnits(unitsRequired)
    setTotalDoses(availableDoses)
  }, [peptideAmount, bacWater, desiredDose, doseUnit])

  const handlePeptideSelect = (id: string) => {
    setSelectedPeptideId(id)
    const peptide = peptides.find(p => p.id === id)
    if (peptide) {
      // Try to parse typical dosing if possible, or just reset to defaults
      if (id === 'bpc-157') setPeptideAmount(5);
      if (id === 'tb-500') setPeptideAmount(5);
      if (id === 'tirzepatide') setPeptideAmount(5);
    }
  }

  return (
    <Page>
      <PageHeader>
        <div className="space-y-1">
          <PageTitle>Dose Calculator</PageTitle>
          <PageDescription>Calculate insulin syringe units for your peptide dose.</PageDescription>
        </div>
      </PageHeader>
      
      <PageBody className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Card className="bg-card/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <CalcIcon className="h-5 w-5 text-primary" />
                Input Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Quick Preset</Label>
                <Select value={selectedPeptideId} onValueChange={handlePeptideSelect}>
                  <SelectTrigger className="bg-background border-border">
                    <SelectValue placeholder="Select a peptide..." />
                  </SelectTrigger>
                  <SelectContent>
                    {peptides.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <FlaskConical className="h-3 w-3" />
                    Peptide (mg)
                  </Label>
                  <Input 
                    type="number" 
                    value={peptideAmount} 
                    onChange={(e) => setPeptideAmount(Number(e.target.value))}
                    className="bg-background border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Droplets className="h-3 w-3" />
                    BAC Water (ml)
                  </Label>
                  <Input 
                    type="number" 
                    value={bacWater} 
                    onChange={(e) => setBacWater(Number(e.target.value))}
                    className="bg-background border-border"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Target className="h-3 w-3" />
                  Desired Dose
                </Label>
                <div className="flex gap-2">
                  <Input 
                    type="number" 
                    value={desiredDose} 
                    onChange={(e) => setDesiredDose(Number(e.target.value))}
                    className="bg-background border-border flex-1"
                  />
                  <Select value={doseUnit} onValueChange={(v: any) => setDoseUnit(v)}>
                    <SelectTrigger className="w-24 bg-background border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mcg">mcg</SelectItem>
                      <SelectItem value="mg">mg</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4 flex gap-3 text-sm text-muted-foreground italic">
              <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <p>
                Calculations assume a standard U-100 (1ml) insulin syringe. 
                Always double-check your math and syringe type.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-card border-primary/30 relative overflow-hidden h-full">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Syringe size={160} className="text-primary rotate-12" />
            </div>
            <CardHeader>
              <CardTitle className="text-xl">Resulting Dosage</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-2">
                <span className="text-sm text-muted-foreground uppercase tracking-widest font-semibold">Insulin Syringe Load</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-6xl font-black text-primary tabular-nums">
                    {units > 100 ? '>100' : Math.round(units * 10) / 10}
                  </span>
                  <span className="text-2xl font-bold text-muted-foreground">Units</span>
                </div>
                {units > 100 && (
                  <p className="text-destructive text-xs font-semibold">Warning: Dose exceeds single syringe capacity!</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-background/50 border border-border space-y-1">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Dose Per Unit</span>
                  <div className="text-xl font-bold text-foreground">
                    {Math.round(mcgPerUnit * 10) / 10} <span className="text-xs text-muted-foreground">mcg</span>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-background/50 border border-border space-y-1">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Total Doses</span>
                  <div className="text-xl font-bold text-foreground">
                    {Math.floor(totalDoses)} <span className="text-xs text-muted-foreground">in vial</span>
                  </div>
                </div>
              </div>

              <Separator className="bg-border" />

              <div className="space-y-4">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <Syringe className="h-4 w-4 text-primary" />
                  Visual Guide
                </h4>
                <div className="relative h-12 bg-muted rounded-full overflow-hidden border border-border">
                  <div 
                    className="h-full bg-primary/20 border-r-2 border-primary transition-all duration-500"
                    style={{ width: `${Math.min(units, 100)}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-between px-4 text-[10px] font-mono text-muted-foreground pointer-events-none">
                    <span>0</span>
                    <span>25</span>
                    <span>50</span>
                    <span>75</span>
                    <span>100 Units</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageBody>
    </Page>
  )
}
