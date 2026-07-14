import { useMemo } from "react";
import type { ThemeDecor as Decor } from "@/lib/themes";

export function ThemeDecor({ decor }: { decor: Decor }) {
  if (decor === "none") return null;
  if (decor === "stars") return <Stars />;
  if (decor === "petals") return <Petals />;
  if (decor === "confetti") return <Confetti />;
  if (decor === "neon") return <NeonGrid />;
  if (decor === "shine") return <Shine />;
  if (decor === "florals") return <Florals />;
  return null;
}

function seedArray(n: number) {
  return Array.from({ length: n }, (_, i) => i);
}

function Stars() {
  const stars = useMemo(
    () =>
      seedArray(70).map((i) => ({
        top: `${(i * 37) % 100}%`,
        left: `${(i * 73) % 100}%`,
        size: (i % 3) + 1,
        delay: (i % 10) * 0.3,
        opacity: 0.3 + ((i * 7) % 70) / 100,
      })),
    [],
  );
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {stars.map((s, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            top: s.top,
            left: s.left,
            width: s.size,
            height: s.size,
            opacity: s.opacity,
            animation: `momently-twinkle 4s ease-in-out ${s.delay}s infinite`,
          }}
        />
      ))}
      <style>{`@keyframes momently-twinkle { 0%,100%{opacity:.2} 50%{opacity:1} }`}</style>
    </div>
  );
}

function Petals() {
  const petals = useMemo(
    () =>
      seedArray(14).map((i) => ({
        left: `${(i * 71) % 100}%`,
        delay: (i % 7) * 1.2,
        duration: 12 + (i % 8),
        size: 14 + (i % 5) * 4,
      })),
    [],
  );
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {petals.map((p, i) => (
        <span
          key={i}
          className="absolute -top-10"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            animation: `momently-fall ${p.duration}s linear ${p.delay}s infinite`,
          }}
        >
          <svg viewBox="0 0 20 20" fill="hsl(345 80% 78% / 0.7)">
            <path d="M10 2 C13 6 18 10 10 18 C2 10 7 6 10 2 Z" />
          </svg>
        </span>
      ))}
      <style>{`@keyframes momently-fall { 0%{transform:translateY(-10vh) rotate(0)} 100%{transform:translateY(110vh) rotate(360deg)} }`}</style>
    </div>
  );
}

function Confetti() {
  const bits = useMemo(
    () =>
      seedArray(40).map((i) => {
        const colors = ["#fb7185", "#38bdf8", "#facc15", "#a78bfa", "#4ade80"];
        return {
          left: `${(i * 53) % 100}%`,
          color: colors[i % colors.length],
          delay: (i % 12) * 0.6,
          duration: 8 + (i % 6),
          size: 6 + (i % 4) * 2,
          rot: (i * 47) % 360,
        };
      }),
    [],
  );
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {bits.map((b, i) => (
        <span
          key={i}
          className="absolute -top-10 rounded-sm"
          style={{
            left: b.left,
            width: b.size,
            height: b.size * 1.6,
            background: b.color,
            transform: `rotate(${b.rot}deg)`,
            animation: `momently-confetti ${b.duration}s linear ${b.delay}s infinite`,
          }}
        />
      ))}
      <style>{`@keyframes momently-confetti { 0%{transform:translateY(-10vh) rotate(0)} 100%{transform:translateY(110vh) rotate(720deg)} }`}</style>
    </div>
  );
}

function NeonGrid() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(hsl(320 95% 65% / 0.15) 1px, transparent 1px), linear-gradient(90deg, hsl(180 95% 55% / 0.15) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          maskImage: "radial-gradient(ellipse at center, black 20%, transparent 70%)",
        }}
      />
      <div className="absolute -top-40 -left-40 size-[500px] rounded-full bg-fuchsia-500/30 blur-[120px] animate-pulse" />
      <div
        className="absolute -bottom-40 -right-40 size-[500px] rounded-full bg-cyan-400/25 blur-[120px] animate-pulse"
        style={{ animationDelay: "1.5s" }}
      />
    </div>
  );
}

function Shine() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background:
            "conic-gradient(from 210deg at 50% 0%, transparent, hsl(45 60% 40% / 0.25), transparent 40%)",
        }}
      />
    </div>
  );
}

function Florals() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <svg
        className="absolute -top-10 -left-10 w-72 opacity-30"
        viewBox="0 0 200 200"
        fill="none"
        stroke="hsl(38 45% 48%)"
        strokeWidth="0.8"
      >
        <circle cx="100" cy="100" r="70" />
        <circle cx="100" cy="100" r="55" />
        <circle cx="100" cy="100" r="40" />
        <path d="M100 30 Q120 100 100 170 Q80 100 100 30 Z" />
        <path d="M30 100 Q100 80 170 100 Q100 120 30 100 Z" />
      </svg>
      <svg
        className="absolute -bottom-16 -right-10 w-80 opacity-25 rotate-45"
        viewBox="0 0 200 200"
        fill="none"
        stroke="hsl(38 45% 48%)"
        strokeWidth="0.8"
      >
        <circle cx="100" cy="100" r="70" />
        <path d="M100 30 Q120 100 100 170 Q80 100 100 30 Z" />
        <path d="M30 100 Q100 80 170 100 Q100 120 30 100 Z" />
      </svg>
    </div>
  );
}
