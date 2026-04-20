export function LoadingScreen() {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ background: "#050505" }}
      data-testid="loading-screen"
    >
      <div className="mb-8 flex gap-3">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-full"
            style={{
              width: i === 2 ? "10px" : i === 1 || i === 3 ? "7px" : "5px",
              height: i === 2 ? "10px" : i === 1 || i === 3 ? "7px" : "5px",
              background: "rgba(255, 42, 42, 0.8)",
              animation: `pulseLoad 1.4s ease-in-out ${i * 0.12}s infinite`,
              boxShadow: "0 0 8px rgba(255, 42, 42, 0.6)",
            }}
          />
        ))}
      </div>
      <div
        className="text-white/20 text-xs tracking-[0.4em] uppercase"
        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
      >
        Initializing Field
      </div>
      <style>{`
        @keyframes pulseLoad {
          0%, 100% { opacity: 0.2; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.3); }
        }
      `}</style>
    </div>
  );
}
