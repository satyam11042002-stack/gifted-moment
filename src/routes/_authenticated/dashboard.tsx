import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { listMySurprises } from "@/lib/surprises.functions";
import { SiteNav } from "@/components/momently/SiteNav";
import { CountdownInline } from "@/components/momently/CountdownRing";
import { occasionLabel } from "@/lib/momently";
import { supabase } from "@/integrations/supabase/client";
import { Plus, LogOut } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Momently" }, { name: "robots", content: "noindex" }] }),
  component: Dashboard,
});

type Row = Awaited<ReturnType<typeof listMySurprises>>[number];

function Dashboard() {
  const list = useServerFn(listMySurprises);
  const navigate = useNavigate();
  const [items, setItems] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { list().then((d) => { setItems(d); setLoading(false); }); }, [list]);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  };

  const now = Date.now();
  const status = (r: Row) => {
    if (!r.is_published) return { label: "Draft", tone: "bg-muted/20 text-muted-foreground" };
    if (r.expires_at && new Date(r.expires_at).getTime() < now) return { label: "Expired", tone: "bg-destructive/10 text-destructive" };
    return { label: "Live", tone: "bg-primary/10 text-primary" };
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-10 flex-wrap gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary mb-2">Your moments</p>
            <h1 className="font-display italic text-5xl">Dashboard</h1>
          </div>
          <div className="flex gap-3">
            <Link to="/create" className="px-5 py-3 rounded-full bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/20 flex items-center gap-2">
              <Plus className="size-4" /> New surprise
            </Link>
            <button onClick={signOut} className="p-3 rounded-full border border-border hover:bg-accent" title="Sign out">
              <LogOut className="size-4" />
            </button>
          </div>
        </div>

        {loading ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : items.length === 0 ? (
          <div className="border border-dashed border-border rounded-3xl p-16 text-center">
            <h2 className="font-display text-3xl mb-3">No surprises yet.</h2>
            <p className="text-muted-foreground mb-6">Craft the first one — it takes about two minutes.</p>
            <Link to="/create" className="inline-block px-6 py-3 rounded-full bg-foreground text-background font-medium">
              Create a surprise
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map((r) => {
              const st = status(r);
              return (
                <Link key={r.id} to="/preview/$id" params={{ id: r.id }}
                  className="group rounded-3xl border border-border bg-card overflow-hidden hover:border-primary/50 transition-colors">
                  <div className="aspect-[4/3] bg-accent relative overflow-hidden">
                    {r.cover_image_url ? (
                      <img src={r.cover_image_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full grid place-items-center bg-gradient-to-br from-primary/10 to-accent">
                        <span className="font-display italic text-3xl text-primary/40">momently</span>
                      </div>
                    )}
                    <span className={"absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-widest " + st.tone}>
                      {st.label}
                    </span>
                  </div>
                  <div className="p-5">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                      {occasionLabel(r.occasion)}
                    </p>
                    <h3 className="font-display text-xl truncate">{r.recipient_name || "Untitled"}</h3>
                    {r.is_published && r.expires_at && (
                      <p className="text-xs text-muted-foreground mt-2 font-mono">
                        <CountdownInline expiresAt={r.expires_at} /> left
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
