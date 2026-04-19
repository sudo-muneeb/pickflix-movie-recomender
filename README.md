# Pickflix - Movie Recommender

A dark, cinematic 3D movie recommendation and exploration platform built with a modern TypeScript monorepo.

## 📋 Project Structure

```
pickflix-movie-recomender/
├── artifacts/                          # Deployable applications
│   ├── api-server/                     # Express backend API
│   │   ├── src/
│   │   │   ├── app.ts                  # Express app setup
│   │   │   ├── index.ts                # Server entry point
│   │   │   ├── lib/logger.ts           # Pino logging
│   │   │   ├── middlewares/            # Express middleware
│   │   │   └── routes/
│   │   │       ├── health.ts           # Health check endpoint
│   │   │       └── index.ts
│   │   ├── build.mjs                   # esbuild configuration
│   │   └── package.json
│   │
│   ├── cinescope/                      # Main 3D movie explorer UI
│   │   ├── src/
│   │   │   ├── App.tsx                 # Root component
│   │   │   ├── main.tsx                # React entry point
│   │   │   ├── pages/
│   │   │   │   ├── Home.tsx            # Main landing page
│   │   │   │   └── not-found.tsx
│   │   │   ├── components/
│   │   │   │   ├── Scene.tsx           # Three.js canvas wrapper
│   │   │   │   ├── ParticleField.tsx   # 3D particle system (3000 movies)
│   │   │   │   ├── HUD.tsx             # Overlay UI layer
│   │   │   │   ├── DetailPanel.tsx     # Movie details sidebar
│   │   │   │   ├── SearchBar.tsx       # Search with autocomplete
│   │   │   │   ├── Tooltip.tsx         # Hover tooltips
│   │   │   │   ├── RetroTV.tsx         # Retro TV frame effect
│   │   │   │   ├── LoadingScreen.tsx   # Pulsing dots loader
│   │   │   │   └── ui/                 # Shadcn components
│   │   │   ├── hooks/
│   │   │   │   ├── use-mobile.tsx      # Mobile detection
│   │   │   │   ├── use-toast.ts        # Toast notifications
│   │   │   │   └── useSound.ts         # Audio playback
│   │   │   ├── data/
│   │   │   │   └── movies.ts           # 3000 movie dataset
│   │   │   └── lib/utils.ts            # Utility functions
│   │   ├── vite.config.ts              # Vite config (requires PORT, BASE_PATH)
│   │   ├── index.html
│   │   └── package.json
│
├── lib/                                # Shared libraries
│   ├── api-client-react/               # React API client hook
│   │   ├── src/
│   │   │   ├── custom-fetch.ts         # Custom fetch wrapper
│   │   │   ├── index.ts                # Main export
│   │   │   └── generated/              # Orval-generated code
│   │   │       ├── api.ts              # API hooks
│   │   │       └── api.schemas.ts      # Generated types
│   │   └── package.json
│   │
│   ├── api-spec/                       # OpenAPI specification
│   │   ├── openapi.yaml                # API definition
│   │   ├── orval.config.ts             # Code generation config
│   │   └── package.json
│   │
│   ├── api-zod/                        # Zod validation schemas
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   └── generated/
│   │   │       ├── api.ts              # Auto-generated schemas
│   │   │       └── types/
│   │   └── package.json
│   │
│   └── db/                             # Database schema & ORM
│       ├── src/
│       │   ├── index.ts
│       │   └── schema/index.ts         # Drizzle ORM schema
│       ├── drizzle.config.ts
│       └── package.json
│
├── scripts/                            # Utility scripts
│   ├── src/hello.ts
│   └── package.json
│
├── pnpm-workspace.yaml                 # Monorepo configuration
├── pnpm-lock.yaml                      # Dependency lockfile (233KB)
├── tsconfig.base.json                  # Shared TypeScript config
├── tsconfig.json
├── package.json                        # Root workspace package
└── .gitignore
```

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|--------------|
| **Frontend** | React 18 + TypeScript + Vite |
| **3D Graphics** | Three.js + React Three Fiber + Postprocessing |
| **UI Components** | Shadcn UI + Tailwind CSS |
| **Backend** | Express 5 + TypeScript |
| **Logging** | Pino |
| **Database** | PostgreSQL + Drizzle ORM |
| **API Definition** | OpenAPI + Zod + Orval |
| **Validation** | Zod + drizzle-zod |
| **Monorepo Tool** | pnpm workspaces |
| **Code Generation** | Orval (from OpenAPI spec) |
| **Build Tool** | esbuild (API) + Vite (Frontend) |
| **Node.js** | v24 |
| **TypeScript** | 5.9 |

## 📦 Key Artifacts

### CineScope - 3D Movie Explorer
A dark, cinematic landing page and movie recommendation experience.

