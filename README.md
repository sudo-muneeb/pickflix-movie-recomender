# Pickflix — AI Movie Recommender Frontend

A dark, cinematic movie discovery platform. The 3D particle explorer lets you fly through thousands of films; the browse page fetches real data from the FastAPI backend; double-clicking any card slides up a full detail sheet. Personalized AI recommendations appear in the infinite-scroll `/recs` page.

---

## 🎯 Application Flow

**New user journey:**
```
Land on / (3D home)
  ↓ (scroll down to 97% depth)
Navigate to /browse
  ↓ (heart some movies)
Click "Get recommendations"
  ↓
Navigate to /recs (infinite scroll + improve recs loop)
```

**Returning user:**
```
Land on /browse (default entry point)
  ↓ (search, filter by language, or scroll)
Double-click card → see full details
  ↓ (heart movies)
Click "Get recommendations" → /recs
```

---

## 🧭 Page Routes & Behaviors

| Route | Component | Entry Point | Behavior | Data Source |
|---|---|---|---|---|
| `/` | `Home.tsx` | Direct URL / landing | 3D particle explorer; scroll to 97% triggers RetroTV boot → `/browse` CTA | Static 3000-movie dataset (fallback) |
| `/browse` | `BrowsePage.tsx` | `/` → RetroTV CTA or direct URL | Card grid + language filters + search + infinite scroll + like button + detail sheet | `GET /movies/default` + `GET /movies/search` + `GET /movies/{index}` |
| `/recs` | `Recs.tsx` | `/browse` → "Get recommendations" button (via `history.state`) | Infinite-scroll card grid; liking a rec refreshes recs with updated seed | `POST /recommend` (repeatedly) |
| `*` | `not-found.tsx` | Invalid URL | 404 fallback | None |

---

### 📄 Page Details

#### **`/` (Home.tsx) — 3D Particle Explorer**

**Entry behavior:**
- Mounts `<Scene>` with Three.js canvas
- Loads 3000 movies as red glowing particles (instanced mesh)
- Camera positioned at `z = 0`; particles fill 3D space from `z = -150` to `z = 150`

**Scroll behavior:**
- Wheel scroll increases `cameraZOffset` smoothly (camera moves along +Z axis into the particle field)
- Particles become denser as you move forward
- **Depth %** counter (top-right HUD) tracks scroll: 0% (top) → 100% (97%+ → triggers RetroTV)

**Mouse behavior:**
- Hover any particle → red glow + scale-up animation + `<Tooltip>` appears (title + year)
- Click particle → `<DetailPanel>` slides in from left (full metadata sidebar)
- Mouse X/Y → subtle camera parallax effect

**RetroTV Trigger:**
- When `scrollDepth ≥ 0.97` (97% scrolled):
  - `<RetroTV>` boot sequence starts
  - Phases: **off** → **flicker** (rapid opacity toggles) → **static** (red noise canvas) → **clearing** (fade out) → **on** (breathing radial gradient)
  - TV screen shows Pickflix branding + "What will you watch tonight?" CTA
  - Clicking CTA: `navigate('/browse')` via wouter

**Navigation out:**
- Escape key → no-op (stay on 3D)
- Search/browse intent → scroll to trigger RetroTV → click CTA

---

#### **`/browse` (BrowsePage.tsx) — 2D Movie Card Grid**

**Entry behavior:**
- On mount: `GET /movies/default?page_offset=0&lang=` (no lang filter = all languages)
- Displays 20 movies in responsive grid (changes columns based on viewport)
- Each `<MovieCard>` shows poster, language tag, rating, year, heart button

**Language filtering:**
- 9 filter pills: **All** | EN | KO | HI | FR | JA | ES | UR | DE
- Clicking a pill: `GET /movies/default?page_offset=0&lang={code}`
- Resets pagination to page 0; clears old grid; shows new language's top-rated movies
- Selected pill highlighted in red

