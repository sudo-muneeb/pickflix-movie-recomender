import { Heart, Star } from "lucide-react";
import { useState } from "react";
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
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative group rounded-lg overflow-hidden flex flex-col h-full"
      style={{
        background: "rgba(12,12,15,0.8)",
        border: "1px solid rgba(255,42,42,0.1)",
        transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
        boxShadow: isHovered
          ? "0 20px 60px rgba(255,42,42,0.25), 0 0 40px rgba(255,42,42,0.1), inset 0 1px 0 rgba(255,255,255,0.1)"
          : "0 4px 16px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.05)",
        cursor: onDoubleClick ? "pointer" : "default",
      }}
      onDoubleClick={onDoubleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Poster Container */}
      <div className="relative w-full overflow-hidden" style={{ aspectRatio: "2/3" }}>
        {posterUrl ? (
          <>
            <img
              src={posterUrl}
              alt={movie.title}
              className="w-full h-full object-cover transition-transform duration-500"
              style={{
                transform: isHovered ? "scale(1.08)" : "scale(1)",
              }}
              loading="lazy"
            />
            {/* Glow overlay on hover */}
            {isHovered && (
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(255,42,42,0.3) 0%, transparent 70%)",
                  animation: "fadeIn 0.3s ease-out",
                }}
              />
            )}
          </>
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{
              background:
                "linear-gradient(135deg, rgba(20,20,25,1) 0%, rgba(10,10,15,1) 100%)",
            }}
          >
            <div className="text-center px-4">
              <div
                className="text-xs uppercase tracking-widest mb-2"
                style={{
                  color: "rgba(255,80,80,0.3)",
                  fontFamily: "'Space Grotesk', sans-serif",
                  letterSpacing: "0.15em",
                }}
              >
                No Poster
              </div>
              <div
                className="text-xs font-medium line-clamp-2"
                style={{ color: "rgba(255,255,255,0.2)" }}
              >
                {movie.title}
              </div>
            </div>
          </div>
        )}

        {/* Heart Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onLike();
          }}
          className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all z-20 hover:scale-110"
          style={{
            background: liked
              ? "linear-gradient(135deg, rgba(220,38,38,0.95) 0%, rgba(190,24,24,0.95) 100%)"
              : "rgba(0,0,0,0.5)",
            backdropFilter: "blur(12px)",
            border: liked
              ? "1px solid rgba(255,80,80,0.8)"
              : "1px solid rgba(255,255,255,0.15)",
            boxShadow: liked
              ? "0 0 16px rgba(255,42,42,0.4), inset 0 1px 0 rgba(255,255,255,0.2)"
              : "0 0 8px rgba(0,0,0,0.4)",
          }}
          aria-label={liked ? "Unlike" : "Like"}
        >
          <Heart
            size={16}
            fill={liked ? "white" : "none"}
            className={liked ? "text-white" : "text-white/50"}
            style={{
              transition: "all 0.2s ease",
              transform: liked ? "scale(1.2)" : "scale(1)",
            }}
          />
        </button>

        {/* Language Tag */}
        {movie.language && (
          <div
            className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold uppercase"
            style={{
              background: "rgba(0,0,0,0.6)",
              backdropFilter: "blur(10px)",
              color: "rgba(255,200,200,0.9)",
              border: "1px solid rgba(255,100,100,0.3)",
              letterSpacing: "0.08em",
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            {movie.language}
          </div>
        )}

        {/* Rating Badge */}
        {movie.avg_rating > 0 && (
          <div
            className="absolute bottom-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full"
            style={{
              background: "rgba(0,0,0,0.7)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255,200,100,0.2)",
            }}
          >
            <Star size={13} className="text-yellow-400" fill="currentColor" />
            <span
              className="text-xs font-semibold"
              style={{ color: "rgba(255,200,100,0.95)" }}
            >
              {movie.avg_rating.toFixed(1)}
            </span>
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <div
          className="text-white font-semibold text-sm leading-tight line-clamp-2"
          title={movie.title}
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            letterSpacing: "-0.01em",
          }}
        >
          {movie.title}
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span style={{ color: "rgba(255,255,255,0.4)" }}>
            {movie.year ?? "—"}
          </span>
          {movie.vote_count > 0 && (
            <span style={{ color: "rgba(255,255,255,0.25)" }}>
              {(movie.vote_count / 1000).toFixed(1)}K votes
            </span>
          )}
        </div>

        {/* Double-click Hint */}
        {onDoubleClick && (
          <div
            className="mt-auto pt-2 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              color: "rgba(255,100,100,0.6)",
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "10px",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            double-click for details
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
