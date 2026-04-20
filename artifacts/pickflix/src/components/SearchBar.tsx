import { useState, useCallback, useRef, useEffect } from "react";
import { Search } from "lucide-react";
import { Movie, MOVIES } from "../data/movies";
import { searchMovies } from "../lib/api";

interface SearchResult {
  movie_index: number;
  title: string;
  year: number | null;
  language: string | null;
}

interface SearchBarProps {
  /** Legacy: select a scene movie (fly-to). Used in Home. */
  onSelect?: (movie: Movie) => void;
  /** New: select by search result (add to liked). Used in Home. */
  onSelectResult?: (result: SearchResult) => void;
  /** If true, uses the API backend search instead of local MOVIES filter */
  useApi?: boolean;
}

export function SearchBar({ onSelect, onSelectResult, useApi }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [localResults, setLocalResults] = useState<Movie[]>([]);
  const [apiResults, setApiResults] = useState<SearchResult[]>([]);
  const [focused, setFocused] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setQuery(val);

      if (debounceRef.current) clearTimeout(debounceRef.current);

      if (val.length < 2) {
        setLocalResults([]);
        setApiResults([]);
        return;
      }

      if (useApi) {
        debounceRef.current = setTimeout(async () => {
          try {
            const data = await searchMovies(val);
            setApiResults(data.results);
          } catch {
            setApiResults([]);
          }
        }, 300);
      } else {
        const q = val.toLowerCase();
        const found = MOVIES.filter(
          (m) =>
            m.title.toLowerCase().includes(q) ||
            m.director.toLowerCase().includes(q) ||
            m.genre.some((g) => g.toLowerCase().includes(q))
        ).slice(0, 6);
        setLocalResults(found);
      }
    },
    [useApi]
  );

  // cleanup on unmount
  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current); }, []);

  const handleSelectLocal = useCallback(
    (movie: Movie) => {
      setQuery("");
      setLocalResults([]);
      setApiResults([]);
      onSelect?.(movie);
    },
    [onSelect]
  );

  const handleSelectApi = useCallback(
    (result: SearchResult) => {
      setQuery("");
      setLocalResults([]);
      setApiResults([]);
      onSelectResult?.(result);
    },
    [onSelectResult]
  );

  const results = useApi ? apiResults : localResults;
  const hasResults = results.length > 0 && focused;

  return (
    <div className="relative" data-testid="search-container">
      <div
        className="flex items-center gap-2 px-4 py-2.5 rounded-full transition-all"
        style={{
          background: focused ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.03)",
          border: focused
            ? "1px solid rgba(255, 42, 42, 0.4)"
            : "1px solid rgba(255,255,255,0.08)",
          boxShadow: focused ? "0 0 20px rgba(255, 42, 42, 0.08)" : "none",
          minWidth: "240px",
        }}
      >
        <Search size={14} className="text-white/30 shrink-0" />
        <input
          type="text"
          placeholder="Search films..."
          value={query}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          className="bg-transparent text-sm text-white/80 outline-none placeholder:text-white/25 w-full"
          data-testid="input-search"
        />
      </div>

      {hasResults && (
        <div
          className="absolute top-full mt-2 w-full rounded-xl overflow-hidden z-50"
          style={{
            background: "rgba(8, 8, 8, 0.97)",
            border: "1px solid rgba(255, 42, 42, 0.15)",
            backdropFilter: "blur(20px)",
          }}
        >
          {useApi
            ? (apiResults as SearchResult[]).map((result) => (
                <button
                  key={result.movie_index}
                  onClick={() => handleSelectApi(result)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/5"
                  data-testid={`search-result-${result.movie_index}`}
                >
                  <div
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ background: "rgba(255, 42, 42, 0.7)" }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-white/90 text-sm font-medium truncate">
                      {result.title}
                    </div>
                    <div className="text-white/30 text-xs">
                      {result.language ?? "?"} · {result.year ?? "—"}
                    </div>
                  </div>
                </button>
              ))
            : (localResults as Movie[]).map((movie) => (
                <button
                  key={movie.id}
                  onClick={() => handleSelectLocal(movie)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/5"
                  data-testid={`search-result-${movie.id}`}
                >
                  <div
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ background: "rgba(255, 42, 42, 0.7)" }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-white/90 text-sm font-medium truncate">
                      {movie.title}
                    </div>
                    <div className="text-white/30 text-xs">
                      {movie.director} · {movie.year}
                    </div>
                  </div>
                  <div className="text-red-400 text-xs shrink-0">
                    ★ {movie.rating.toFixed(1)}
                  </div>
                </button>
              ))}
        </div>
      )}
    </div>
  );
}
