const BASE = "http://localhost:8000";

/**
 * Movie data from the API.
 * `movie_index` is the TMDB ID of the movie.
 */
export interface MovieOut {
  movie_index: number;  // TMDB ID
  title: string;
  year: number | null;
  language: string | null;
  avg_rating: number;
  vote_count: number;
  poster_path: string | null;
}

export interface MovieListResponse {
  movies: MovieOut[];
  page: number;
  has_more: boolean;
  pagination_key?: string;
}

export interface SearchResponse {
  results: Pick<MovieOut, "movie_index" | "title" | "year" | "language">[];
}

/**
 * Full movie details from the API.
 * `movie_index` is the TMDB ID of the movie.
 */
export interface MovieDetail {
  movie_index: number;  // TMDB ID
  title: string;
  original_title: string | null;
  tagline: string | null;
  overview: string | null;
  release_date: string | null;
  year: number | null;
  status: string | null;
  runtime: number | null;
  adult: boolean;
  language: string | null;
  genres: string | null;
  keywords: string | null;
  directors: string | null;
  writers: string | null;
  cast: string | null;
  avg_rating: number | null;
  vote_count: number | null;
  vote_average: number | null;
  popularity: number | null;
  budget: number | null;
  revenue: number | null;
  poster_path: string | null;
  backdrop_path: string | null;
  homepage: string | null;
  production_companies: string | null;
  production_countries: string | null;
  spoken_languages: string | null;
  imdb_id: string | null;
  tmdb_id: number | null;
}

export async function fetchMovieDetail(movie_index: number): Promise<MovieDetail> {
  const res = await fetch(`${BASE}/movies/${movie_index}`);
  if (!res.ok) throw new Error(`fetchMovieDetail: ${res.status}`);
  return res.json();
}

export async function fetchTopMovies({
  lang,
  page = 0,
  pagination_key,
}: {
  lang?: string | null;
  page?: number;
  pagination_key?: string | null;
}): Promise<MovieListResponse> {
  const params = new URLSearchParams();
  if (lang) params.set("lang", lang);
  if (pagination_key) params.set("pagination_key", pagination_key);
  params.set("page_offset", String(page));
  const res = await fetch(`${BASE}/movies/default?${params.toString()}`);
  if (!res.ok) throw new Error(`fetchTopMovies: ${res.status}`);
  return res.json();
}

export async function fetchRecommendations({
  liked_indices,
  exclude_indices,
  page,
}: {
  liked_indices: number[];
  exclude_indices: number[];
  page: number;
}): Promise<MovieListResponse> {
  const res = await fetch(`${BASE}/recommend`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ liked_indices, exclude_indices, page }),
  });
  if (!res.ok) throw new Error(`fetchRecommendations: ${res.status}`);
  return res.json();
}

export async function searchMovies(q: string): Promise<SearchResponse> {
  const params = new URLSearchParams({ q });
  const res = await fetch(`${BASE}/movies/search?${params.toString()}`);
  if (!res.ok) throw new Error(`searchMovies: ${res.status}`);
  return res.json();
}

/**
 * Check if the backend server is healthy.
 * Returns true if healthy, false otherwise.
 */
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE}/health`, {
      method: "GET",
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });
    return res.ok;
  } catch (error) {
    return false;
  }
}
