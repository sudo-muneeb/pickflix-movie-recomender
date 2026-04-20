# Pickflix — AI Movie Recommender Frontend

A dark, cinematic movie discovery platform. The 3D particle explorer lets you fly through thousands of films; the browse page fetches real data from the FastAPI backend; double-clicking any card slides up a full detail sheet.

---

## 🗂 Project Structure

```
frontend/
├── artifacts/
│   └── pickflix/               ← Main React app (Vite + Tailwind v4)
│       ├── src/
│       │   ├── App.tsx
│       │   ├── main.tsx
│       │   ├── index.css
│       │   ├── pages/
│       │   │   ├── Home.tsx
│       │   │   ├── BrowsePage.tsx
│       │   │   ├── Recs.tsx
│       │   │   └── not-found.tsx
│       │   ├── components/
│       │   │   ├── HUD.tsx
│       │   │   ├── Scene.tsx
│       │   │   ├── ParticleField.tsx
│       │   │   ├── RetroTV.tsx
│       │   │   ├── DetailPanel.tsx
│       │   │   ├── MovieCard.tsx
│       │   │   ├── MovieDetailSheet.tsx
│       │   │   ├── LikedTray.tsx
│       │   │   ├── SearchBar.tsx
│       │   │   ├── Tooltip.tsx
│       │   │   └── LoadingScreen.tsx
│       │   ├── hooks/
│       │   │   ├── useTopMovies.ts
│       │   │   └── useRecommend.ts
│       │   ├── lib/
│       │   │   ├── api.ts
│       │   │   └── utils.ts
│       │   └── data/
│       │       └── movies.ts
│       ├── vite.config.ts
│       ├── package.json
│       └── index.html
├── pnpm-workspace.yaml
└── README.md                    ← this file
```

---

## 🚀 Running Locally

```bash
# From the frontend/ directory
cd artifacts/pickflix
PORT=3000 BASE_PATH=/ pnpm run dev
```

> Backend must be running at `http://localhost:8000` (see backend README).

---

## 🧭 Page Routes

| Route | Component | Description |
|---|---|---|
| `/` | `Home.tsx` | 3D particle explorer — 3000 films as glowing orbs |
| `/browse` | `BrowsePage.tsx` | 2D card grid — real data from `GET /movies/top` |
| `/recs` | `Recs.tsx` | AI recommendation results — infinite scroll |
| `*` | `not-found.tsx` | 404 fallback |

---

## 📄 Important Files

### `src/App.tsx`
Root component. Sets up `QueryClientProvider` and **wouter** `Router` with three routes: `/` → Home, `/browse` → BrowsePage, `/recs` → Recs.

---

### `src/pages/Home.tsx`
**The 3D landing page.**

- Mounts a Three.js canvas via `<Scene>` which renders 3000 particles as glowing red orbs using instanced meshes.
- Wheel scroll drives a smooth camera Z-offset (`cameraZOffset`) so scrolling flies you through the particle field.
- Mouse position drives subtle parallax (`mouseParallax`).
- Hovering a particle shows a `<Tooltip>`. Clicking opens `<DetailPanel>` in a slide-in sidebar.
- Scrolling all the way to 97% depth triggers `<RetroTV>` — a CRT boot animation that reveals the Pickflix TV screen with a "What will you watch tonight?" CTA. Clicking it navigates to `/browse`.
- `<HUD>` shows the **Pickflix** logo top-left and a depth % top-right. No search bar here.

---

### `src/pages/BrowsePage.tsx`
**The 2D home / browse page.**

