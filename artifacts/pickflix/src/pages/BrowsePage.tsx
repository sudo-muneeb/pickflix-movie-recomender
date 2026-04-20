import { useEffect, useRef, useState, useCallback } from "react";
import { Link, useLocation } from "wouter";
import { Search, Sparkles, ArrowLeft, Loader2 } from "lucide-react";
import { useDefaultMovies } from "../hooks/useDefaultMovies";
import { useRecommend } from "../hooks/useRecommend";
import { MovieCard } from "../components/MovieCard";
import { LikedTray } from "../components/LikedTray";
import { MovieDetailSheet } from "../components/MovieDetailSheet";
import { searchMovies, fetchMovieDetail, MovieOut, MovieDetail } from "../lib/api";

const LANGUAGES = [
  { code: null, label: "All" },
  { code: "en", label: "EN" },
  { code: "hi", label: "HI" },
  { code: "ur", label: "UR" },

];

export default function BrowsePage() {
  const [, navigate] = useLocation();
  const { movies, lang, loading: topLoading, hasMore, loadMore, setLang } = useDefaultMovies();
  const { likedIndices, addLiked, removeLiked } = useRecommend();

  // search
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<MovieOut[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sentinelRef = useRef<HTMLDivElement>(null);
  const didInit = useRef(false);

  // Movie detail sheet
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

  // Load first page on mount
  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
    loadMore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Infinite scroll
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !topLoading && hasMore && !query) {
          timeoutId = setTimeout(() => {
            loadMore();
          }, 500);
        } else {
          if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
          }
        }
      },
      { threshold: 0.1 }
    );
    obs.observe(sentinel);
    return () => {
      obs.disconnect();
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [topLoading, hasMore, loadMore, query]);

  // Debounced search
  const handleQueryChange = (val: string) => {
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!val.trim()) {
      setSearchResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const data = await searchMovies(val);
        // Use the full movie data returned by the search endpoint
        setSearchResults(data.results as MovieOut[]);
      } catch {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);
  };

  const likedMovies: MovieOut[] = likedIndices
    .map((idx) => movies.find((m) => m.movie_index === idx))
    .filter(Boolean) as MovieOut[];

  const displayMovies = query ? searchResults : movies;
  const isLoading = query ? searchLoading : topLoading;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#050505" }}
    >
      {/* ── Sticky top bar ── */}
      <header
        className="sticky top-0 z-40 px-6 py-4"
        style={{
          background: "rgba(5,5,5,0.92)",
          backdropFilter: "blur(24px)",
          borderBottom: "1px solid rgba(255,42,42,0.1)",
          boxShadow: "0 1px 24px rgba(0,0,0,0.6)",
        }}
      >
        <div className="flex items-center gap-4">
          {/* Back to 3D */}
          <Link href="/">
           
    

          {/* Pickflix logo */}
          <div className="flex items-baseline gap-0.5 select-none">
            <span
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "22px",
                fontWeight: 700,
                color: "rgba(255,255,255,0.95)",
                textShadow:
                  "0 0 16px rgba(255,42,42,0.8), 0 0 40px rgba(255,42,42,0.3)",
                letterSpacing: "-0.02em",
              }}
            >
              Pick
            </span>
            <span
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "22px",
                fontWeight: 700,
                color: "rgba(220,38,38,1)",
                textShadow:
                  "0 0 16px rgba(255,42,42,1), 0 0 48px rgba(255,42,42,0.7)",
                letterSpacing: "-0.02em",
              }}
            >
              flix
            </span>
          </div>      </Link>

          {/* Search bar */}
          <div className="flex-1 relative max-w-md mx-auto">
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-full transition-all"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,42,42,0.2)",
              }}
            >
              <Search size={14} style={{ color: "rgba(255,80,80,0.5)", flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Search movies, genres, directors…"
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
                className="bg-transparent text-sm outline-none w-full"
                style={{
                  color: "rgba(255,255,255,0.8)",
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              />
              {query && (
                <button
                  onClick={() => {
                    setQuery("");
                    setSearchResults([]);
                  }}
                  style={{ color: "rgba(255,255,255,0.3)", fontSize: 16, lineHeight: 1 }}
                >
                  ×
                </button>
              )}
            </div>
          </div>

      
        </div>

        {/* Language pills */}
        <div className="flex items-center gap-1.5 mt-3 overflow-x-auto pb-0.5">
          {LANGUAGES.map(({ code, label }) => {
            const isActive = lang === code;
            return (
              <button
                key={label}
                onClick={() => setLang(code)}
                className="shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-all"
                style={{
                  background: isActive
                    ? "rgba(220,38,38,0.8)"
                    : "rgba(255,255,255,0.05)",
                  border: isActive
                    ? "1px solid rgba(255,80,80,0.5)"
                    : "1px solid rgba(255,255,255,0.06)",
                  color: isActive ? "white" : "rgba(255,255,255,0.35)",
                  boxShadow: isActive ? "0 0 12px rgba(220,38,38,0.3)" : "none",
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="flex-1 px-6 py-8 pb-32">
        {/* Section title */}
  

        {/* Card grid */}
        <div
          className="grid gap-6"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          }}
        >
          {displayMovies.map((movie) => (
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
        {isLoading && (
          <div className="flex justify-center py-10">
            <div
              className="flex items-center gap-3"
              style={{ color: "rgba(255,255,255,0.3)" }}
            >
              <Loader2 size={18} className="animate-spin" />
              <span
                className="text-sm"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {query ? "Searching…" : "Loading more…"}
              </span>
            </div>
          </div>
        )}

        {/* Empty search state */}
        {query && !isLoading && searchResults.length === 0 && (
          <div className="flex flex-col items-center py-20 text-center">
            <div
              className="text-4xl mb-4"
              style={{ color: "rgba(255,255,255,0.06)" }}
            >
              ✦
            </div>
            <div
              className="text-base"
              style={{ color: "rgba(255,255,255,0.35)" }}
            >
              No results for "{query}"
            </div>
          </div>
        )}

        {/* Infinite scroll sentinel (only for top-movies mode) */}
        {!query && <div ref={sentinelRef} className="h-8" />}
      </main>

      {/* ── Liked tray ── */}
      <LikedTray
        likedMovies={likedMovies}
        onRemove={removeLiked}
        onGetRecs={() =>
          navigate("/recs", { state: { liked_indices: likedIndices } } as any)
        }
      />

      {/* Movie detail sheet */}
      {(detailIndex !== null) && (
        <MovieDetailSheet
          movie={detailMovie}
          loading={detailLoading}
          liked={detailIndex !== null && likedIndices.includes(detailIndex)}
          onClose={closeDetail}
          onLike={() => {
            if (detailIndex === null) return;
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
