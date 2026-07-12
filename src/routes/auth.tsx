import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in — Momently" }, { name: "robots", content: "noindex" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard", replace: true });
    });
  }, [navigate]);

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast.success("Welcome to Momently. Check your inbox to confirm.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/dashboard", replace: true });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const handleGoogle = async () => {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) {
      toast.error(result.error.message ?? "Google sign-in failed");
      setBusy(false);
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/dashboard", replace: true });
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-primary/10 via-accent to-background relative overflow-hidden">
        <Link to="/" className="flex items-center gap-2">
          <div className="size-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold font-display">M</div>
          <span className="font-semibold text-lg">Momently</span>
        </Link>
        <div>
          <h2 className="font-display italic text-5xl leading-tight mb-4 max-w-md">
            Every surprise, wrapped in light.
          </h2>
          <p className="text-muted-foreground max-w-sm">
            Sign in to craft ephemeral moments for the people who matter most.
          </p>
        </div>
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
          Momently · 2026
        </p>
      </div>

      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="flex gap-2 mb-8 bg-accent rounded-full p-1">
            {(["signin", "signup"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={
                  "flex-1 py-2 rounded-full text-sm font-medium transition-all " +
                  (mode === m ? "bg-background shadow-sm" : "text-muted-foreground")
                }
              >
                {m === "signin" ? "Sign in" : "Sign up"}
              </button>
            ))}
          </div>

          <h1 className="font-display text-3xl mb-2">
            {mode === "signin" ? "Welcome back." : "Create your account."}
          </h1>
          <p className="text-muted-foreground text-sm mb-8">
            {mode === "signin" ? "Sign in to keep creating moments." : "Get started in seconds. It's free."}
          </p>

          <button
            onClick={handleGoogle}
            disabled={busy}
            className="w-full py-3 rounded-full border border-border bg-card font-medium hover:bg-accent transition-colors mb-4 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>Continue with Google</span>
          </button>

          <div className="flex items-center gap-3 my-6">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={handleEmail} className="space-y-4">
            <div>
              <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Email</label>
              <input
                type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full mt-1 px-4 py-3 rounded-xl border border-border bg-card focus:border-primary outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Password</label>
              <input
                type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full mt-1 px-4 py-3 rounded-xl border border-border bg-card focus:border-primary outline-none"
              />
            </div>
            <button
              type="submit" disabled={busy}
              className="w-full py-3 rounded-full bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/20 hover:shadow-xl transition-all disabled:opacity-60"
            >
              {busy ? "..." : mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>

          <Link to="/" className="block text-center text-sm text-muted-foreground mt-6 hover:text-primary">
            ← Back home
          </Link>
        </div>
      </div>
    </div>
  );
}
