// Premium theme engine — CSS variable driven, layout stays constant.
// Every theme sets: background, foreground/ink, primary accent, secondary,
// muted, border, card, radius, display font, decorative background element.

export type ThemeDecor =
  | "none"
  | "stars"
  | "petals"
  | "confetti"
  | "neon"
  | "shine"
  | "florals";

export type ThemeTokens = {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  border: string;
  ring: string;
  radius: string;
  displayFont: string;
  bodyFont: string;
  bgImage?: string; // extra background gradient/image layered under content
  buttonExtra?: string; // extra button styles (glow, gradient overlays)
  cardExtra?: string; // extra styles for cards
};

export type MomentlyTheme = {
  id: string;
  label: string;
  tagline: string;
  swatch: string[]; // hex/color list for the picker preview
  decor: ThemeDecor;
  tokens: ThemeTokens;
};

const PLAYFAIR = `"Playfair Display", ui-serif, Georgia, serif`;
const INTER = `"Inter", ui-sans-serif, system-ui, sans-serif`;
const CORMORANT = `"Cormorant Garamond", "Playfair Display", ui-serif, Georgia, serif`;
const SPACE = `"Space Grotesk", "Inter", ui-sans-serif, system-ui, sans-serif`;

export const THEMES: MomentlyTheme[] = [
  {
    id: "boutique",
    label: "Boutique Warmth",
    tagline: "The signature Momently look.",
    swatch: ["#f5eee6", "#f38a6e", "#1f1913"],
    decor: "none",
    tokens: {
      background: "hsl(20 40% 98%)",
      foreground: "hsl(20 20% 12%)",
      card: "hsl(0 0% 100%)",
      cardForeground: "hsl(20 20% 12%)",
      primary: "hsl(12 85% 65%)",
      primaryForeground: "hsl(0 0% 100%)",
      secondary: "hsl(20 20% 96%)",
      secondaryForeground: "hsl(20 20% 12%)",
      muted: "hsl(20 15% 60%)",
      mutedForeground: "hsl(20 10% 40%)",
      accent: "hsl(20 40% 94%)",
      accentForeground: "hsl(20 20% 12%)",
      border: "hsl(20 20% 12% / 0.08)",
      ring: "hsl(12 85% 65%)",
      radius: "1rem",
      displayFont: PLAYFAIR,
      bodyFont: INTER,
    },
  },
  {
    id: "minimal-white",
    label: "Minimal White",
    tagline: "Whisper-quiet luxury.",
    swatch: ["#ffffff", "#111111", "#dcdcdc"],
    decor: "none",
    tokens: {
      background: "hsl(0 0% 100%)",
      foreground: "hsl(0 0% 8%)",
      card: "hsl(0 0% 100%)",
      cardForeground: "hsl(0 0% 8%)",
      primary: "hsl(0 0% 8%)",
      primaryForeground: "hsl(0 0% 100%)",
      secondary: "hsl(0 0% 96%)",
      secondaryForeground: "hsl(0 0% 8%)",
      muted: "hsl(0 0% 60%)",
      mutedForeground: "hsl(0 0% 42%)",
      accent: "hsl(0 0% 96%)",
      accentForeground: "hsl(0 0% 8%)",
      border: "hsl(0 0% 90%)",
      ring: "hsl(0 0% 8%)",
      radius: "0.5rem",
      displayFont: CORMORANT,
      bodyFont: INTER,
      cardExtra: "shadow-[0_1px_2px_rgba(0,0,0,0.04),0_20px_60px_-30px_rgba(0,0,0,0.08)]",
    },
  },
  {
    id: "luxury-black",
    label: "Luxury Black",
    tagline: "Onyx and gold. Wear the room.",
    swatch: ["#0a0a0a", "#d4af37", "#1a1a1a"],
    decor: "shine",
    tokens: {
      background: "hsl(0 0% 4%)",
      foreground: "hsl(45 40% 92%)",
      card: "hsl(0 0% 8%)",
      cardForeground: "hsl(45 40% 92%)",
      primary: "hsl(45 65% 55%)",
      primaryForeground: "hsl(0 0% 4%)",
      secondary: "hsl(0 0% 12%)",
      secondaryForeground: "hsl(45 40% 92%)",
      muted: "hsl(0 0% 50%)",
      mutedForeground: "hsl(45 15% 65%)",
      accent: "hsl(0 0% 12%)",
      accentForeground: "hsl(45 40% 92%)",
      border: "hsl(45 40% 92% / 0.12)",
      ring: "hsl(45 65% 55%)",
      radius: "0.75rem",
      displayFont: CORMORANT,
      bodyFont: INTER,
      bgImage: "radial-gradient(ellipse at top, hsl(45 60% 30% / 0.15), transparent 60%), radial-gradient(ellipse at bottom, hsl(45 40% 20% / 0.1), transparent 60%)",
      buttonExtra: "shadow-[0_0_40px_-10px_hsl(45_65%_55%_/_0.6)]",
      cardExtra: "bg-white/[0.03] backdrop-blur-xl border-white/10",
    },
  },
  {
    id: "romantic-rose",
    label: "Romantic Rose",
    tagline: "Soft blush, floating petals.",
    swatch: ["#fdf2f4", "#e11d48", "#fbcfe8"],
    decor: "petals",
    tokens: {
      background: "hsl(340 60% 98%)",
      foreground: "hsl(340 30% 20%)",
      card: "hsl(0 0% 100%)",
      cardForeground: "hsl(340 30% 20%)",
      primary: "hsl(345 75% 55%)",
      primaryForeground: "hsl(0 0% 100%)",
      secondary: "hsl(340 50% 96%)",
      secondaryForeground: "hsl(340 30% 20%)",
      muted: "hsl(340 20% 60%)",
      mutedForeground: "hsl(340 15% 45%)",
      accent: "hsl(340 60% 94%)",
      accentForeground: "hsl(340 30% 20%)",
      border: "hsl(340 40% 85%)",
      ring: "hsl(345 75% 55%)",
      radius: "1.25rem",
      displayFont: PLAYFAIR,
      bodyFont: INTER,
      bgImage: "radial-gradient(ellipse at top, hsl(345 80% 88% / 0.5), transparent 60%)",
    },
  },
  {
    id: "galaxy",
    label: "Galaxy",
    tagline: "Cosmic. Dreamy. Infinite.",
    swatch: ["#050014", "#7c3aed", "#22d3ee"],
    decor: "stars",
    tokens: {
      background: "hsl(250 60% 4%)",
      foreground: "hsl(220 40% 96%)",
      card: "hsl(250 40% 10%)",
      cardForeground: "hsl(220 40% 96%)",
      primary: "hsl(265 85% 70%)",
      primaryForeground: "hsl(250 60% 4%)",
      secondary: "hsl(250 40% 14%)",
      secondaryForeground: "hsl(220 40% 96%)",
      muted: "hsl(250 20% 50%)",
      mutedForeground: "hsl(220 20% 70%)",
      accent: "hsl(250 40% 14%)",
      accentForeground: "hsl(220 40% 96%)",
      border: "hsl(220 40% 96% / 0.12)",
      ring: "hsl(190 90% 55%)",
      radius: "1rem",
      displayFont: CORMORANT,
      bodyFont: SPACE,
      bgImage: "radial-gradient(ellipse at 20% 20%, hsl(265 80% 30% / 0.6), transparent 50%), radial-gradient(ellipse at 80% 60%, hsl(190 80% 30% / 0.4), transparent 50%)",
      buttonExtra: "shadow-[0_0_40px_-8px_hsl(265_85%_70%_/_0.7)]",
      cardExtra: "bg-white/[0.04] backdrop-blur-xl border-white/10",
    },
  },
  {
    id: "wedding-gold",
    label: "Wedding Gold",
    tagline: "Ivory, gold, and vows.",
    swatch: ["#fbf8f1", "#b8935a", "#f3ead6"],
    decor: "florals",
    tokens: {
      background: "hsl(40 55% 97%)",
      foreground: "hsl(30 30% 18%)",
      card: "hsl(40 60% 99%)",
      cardForeground: "hsl(30 30% 18%)",
      primary: "hsl(38 45% 48%)",
      primaryForeground: "hsl(40 55% 97%)",
      secondary: "hsl(40 40% 93%)",
      secondaryForeground: "hsl(30 30% 18%)",
      muted: "hsl(35 25% 60%)",
      mutedForeground: "hsl(30 20% 42%)",
      accent: "hsl(40 50% 92%)",
      accentForeground: "hsl(30 30% 18%)",
      border: "hsl(38 45% 48% / 0.28)",
      ring: "hsl(38 45% 48%)",
      radius: "1rem",
      displayFont: CORMORANT,
      bodyFont: INTER,
      bgImage: "radial-gradient(ellipse at top, hsl(40 60% 88% / 0.6), transparent 60%)",
      cardExtra: "border-[color:hsl(38_45%_48%_/_0.25)] shadow-[0_10px_40px_-20px_hsl(38_45%_48%_/_0.4)]",
    },
  },
  {
    id: "birthday-party",
    label: "Birthday Party",
    tagline: "Confetti, balloons, joy.",
    swatch: ["#fff8ee", "#fb7185", "#38bdf8"],
    decor: "confetti",
    tokens: {
      background: "hsl(40 100% 97%)",
      foreground: "hsl(240 30% 15%)",
      card: "hsl(0 0% 100%)",
      cardForeground: "hsl(240 30% 15%)",
      primary: "hsl(345 90% 62%)",
      primaryForeground: "hsl(0 0% 100%)",
      secondary: "hsl(200 90% 92%)",
      secondaryForeground: "hsl(240 30% 15%)",
      muted: "hsl(240 15% 60%)",
      mutedForeground: "hsl(240 15% 42%)",
      accent: "hsl(48 100% 92%)",
      accentForeground: "hsl(240 30% 15%)",
      border: "hsl(240 30% 15% / 0.1)",
      ring: "hsl(345 90% 62%)",
      radius: "1.5rem",
      displayFont: PLAYFAIR,
      bodyFont: INTER,
      bgImage: "linear-gradient(180deg, hsl(48 100% 96%), hsl(340 100% 96%), hsl(200 100% 96%))",
      buttonExtra: "shadow-[0_10px_30px_-10px_hsl(345_90%_62%_/_0.5)]",
    },
  },
  {
    id: "neon-celebration",
    label: "Neon Celebration",
    tagline: "After-hours, all lights on.",
    swatch: ["#080614", "#ec4899", "#22d3ee"],
    decor: "neon",
    tokens: {
      background: "hsl(260 55% 5%)",
      foreground: "hsl(280 40% 96%)",
      card: "hsl(260 40% 10%)",
      cardForeground: "hsl(280 40% 96%)",
      primary: "hsl(320 95% 65%)",
      primaryForeground: "hsl(260 55% 5%)",
      secondary: "hsl(260 40% 14%)",
      secondaryForeground: "hsl(280 40% 96%)",
      muted: "hsl(280 20% 50%)",
      mutedForeground: "hsl(280 20% 72%)",
      accent: "hsl(260 40% 14%)",
      accentForeground: "hsl(280 40% 96%)",
      border: "hsl(320 95% 65% / 0.3)",
      ring: "hsl(180 95% 55%)",
      radius: "1rem",
      displayFont: SPACE,
      bodyFont: SPACE,
      bgImage: "radial-gradient(ellipse at 15% 20%, hsl(320 95% 45% / 0.35), transparent 50%), radial-gradient(ellipse at 85% 80%, hsl(180 95% 45% / 0.3), transparent 50%)",
      buttonExtra: "shadow-[0_0_30px_-2px_hsl(320_95%_65%_/_0.9)] ring-1 ring-white/20",
      cardExtra: "bg-white/[0.04] backdrop-blur-xl border-[color:hsl(320_95%_65%_/_0.4)] shadow-[0_0_40px_-10px_hsl(320_95%_65%_/_0.4)]",
    },
  },
];

