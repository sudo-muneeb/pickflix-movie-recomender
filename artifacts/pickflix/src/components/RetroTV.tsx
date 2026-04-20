import { useEffect, useRef, useState, useCallback } from "react";

type TVPhase = "off" | "flicker" | "static" | "clearing" | "on";

interface RetroCRTProps {
  visible: boolean;
  onEnter?: () => void;
}

function useNoiseCanvas(phase: TVPhase) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    cancelAnimationFrame(rafRef.current);

    if (phase === "off" || phase === "flicker") {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    startTimeRef.current = performance.now();

    const draw = (now: number) => {
      const elapsed = (now - startTimeRef.current) / 1000;
      const W = canvas.width;
      const H = canvas.height;

      if (phase === "static") {
        const imageData = ctx.createImageData(W, H);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
          const v = Math.random() * 255;
          const r = v > 180 ? Math.min(255, v * 1.4) : v * 0.3;
          data[i] = r;
          data[i + 1] = 0;
          data[i + 2] = 0;
          data[i + 3] = 255;
        }
        ctx.putImageData(imageData, 0, 0);
        ctx.fillStyle = "rgba(0,0,0,0.18)";
        ctx.fillRect(0, 0, W, H);
        rafRef.current = requestAnimationFrame(draw);
        return;
      }

      if (phase === "clearing") {
        const progress = Math.min(1, elapsed / 1.2);
        const eased = 1 - Math.pow(1 - progress, 3);

        const imageData = ctx.createImageData(W, H);
        const data = imageData.data;
        const noiseStrength = 1 - eased;
        for (let i = 0; i < data.length; i += 4) {
          const v = Math.random() * 255 * noiseStrength;
          data[i] = v * 0.5;
          data[i + 1] = 0;
          data[i + 2] = 0;
          data[i + 3] = 255;
        }
        ctx.putImageData(imageData, 0, 0);

        const redAlpha = eased * 0.35;
        ctx.fillStyle = `rgba(180, 10, 10, ${redAlpha})`;
        ctx.fillRect(0, 0, W, H);

        rafRef.current = requestAnimationFrame(draw);
        return;
      }

      if (phase === "on") {
        ctx.clearRect(0, 0, W, H);
        const grd = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * 0.65);
        grd.addColorStop(0, "rgba(200, 20, 20, 0.32)");
        grd.addColorStop(0.5, "rgba(160, 8, 8, 0.2)");
        grd.addColorStop(1, "rgba(80, 0, 0, 0.05)");
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, W, H);

        const breathe = Math.sin(now * 0.001) * 0.04 + 0.96;
        ctx.globalAlpha = breathe;
        ctx.fillStyle = "rgba(255, 30, 30, 0.04)";
        ctx.fillRect(0, 0, W, H);
        ctx.globalAlpha = 1;

        rafRef.current = requestAnimationFrame(draw);
        return;
      }
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => cancelAnimationFrame(rafRef.current);
  }, [phase]);

  return canvasRef;
}

