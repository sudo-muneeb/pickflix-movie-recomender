import { useState, useCallback, useRef, useEffect } from "react";
import { fetchTopMovies, MovieOut } from "../lib/api";

interface PaginationState {
  paginationKey: string | null;
  currentLang: string | null;
  pageOffset: number;
  inFlightRequest: Promise<any> | null;
}

const createPaginationState = (): PaginationState => ({
  paginationKey: null,
  currentLang: null,
  pageOffset: 0,
  inFlightRequest: null,
});

export function useDefaultMovies() {
  const [movies, setMovies] = useState<MovieOut[]>([]);
  const [lang, setLangState] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // track the current "session" so stale fetches don't race
  const sessionRef = useRef(0);
  
  // Pagination state tracking: key is sent back to server on each request
  const paginationStateRef = useRef<PaginationState>(createPaginationState());
  
  // Reset pagination on page refresh
  useEffect(() => {
    return () => {
      // Reset pagination state when component unmounts or is torn down
      paginationStateRef.current = createPaginationState();
    };
  }, []);

  const loadMore = useCallback(async () => {
    const paginationState = paginationStateRef.current;
    
    // Prevent redundant loads
    if (loading || !hasMore) return;
    if (paginationState.inFlightRequest) return; // Already fetching

    const session = ++sessionRef.current;
    const currentLang = lang;
    const currentKey = paginationState.paginationKey;
    const currentPage = paginationState.pageOffset;

    setLoading(true);
    try {
      const request = fetchTopMovies({
        lang: currentLang,
        page: currentPage,
        pagination_key: currentKey,
      });
      paginationState.inFlightRequest = request;
      const data = await request;
      paginationState.inFlightRequest = null;
      
      if (session !== sessionRef.current) return; // stale
      
      setMovies((prev) => [...prev, ...data.movies]);
      paginationState.paginationKey = data.pagination_key || null;
      paginationState.pageOffset += 1; // Increment page for next load
      setHasMore(data.has_more);
    } catch (err) {
      paginationState.inFlightRequest = null;
      console.error("useDefaultMovies loadMore:", err);
    } finally {
      if (session === sessionRef.current) setLoading(false);
    }
  }, [loading, hasMore, lang]);

  const setLang = useCallback(
    async (newLang: string | null) => {
      sessionRef.current++; // invalidate any in-flight fetches
      const session = sessionRef.current;
      
      // Reset pagination state for new language
      const paginationState = paginationStateRef.current;
      paginationState.paginationKey = null;  // Clear key to start fresh
      paginationState.currentLang = newLang;
      paginationState.pageOffset = 0;        // Reset page offset
      paginationState.inFlightRequest = null;
      
      setLangState(newLang);
      setMovies([]);
      setHasMore(true);
      setLoading(true);
      try {
        // Don't send pagination_key to start fresh
        const request = fetchTopMovies({ lang: newLang, page: 0 });
        paginationState.inFlightRequest = request;
        const data = await request;
        paginationState.inFlightRequest = null;
        
        if (session !== sessionRef.current) return;
        setMovies(data.movies);
        paginationState.paginationKey = data.pagination_key || null;
        paginationState.pageOffset = 1; // Next load should be page 1
        setHasMore(data.has_more);
      } catch (err) {
        paginationState.inFlightRequest = null;
        console.error("useDefaultMovies setLang:", err);
      } finally {
        if (session === sessionRef.current) setLoading(false);
      }
    },
    []
  );

  return { movies, lang, loading, hasMore, loadMore, setLang };
}
