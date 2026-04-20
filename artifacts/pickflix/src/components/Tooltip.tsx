import { Movie } from "../data/movies";

interface TooltipProps {
  movie: Movie;
  position: { x: number; y: number };
}

export function Tooltip({ movie, position }: TooltipProps) {
  const offsetX = position.x > window.innerWidth * 0.7 ? -180 : 16;
  const offsetY = position.y > window.innerHeight * 0.7 ? -80 : 16;

  return (
    <div
      className="pointer-events-none fixed z-30 select-none"
      style={{
        left: position.x + offsetX,
        top: position.y + offsetY,
      }}
      data-testid="movie-tooltip"
    >
      <div
        className="glass-panel rounded-lg px-3 py-2 min-w-[160px]"
        style={{
          animation: "fadeIn 0.15s ease-out",
        }}
      >
        <div className="text-sm font-semibold text-white leading-tight">
          {movie.title}
        </div>
        <div className="mt-1 flex items-center gap-2">
          <div className="text-xs text-red-400 font-medium">
            ★ {movie.rating.toFixed(1)}
          </div>
          <div className="text-xs text-white/40">{movie.year}</div>
        </div>
        <div className="mt-1 text-xs text-white/40">
          {movie.genre.join(" · ")}
        </div>
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