**Search behavior:**
- Search bar (top of page) debounced 300ms
- Typing queries: `GET /movies/search?q={query}`
- Results replace grid immediately
- Clicking a result or clearing search → reverts to default list
- Returns results ranked by match tier (exact → prefix → substring → fuzzy)

**Infinite scroll:**
- Sentinel `<div>` at bottom of grid
- `IntersectionObserver` detects when user scrolls near bottom
- Triggers: `GET /movies/default?page_offset={nextPage}&lang={currentLang}&pagination_key={key}`
- Appends 20 more movies to grid; updates `has_more` flag
- Continues until `has_more: false`
- Uses the same `pagination_key` across pages to maintain consistent shuffle order

**Like/heart button:**
- Each card has a heart icon (outline = unliked, filled red = liked)
- Click → toggles `likedIndices` state
- Hearts persist only in frontend session state (not saved to backend)
- `<LikedTray>` at bottom shows all liked movies' thumbnails + count badge

**Double-click behavior:**
- Double-click any card → `fetchMovieDetail(movie_index)` where `movie_index` is the TMDB ID
- `<MovieDetailSheet>` slides up from bottom
- Shows: backdrop image, poster, title, genres, overview, cast, directors, budget, IMDb link, like button
- Close options: X button, backdrop click, Escape key

**"Get recommendations" button:**
- Fixed on `<LikedTray>` (bottom-left)
- Disabled when no movies are liked
- Click → `navigate('/recs', { state: { liked_indices: [...] } })`
- Passes `liked_indices` via wouter history state (no URL params)

---

#### **`/recs` (Recs.tsx) — AI Recommendations**

**Entry behavior:**
- Reads `liked_indices` from `window.history.state` (set by wouter navigate from `/browse`)
- Immediately calls: `POST /recommend` with body:
  ```json
  { "liked_indices": [A, B, C], "exclude_indices": [A, B, C], "page": 0 }
  ```
- Renders infinite-scroll card grid with recommendations
- Shows loading spinner until first batch arrives

**Infinite scroll:**
- Sentinel div at bottom
- On intersection: `POST /recommend` with `exclude_indices` = liked + all shown recommendations
- Prevents duplicate recommendations across pages
- Appends new batch to grid; checks `has_more` to stop scrolling when exhausted

**Like/heart behavior — "Improve recs" loop:**
- User hearts a recommended movie → added to `likedIndices`
- Immediately:
  1. Clear `recs[]` and `exclude_indices` (reset to just liked)
  2. Call: `POST /recommend` with new `liked_indices` (now includes the new like)
  3. Grid shows fresh recommendations (better-tuned preference vector)
- This is the **core feedback loop**: user refines taste → model adapts → better recs

**Unlike behavior:**
- User unhearts a recommendation
- Same flow: clear recs, fetch fresh with updated seed

**No search on this page:**
- Recommendations are AI-driven, not keyword-based
- To search, go back to `/browse` (via back button or logo click)

---

### 🎨 Component Behaviors

#### **`<MovieCard.tsx>`**
- Props: `movie: MovieOut`, `liked: boolean`, `onLike: () => void`, `onDoubleClick?: () => void`
- Displays:
  - **Poster:** TMDB image or dark placeholder if missing
  - **Language badge** (top-left, small pill)
  - **Heart button** (top-right, toggles on click)
  - **Rating + year** (below poster)
- On hover:
  - Lifts with red shadow
  - Shows subtle "double-click for details" hint (tooltip)
  - Cursor changes to pointer
- On double-click: calls `onDoubleClick()` → triggers detail sheet

#### **`<MovieDetailSheet.tsx>`**
- Animated slide-up from bottom (`translateY(100%) → translateY(0)`)
- Shows:
  - **Backdrop image** (full-width blur background)
  - **Poster** (left side, 200px wide)
  - **Title + tagline** (bold red accent)
  - **Genre pills** (interactive, can filter later)
  - **Overview** (paragraph text, scrollable)
  - **Credits:** Director, Writers, Cast (chip-style)
  - **Financials:** Budget, Revenue, Popularity, IMDb link
  - **Like button:** toggles the movie in `likedIndices`
