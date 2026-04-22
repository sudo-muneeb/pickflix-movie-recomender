import { useEffect, useRef, useState, useCallback } from "react";
import { Link, useLocation } from "wouter";
import { Search, Loader2, Home } from "lucide-react";
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

  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<MovieOut[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sentinelRef = useRef<HTMLDivElement>(null);
  const didInit = useRef(false);

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
    if (didInit.current) return;
    didInit.current = true;
    loadMore();
  }, []);

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

  const handleQueryChange = (val: string) => {
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!val.trim()) {
      setSearchResults([]);
      return;
    }
    setSearchLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const data = await searchMovies(val);
        setSearchResults(data.results as MovieOut[]);
      } catch {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);
  };

  const displayMovies = query ? searchResults : movies;
  const isLoading = query ? searchLoading : topLoading;

  const likedMovies: MovieOut[] = likedIndices
    .map((idx) => {
      return displayMovies.find((m) => m.movie_index === idx) || 
             movies.find((m) => m.movie_index === idx);
    })
    .filter(Boolean) as MovieOut[];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#050505" }}>
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
        <div className="px-8 py-5">
          {/* Top row: Logo + Search + Back */}
          <div className="flex items-center gap-6 mb-5">
            {/* Back button */}
            <Link href="/">
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
                <Home size={14} />
                3D Home
              </button>
            </Link>

            {/* Logo */}
            <div className="flex items-baseline gap-1">
              <span
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: "24px",
                  fontWeight: 800,
                  color: "rgba(255,255,255,0.95)",
                  textShadow:
                    "0 0 20px rgba(255,42,42,0.6), 0 0 40px rgba(255,42,42,0.2)",
                  letterSpacing: "-0.02em",
                }}
              >
                Pick
              </span>
              <span
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: "24px",
                  fontWeight: 800,
                  background: "linear-gradient(135deg, #ff2a2a 0%, #dc2626 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  textShadow: "0 0 20px rgba(255,42,42,1)",
                  letterSpacing: "-0.02em",
                }}
              >
                flix
              </span>
            </div>

            {/* Search bar */}
            <div
              className="flex-1 relative max-w-2xl group"
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
            >
              <div
                className="flex items-center gap-3 px-5 py-3 rounded-xl transition-all duration-300"
                style={{
                  background: isSearchFocused
                    ? "rgba(255,42,42,0.08)"
                    : "rgba(255,255,255,0.04)",
                  border: isSearchFocused
                    ? "1.5px solid rgba(255,42,42,0.4)"
                    : "1px solid rgba(255,255,255,0.08)",
                  boxShadow: isSearchFocused
                    ? "0 0 20px rgba(255,42,42,0.15), inset 0 1px 0 rgba(255,255,255,0.1)"
                    : "inset 0 1px 0 rgba(255,255,255,0.05)",
                }}
              >
                <Search
                  size={16}
                  style={{
                    color: isSearchFocused
                      ? "rgba(255,100,100,0.8)"
                      : "rgba(255,100,100,0.3)",
                    flexShrink: 0,
                    transition: "color 0.2s",
                  }}
                />
                <input
                  type="text"
                  placeholder="Search movies, directors, genres…"
                  value={query}
                  onChange={(e) => handleQueryChange(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  className="bg-transparent text-sm outline-none w-full"
                  style={{
                    color: "rgba(255,255,255,0.9)",
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: "14px",
                  }}
                />
                {query && (
                  <button
                    onClick={() => {
                      setQuery("");
                      setSearchResults([]);
                    }}
                    className="shrink-0 text-lg leading-none transition-colors hover:text-red-400"
                    style={{ color: "rgba(255,255,255,0.3)" }}
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Selected counter */}
            {likedIndices.length > 0 && (
              <div
                className="flex items-center gap-2 px-4 py-2 rounded-lg"
                style={{
                  background: "linear-gradient(135deg, rgba(220,38,38,0.15) 0%, rgba(200,30,30,0.08) 100%)",
                  border: "1px solid rgba(255,100,100,0.3)",
                }}
              >
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{
                    background: "rgba(255,42,42,0.8)",
                    boxShadow: "0 0 8px rgba(255,42,42,0.6)",
                  }}
                />
                <span
                  className="text-sm font-semibold"
                  style={{
                    color: "rgba(255,120,120,0.9)",
                    fontFamily: "'Space Grotesk', sans-serif",
                  }}
                >
                  {likedIndices.length}
                </span>
              </div>
            )}
          </div>

          {/* Language filter pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span
              className="text-xs shrink-0"
              style={{
                color: "rgba(255,255,255,0.25)",
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "11px",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              Language:
            </span>
            <div className="flex gap-2">
              {LANGUAGES.map(({ code, label }) => {
                const isActive = lang === code;
                return (
                  <button
                    key={label}
                    onClick={() => setLang(code)}
                    className="shrink-0 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all duration-200 hover:scale-105"
                    style={{
                      background: isActive
                        ? "linear-gradient(135deg, rgba(255,42,42,0.9) 0%, rgba(220,38,38,0.8) 100%)"
                        : "rgba(255,255,255,0.04)",
                      border: isActive
                        ? "1px solid rgba(255,100,100,0.6)"
                        : "1px solid rgba(255,255,255,0.08)",
                      color: isActive ? "white" : "rgba(255,255,255,0.4)",
                      boxShadow: isActive
                        ? "0 0 16px rgba(255,42,42,0.4), inset 0 1px 0 rgba(255,255,255,0.2)"
                        : "none",
                      fontFamily: "'Space Grotesk', sans-serif",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="flex-1 px-8 py-12 pb-32">
        {/* Section title */}
        {!query && (
          <div className="mb-10">
            <h2
              className="text-3xl font-bold mb-2"
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                color: "rgba(255,255,255,0.95)",
                letterSpacing: "-0.01em",
              }}
            >
              Discover
            </h2>
            <p
              className="text-sm"
              style={{
                color: "rgba(255,255,255,0.35)",
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            >
              {lang ? `Showing ${lang.toUpperCase()} films` : "All languages"}
              {movies.length > 0 ? ` • ${movies.length} loaded` : ""}
            </p>
          </div>
        )}

        {/* Search results header */}
        {query && (
          <div className="mb-10">
            <h2
              className="text-2xl font-bold"
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                color: "rgba(255,255,255,0.9)",
              }}
            >
              Search Results
            </h2>
            <p
              className="text-sm mt-1"
              style={{ color: "rgba(255,255,255,0.35)" }}
            >
              {searchResults.length} {searchResults.length === 1 ? "film" : "films"} found
            </p>
          </div>
        )}

        {/* Movie grid */}
        <div
          className="grid gap-6"
          style={{
            gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
            animation: "fadeIn 0.4s ease-out",
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

        {/* Loading state */}
        {isLoading && (
          <div className="flex justify-center py-16">
            <div className="flex items-center gap-3" style={{ color: "rgba(255,255,255,0.35)" }}>
              <Loader2 size={20} className="animate-spin" />
              <span
                className="text-sm"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {query ? "Searching…" : "Loading…"}
              </span>
            </div>
          </div>
        )}

        {/* Empty search state */}
        {query && !isLoading && searchResults.length === 0 && (
          <div className="flex flex-col items-center py-24 text-center">
            <div style={{ fontSize: "48px", color: "rgba(255,255,255,0.08)", marginBottom: "16px" }}>
              ✦
            </div>
            <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "16px", marginBottom: "8px" }}>
              No films found for "{query}"
            </div>
            <div style={{ color: "rgba(255,255,255,0.2)", fontSize: "13px" }}>
              Try searching for a different title or director
            </div>
          </div>
        )}

        {/* Infinite scroll sentinel */}
        {!query && <div ref={sentinelRef} className="h-8" />}
      </main>

      {/* Liked tray */}
      <LikedTray
        likedMovies={likedMovies}
        onRemove={removeLiked}
        onGetRecs={() =>
          navigate("/recs", { state: { liked_indices: likedIndices } } as any)
        }
      />

      {/* Detail sheet */}
      {detailIndex !== null && (
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

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
