import { X, Sparkles } from "lucide-react";
import { MovieOut } from "../lib/api";

const TMDB_BASE = "https://image.tmdb.org/t/p/w300";
const MAX_VISIBLE = 5;

interface LikedTrayProps {
  likedMovies: MovieOut[];
  onRemove: (index: number) => void;
  onGetRecs: () => void;
}

export function LikedTray({ likedMovies, onRemove, onGetRecs }: LikedTrayProps) {
  if (likedMovies.length === 0) return null;

  const visible = likedMovies.slice(0, MAX_VISIBLE);
  const overflow = likedMovies.length - MAX_VISIBLE;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center gap-4 px-6 py-3"
      style={{
        background: "rgba(5,5,5,0.85)",
        backdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(255,42,42,0.15)",
        boxShadow: "0 -4px 24px rgba(0,0,0,0.5)",
      }}
    >
      {/* Label */}
      <div
        className="text-white/40 text-xs uppercase tracking-widest shrink-0 hidden sm:block"
        style={{ letterSpacing: "0.2em" }}
      >
        Liked
      </div>

      {/* Thumbnails */}
      <div className="flex items-center gap-2 flex-1 overflow-hidden">
        {visible.map((movie) => {
          const posterUrl = movie.poster_path
            ? `${TMDB_BASE}${movie.poster_path}`
            : null;
          return (
            <div
              key={movie.movie_index}
              className="relative shrink-0 group"
              style={{ width: 48, height: 64 }}
            >
              {posterUrl ? (
                <img
                  src={posterUrl}
                  alt={movie.title}
                  className="w-full h-full object-cover rounded-md"
                  style={{ border: "1px solid rgba(255,42,42,0.25)" }}
                />
              ) : (
                <div
                  className="w-full h-full rounded-md flex items-center justify-center"
                  style={{
                    background: "rgba(30,30,35,1)",
                    border: "1px solid rgba(255,42,42,0.25)",
                  }}
                >
                  <span className="text-white/20 text-xs text-center px-1 leading-tight">
                    {movie.title.slice(0, 6)}
                  </span>
                </div>
              )}

              {/* Remove button */}
              <button
                onClick={() => onRemove(movie.movie_index)}
                className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                style={{
                  background: "rgba(220,38,38,0.9)",
                  border: "1px solid rgba(255,255,255,0.2)",
                }}
                aria-label={`Remove ${movie.title}`}
              >
                <X size={8} className="text-white" />
              </button>
            </div>
          );
        })}

        {overflow > 0 && (
          <div
            className="shrink-0 text-white/40 text-xs font-medium"
            style={{ fontSize: 11 }}
          >
            +{overflow} more
          </div>
        )}
      </div>

      {/* CTA button */}
      <button
        onClick={onGetRecs}
        disabled={likedMovies.length === 0}
        className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        style={{
          background:
            likedMovies.length > 0
              ? "linear-gradient(135deg, rgba(220,38,38,1) 0%, rgba(185,28,28,1) 100%)"
              : "rgba(100,100,100,0.3)",
          color: "white",
          boxShadow:
            likedMovies.length > 0
              ? "0 0 20px rgba(220,38,38,0.3)"
              : "none",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
        onMouseEnter={(e) => {
          if (likedMovies.length > 0) {
            (e.currentTarget as HTMLElement).style.boxShadow =
              "0 0 32px rgba(220,38,38,0.5)";
            (e.currentTarget as HTMLElement).style.transform = "scale(1.03)";
          }
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.boxShadow =
            likedMovies.length > 0 ? "0 0 20px rgba(220,38,38,0.3)" : "none";
          (e.currentTarget as HTMLElement).style.transform = "scale(1)";
        }}
      >
        <Sparkles size={14} />
        Get recommendations
      </button>
    </div>
  );
}