export function RetroTV({ visible, onEnter }: RetroCRTProps) {
  const [phase, setPhase] = useState<TVPhase>("off");
  const [flickerOn, setFlickerOn] = useState(false);
  const [tvVisible, setTvVisible] = useState(false);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const hasAnimatedRef = useRef(false);
  const canvasRef = useNoiseCanvas(phase);

  const clearTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  const schedule = useCallback((fn: () => void, delay: number) => {
    const id = setTimeout(fn, delay);
    timeoutsRef.current.push(id);
    return id;
  }, []);

  useEffect(() => {
    if (visible && !hasAnimatedRef.current) {
      hasAnimatedRef.current = true;
      setTvVisible(true);

      schedule(() => setFlickerOn(true), 130);
      schedule(() => setFlickerOn(false), 180);
      schedule(() => setFlickerOn(true), 225);
      schedule(() => setFlickerOn(false), 245);
      schedule(() => setFlickerOn(true), 275);
      schedule(() => setFlickerOn(false), 285);
      schedule(() => setFlickerOn(true), 305);
      schedule(() => {
        setPhase("static");
        setFlickerOn(true);
      }, 340);
      schedule(() => setPhase("clearing"), 900);
      schedule(() => setPhase("on"), 1500);
    }

    if (!visible) {
      clearTimeouts();
      setPhase("off");
      setFlickerOn(false);
      setTvVisible(false);
      hasAnimatedRef.current = false;
    }

    return clearTimeouts;
  }, [visible, schedule, clearTimeouts]);

  if (!tvVisible) return null;

  const screenLit = phase !== "off" && flickerOn;
  const showText = phase === "on";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        background: "rgba(4,2,2,0.4)",
        animation: tvVisible ? "tvOverlayIn 0.6s ease-out forwards" : undefined,
      }}
      data-testid="retro-tv-overlay"
    >
      <div style={{ perspective: "1200px" }}>
        <div
          style={{
            transform: "rotateX(3deg) rotateY(-1deg)",
            transformStyle: "preserve-3d",
            position: "relative",
          }}
        >
          <div
            style={{
              width: "480px",
              height: "380px",
              background: "linear-gradient(145deg, #1a1210 0%, #0e0a08 40%, #0a0705 100%)",
              borderRadius: "28px 28px 22px 22px",
              border: "3px solid #2a1a14",
              position: "relative",
              boxShadow: `
                0 0 60px rgba(255,42,42,0.18),
                0 0 120px rgba(255,42,42,0.08),
                0 0 200px rgba(255,42,42,0.04),
                inset 0 2px 4px rgba(255,255,255,0.04),
                inset 0 -2px 8px rgba(0,0,0,0.8),
                0 30px 60px rgba(0,0,0,0.8)
              `,
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "3px",
                left: "3px",
                right: "3px",
                height: "50%",
                borderRadius: "25px 25px 0 0",
                background: "linear-gradient(180deg, rgba(255,255,255,0.035) 0%, transparent 100%)",
                pointerEvents: "none",
              }}
            />

            <div
              style={{
                position: "absolute",
                top: "28px",
                left: "28px",
                right: "28px",
                height: "268px",
                borderRadius: "14px",
                overflow: "hidden",
                background: "#050202",
                boxShadow: screenLit
                  ? `inset 0 0 30px rgba(180,10,10,0.5), inset 0 0 60px rgba(100,0,0,0.3), 0 0 20px rgba(255,42,42,0.3)`
                  : `inset 0 0 20px rgba(0,0,0,0.95)`,
                transition: "box-shadow 0.05s",
              }}
            >
              <canvas
                ref={canvasRef}
                width={424}
                height={268}
                style={{
                  width: "100%",
                  height: "100%",
                  display: "block",
                  borderRadius: "12px",
                }}
              />

              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.08) 3px, rgba(0,0,0,0.08) 4px)",
                  pointerEvents: "none",
                  borderRadius: "12px",
                }}
              />

              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "radial-gradient(ellipse 80% 70% at 50% 50%, transparent 40%, rgba(0,0,0,0.55) 100%)",
                  pointerEvents: "none",
                  borderRadius: "12px",
                }}
              />

              {showText && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "20px 24px 20px",
                    animation: "textReveal 0.8s ease-out forwards",
                  }}
                >
                  {/* ── CTA ── */}
                  <button
                    onClick={onEnter}
                    data-testid="tv-tagline"
                    style={{
                      background: "none",
                      border: "none",
                      cursor: onEnter ? "pointer" : "default",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "8px",
                      padding: 0,
                    }}
                  >
                    <span style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: "19px",
                      fontWeight: 500,
                      color: "rgba(255,210,210,0.95)",
                      textAlign: "center",
                      lineHeight: 1.35,
                      textShadow: "0 0 20px rgba(255,42,42,0.9), 0 0 55px rgba(255,42,42,0.5)",
                      letterSpacing: "0.01em",
                      transition: "text-shadow 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.textShadow =
                        "0 0 28px rgba(255,42,42,1), 0 0 70px rgba(255,42,42,0.8)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.textShadow =
                        "0 0 20px rgba(255,42,42,0.9), 0 0 55px rgba(255,42,42,0.5)";
                    }}
                    >
                      What will you watch tonight?
                    </span>
                    <div style={{
                      width: "48px",
                      height: "1px",
                      background: "linear-gradient(to right, transparent, rgba(255,42,42,0.7), transparent)",
                    }} />
                    {onEnter && (
                      <span style={{
                        fontFamily: "'Space Grotesk', sans-serif",
                        fontSize: "9px",
                        letterSpacing: "0.28em",
                        textTransform: "uppercase",
                        color: "rgba(255,80,80,0.35)",
                      }}>click to browse</span>
                    )}
                  </button>

                  {/* ── Divider dot ── */}
                  <div style={{
                    width: "4px",
                    height: "4px",
                    borderRadius: "50%",
                    background: "rgba(255,42,42,0.45)",
                    boxShadow: "0 0 8px rgba(255,42,42,0.6)",
                    animation: "pulse-glow 2s ease-in-out infinite",
                  }} />
                </div>
              )}
            </div>

            <div
              style={{
                position: "absolute",
                bottom: "20px",
                left: "28px",
                right: "90px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: screenLit ? "#ff2a2a" : "#1a0808",
                  boxShadow: screenLit ? "0 0 8px rgba(255,42,42,0.9), 0 0 20px rgba(255,42,42,0.5)" : "none",
                  transition: "all 0.1s",
                }}
              />
              <div
                style={{
                  flex: 1,
                  height: "2px",
                  background: "linear-gradient(to right, rgba(255,42,42,0.15), transparent)",
                  borderRadius: "1px",
                }}
              />
              <div
                style={{
                  fontFamily: "monospace",
                  fontSize: "9px",
                  color: "rgba(255,80,80,0.25)",
                  letterSpacing: "0.2em",
                }}
              >
                CINE·1
              </div>
            </div>

            <div
              style={{
                position: "absolute",
                right: "24px",
                bottom: "16px",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              {[0, 1].map((i) => (
                <div
                  key={i}
                  style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    background:
                      "radial-gradient(circle at 35% 35%, #2a1a14, #0e0805)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    boxShadow:
                      "inset 0 1px 2px rgba(255,255,255,0.05), 0 1px 3px rgba(0,0,0,0.8)",
                  }}
                />
              ))}
            </div>
          </div>

          <div
            style={{
              position: "absolute",
              bottom: "-38px",
              left: "50%",
              transform: "translateX(-50%)",
              width: "300px",
              height: "38px",
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "center",
              gap: "120px",
            }}
          >
            {["left", "right"].map((side) => (
              <div
                key={side}
                style={{
                  width: "18px",
                  height: "38px",
                  background:
                    "linear-gradient(180deg, #0e0a08, #080504)",
                  borderRadius: "0 0 4px 4px",
                  border: "1px solid rgba(42,26,20,0.8)",
                  borderTop: "none",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.6)",
                }}
              />
            ))}
          </div>

          <div
            style={{
              position: "absolute",
              bottom: "-46px",
              left: "50%",
              transform: "translateX(-50%)",
              width: "360px",
              height: "8px",
              background: "linear-gradient(180deg, #0a0706, #060403)",
              borderRadius: "0 0 6px 6px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes tvOverlayIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes textReveal {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
