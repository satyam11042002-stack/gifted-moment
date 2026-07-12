export function SiteFooter() {
  return (
    <footer className="px-6 py-16 border-t border-border">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex items-center gap-2">
          <div className="size-6 bg-primary rounded-full" />
          <span className="font-semibold">Momently</span>
        </div>
        <div className="flex gap-8 text-sm text-muted-foreground">
          <a href="#" className="hover:text-primary transition-colors">Privacy</a>
          <a href="#" className="hover:text-primary transition-colors">Terms</a>
          <a href="#" className="hover:text-primary transition-colors">Instagram</a>
        </div>
        <p className="text-xs text-muted-foreground/70">Making time matter, since today.</p>
      </div>
    </footer>
  );
}
