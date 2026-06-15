export interface Peptide {
  id: string;
  name: string;
  description: string;
  typicalDosing: string;
  storageGuidance: string;
  reconstitutionExamples: string;
  isFavorite: boolean;
  createdAt: string;
}

export interface Injection {
  id: string;
  date: string;
  peptideId: string;
  doseAmount: number;
  doseUnit: 'mcg' | 'mg';
  site: string;
  notes: string;
  createdAt: string;
}

export interface Macros {
  gender: 'male' | 'female';
  age: number;
  height: number;
  weight: number;
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'extra_active';
  goal: 'maintenance' | 'fat_loss' | 'muscle_gain';
}

export interface Settings {
  id: string;
  theme: 'dark' | 'light';
  macros?: Macros;
  bodyMapGender: 'male' | 'female';
}