- On mount calls `GET /movies/top?page=0` via `useTopMovies` and renders a responsive card grid.
- **Language filter pills** (All / EN / KO / HI / FR / JA / ES / UR / DE) re-fetch with `?lang=xx`.
- **Search bar** (debounced 300ms) calls `GET /movies/search?q=` and switches the grid to search results.
- **Infinite scroll** via `IntersectionObserver` on a sentinel `<div>` at the bottom.
- **Double-clicking** any `<MovieCard>` opens `<MovieDetailSheet>` — a slide-up bottom drawer with full film metadata fetched from `GET /movies/{index}`.
- **Heart button** on each card adds/removes the movie from `likedIndices`.
- **`<LikedTray>`** fixed at the bottom shows liked-movie thumbnails + a "Get recommendations" button → navigates to `/recs` passing `liked_indices` via `history.state`.

---

### `src/pages/Recs.tsx`
**The AI recommendations page.**

- Reads `liked_indices` from `window.history.state` (set by wouter navigate).
- Calls `POST /recommend` with `{ liked_indices, exclude_indices }` on mount via `useRecommend`.
- Renders a responsive 4-column card grid.
- IntersectionObserver loads more batches (appending to `exclude_indices` to avoid duplicates).
- Liking a rec card triggers a fresh recommendation fetch with the updated seed set — the "improve my recs" loop.
- Double-clicking any card opens the same `<MovieDetailSheet>`.

---

### `src/components/HUD.tsx`
Overlay for the 3D landing page. Shows:
- **Top-left:** `Pick` (white glow) + `flix` (red glow) logotype
- **Top-right:** Depth % counter (tracks scroll position)
- **Bottom:** "Discover your taste in motion" tagline that fades as you scroll
- **Left edge:** Vertical z-axis indicator line
- No search bar — search lives on `/browse`

---

### `src/components/Scene.tsx`
Thin wrapper around `@react-three/fiber` `<Canvas>`. Sets up camera, fog, ambient light, bloom post-processing (`@react-three/postprocessing`), and renders `<ParticleField>`.

Accepts an optional `apiMovies` prop — when provided, it maps `MovieOut[]` from the backend into the `Movie` shape used by ParticleField (computing spatial x/y/z positions from `movie_index`). Falls back to the static 3000-entry `MOVIES` dataset when no API data is available.

---

### `src/components/ParticleField.tsx`
The core 3D renderer. Uses `THREE.InstancedMesh` to render 3000+ particles in a single draw call.

- Each frame: updates camera position (smooth lerp toward target), animates each particle with sinusoidal drift, applies hover/select color highlights.
- Raycasting (`THREE.Raycaster`) detects pointer-over and click — fires `onHover` and `onSelect` callbacks.
- Selected particles glow red; hovered particles scale up.

---

### `src/components/RetroTV.tsx`
The cinematic TV boot sequence that appears when the user scrolls to 97% depth.

**Phase sequence:** `off → flicker → static → clearing → on`

- `flicker`: rapid CSS opacity toggles
- `static`: canvas noise animation in red tones
- `clearing`: noise fades out with red glow
- `on`: breathing radial gradient + reveals the Pickflix UI

When `phase === "on"`, the TV screen shows:
1. **Pickflix navbar** (Pick in white, flix in red)
2. **Search bar** (decorative placeholder)
3. **"What will you watch tonight?"** — glowing clickable text that calls `onEnter()` → navigates to `/browse`

---

### `src/components/MovieCard.tsx`
Reusable card component used on Browse and Recs pages.

Props: `movie: MovieOut`, `liked: boolean`, `onLike: () => void`, `onDoubleClick?: () => void`

- Shows TMDB poster at `https://image.tmdb.org/t/p/w300{poster_path}` or a dark placeholder.
- Language tag badge top-left, heart button top-right.
- Star rating + year below the poster.
- On hover: lifts with red shadow; shows a subtle "double-click for details" hint.
- `onDoubleClick` triggers `fetchMovieDetail(movie_index)` in the parent and opens `<MovieDetailSheet>`.

---

### `src/components/MovieDetailSheet.tsx`
Full-screen bottom-sheet drawer that slides up on double-click.

