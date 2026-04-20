import { Movie } from "../data/movies";
import { X, Star, Calendar, User, Film, Heart } from "lucide-react";

interface DetailPanelProps {
  movie: Movie;
  onClose: () => void;
  liked?: boolean;
  onLike?: () => void;
}

export function DetailPanel({ movie, onClose, liked, onLike }: DetailPanelProps) {
  return (
    <div
      className="fixed right-0 top-0 h-full w-80 z-40 flex flex-col"
      style={{ animation: "slideIn 0.3s ease-out" }}
      data-testid="detail-panel"
    >
      <div className="glass-panel h-full flex flex-col border-l border-red-900/20">
        <div className="flex items-start justify-between p-6 border-b border-white/5">
          <div className="flex-1 pr-4">
            <h2
              className="text-white font-semibold text-xl leading-tight"
              data-testid="detail-title"
            >
              {movie.title}
            </h2>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-red-400 text-sm font-medium">{movie.year}</span>
              <span className="text-white/20 text-sm">·</span>
              <span className="text-white/40 text-sm">{movie.genre.join(", ")}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors"
            data-testid="button-close-detail"
          >
            <X size={14} className="text-white/60" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-red-950/20 border border-red-900/20">
            <Star size={18} className="text-red-400 shrink-0" />
            <div>
              <div className="text-white font-semibold text-2xl leading-none">
                {movie.rating.toFixed(1)}
              </div>
              <div className="text-white/40 text-xs mt-0.5">Rating Score</div>
            </div>
            <div className="ml-auto">
              <div className="flex gap-0.5">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-1.5 h-6 rounded-full"
                    style={{
                      background: i < Math.floor(movie.rating)
                        ? "rgba(255, 42, 42, 0.8)"
                        : "rgba(255, 255, 255, 0.05)",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <User size={14} className="text-white/30 mt-0.5 shrink-0" />
              <div>
                <div className="text-white/30 text-xs uppercase tracking-wider mb-1">Director</div>
                <div className="text-white text-sm font-medium">{movie.director}</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar size={14} className="text-white/30 mt-0.5 shrink-0" />
              <div>
                <div className="text-white/30 text-xs uppercase tracking-wider mb-1">Year</div>
                <div className="text-white text-sm font-medium">{movie.year}</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Film size={14} className="text-white/30 mt-0.5 shrink-0" />
              <div>
                <div className="text-white/30 text-xs uppercase tracking-wider mb-1">Genre</div>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {movie.genre.map((g) => (
                    <span
                      key={g}
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        background: "rgba(255, 42, 42, 0.12)",
                        border: "1px solid rgba(255, 42, 42, 0.2)",
                        color: "rgba(255, 120, 120, 0.9)",
                      }}
                    >
                      {g}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-white/5 pt-5">
            <div className="text-white/30 text-xs uppercase tracking-wider mb-2">Synopsis</div>
            <p className="text-white/60 text-sm leading-relaxed">{movie.description}</p>
          </div>

          <div className="border-t border-white/5 pt-5">
            <div className="text-white/30 text-xs uppercase tracking-wider mb-3">Similarity Cluster</div>
            <div className="flex gap-1 flex-wrap">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="h-1 rounded-full"
                  style={{
                    width: `${20 + Math.sin(i * 1.7) * 15}px`,
                    background: `rgba(255, 42, 42, ${0.2 + i * 0.08})`,
                  }}
                />
              ))}
            </div>
            <p className="text-white/25 text-xs mt-2">
              {Math.floor(movie.rating * 12)} similar films in proximity
            </p>
          </div>
        </div>

        <div className="p-6 border-t border-white/5 flex gap-2">
          {onLike && (
            <button
              onClick={onLike}
              className="flex items-center justify-center gap-2 flex-1 py-2.5 rounded-lg text-sm font-medium transition-all"
              style={{
                background: liked
                  ? "rgba(220,38,38,0.25)"
                  : "rgba(255,255,255,0.05)",
                border: liked
                  ? "1px solid rgba(220,38,38,0.5)"
                  : "1px solid rgba(255,255,255,0.08)",
                color: liked ? "rgba(255,120,120,0.9)" : "rgba(255,255,255,0.5)",
              }}
              data-testid="button-like"
            >
              <Heart
                size={14}
                fill={liked ? "rgba(220,38,38,0.9)" : "none"}
              />
              {liked ? "Liked" : "Like"}
            </button>
          )}
          <button
            className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all"
            style={{
              background: "rgba(255, 42, 42, 0.15)",
              border: "1px solid rgba(255, 42, 42, 0.3)",
              color: "rgba(255, 120, 120, 0.9)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "rgba(255, 42, 42, 0.25)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "rgba(255, 42, 42, 0.15)";
            }}
            data-testid="button-find-similar"
          >
            Find Similar
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