- Close options:
  - X button (top-right)
  - Backdrop click
  - Escape key
- Animation: cubic-bezier spring curve (bouncy)

#### **`<LikedTray.tsx>`**
- Fixed at bottom of `/browse` page
- Only visible when `likedMovies.length > 0`
- Shows:
  - Up to 5 poster thumbnails (48×64 px, stacked horizontally)
  - Remove (×) button on thumbnail hover
  - Red badge showing count ("❤️ 7" if 7 movies liked)
  - "Get Recommendations" button (red gradient CTA)
    - Disabled when count = 0
    - Enabled when count ≥ 1
    - On click: navigate to `/recs` with `history.state`

#### **`<HUD.tsx>`** (3D home page overlay)
- Top-left: **Pickflix** logo (Pick = white glow, flix = red glow)
- Top-right: **Depth %** counter (0–100%, updates as you scroll)
- Bottom: **"Discover your taste in motion"** tagline (fades as you scroll past 50%)
- Left edge: Vertical z-axis indicator line (animated)

#### **`<Scene.tsx>`** & **`<ParticleField.tsx>`** (3D rendering)
- `<Scene>` wraps Three.js `<Canvas>` + camera + lights + bloom post-processing
- `<ParticleField>` uses `InstancedMesh` to render 3000+ particles in one draw call
- Per-frame: camera lerp, particle drift (sine waves), raycasting for interactions
- Hover → glow + scale
- Click → select (red highlight)
- Callback: `onHover(movie)` → tooltip, `onSelect(movie)` → detail panel

#### **`<RetroTV.tsx>`** (boot sequence)
- Phases: `off` → `flicker` → `static` → `clearing` → `on`
- Each phase animates CSS opacity, canvas noise, gradients
- When `phase === "on"`:
  - Shows Pickflix navbar + search bar (decorative)
  - "What will you watch tonight?" glowing text (clickable)
  - Calls `onEnter()` → navigate to `/browse`

#### **`<SearchBar.tsx>`**
- Debounced 300ms input
- On change: calls `fetchSearchResults(q)`
- Shows results in a dropdown/modal
- Clicking a result: parent updates grid
- Clearing input: reverts to default list

---

## 🎣 Hook Behaviors

### **`useDefaultMovies()`**
Manages paginated browse data:
```ts
const { movies, lang, loading, hasMore, loadMore, setLang } = useDefaultMovies();
```

**State:**
- `movies[]` — accumulated list of movies across pages
- `lang` — current language filter
- `currentPage` — tracks pagination

**Methods:**
- `loadMore()` → GET next page, append to `movies[]`
- `setLang(code)` → reset to page 0, clear `movies[]`, fetch new language
- `sessionRef` counter prevents race conditions (stale response overwrites)

**Behavior:**
- On mount: auto-fetches page 0 with default settings
- On language change: clears and refetches
- Infinite scroll: calls `loadMore()` repeatedly

---

### **`useRecommend(initialIndices?)`**
Manages recommendations + liked indices:
```ts
const { likedIndices, recs, loading, hasMore, addLiked, removeLiked, loadMore } = useRecommend(initialIndices);
```

**State:**
- `likedIndices[]` — movies the user likes (seed for recommendations)
- `recs[]` — current batch of recommendations
- `shownSet` — all indices shown so far (for `exclude_indices`)
- `loading` — boolean flag

**Methods:**
- `addLiked(index)` → add to `likedIndices`, reset recs, fetch fresh
- `removeLiked(index)` → remove from `likedIndices`, reset recs, fetch fresh
- `loadMore()` → append `exclude_indices`, fetch next batch

**Behavior:**
- On mount (if `initialIndices` provided): auto-fetch recommendations
- Each like/unlike: clear recs, fetch fresh (improved vector)
- Infinite scroll: append to `exclude_indices`

