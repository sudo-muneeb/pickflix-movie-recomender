import { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "wouter";
import { ArrowLeft, Loader2 } from "lucide-react";
import { MovieCard } from "../components/MovieCard";
import { MovieDetailSheet } from "../components/MovieDetailSheet";
import { useRecommend } from "../hooks/useRecommend";
import { fetchMovieDetail, MovieDetail } from "../lib/api";

const TMDB_BASE = "https://image.tmdb.org/t/p/w300";

interface RecsLocationState {
  liked_indices?: number[];
}

export default function Recs() {
  const state =
    typeof window !== "undefined"
      ? ((window.history.state as RecsLocationState) ?? {})
      : {};
  const initialIndices: number[] = state.liked_indices ?? [];

  const { likedIndices, recs, loading, hasMore, addLiked, removeLiked, loadMore } =
    useRecommend(initialIndices);

  const sentinelRef = useRef<HTMLDivElement>(null);
  const [seedPosters, setSeedPosters] = useState<Record<number, string | null>>({});

  const [detailIndex, setDetailIndex] = useState<number | null>(null);
  const [detailMovie, setDetailMovie] = useState<MovieDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const openDetail = useCallback(async (movie_index: number) => {
    setDetailIndex(movie_index);
    setDetailMovie(null);
    setDetailLoading(true);
    try {
      const data = await fetchMovieDetail(movie_index);
      setDetailMovie(data);
    } catch (err) {
      console.error("fetchMovieDetail:", err);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const closeDetail = useCallback(() => {
    setDetailIndex(null);
    setDetailMovie(null);
  }, []);

  useEffect(() => {
    if (likedIndices.length === 0) {
      setSeedPosters({});
      return;
    }

    let cancelled = false;

    const loadSeedPosters = async () => {
      const posters = await Promise.all(
        likedIndices.map(async (idx) => {
          const existing = recs.find((r) => r.movie_index === idx)?.poster_path ?? null;
          if (existing) return [idx, existing] as const;

          try {
            const detail = await fetchMovieDetail(idx);
            return [idx, detail.poster_path ?? null] as const;
          } catch {
            return [idx, null] as const;
          }
        })
      );

      if (!cancelled) {
        setSeedPosters(Object.fromEntries(posters));
      }
    };

    loadSeedPosters();

    return () => {
      cancelled = true;
    };
  }, [likedIndices, recs]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && hasMore) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loading, hasMore, loadMore]);

  return (
    <div className="min-h-screen" style={{ background: "#050505" }}>
      {/* ── Cinematic Header ── */}
      <header
        className="sticky top-0 z-40"
        style={{
          background: "linear-gradient(180deg, rgba(5,5,5,0.95) 0%, rgba(5,5,5,0.8) 100%)",
          backdropFilter: "blur(32px)",
          borderBottom: "1px solid rgba(255,42,42,0.08)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.05)",
        }}
      >
        <div className="px-8 py-6">
          {/* Top row: Back + Title */}
          <div className="flex items-center gap-6 mb-6">
            <Link href="/browse">
              <button
                className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all hover:scale-105"
                style={{
                  color: "rgba(255,255,255,0.5)",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: "12px",
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "rgba(255,42,42,0.1)";
                  (e.currentTarget as HTMLElement).style.color = "rgba(255,100,100,0.9)";
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,42,42,0.3)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)";
                  (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.5)";
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)";
                }}
              >
                <ArrowLeft size={14} />
                Back to Browse
              </button>
            </Link>

            <div className="flex-1">
              <h1
                className="text-3xl font-bold"
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  background: "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,150,150,0.9) 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  letterSpacing: "-0.01em",
                }}
              >
                AI Recommendations
              </h1>
              <p
                className="text-xs mt-1"
                style={{
                  color: "rgba(255,100,100,0.6)",
                  fontFamily: "'Space Grotesk', sans-serif",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                }}
              >
                Personalized for your taste
              </p>
            </div>

            {/* Seed info badge */}
            {likedIndices.length > 0 && (
              <div
                className="flex items-center gap-2 px-4 py-2 rounded-lg"
                style={{
                  background: "linear-gradient(135deg, rgba(255,42,42,0.1) 0%, rgba(200,30,30,0.05) 100%)",
                  border: "1px solid rgba(255,100,100,0.2)",
                }}
              >
                <span style={{ fontSize: "10px", color: "rgba(255,100,100,0.5)" }}>POWERED BY</span>
                <span
                  className="font-semibold"
                  style={{
                    color: "rgba(255,100,100,0.9)",
                    fontFamily: "'Space Grotesk', sans-serif",
                  }}
                >
                  {likedIndices.length} {likedIndices.length === 1 ? "film" : "films"}
                </span>
              </div>
            )}
          </div>

          {/* Seed films visualization */}
          {likedIndices.length > 0 && (
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "24px" }}>
              <p
                className="text-xs mb-4"
                style={{
                  color: "rgba(255,255,255,0.3)",
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: "11px",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                Your favorite films
              </p>
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {likedIndices.map((idx, i) => {
                  const posterPath = seedPosters[idx] ?? null;
                  const poster = posterPath ? `${TMDB_BASE}${posterPath}` : null;
                  return (
                    <div
                      key={idx}
                      className="shrink-0 rounded-lg overflow-hidden transition-all hover:scale-105"
                      style={{
                        width: 48,
                        height: 72,
                        background: "rgba(15,15,20,0.8)",
                        border: "1px solid rgba(255,100,100,0.2)",
                        boxShadow: `0 4px 12px rgba(0,0,0,0.6)${
                          i === 0 ? ", 0 0 16px rgba(255,42,42,0.15)" : ""
                        }`,
                        animation: `seedSlideIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 0.1}s both`,
                      }}
                    >
                      {poster && (
                        <img
                          src={poster}
                          alt={`seed-${idx}`}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="px-8 py-12 pb-20">
        {/* Recommendations grid */}
        <div className="mb-10">
          <h2
            className="text-2xl font-bold mb-2"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              color: "rgba(255,255,255,0.95)",
              letterSpacing: "-0.01em",
            }}
          >
            Recommendations
          </h2>
          <p
            className="text-sm"
            style={{
              color: "rgba(255,255,255,0.35)",
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            {recs.length} films discovered • Heart to improve suggestions
          </p>
        </div>

        {/* Grid */}
        <div
          className="grid gap-6 mb-12"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
            animation: "fadeIn 0.4s ease-out",
          }}
        >
          {recs.map((movie) => (
            <MovieCard
              key={movie.movie_index}
              movie={movie}
              liked={likedIndices.includes(movie.movie_index)}
              onLike={() => {
                if (likedIndices.includes(movie.movie_index)) {
                  removeLiked(movie.movie_index);
                } else {
                  addLiked(movie.movie_index);
                }
              }}
              onDoubleClick={() => openDetail(movie.movie_index)}
            />
          ))}
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex justify-center py-16">
            <div className="flex items-center gap-3" style={{ color: "rgba(255,255,255,0.35)" }}>
              <Loader2 size={20} className="animate-spin" />
              <span style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Discovering films…
              </span>
            </div>
          </div>
        )}

        {/* Empty initial state */}
        {!loading && recs.length === 0 && likedIndices.length === 0 && (
          <div className="flex flex-col items-center py-24 text-center">
            <div
              style={{
                fontSize: "56px",
                color: "rgba(255,42,42,0.1)",
                marginBottom: "20px",
                lineHeight: 1,
              }}
            >
              ♡
            </div>
            <h3
              className="text-xl font-semibold mb-3"
              style={{
                color: "rgba(255,255,255,0.6)",
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            >
              Start by liking films
            </h3>
            <p style={{ color: "rgba(255,255,255,0.3)", maxWidth: "300px", lineHeight: 1.6 }}>
              Go back to browse and heart some movies. The AI will learn your taste and
              recommend personalized films.
            </p>
            <Link href="/browse">
              <button
                className="mt-8 px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105"
                style={{
                  background: "linear-gradient(135deg, rgba(255,42,42,0.9) 0%, rgba(220,38,38,0.8) 100%)",
                  color: "white",
                  border: "1px solid rgba(255,100,100,0.6)",
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: "13px",
                  letterSpacing: "0.05em",
                  boxShadow: "0 0 16px rgba(255,42,42,0.3)",
                }}
              >
                Browse Movies
              </button>
            </Link>
          </div>
        )}

        {/* Empty recs state (but has likes) */}
        {!loading && recs.length === 0 && likedIndices.length > 0 && (
          <div className="flex flex-col items-center py-24 text-center">
            <div style={{ fontSize: "48px", color: "rgba(255,255,255,0.06)", marginBottom: "16px" }}>
              ✦
            </div>
            <h3
              className="text-lg font-semibold mb-2"
              style={{
                color: "rgba(255,255,255,0.5)",
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            >
              No recommendations yet
            </h3>
            <p style={{ color: "rgba(255,255,255,0.25)" }}>
              Try liking more films to improve results
            </p>
          </div>
        )}

        {/* Infinite scroll sentinel */}
        <div ref={sentinelRef} className="h-8" />
      </main>

      {/* Detail sheet */}
      {detailIndex !== null && (
        <MovieDetailSheet
          movie={detailMovie}
          loading={detailLoading}
          liked={likedIndices.includes(detailIndex)}
          onClose={closeDetail}
          onLike={() => {
            if (likedIndices.includes(detailIndex)) {
              removeLiked(detailIndex);
            } else {
              addLiked(detailIndex);
            }
          }}
        />
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes seedSlideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}
