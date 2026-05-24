export interface PeptideRef {
  name: string;
  vialSizes: string;
  doseRange: string;
  bacWaterMl: number;
  vialMg: number;
  notes: string;
}

export const PEPTIDE_REFERENCE: PeptideRef[] = [
  {
    name: "BPC-157",
    vialSizes: "5 mg",
    doseRange: "200–500 mcg/day",
    bacWaterMl: 2,
    vialMg: 5,
    notes: "Subcutaneous or intramuscular. Typically split into twice-daily injections.",
  },
  {
    name: "TB-500",
    vialSizes: "5 mg, 10 mg",
    doseRange: "2,000–2,500 mcg twice/week (loading), 200–300 mcg/week (maintenance)",
    bacWaterMl: 2,
    vialMg: 5,
    notes: "Subcutaneous. Often cycled 4–6 weeks on, 2–4 weeks off.",
  },
  {
    name: "Wolverine",
    vialSizes: "10 mg",
    doseRange: "Varies — follow product guidance",
    bacWaterMl: 2,
    vialMg: 10,
    notes: "Blend — follow supplier dosing protocol.",
  },
  {
    name: "Tirzepatide",
    vialSizes: "5 mg, 10 mg",
    doseRange: "2,500–15,000 mcg/week",
    bacWaterMl: 2,
    vialMg: 5,
    notes: "Subcutaneous, once weekly. Start low and titrate over several weeks.",
  },
  {
    name: "MOTS-C",
    vialSizes: "5 mg, 10 mg",
    doseRange: "5,000–10,000 mcg/week",
    bacWaterMl: 2,
    vialMg: 5,
    notes: "Subcutaneous or intravenous. Often cycled 5 days on, 2 days off.",
  },
  {
    name: "GHK-Cu",
    vialSizes: "50 mg",
    doseRange: "1,000–2,000 mcg/day",
    bacWaterMl: 5,
    vialMg: 50,
    notes: "Subcutaneous. Sensitive to light — store vial protected.",
  },
  {
    name: "Semax",
    vialSizes: "5 mg",
    doseRange: "200–600 mcg/day",
    bacWaterMl: 2,
    vialMg: 5,
    notes: "Intranasal or subcutaneous. Typically split into 1–2 doses per day.",
  },
  {
    name: "Selank",
    vialSizes: "5 mg",
    doseRange: "250–500 mcg/day",
    bacWaterMl: 2,
    vialMg: 5,
    notes: "Intranasal or subcutaneous. Anxiolytic profile — often taken in the morning.",
  },
  {
    name: "KPV",
    vialSizes: "5 mg, 10 mg",
    doseRange: "100–300 mcg/day",
    bacWaterMl: 2,
    vialMg: 5,
    notes: "Subcutaneous. Anti-inflammatory; also available in oral and topical forms.",
  },
  {
    name: "PT-141",
    vialSizes: "10 mg",
    doseRange: "1,000–2,000 mcg per use",
    bacWaterMl: 2,
    vialMg: 10,
    notes: "Subcutaneous. Administer 1–4 hours before intended effect. Use as needed.",
  },
  {
    name: "Melanotan II",
    vialSizes: "10 mg",
    doseRange: "250–1,000 mcg/day (loading), 100–250 mcg/day (maintenance)",
    bacWaterMl: 2,
    vialMg: 10,
    notes: "Subcutaneous. Start with a low loading dose and titrate slowly.",
  },
];