- Animated via `translateY(100%) → translateY(0)` with a cubic-bezier spring.
- Shows: **backdrop image** (w1280), **poster** (w500), **title + tagline**, genre pills, overview, director/writers/cast chips, budget/revenue, IMDb link, like button.
- Closes on: X button, backdrop click, or `Escape` key.
- `liked` / `onLike` props wire into the parent's `useRecommend` state.

---

### `src/components/LikedTray.tsx`
Fixed bottom overlay on `/browse`. Only renders when `likedMovies.length > 0`.

- Shows up to 5 poster thumbnails (48×64 px) with ×-remove buttons on hover.
- "Get recommendations" button (disabled when empty) — red gradient CTA.

---

### `src/hooks/useTopMovies.ts`
Manages `GET /movies/top` pagination.

```ts
const { movies, lang, loading, hasMore, loadMore, setLang } = useTopMovies();
```

- `loadMore()` appends the next page to `movies[]`.
- `setLang(code)` resets to page 0, clears the list, and re-fetches for the new language.
- A `sessionRef` counter prevents stale responses from racing.

---

### `src/hooks/useRecommend.ts`
Manages liked indices, the exclude set, and `POST /recommend` calls.

```ts
const { likedIndices, recs, loading, hasMore, addLiked, removeLiked, loadMore } = useRecommend(initialIndices);
```

- `addLiked(index)` → appends to `likedIndices`, clears `shownSet` to just the new likes, resets `recs`, fetches fresh.
- `removeLiked(index)` → same reset flow.
- `loadMore()` → POSTs with current `shownSet` as `exclude_indices`, appends results.
- Auto-fetches on mount when `initialIndices` is non-empty (used by Recs page).

---

### `src/lib/api.ts`
All `fetch` wrappers — plain fetch, no extra libraries.

| Function | Endpoint | Description |
|---|---|---|
| `fetchTopMovies({ lang, page })` | `GET /movies/top` | Paginated rated movies |
| `fetchRecommendations({ liked_indices, exclude_indices, page })` | `POST /recommend` | FAISS-powered recs |
| `searchMovies(q)` | `GET /movies/search?q=` | Fuzzy title search |
| `fetchMovieDetail(movie_index)` | `GET /movies/{index}` | Full metadata |

Key interfaces: `MovieOut`, `MovieDetail`, `MovieListResponse`, `SearchResponse`.

---

### `src/data/movies.ts`
Deterministic seeded-random generator that produces 3000 fake `Movie` objects for the 3D particle field (used as fallback when the backend is offline). Fields: `id, title, year, rating, genre, director, description, x, y, z, brightness, size`.

---

### `src/index.css`
Global styles + Tailwind v4 config. Key utilities:

| Class | Effect |
|---|---|
| `.glow-red` | `box-shadow` red halo |
| `.glow-text` | `text-shadow` red glow |
| `.glass-panel` | Frosted glass card |
| `.pulse-dot` | Pulsing animated dot |

CSS variables set the color system: primary red `hsl(0 90% 55%)`, dark backgrounds.

---

## 🔌 Backend API (runs at `localhost:8000`)

| Method | Path | Used by |
|---|---|---|
| `GET` | `/movies/top?page=0&lang=en` | BrowsePage, useTopMovies |
| `POST` | `/recommend` | useRecommend |
| `GET` | `/movies/search?q=` | SearchBar in BrowsePage |
| `GET` | `/movies/{index}` | MovieDetailSheet |
| `GET` | `/health` | Liveness probe |

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + Vite 7 |
| 3D | Three.js · @react-three/fiber · @react-three/postprocessing |
| Routing | wouter v3 |
| Styling | Tailwind CSS v4 (via `@tailwindcss/vite`) |
| Icons | lucide-react |
| Fonts | Space Grotesk (Google Fonts) |
| Package manager | pnpm (workspace monorepo) |
| Type checking | TypeScript 5.9 |

---

**Last updated:** April 2026