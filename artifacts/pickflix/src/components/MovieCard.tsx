import { Heart, Star } from "lucide-react";
import { MovieOut } from "../lib/api";

interface MovieCardProps {
  movie: MovieOut;
  liked: boolean;
  onLike: () => void;
  onDoubleClick?: () => void;
}

const TMDB_BASE = "https://image.tmdb.org/t/p/w300";

export function MovieCard({ movie, liked, onLike, onDoubleClick }: MovieCardProps) {
  const posterUrl = movie.poster_path ? `${TMDB_BASE}${movie.poster_path}` : null;

  return (
    <div
      className="relative group rounded-xl overflow-hidden flex flex-col"
      style={{
        background: "rgba(24,24,27,0.95)",
        border: "1px solid rgba(39,39,42,0.8)",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        boxShadow: "0 2px 12px rgba(0,0,0,0.4)",
      }}
      onDoubleClick={onDoubleClick}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
        (e.currentTarget as HTMLElement).style.boxShadow =
          "0 8px 32px rgba(255,42,42,0.15)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
        (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 12px rgba(0,0,0,0.4)";
      }}
    >
      {/* Poster */}
      <div className="relative w-full" style={{ aspectRatio: "2/3" }}>
        {posterUrl ? (
          <img
            src={posterUrl}
            alt={movie.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{
              background:
                "linear-gradient(135deg, rgba(30,30,35,1) 0%, rgba(20,20,25,1) 100%)",
            }}
          >
            <div className="text-center px-4">
              <div
                className="text-white/20 text-xs uppercase tracking-wider mb-1"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                No Poster
              </div>
              <div className="text-white/30 text-xs font-medium line-clamp-3">
                {movie.title}
              </div>
            </div>
          </div>
        )}

        {/* Heart button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onLike();
          }}
          className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all z-10"
          style={{
            background: liked
              ? "rgba(220,38,38,0.9)"
              : "rgba(0,0,0,0.6)",
            backdropFilter: "blur(8px)",
            border: liked
              ? "1px solid rgba(239,68,68,0.6)"
              : "1px solid rgba(255,255,255,0.1)",
          }}
          aria-label={liked ? "Unlike" : "Like"}
        >
          <Heart
            size={14}
            fill={liked ? "white" : "none"}
            className={liked ? "text-white" : "text-white/60"}
          />
        </button>

        {/* Language tag */}
        {movie.language && (
          <div
            className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-xs font-medium uppercase"
            style={{
              background: "rgba(0,0,0,0.7)",
              backdropFilter: "blur(8px)",
              color: "rgba(255,255,255,0.6)",
              border: "1px solid rgba(255,255,255,0.08)",
              letterSpacing: "0.05em",
            }}
          >
            {movie.language}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-1 flex-1">
        <div
          className="text-white text-sm font-medium leading-tight truncate"
          title={movie.title}
        >
          {movie.title}
        </div>

        {movie.avg_rating > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-zinc-400 text-xs">
              {movie.year ?? "—"}
            </span>
            <div className="flex items-center gap-1">
              <Star size={11} className="text-yellow-500 shrink-0" />
              <span className="text-zinc-400 text-xs">
                {movie.avg_rating.toFixed(1)}
              </span>
            </div>
          </div>
        )}

        {/* Double-click hint */}
        {onDoubleClick && (
          <div
            className="text-center text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 mt-0.5"
            style={{
              color: "rgba(255,80,80,0.4)",
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 9,
              letterSpacing: "0.05em",
            }}
          >
            double-click for details
          </div>
        )}
      </div>
    </div>
  );
}
