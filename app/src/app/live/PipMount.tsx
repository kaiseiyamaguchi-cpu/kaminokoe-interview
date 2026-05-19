"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type Suggestion = {
  id: string;
  content: string;
  cues?: string[];
  matchedPrepTitle?: string | null;
} | null;

export function PipMount({
  latestQuestion,
  latestSuggestion,
  remainingSec,
  onClose,
}: {
  latestQuestion: string;
  latestSuggestion: Suggestion;
  remainingSec: number;
  onClose: () => void;
}) {
  const [pipWindow, setPipWindow] = useState<Window | null>(null);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dpip = (window as any).documentPictureInPicture as
      | { window: Window | null; requestWindow: (o: { width: number; height: number }) => Promise<Window> }
      | undefined;

    if (!dpip) return;

    const existing = dpip.window;
    if (existing) {
      setPipWindow(existing);
      return;
    }
    dpip.requestWindow({ width: 380, height: 520 }).then((w) => {
      setPipWindow(w);
    });
  }, []);

  useEffect(() => {
    if (!pipWindow) return;
    // copy our styles to PiP window
    Array.from(document.styleSheets).forEach((sheet) => {
      try {
        if (sheet.cssRules) {
          const style = pipWindow.document.createElement("style");
          style.textContent = Array.from(sheet.cssRules).map((r) => r.cssText).join("\n");
          pipWindow.document.head.appendChild(style);
        } else if (sheet.href) {
          const link = pipWindow.document.createElement("link");
          link.rel = "stylesheet";
          link.href = sheet.href;
          pipWindow.document.head.appendChild(link);
        }
      } catch {
        if (sheet.href) {
          const link = pipWindow.document.createElement("link");
          link.rel = "stylesheet";
          link.href = sheet.href;
          pipWindow.document.head.appendChild(link);
        }
      }
    });
    pipWindow.document.body.style.margin = "0";
    pipWindow.document.body.style.background = "rgba(15,15,25,0.94)";
    pipWindow.document.body.style.color = "#f1f5f9";
    pipWindow.document.body.style.fontFamily = '-apple-system, "Hiragino Sans", "Noto Sans JP", sans-serif';
    const handleClose = () => onClose();
    pipWindow.addEventListener("pagehide", handleClose);
    return () => {
      pipWindow.removeEventListener("pagehide", handleClose);
    };
  }, [pipWindow, onClose]);

  if (!pipWindow) return null;

  const fmt = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  return createPortal(
    <div style={{ padding: 0, minHeight: "100vh", background: "rgba(15,15,25,0.96)" }}>
      <div style={{
        padding: "8px 14px",
        background: "rgba(255,255,255,0.04)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        fontSize: 11, color: "#c7d2fe", fontWeight: 700,
      }}>
        <span>💡 かんぺAI</span>
        <span style={{ color: "#94a3b8", fontFamily: "ui-monospace, monospace" }}>⏱ {fmt(remainingSec)}</span>
      </div>

      <div style={{ padding: "14px 16px 16px" }}>
        <div style={{
          fontSize: 10, color: "#fbbf24", textTransform: "uppercase",
          letterSpacing: "0.06em", fontWeight: 700, marginBottom: 6,
        }}>❓ 直近の質問</div>
        <div style={{
          fontSize: 12, color: "#fde68a", background: "rgba(251,191,36,0.06)",
          borderLeft: "2px solid #fbbf24", padding: "8px 12px", borderRadius: 4,
          marginBottom: 14, lineHeight: 1.5,
        }}>
          {latestQuestion || "音声を待っています..."}
        </div>

        <div style={{
          fontSize: 10, color: "#a5b4fc", textTransform: "uppercase",
          letterSpacing: "0.06em", fontWeight: 700, marginBottom: 8,
        }}>💡 回答候補</div>

        {latestSuggestion ? (
          <>
            <div style={{
              fontSize: 15, lineHeight: 1.7, color: "#f8fafc", marginBottom: 12,
            }}>
              {latestSuggestion.content}
            </div>

            {latestSuggestion.cues && latestSuggestion.cues.length > 0 && (
              <div style={{
                borderTop: "1px solid rgba(255,255,255,0.08)",
                paddingTop: 10, marginBottom: 10,
              }}>
                <div style={{
                  fontSize: 10, color: "#64748b", textTransform: "uppercase",
                  letterSpacing: "0.06em", fontWeight: 700, marginBottom: 6,
                }}>▼ 触れるべき要素</div>
                {latestSuggestion.cues.map((c, i) => (
                  <div key={i} style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.7 }}>
                    <span style={{ color: "#fbbf24" }}>▸</span> {c}
                  </div>
                ))}
              </div>
            )}

            {latestSuggestion.matchedPrepTitle && (
              <div style={{
                fontSize: 10, color: "#64748b", marginTop: 6,
                background: "rgba(255,255,255,0.04)", padding: "4px 8px",
                borderRadius: 4, display: "inline-block",
              }}>📌 {latestSuggestion.matchedPrepTitle}</div>
            )}
          </>
        ) : (
          <div style={{ fontSize: 12, color: "#64748b" }}>質問が来ると回答候補がここに出ます</div>
        )}
      </div>
    </div>,
    pipWindow.document.body,
  );
}