**Features:**
- 3000 glowing red particle dots in 3D space (one per movie)
- Depth-layered particles (front = bright/large, back = faint/small)
- Mouse parallax effect — camera shifts with cursor position
- Scroll to fly forward through the particle field
- Interactive hover tooltips showing title + rating
- Click to open detail panel with full movie information
- Search bar with autocomplete to find and fly to any film
- Bloom postprocessing effect for neon glow
- Fog effect for depth perception
- Slow particle drift animation
- Instanced meshes for 60fps performance
- WebGL error boundary for graceful degradation

**Tech:** React + Vite + React Three Fiber + Three.js + @react-three/postprocessing

### API Server
Shared Express 5 backend providing RESTful APIs.

**Currently:**
- `/api/healthz` — Health check endpoint

**Tech:** Express 5 + TypeScript + Pino + esbuild

## 🚀 Getting Started

### Prerequisites
- Node.js 24+
- pnpm (package manager)

### Installation

```bash
# Install pnpm globally
npm install -g pnpm

# Install all workspace dependencies
pnpm install
```

### Environment Variables

Create a `.env` file or export these variables:

```bash
export PORT=3000           # Required for Vite builds
export BASE_PATH=/         # Required for Vite builds
```

## 📝 Available Commands

### Workspace Commands

```bash
# Full typecheck across all packages
pnpm run typecheck

# Build everything with typecheck
pnpm run build

# Regenerate API hooks and Zod schemas from OpenAPI spec
pnpm --filter @workspace/api-spec run codegen

# Push database schema changes (dev only)
pnpm --filter @workspace/db run push
```

### Running Services

```bash
# Run API server locally (dev mode)
pnpm --filter @workspace/api-server run dev

# Run CineScope frontend (dev mode)
cd artifacts/cinescope && PORT=3000 BASE_PATH=/ pnpm run dev
```

### Quick Start

```bash
# Terminal 1: Run API server
PORT=3000 BASE_PATH=/ pnpm --filter @workspace/api-server run dev

# Terminal 2: Run CineScope UI
PORT=3000 BASE_PATH=/ pnpm --filter @workspace/cinescope run dev
```

## 📊 Repository Size Breakdown

| Item | Size | Notes |
|------|------|-------|
| **.local/** (pnpm cache) | **586MB** | ⚠️ Can be deleted — regenerated on `pnpm install` |
| Source code | ~8MB | Keep |
| .git (history) | ~2MB | Keep |
| pnpm-lock.yaml | 233KB | Keep — reproducible dependencies |
| **Total** | **594MB** | After cleanup: **~8MB** |

### Clean Up Cache

```bash
rm -rf .local/
```

This removes the pnpm cache and reduces repo size to ~8MB. Dependencies will reinstall automatically on next `pnpm install`.

## 🏗️ Build Artifacts

After running `pnpm run build`:

```
artifacts/
├── api-server/dist/          # CJS bundles
│   ├── index.mjs             # 1.4MB (with source map)
│   ├── pino-*.mjs            # Logger bundles
│   └── *.mjs.map
├── cinescope/dist/           # Production frontend
│   ├── index.html
│   └── assets/
│       ├── index-*.js        # 1.2MB gzipped
│       └── index-*.css       # 90KB

```

## 🔧 Development Workflow

### Adding a New API Endpoint

1. Update `lib/api-spec/openapi.yaml` with the new endpoint definition
2. Run `pnpm --filter @workspace/api-spec run codegen`
3. Implement endpoint in `artifacts/api-server/src/routes/`
4. Update Zod schemas in `lib/api-zod/` if needed

### Working with Database

1. Update schema in `lib/db/src/schema/index.ts`
2. Run `pnpm --filter @workspace/db run push`
3. Schemas auto-generate Zod validators

### Updating Dependencies

```bash
# Check for outdated packages
pnpm outdated

# Update specific package
pnpm --filter @workspace/cinescope update react@latest

# Update all
pnpm -r update
```

## 📚 Code Organization

### Monorepo Conventions

- **artifacts/** — Applications that can be deployed independently
- **lib/** — Reusable libraries and shared code
- **scripts/** — Build and utility scripts
- Each package has its own `package.json` and `tsconfig.json`
- Use pnpm filters to run commands in specific workspaces

### TypeScript

- Shared base config in `tsconfig.base.json`
- Each package extends and customizes as needed
- Full project typecheck: `pnpm run typecheck`

### Styling

- Tailwind CSS for utility-first styling
- Shadcn UI components for consistent design
- Dark theme optimized

## 🚨 Common Issues

### Build fails with "PORT environment variable is required"

**Solution:** Set `PORT` and `BASE_PATH` before building:

```bash
PORT=3000 BASE_PATH=/ pnpm run build
```

### pnpm command not found

**Solution:** Install pnpm globally:

```bash
npm install -g pnpm
```

### Large repository size

**Solution:** Remove pnpm cache:

```bash
rm -rf .local/
```

## 📄 License

MIT

## 🤝 Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Run `pnpm run typecheck` to validate
4. Run `pnpm run build` to ensure builds pass
5. Submit a pull request

---

**Last Updated:** April 19, 2026  
**Node.js:** v24  
**TypeScript:** 5.9  
**pnpm:** Latest