---

## 🔌 API Usage Patterns

### Browse Page → Top Movies
```ts
// On mount or language change
GET /movies/default?sort=top&page=0&lang=en
→ { movies: [...], page: 0, has_more: true }

// User scrolls (infinite scroll)
GET /movies/default?sort=top&page=1&lang=en
→ { movies: [...], page: 1, has_more: true }
```

### Browse Page → Search
```ts
// User types (debounced 300ms)
GET /movies/search?q=avatar
→ { results: [...] }  // Already sorted by match quality
```

### Browse Page → Movie Detail
```ts
// User double-clicks a movie
GET /movies/42
→ { 
  title, original_title, overview, genres[], cast[], 
  budget, revenue, imdb_id, release_date, runtime, ...
}
```

### Recs Page → AI Recommendations
```ts
// On mount with liked_indices=[42, 107, 883]
POST /recommend
Body: { liked_indices: [42, 107, 883], exclude_indices: [42, 107, 883], page: 0 }
→ { movies: [...], has_more: true, score: 0.89 }

// User scrolls (infinite scroll)
POST /recommend
Body: { liked_indices: [42, 107, 883], exclude_indices: [42, 107, 883, ...D-S], page: 1 }
→ { movies: [...], has_more: true }

// User likes a recommendation (index 201)
POST /recommend
Body: { liked_indices: [42, 107, 883, 201], exclude_indices: [42, 107, 883, 201], page: 0 }
→ { movies: [...], has_more: true }  // Fresh recs with better seed
```

---

## 📊 Component Communication & State

```
App.tsx (Route provider, QueryClient)
  ├── Home.tsx (3D landing)
  │   ├── <Scene> → <ParticleField> (Three.js render)
  │   ├── <HUD> (logo + depth %)
  │   ├── <DetailPanel> (sidebar detail on particle click)
  │   └── <RetroTV> (boot sequence, navigate to /browse)
  │
  ├── BrowsePage.tsx (card grid + filters)
  │   ├── useDefaultMovies() (pagination state)
  │   ├── <SearchBar> (query → GET /movies/search)
  │   ├── <MovieCard> × 20 (poster + like button)
  │   │   └── onDoubleClick → fetch detail
  │   ├── <MovieDetailSheet> (full metadata)
  │   └── <LikedTray> (liked movies + "Get recommendations" CTA)
  │
  └── Recs.tsx (recommendation grid + improve loop)
      ├── useRecommend() (liked + recs state)
      ├── <MovieCard> × 20 (from recommendations)
      │   └── onLike → refresh recs with updated seed
      └── <MovieDetailSheet> (full metadata)
```

**State flow:**
1. User hearts movie on `/browse` → added to local `likedIndices` state in `BrowsePage`
2. User navigates to `/recs` → `likedIndices` passed via `history.state`
3. `Recs` page receives `likedIndices`, calls `useRecommend(likedIndices)`
4. User likes a recommendation → `addLiked()` in `useRecommend` → reset recs, fetch fresh
5. User goes back to `/browse` → state lost (fresh page load)

---

## 🛠 Tech Stack & Key Dependencies

| Layer | Technology | Purpose |
|---|---|---|
| **Framework** | React 19 + Vite 7 | Component-based UI + fast dev server |
| **3D Graphics** | Three.js | WebGL particle field + camera |
| **3D React** | @react-three/fiber | Declarative Three.js components |
| **Effects** | @react-three/postprocessing | Bloom effect on particles |
| **Routing** | wouter v3 | Lightweight client-side routing |
| **Styling** | Tailwind CSS v4 | Utility-first CSS + custom glow effects |
| **Icons** | lucide-react | Consistent icon library (heart, search, X, etc.) |
| **Data Fetching** | Plain `fetch` | No library needed; simple REST calls |
| **Query Caching** | @tanstack/react-query | Automatic request deduplication + caching |
| **Type Safety** | TypeScript 5.9 | Full type checking for API responses |
| **Fonts** | Space Grotesk (Google Fonts) | Sleek monospace-like heading font |
| **Package Manager** | pnpm (workspace) | Monorepo structure for frontend + lib |