export type ThemeId = string;

export function getTheme(id: string | null | undefined): MomentlyTheme {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}

export function themeCssVars(theme: MomentlyTheme): React.CSSProperties {
  const t = theme.tokens;
  return {
    // shadcn-style vars we override for scoped theming
    ["--background" as string]: t.background,
    ["--foreground" as string]: t.foreground,
    ["--card" as string]: t.card,
    ["--card-foreground" as string]: t.cardForeground,
    ["--popover" as string]: t.card,
    ["--popover-foreground" as string]: t.cardForeground,
    ["--primary" as string]: t.primary,
    ["--primary-foreground" as string]: t.primaryForeground,
    ["--secondary" as string]: t.secondary,
    ["--secondary-foreground" as string]: t.secondaryForeground,
    ["--muted" as string]: t.muted,
    ["--muted-foreground" as string]: t.mutedForeground,
    ["--accent" as string]: t.accent,
    ["--accent-foreground" as string]: t.accentForeground,
    ["--border" as string]: t.border,
    ["--input" as string]: t.border,
    ["--ring" as string]: t.ring,
    ["--radius" as string]: t.radius,
    ["--font-display" as string]: t.displayFont,
    ["--font-sans" as string]: t.bodyFont,
    backgroundColor: t.background,
    color: t.foreground,
    fontFamily: t.bodyFont,
  } as React.CSSProperties;
}
