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
  // wouter stores navigation state in window.history.state
  const state =
    typeof window !== "undefined"
      ? ((window.history.state as RecsLocationState) ?? {})
      : {};
  const initialIndices: number[] = state.liked_indices ?? [];

  const { likedIndices, recs, loading, hasMore, addLiked, removeLiked, loadMore } =
    useRecommend(initialIndices);

  const sentinelRef = useRef<HTMLDivElement>(null);

  // Detail sheet
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

  // Infinite scroll via IntersectionObserver
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
    <div
      className="min-h-screen"
      style={{ background: "linear-gradient(180deg, #090909 0%, #050505 100%)" }}
    >
      {/* Sticky top bar */}
      <div
        className="sticky top-0 z-40 flex items-center gap-4 px-8 py-4"
        style={{
          background: "rgba(5,5,5,0.92)",
          backdropFilter: "blur(24px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <Link href="/">
          <a
            className="flex items-center gap-2 transition-colors text-sm"
            style={{ color: "rgba(255,255,255,0.45)" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.9)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.45)";
            }}
            data-testid="back-link"
          >
            <ArrowLeft size={16} />
            Back
          </a>
        </Link>

        <div className="w-px h-6 mx-2" style={{ background: "rgba(255,255,255,0.08)" }} />

        {/* Seed movie thumbnails */}
        <div className="flex items-center gap-3 overflow-x-auto flex-1">
          <span
            className="text-xs uppercase tracking-wider shrink-0"
            style={{ color: "rgba(255,255,255,0.25)", letterSpacing: "0.15em" }}
          >
            Because you liked…
          </span>
          <div className="flex gap-2">
            {likedIndices.map((idx) => {
              const movie = recs.find((r) => r.movie_index === idx);
              const poster = movie?.poster_path
                ? `${TMDB_BASE}${movie.poster_path}`
                : null;
              return (
                <div
                  key={idx}
                  className="shrink-0 rounded-md overflow-hidden"
                  style={{
                    width: 32,
                    height: 44,
                    background: "rgba(25,25,30,1)",
                    border: "1px solid rgba(255,42,42,0.2)",
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

        {/* Branding */}
        <div className="shrink-0 hidden sm:flex items-center gap-1">
          <span
            className="text-xs uppercase tracking-widest"
            style={{ color: "rgba(255,255,255,0.15)", letterSpacing: "0.25em" }}
          >
            PickFlix
          </span>
          <span className="text-red-400 text-xs">AI</span>
        </div>
      </div>

      {/* Main content */}
      <div className="px-8 pt-10 pb-20">
        <h2
          className="font-semibold text-2xl mb-8"
          style={{
            color: "rgba(255,255,255,0.9)",
            fontFamily: "'Space Grotesk', sans-serif",
          }}
        >
          Recommended for you
          {likedIndices.length === 0 && (
            <span
              className="text-base font-normal ml-3"
              style={{ color: "rgba(255,255,255,0.25)" }}
            >
              — go back and like some films first
            </span>
          )}
        </h2>

        {/* Grid — responsive, 4 columns on wide screens */}
        <div
          className="grid gap-4"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
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

        {/* Loading spinner */}
        {loading && (
          <div className="flex justify-center py-12">
            <div
              className="flex items-center gap-3"
              style={{ color: "rgba(255,255,255,0.35)" }}
            >
              <Loader2 size={20} className="animate-spin" />
              <span className="text-sm">Finding films…</span>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && recs.length === 0 && likedIndices.length > 0 && (
          <div className="flex flex-col items-center py-20 text-center">
            <div
              className="text-5xl mb-4"
              style={{ color: "rgba(255,255,255,0.08)" }}
            >
              ✦
            </div>
            <div
              className="text-lg mb-2"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              No recommendations found
            </div>
            <div
              className="text-sm"
              style={{ color: "rgba(255,255,255,0.2)" }}
            >
              Try liking more films to improve results
            </div>
          </div>
        )}

        {/* Infinite scroll sentinel */}
        <div ref={sentinelRef} className="h-8 mt-4" />
      </div>

      {/* Movie detail sheet */}
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
    </div>
  );
}
