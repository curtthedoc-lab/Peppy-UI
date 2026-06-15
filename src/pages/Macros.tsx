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
  Separator,
  RadioGroup,
  RadioGroupItem
} from '@blinkdotnew/ui'
import { Activity, User, Scale, Flame, Utensils, Info, CheckCircle2 } from 'lucide-react'
import { useSettings } from '@/hooks/useSettings'
import { Macros as MacroType } from '@/types'

export function Macros() {
  const { settings, updateMacros } = useSettings()
  
  const [formData, setFormData] = useState<MacroType>({
    gender: 'female',
    age: 30,
    height: 165,
    weight: 65,
    activityLevel: 'moderate',
    goal: 'maintenance'
  })

  useEffect(() => {
    if (settings?.macros) {
      try {
        setFormData(JSON.parse(settings.macros))
      } catch (e) {
        console.error("Failed to parse macros", e)
      }
    }
  }, [settings])

  const calculateMacros = () => {
    // Mifflin-St Jeor Equation
    let bmr = 0
    if (formData.gender === 'male') {
      bmr = (10 * formData.weight) + (6.25 * formData.height) - (5 * formData.age) + 5
    } else {
      bmr = (10 * formData.weight) + (6.25 * formData.height) - (5 * formData.age) - 161
    }

    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      extra_active: 1.9
    }

    const maintenance = bmr * activityMultipliers[formData.activityLevel]
    
    let targetCals = maintenance
    if (formData.goal === 'fat_loss') targetCals -= 500
    if (formData.goal === 'muscle_gain') targetCals += 300

    // Typical macro split (40% Protein, 30% Carbs, 30% Fat for fat loss; or balanced)
    let p = 0, c = 0, f = 0
    
    if (formData.goal === 'fat_loss') {
      p = (targetCals * 0.40) / 4
      f = (targetCals * 0.30) / 9
      c = (targetCals * 0.30) / 4
    } else if (formData.goal === 'muscle_gain') {
      p = (targetCals * 0.30) / 4
      f = (targetCals * 0.25) / 9
      c = (targetCals * 0.45) / 4
    } else {
      p = (targetCals * 0.30) / 4
      f = (targetCals * 0.30) / 9
      c = (targetCals * 0.40) / 4
    }

    return {
      maintenance: Math.round(maintenance),
      target: Math.round(targetCals),
      protein: Math.round(p),
      carbs: Math.round(c),
      fat: Math.round(f)
    }
  }

  const results = calculateMacros()

  return (
    <Page>
      <PageHeader>
        <div className="space-y-1">
          <PageTitle>Find My Macros</PageTitle>
          <PageDescription>Calculate your ideal calorie and macronutrient intake.</PageDescription>
        </div>
      </PageHeader>
      
      <PageBody className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Card className="bg-card/50">
            <CardHeader className="pb-4 border-b border-border/50">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Your Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-3">
                <Label>Gender</Label>
                <RadioGroup 
                  value={formData.gender} 
                  onValueChange={(v: any) => setFormData(d => ({ ...d, gender: v }))}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="male" id="male" />
                    <Label htmlFor="male" className="font-normal">Male</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="female" id="female" />
                    <Label htmlFor="female" className="font-normal">Female</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Age</Label>
                  <Input 
                    type="number" 
                    value={formData.age} 
                    onChange={(e) => setFormData(d => ({ ...d, age: Number(e.target.value) }))}
                    className="bg-background border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Height (cm)</Label>
                  <Input 
                    type="number" 
                    value={formData.height} 
                    onChange={(e) => setFormData(d => ({ ...d, height: Number(e.target.value) }))}
                    className="bg-background border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Weight (kg)</Label>
                  <Input 
                    type="number" 
                    value={formData.weight} 
                    onChange={(e) => setFormData(d => ({ ...d, weight: Number(e.target.value) }))}
                    className="bg-background border-border"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Activity Level</Label>
                <Select 
                  value={formData.activityLevel} 
                  onValueChange={(v: any) => setFormData(d => ({ ...d, activityLevel: v }))}
                >
                  <SelectTrigger className="bg-background border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sedentary">Sedentary (Office job)</SelectItem>
                    <SelectItem value="light">Lightly Active (1-2 days/week)</SelectItem>
                    <SelectItem value="moderate">Moderately Active (3-5 days/week)</SelectItem>
                    <SelectItem value="active">Very Active (6-7 days/week)</SelectItem>
                    <SelectItem value="extra_active">Extra Active (Athlete/Physical job)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Your Goal</Label>
                <Select 
                  value={formData.goal} 
                  onValueChange={(v: any) => setFormData(d => ({ ...d, goal: v }))}
                >
                  <SelectTrigger className="bg-background border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="fat_loss">Fat Loss (-500 cal)</SelectItem>
                    <SelectItem value="muscle_gain">Muscle Gain (+300 cal)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button className="w-full gap-2" onClick={() => updateMacros(formData)}>
                <CheckCircle2 className="h-4 w-4" />
                Save Profile
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-card border-primary/30 h-full">
            <CardHeader className="border-b border-border/50">
              <CardTitle className="text-xl">Your Daily Targets</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8 pt-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 rounded-2xl bg-primary/10 border border-primary/20 space-y-1 col-span-2">
                  <span className="text-xs text-primary uppercase font-bold tracking-widest">Daily Calories</span>
                  <div className="text-4xl font-black text-foreground">
                    {results.target} <span className="text-lg font-bold text-muted-foreground">kcal</span>
                  </div>
                  <p className="text-xs text-muted-foreground pt-2">
                    Maintenance is approx. <strong>{results.maintenance}</strong> calories.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Macro Breakdown</h4>
                <div className="space-y-4">
                  {[
                    { label: 'Protein', value: results.protein, color: 'bg-primary', icon: Utensils },
                    { label: 'Carbs', value: results.carbs, color: 'bg-accent', icon: Flame },
                    { label: 'Fats', value: results.fat, color: 'bg-destructive', icon: Scale },
                  ].map(m => (
                    <div key={m.label} className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-2">
                          <div className={cn("h-2 w-2 rounded-full", m.color)} />
                          <span className="font-semibold">{m.label}</span>
                        </div>
                        <span className="font-mono">{m.value}g</span>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div className={cn("h-full transition-all duration-500", m.color)} style={{ width: `${(m.value * (m.label === 'Fats' ? 9 : 4) / results.target) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator className="bg-border" />

              <div className="space-y-3">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <Info className="h-4 w-4 text-primary" />
                  Understanding Macros
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Protein is essential for muscle repair (especially when using peptides like BPC-157). 
                  Carbs provide energy for workouts, and fats support hormonal health.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageBody>
    </Page>
  )
}
