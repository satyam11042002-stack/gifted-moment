import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { toast } from "sonner";
import { Copy, Download, Share2, ExternalLink, QrCode } from "lucide-react";

export function ShareCard({
  url,
  recipientName,
}: {
  url: string;
  recipientName?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    QRCode.toCanvas(el, url, {
      width: 220,
      margin: 1,
      color: { dark: "#0f0f0f", light: "#ffffff" },
      errorCorrectionLevel: "M",
    }).catch(() => {});
    QRCode.toDataURL(url, {
      width: 720,
      margin: 2,
      errorCorrectionLevel: "H",
      color: { dark: "#0f0f0f", light: "#ffffff" },
    }).then(setDataUrl).catch(() => {});
  }, [url]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied");
    } catch {
      toast.error("Couldn't copy");
    }
  };

  const download = () => {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `momently-${(recipientName || "surprise").toLowerCase().replace(/\s+/g, "-")}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const share = async () => {
    const shareData = {
      title: recipientName ? `A moment for ${recipientName}` : "A Momently surprise",
      text: "Someone made this just for you.",
      url,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        /* user cancelled */
      }
    } else {
      copy();
    }
  };

  return (
    <div className="rounded-3xl border border-border bg-card p-6">
      <div className="flex items-center gap-2 mb-4">
        <QrCode className="size-4 text-primary" />
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
          Share this moment
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-5">
        <div className="rounded-2xl bg-white p-3 shadow-md ring-1 ring-black/5 shrink-0">
          <canvas
            ref={canvasRef}
            width={220}
            height={220}
            aria-label="QR code to open surprise"
            className="block"
          />
        </div>

        <div className="flex-1 w-full min-w-0">
          <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">
            Direct link
          </p>
          <div className="flex items-center gap-2 mb-4">
            <code className="flex-1 truncate text-sm font-mono px-3 py-2 rounded-lg bg-accent">
              {url}
            </code>
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-lg border border-border hover:bg-accent"
              aria-label="Open"
            >
              <ExternalLink className="size-4" />
            </a>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={copy}
              className="rounded-full border border-border py-2.5 text-sm font-medium hover:bg-accent inline-flex items-center justify-center gap-2"
            >
              <Copy className="size-4" /> Copy
            </button>
            <button
              onClick={download}
              disabled={!dataUrl}
              className="rounded-full border border-border py-2.5 text-sm font-medium hover:bg-accent disabled:opacity-50 inline-flex items-center justify-center gap-2"
            >
              <Download className="size-4" /> QR
            </button>
            <button
              onClick={share}
              className="rounded-full bg-primary text-primary-foreground py-2.5 text-sm font-semibold shadow-lg shadow-primary/20 inline-flex items-center justify-center gap-2"
            >
              <Share2 className="size-4" /> Share
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