---

## 🚀 Running Locally

```bash
# From the frontend/ directory
cd artifacts/pickflix
PORT=3000 BASE_PATH=/ pnpm run dev
```

> Backend must be running at `http://localhost:8000` (see backend README).

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
│       │   │   ├── Home.tsx             ← 3D particle explorer
│       │   │   ├── BrowsePage.tsx       ← Card grid + filters + search
│       │   │   ├── Recs.tsx             ← AI recommendations
│       │   │   └── not-found.tsx        ← 404 fallback
│       │   ├── components/
│       │   │   ├── HUD.tsx              ← Logo + depth counter
│       │   │   ├── Scene.tsx            ← Three.js canvas wrapper
│       │   │   ├── ParticleField.tsx    ← Particle renderer
│       │   │   ├── RetroTV.tsx          ← CRT boot animation
│       │   │   ├── DetailPanel.tsx      ← Particle detail sidebar
│       │   │   ├── MovieCard.tsx        ← Reusable card component
│       │   │   ├── MovieDetailSheet.tsx ← Bottom-sheet full detail
│       │   │   ├── LikedTray.tsx        ← Liked movies + CTA
│       │   │   ├── SearchBar.tsx        ← Query input
│       │   │   ├── Tooltip.tsx          ← Hover tooltip
│       │   │   └── LoadingScreen.tsx    ← Spinner
│       │   ├── hooks/
│       │   │   ├── useDefaultMovies.ts      ← Browse pagination state
│       │   │   └── useRecommend.ts      ← Recs + liked state
│       │   ├── lib/
│       │   │   ├── api.ts               ← Fetch wrappers
│       │   │   └── utils.ts             ← Helper functions
│       │   └── data/
│       │       └── movies.ts            ← Static 3000-movie fallback
│       ├── vite.config.ts
│       ├── package.json
│       └── index.html
├── lib/
│   └── api-client-react/       ← Generated API client (not currently used)
├── pnpm-workspace.yaml
└── README.md                    ← this file
```

---

## 📚 Detailed Component Reference

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

- On mount calls `GET /movies/default?page=0` via `useDefaultMovies` and renders a responsive card grid.
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

Accepts an optional `apiMovies` prop — when provided, it maps `MovieOut[]` from the backend (where `movie_index` is the TMDB ID) into the `Movie` shape used by ParticleField (computing spatial x/y/z positions from `movie_index`). Falls back to the static 3000-entry `MOVIES` dataset when no API data is available.

---

### `src/App.tsx`
Root component. Sets up `QueryClientProvider` and **wouter** `Router` with three routes: `/` → Home, `/browse` → BrowsePage, `/recs` → Recs.

---

## ✨ Summary

**Pickflix is a full-stack movie discovery platform** combining:
- **3D immersive experience** on `/` with particle field + scroll-driven navigation
- **2D browsing + search** on `/browse` with language filters and infinite scroll  
- **AI-powered recommendations** on `/recs` with feedback loop for taste refinement

**Key flows:**
1. User discovers movies via 3D explorer or browse page
2. Hearts favorite films
3. Clicks "Get recommendations" → AI refines suggestions based on taste
4. Infinite-scroll discovery with option to improve recs by liking recommendations

**Backend handles:**
- High-quality movie metadata (235k+ films)
- FAISS-powered semantic similarity search
- Fuzzy title search with ranking by relevance
- Consistent logging for monitoring

**Frontend manages:**
- State via custom hooks (`useDefaultMovies`, `useRecommend`)
- Three.js rendering with @react-three/fiber
- Responsive card grid UI with Tailwind CSS
- Seamless routing between discovery and recommendation modes

---

**Last updated:** April 2026