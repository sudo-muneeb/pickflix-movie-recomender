import { Suspense, useRef, useCallback, Component, ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { KernelSize } from "postprocessing";
import { ParticleField } from "./ParticleField";
import { Movie, MOVIES } from "../data/movies";
import type { MovieOut } from "../lib/api";
import * as THREE from "three";

interface SceneProps {
  onHover: (movie: Movie | null, position: { x: number; y: number } | null) => void;
  onSelect: (movie: Movie | null) => void;
  selectedMovie: Movie | null;
  cameraZOffset: number;
  mouseParallax: { x: number; y: number };
  apiMovies?: MovieOut[];
}

class WebGLErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{ background: "#050505" }}
        >
          <div className="text-center max-w-sm px-8">
            <div className="flex justify-center gap-2 mb-8">
              {[...Array(9)].map((_, i) => (
                <div
                  key={i}
                  className="rounded-full"
                  style={{
                    width: "4px",
                    height: "4px",
                    background: `rgba(255, 42, 42, ${0.2 + i * 0.09})`,
                    transform: `translateY(${Math.sin(i) * 8}px)`,
                  }}
                />
              ))}
            </div>
            <div
              className="text-white/80 text-lg font-light mb-3"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Discover your taste in motion
            </div>
            <div className="text-white/30 text-sm leading-relaxed">
              Your browser does not support WebGL, which is required for the 3D experience.
              Try opening this in Chrome or Firefox for the full immersive view.
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function FogPlane() {
  return (
    <fog attach="fog" args={["#050505", 60, 200]} />
  );
}

// Map API movies to the Movie shape used by ParticleField
function apiMoviesToScene(apiMovies: MovieOut[]): Movie[] {
  return apiMovies.map((m, i) => ({
    id: m.movie_index,
    title: m.title,
    year: m.year ?? 0,
    rating: m.avg_rating,
    genre: [m.language ?? "?"],
    director: "",
    description: "",
    x: (Math.sin(m.movie_index * 2.3) * 60),
    y: (Math.cos(m.movie_index * 1.7) * 40),
    z: ((i / Math.max(apiMovies.length - 1, 1)) - 0.5) * 200,
    brightness: 0.3 + Math.min(m.avg_rating / 10, 0.7),
    size: 0.4 + Math.min(m.vote_count / 5000, 1.2),
  }));
}

export function Scene({
  onHover,
  onSelect,
  selectedMovie,
  cameraZOffset,
  mouseParallax,
  apiMovies,
}: SceneProps) {
  const movies = apiMovies && apiMovies.length > 0 ? apiMoviesToScene(apiMovies) : MOVIES;
  return (
    <WebGLErrorBoundary>
      <Canvas
        camera={{ position: [0, 0, 0], fov: 75, near: 0.1, far: 300 }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 0.8,
          failIfMajorPerformanceCaveat: false,
        }}
        style={{ background: "#050505" }}
        onCreated={({ gl }) => {
          gl.setClearColor(new THREE.Color("#050505"), 1);
        }}
        data-testid="canvas-3d"
      >
        <FogPlane />
        <ambientLight intensity={0.1} />
        <Suspense fallback={null}>
          <ParticleField
            movies={movies}
            onHover={onHover}
            onSelect={onSelect}
            selectedMovie={selectedMovie}
            cameraZOffset={cameraZOffset}
            mouseParallax={mouseParallax}
          />
          <EffectComposer>
            <Bloom
              kernelSize={KernelSize.LARGE}
              luminanceThreshold={0.3}
              luminanceSmoothing={0.9}
              intensity={2.5}
            />
          </EffectComposer>
        </Suspense>
      </Canvas>
    </WebGLErrorBoundary>
  );
}
