import type { ReactNode } from "react";
import { getTheme, themeCssVars } from "@/lib/themes";
import { ThemeDecor } from "./ThemeDecor";

export function ThemedShell({
  themeId,
  children,
  className,
}: {
  themeId: string;
  children: ReactNode;
  className?: string;
}) {
  const theme = getTheme(themeId);
  return (
    <div
      data-theme={theme.id}
      style={themeCssVars(theme)}
      className={"relative min-h-screen isolate " + (className ?? "")}
    >
      {theme.tokens.bgImage && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{ backgroundImage: theme.tokens.bgImage }}
        />
      )}
      <ThemeDecor decor={theme.decor} />
      <div className="relative">{children}</div>
    </div>
  );
}
