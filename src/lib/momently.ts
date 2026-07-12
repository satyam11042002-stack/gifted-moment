export const OCCASIONS = [
  { id: "birthday", label: "Birthday", greeting: "Happy Birthday" },
  { id: "anniversary", label: "Anniversary", greeting: "Happy Anniversary" },
  { id: "proposal", label: "Proposal", greeting: "Will you..." },
  { id: "wedding", label: "Wedding", greeting: "To the newlyweds" },
  { id: "farewell", label: "Farewell", greeting: "Until we meet again" },
  { id: "graduation", label: "Graduation", greeting: "Congratulations, Grad" },
  { id: "baby-shower", label: "Baby Shower", greeting: "A little one is on the way" },
] as const;

export type OccasionId = (typeof OCCASIONS)[number]["id"];

export function occasionGreeting(id: string): string {
  return OCCASIONS.find((o) => o.id === id)?.greeting ?? "For you";
}

export function occasionLabel(id: string): string {
  return OCCASIONS.find((o) => o.id === id)?.label ?? "Surprise";
}

export function formatCountdown(ms: number): { hh: string; mm: string; ss: string; expired: boolean } {
  if (ms <= 0) return { hh: "00", mm: "00", ss: "00", expired: true };
  const total = Math.floor(ms / 1000);
  const hh = String(Math.floor(total / 3600)).padStart(2, "0");
  const mm = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
  const ss = String(total % 60).padStart(2, "0");
  return { hh, mm, ss, expired: false };
}
