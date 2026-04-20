import { useState, useCallback, useRef } from "react";
import { fetchTopMovies, MovieOut, TopMoviesSort } from "../lib/api";

export function useTopMovies() {
  const [movies, setMovies] = useState<MovieOut[]>([]);
  const [page, setPage] = useState(0);
  const [lang, setLangState] = useState<string | null>(null);
  const [sort, setSortState] = useState<TopMoviesSort>("random");
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // track the current "session" so stale fetches don't race
  const sessionRef = useRef(0);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    const session = ++sessionRef.current;
    const currentLang = lang;
    const currentSort = sort;
    const currentPage = page;

    setLoading(true);
    try {
      const data = await fetchTopMovies({
        sort: currentSort,
        lang: currentLang,
        page: currentPage,
      });
      if (session !== sessionRef.current) return; // stale
      setMovies((prev) => [...prev, ...data.movies]);
      setPage(currentPage + 1);
      setHasMore(data.has_more);
    } catch (err) {
      console.error("useTopMovies loadMore:", err);
    } finally {
      if (session === sessionRef.current) setLoading(false);
    }
  }, [loading, hasMore, lang, sort, page]);

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
        const data = await fetchTopMovies({ lang: newLang, sort, page: 0 });
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
    [sort]
  );

  const setSort = useCallback(
    async (newSort: TopMoviesSort) => {
      sessionRef.current++; // invalidate any in-flight fetches
      const session = sessionRef.current;
      setSortState(newSort);
      setMovies([]);
      setPage(0);
      setHasMore(true);
      setLoading(true);
      try {
        const data = await fetchTopMovies({ lang, sort: newSort, page: 0 });
        if (session !== sessionRef.current) return;
        setMovies(data.movies);
        setPage(1);
        setHasMore(data.has_more);
      } catch (err) {
        console.error("useTopMovies setSort:", err);
      } finally {
        if (session === sessionRef.current) setLoading(false);
      }
    },
    [lang]
  );

  return { movies, lang, sort, loading, hasMore, loadMore, setLang, setSort };
}
