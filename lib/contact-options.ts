export const EVENT_TYPES = [
  "Casamento",
  "Pré-wedding",
  "Aniversário",
  "Ensaio",
  "Formatura",
  "Evento corporativo",
  "Outro",
] as const;

export const SHIFTS = [
  "Manhã",
  "Tarde",
  "Noite",
  "Integral",
  "A combinar",
] as const;

export type EventType = (typeof EVENT_TYPES)[number];
export type Shift = (typeof SHIFTS)[number];
