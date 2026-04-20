import { useEffect, useState, useCallback } from "react";
import {
  X, Star, Clock, Globe, Users, Film, Calendar,
  ExternalLink, TrendingUp, Heart, DollarSign,
} from "lucide-react";
import { MovieDetail } from "../lib/api";

const TMDB_POSTER = "https://image.tmdb.org/t/p/w500";
const TMDB_BACKDROP = "https://image.tmdb.org/t/p/w1280";

interface MovieDetailSheetProps {
  movie: MovieDetail | null;
  loading?: boolean;
  liked?: boolean;
  onClose: () => void;
  onLike?: () => void;
}

function fmt(n: number | null | undefined, prefix = "") {
  if (n == null || n === 0) return null;
  if (n >= 1_000_000_000) return `${prefix}${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${prefix}${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${prefix}${(n / 1_000).toFixed(0)}K`;
  return `${prefix}${n}`;
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-block px-2.5 py-0.5 rounded-full text-xs"
      style={{
        background: "rgba(220,38,38,0.1)",
        border: "1px solid rgba(220,38,38,0.2)",
        color: "rgba(255,160,160,0.9)",
        fontFamily: "'Space Grotesk', sans-serif",
      }}
    >
      {children}
    </span>
  );
}

function Row({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number | null | undefined;
}) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex items-start gap-3">
      <div
        className="mt-0.5 shrink-0"
        style={{ color: "rgba(255,42,42,0.5)" }}
      >
        {icon}
      </div>
      <div>
        <div
          className="text-xs uppercase tracking-wider mb-0.5"
          style={{ color: "rgba(255,255,255,0.25)", fontFamily: "'Space Grotesk', sans-serif" }}
        >
          {label}
        </div>
        <div
          className="text-sm leading-relaxed"
          style={{ color: "rgba(255,255,255,0.75)", fontFamily: "'Space Grotesk', sans-serif" }}
        >
          {value}
        </div>
      </div>
    </div>
  );
}

