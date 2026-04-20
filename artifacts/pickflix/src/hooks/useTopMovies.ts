import { useState, useCallback, useRef } from "react";
import { fetchTopMovies, MovieOut } from "../lib/api";

export function useTopMovies() {
  const [movies, setMovies] = useState<MovieOut[]>([]);
  const [page, setPage] = useState(0);
  const [lang, setLangState] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // track the current "session" so stale fetches don't race
  const sessionRef = useRef(0);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    const session = ++sessionRef.current;
    const currentLang = lang;
    const currentPage = page;

    setLoading(true);
    try {
      const data = await fetchTopMovies({ lang: currentLang, page: currentPage });
      if (session !== sessionRef.current) return; // stale
      setMovies((prev) => [...prev, ...data.movies]);
      setPage(currentPage + 1);
      setHasMore(data.has_more);
    } catch (err) {
      console.error("useTopMovies loadMore:", err);
    } finally {
      if (session === sessionRef.current) setLoading(false);
    }
  }, [loading, hasMore, lang, page]);

  const setLang = useCallback(
    async (newLang: string | null) => {
      sessionRef.current++; // invalidate any in-flight fetches
      const session = sessionRef.current;
      setLangState(newLang);
      setMovies([]);
      setPage(0);
      setHasMore(true);
      setLoading(true);
      try {
        const data = await fetchTopMovies({ lang: newLang, page: 0 });
        if (session !== sessionRef.current) return;
        setMovies(data.movies);
        setPage(1);
        setHasMore(data.has_more);
      } catch (err) {
        console.error("useTopMovies setLang:", err);
      } finally {
        if (session === sessionRef.current) setLoading(false);
      }
    },
    []
  );

  return { movies, lang, loading, hasMore, loadMore, setLang };
}
