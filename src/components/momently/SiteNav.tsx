import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function SiteNav() {
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSignedIn(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => setSignedIn(!!session));
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <nav className="sticky top-0 z-50 w-full px-6 py-4 flex items-center justify-between border-b border-border bg-background/80 backdrop-blur-md">
      <Link to="/" className="flex items-center gap-2 group">
        <div className="size-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold font-display">M</div>
        <span className="font-semibold tracking-tight text-lg">Momently</span>
      </Link>
      <div className="flex items-center gap-3 md:gap-6">
        {signedIn ? (
          <Link to="/dashboard" className="text-sm font-medium hover:text-primary transition-colors">
            Dashboard
          </Link>
        ) : (
          <Link to="/auth" className="text-sm font-medium hover:text-primary transition-colors">
            Sign in
          </Link>
        )}
        <Link
          to="/create"
          className="px-5 py-2.5 bg-foreground text-background rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Create surprise
        </Link>
      </div>
    </nav>
  );
}