export function MovieDetailSheet({
  movie,
  loading,
  liked,
  onClose,
  onLike,
}: MovieDetailSheetProps) {
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);

  // Animate in on mount / movie change
  useEffect(() => {
    if (movie || loading) {
      setClosing(false);
      const t = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(t);
    }
  }, [movie, loading]);

  const handleClose = useCallback(() => {
    setClosing(true);
    setVisible(false);
    const t = setTimeout(onClose, 380);
    return () => clearTimeout(t);
  }, [onClose]);

  // Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleClose]);

  if (!movie && !loading) return null;

  const posterUrl = movie?.poster_path ? `${TMDB_POSTER}${movie.poster_path}` : null;
  const backdropUrl = movie?.backdrop_path ? `${TMDB_BACKDROP}${movie.backdrop_path}` : null;
  const genres = movie?.genres ? movie.genres.split(",").map((g) => g.trim()).filter(Boolean) : [];
  const cast = movie?.cast ? movie.cast.split(",").slice(0, 6).map((c) => c.trim()) : [];

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 z-50"
        style={{
          background: "rgba(0,0,0,0.7)",
          backdropFilter: "blur(6px)",
          opacity: visible ? 1 : 0,
          transition: "opacity 0.35s ease",
        }}
        onClick={handleClose}
      />

      {/* Sheet */}
      <div
        className="fixed inset-x-0 bottom-0 z-50 rounded-t-3xl overflow-hidden"
        style={{
          maxHeight: "88vh",
          background: "rgba(9,6,6,0.98)",
          border: "1px solid rgba(255,42,42,0.12)",
          borderBottom: "none",
          boxShadow: "0 -8px 60px rgba(0,0,0,0.8), 0 -2px 0 rgba(255,42,42,0.15)",
          transform: visible ? "translateY(0)" : "translateY(100%)",
          transition: "transform 0.38s cubic-bezier(0.32, 0.72, 0, 1)",
          display: "flex",
          flexDirection: "column",
        }}
        data-testid="movie-detail-sheet"
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div
            className="rounded-full"
            style={{
              width: 40,
              height: 4,
              background: "rgba(255,255,255,0.12)",
            }}
          />
        </div>

        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = "rgba(220,38,38,0.25)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)";
          }}
          aria-label="Close"
        >
          <X size={16} style={{ color: "rgba(255,255,255,0.6)" }} />
        </button>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 pb-10">
          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
                  style={{ borderColor: "rgba(220,38,38,0.6)", borderTopColor: "transparent" }}
                />
                <span
                  className="text-sm"
                  style={{ color: "rgba(255,255,255,0.3)", fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  Loading…
                </span>
              </div>
            </div>
          )}

          {movie && (
            <>
              {/* Backdrop */}
              {backdropUrl && (
                <div
                  className="relative w-full overflow-hidden shrink-0"
                  style={{ height: 220 }}
                >
                  <img
                    src={backdropUrl}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(to bottom, rgba(9,6,6,0) 0%, rgba(9,6,6,0.7) 70%, rgba(9,6,6,1) 100%)",
                    }}
                  />
                </div>
              )}

              {/* Main content */}
              <div
                className={`px-6 flex gap-6 ${backdropUrl ? "-mt-16 relative z-10" : "pt-6"}`}
              >
                {/* Poster */}
                <div
                  className="shrink-0 rounded-xl overflow-hidden"
                  style={{
                    width: 120,
                    height: 180,
                    background: "rgba(30,20,20,1)",
                    border: "1px solid rgba(255,42,42,0.15)",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
                  }}
                >
                  {posterUrl ? (
                    <img
                      src={posterUrl}
                      alt={movie.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Film size={32} style={{ color: "rgba(255,255,255,0.1)" }} />
                    </div>
                  )}
                </div>

                {/* Title + quick stats */}
                <div className="flex-1 min-w-0 pt-16">
                  {movie.tagline && (
                    <p
                      className="text-xs mb-2 italic"
                      style={{ color: "rgba(255,80,80,0.5)", fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      "{movie.tagline}"
                    </p>
                  )}
                  <h2
                    className="text-2xl font-bold leading-tight mb-1"
                    style={{
                      color: "rgba(255,255,255,0.95)",
                      fontFamily: "'Space Grotesk', sans-serif",
                      textShadow: "0 0 20px rgba(255,42,42,0.2)",
                    }}
                  >
                    {movie.title}
                  </h2>
                  {movie.original_title && movie.original_title !== movie.title && (
                    <p
                      className="text-sm mb-2"
                      style={{ color: "rgba(255,255,255,0.35)" }}
                    >
                      {movie.original_title}
                    </p>
                  )}

                  {/* Meta pills row */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {movie.year && <Pill>{movie.year}</Pill>}
                    {movie.runtime && <Pill>{movie.runtime} min</Pill>}
                    {movie.language && (
                      <Pill>{movie.language.toUpperCase()}</Pill>
                    )}
                    {movie.status && <Pill>{movie.status}</Pill>}
                  </div>

                  {/* Rating */}
                  {(movie.avg_rating || movie.vote_average) && (
                    <div className="flex items-center gap-4 mt-3">
                      {movie.avg_rating != null && (
                        <div className="flex items-center gap-1.5">
                          <Star size={14} className="text-yellow-500" fill="rgb(234,179,8)" />
                          <span
                            className="text-base font-semibold"
                            style={{ color: "rgba(255,255,255,0.85)" }}
                          >
                            {movie.avg_rating.toFixed(1)}
                          </span>
                          <span
                            className="text-xs"
                            style={{ color: "rgba(255,255,255,0.3)" }}
                          >
                            / 10
                          </span>
                          {movie.vote_count && (
                            <span
                              className="text-xs"
                              style={{ color: "rgba(255,255,255,0.25)" }}
                            >
                              · {fmt(movie.vote_count)} votes
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Genre pills */}
              {genres.length > 0 && (
                <div className="flex flex-wrap gap-2 px-6 mt-4">
                  {genres.map((g) => (
                    <Pill key={g}>{g}</Pill>
                  ))}
                </div>
              )}

              {/* Overview */}
              {movie.overview && (
                <div className="px-6 mt-5">
                  <p
                    className="text-sm leading-relaxed"
                    style={{
                      color: "rgba(255,255,255,0.6)",
                      fontFamily: "'Space Grotesk', sans-serif",
                    }}
                  >
                    {movie.overview}
                  </p>
                </div>
              )}

              {/* Divider */}
              <div
                className="mx-6 mt-6 mb-5"
                style={{
                  height: 1,
                  background: "linear-gradient(to right, transparent, rgba(255,42,42,0.15), transparent)",
                }}
              />

              {/* Detail rows */}
              <div className="px-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Row icon={<Users size={14} />} label="Director" value={movie.directors} />
                <Row icon={<Users size={14} />} label="Writers" value={movie.writers} />
                <Row icon={<Globe size={14} />} label="Production" value={movie.production_companies} />
                <Row icon={<Globe size={14} />} label="Countries" value={movie.production_countries} />
                <Row icon={<DollarSign size={14} />} label="Budget" value={fmt(movie.budget, "$")} />
                <Row icon={<DollarSign size={14} />} label="Revenue" value={fmt(movie.revenue, "$")} />
                <Row icon={<TrendingUp size={14} />} label="Popularity" value={movie.popularity?.toFixed(1)} />
                <Row icon={<Calendar size={14} />} label="Released" value={movie.release_date} />
              </div>

              {/* Cast */}
              {cast.length > 0 && (
                <div className="px-6 mt-5">
                  <div
                    className="text-xs uppercase tracking-wider mb-3"
                    style={{ color: "rgba(255,255,255,0.25)", fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    Cast
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {cast.map((c) => (
                      <span
                        key={c}
                        className="text-xs px-3 py-1 rounded-full"
                        style={{
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.08)",
                          color: "rgba(255,255,255,0.6)",
                          fontFamily: "'Space Grotesk', sans-serif",
                        }}
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-3 px-6 mt-6">
                {onLike && (
                  <button
                    onClick={onLike}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all"
                    style={{
                      background: liked
                        ? "rgba(220,38,38,0.9)"
                        : "rgba(255,255,255,0.06)",
                      border: liked
                        ? "1px solid rgba(255,80,80,0.4)"
                        : "1px solid rgba(255,255,255,0.1)",
                      color: liked ? "white" : "rgba(255,255,255,0.55)",
                      fontFamily: "'Space Grotesk', sans-serif",
                      boxShadow: liked ? "0 0 20px rgba(220,38,38,0.3)" : "none",
                    }}
                  >
                    <Heart size={14} fill={liked ? "white" : "none"} />
                    {liked ? "Liked" : "Like"}
                  </button>
                )}
                {movie.homepage && (
                  <a
                    href={movie.homepage}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      color: "rgba(255,255,255,0.45)",
                      fontFamily: "'Space Grotesk', sans-serif",
                    }}
                  >
                    <ExternalLink size={13} />
                    Website
                  </a>
                )}
                {movie.imdb_id && (
                  <a
                    href={`https://www.imdb.com/title/${movie.imdb_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all"
                    style={{
                      background: "rgba(245,197,24,0.08)",
                      border: "1px solid rgba(245,197,24,0.2)",
                      color: "rgba(245,197,24,0.7)",
                      fontFamily: "'Space Grotesk', sans-serif",
                    }}
                  >
                    <ExternalLink size={13} />
                    IMDb
                  </a>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes sheet-in {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
