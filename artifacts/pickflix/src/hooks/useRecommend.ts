import { useState, useCallback, useRef, useEffect } from "react";
import { fetchRecommendations, MovieOut } from "../lib/api";

export function useRecommend(initialIndices: number[] = []) {
  const [likedIndices, setLikedIndices] = useState<number[]>(initialIndices);
  const [shownSet, setShownSet] = useState<Set<number>>(
    new Set(initialIndices)
  );
  const [recs, setRecs] = useState<MovieOut[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const sessionRef = useRef(0);

  // Auto-fetch on mount if initial indices provided
  const didAutoFetch = useRef(false);
  useEffect(() => {
    if (didAutoFetch.current || initialIndices.length === 0) return;
    didAutoFetch.current = true;
    const session = ++sessionRef.current;
    const initSet = new Set(initialIndices);
    setLoading(true);
    fetchRecommendations({
      liked_indices: initialIndices,
      exclude_indices: Array.from(initSet),
      page: 0,
    })
      .then((data) => {
        if (session !== sessionRef.current) return;
        setRecs(data.movies);
        setShownSet(new Set([...initSet, ...data.movies.map((m) => m.movie_index)]));
        setHasMore(data.has_more);
      })
      .catch((err) => console.error("useRecommend init:", err))
      .finally(() => { if (session === sessionRef.current) setLoading(false); });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const doFetch = useCallback(
    async (
      indices: number[],
      excludeSet: Set<number>,
      session: number
    ) => {
      if (indices.length === 0) return;
      setLoading(true);
      try {
        const data = await fetchRecommendations({
          liked_indices: indices,
          exclude_indices: Array.from(excludeSet),
          page: 0,
        });
        if (session !== sessionRef.current) return;
        setRecs(data.movies);
        setShownSet(new Set([...excludeSet, ...data.movies.map((m) => m.movie_index)]));
        setHasMore(data.has_more);
      } catch (err) {
        console.error("useRecommend doFetch:", err);
      } finally {
        if (session === sessionRef.current) setLoading(false);
      }
    },
    []
  );

  const addLiked = useCallback(
    (index: number) => {
      setLikedIndices((prev) => {
        if (prev.includes(index)) return prev;
        const next = [...prev, index];
        const newShownSet = new Set(next);
        const session = ++sessionRef.current;
        setShownSet(newShownSet);
        setRecs([]);
        setHasMore(true);
        doFetch(next, newShownSet, session);
        return next;
      });
    },
    [doFetch]
  );

  const removeLiked = useCallback(
    (index: number) => {
      setLikedIndices((prev) => {
        const next = prev.filter((i) => i !== index);
        const newShownSet = new Set(next);
        const session = ++sessionRef.current;
        setShownSet(newShownSet);
        setRecs([]);
        setHasMore(true);
        if (next.length > 0) doFetch(next, newShownSet, session);
        return next;
      });
    },
    [doFetch]
  );

  const loadMore = useCallback(async () => {
    if (loading || !hasMore || likedIndices.length === 0) return;
    const session = ++sessionRef.current;
    setLoading(true);
    try {
      const data = await fetchRecommendations({
        liked_indices: likedIndices,
        exclude_indices: Array.from(shownSet),
        page: 0,
      });
      if (session !== sessionRef.current) return;
      setRecs((prev) => [...prev, ...data.movies]);
      setShownSet((prev) => {
        const next = new Set(prev);
        data.movies.forEach((m) => next.add(m.movie_index));
        return next;
      });
      setHasMore(data.has_more);
    } catch (err) {
      console.error("useRecommend loadMore:", err);
    } finally {
      if (session === sessionRef.current) setLoading(false);
    }
  }, [loading, hasMore, likedIndices, shownSet]);

  return {
    likedIndices,
    recs,
    loading,
    hasMore,
    addLiked,
    removeLiked,
    loadMore,
  };
}
