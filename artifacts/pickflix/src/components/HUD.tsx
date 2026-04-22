import { ReactNode } from "react";
import { Movie } from "../data/movies";

interface HUDProps {
  scrollProgress: number;
  children?: ReactNode;
}

export function HUD({ scrollProgress, children }: HUDProps) {
  return (
    <>
      {/* Radial vignette */}
      <div
        className="fixed inset-0 pointer-events-none z-10"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 50%, transparent 40%, rgba(5,5,5,0.6) 100%)",
        }}
      />

      {/* Top bar */}
      <div
        className="fixed top-0 left-0 right-0 z-20 flex items-center justify-between px-8 py-6 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, rgba(5,5,5,0.8) 0%, transparent 100%)",
        }}
      >
        {/* Pickflix logo with AI · Discover */}
        <div className="flex items-center gap-12">
          <div className="flex items-baseline gap-0 select-none">
            <span
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "20px",
                fontWeight: 700,
                color: "rgba(255,255,255,0.92)",
                textShadow:
                  "0 0 16px rgba(255,42,42,0.7), 0 0 40px rgba(255,42,42,0.25)",
                letterSpacing: "-0.02em",
              }}
            >
              Pick
            </span>
            <span
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "20px",
                fontWeight: 700,
                color: "rgba(220,38,38,1)",
                textShadow:
                  "0 0 16px rgba(255,42,42,1), 0 0 48px rgba(255,42,42,0.7)",
                letterSpacing: "-0.02em",
              }}
            >
              Flix
            </span>
          </div>
          <div style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: "11px",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "rgba(255,120,120,0.5)",
          }}>AI · Discover</div>
        </div>

        {/* Depth meter */}
        <div className="text-right">
          <div className="text-white/20 text-xs tracking-wider uppercase">
            Depth
          </div>
          <div className="text-white/40 text-sm font-mono">
            {Math.floor(scrollProgress * 100)}%
          </div>
        </div>
      </div>

      {/* Bottom ambient text — fades out as you scroll */}
      <div
        className="fixed bottom-0 left-0 right-0 z-20 flex flex-col items-center pb-12"
        style={{
          background:
            "linear-gradient(to top, rgba(5,5,5,0.8) 0%, transparent 100%)",
          pointerEvents: "none",
        }}
      >
        <div
          className="text-center mb-6"
          style={{ opacity: Math.max(0, 1 - scrollProgress * 3) }}
        >
          <div
            className="text-2xl font-light tracking-wider text-white/80 glow-text"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Discover your taste in motion
          </div>
          <div className="mt-2 text-white/25 text-sm tracking-widest uppercase">
            Scroll to enter · Hover to reveal · Click to explore
          </div>
        </div>

        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="rounded-full pulse-dot"
              style={{
                width: "4px",
                height: "4px",
                background: "rgba(255, 42, 42, 0.6)",
                animationDelay: `${i * 0.3}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Left z-axis indicator */}
      <div
        className="fixed left-8 top-1/2 -translate-y-1/2 z-20 pointer-events-none"
        style={{ opacity: 0.4 }}
      >
        <div
          className="w-0.5 rounded-full"
          style={{
            height: "80px",
            background: "linear-gradient(to bottom, transparent, rgba(255,42,42,0.6), transparent)",
          }}
        />
        <div className="mt-2 text-white/25 text-xs tracking-widest uppercase rotate-90 origin-left translate-x-2">
          z-axis
        </div>
      </div>

      {/* Slot for overlays */}
      {children}
    </>
  );
}
