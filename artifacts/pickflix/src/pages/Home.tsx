import { useState, useCallback, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Scene } from "../components/Scene";
import { Tooltip } from "../components/Tooltip";
import { DetailPanel } from "../components/DetailPanel";
import { HUD } from "../components/HUD";
import { LoadingScreen } from "../components/LoadingScreen";
import { RetroTV } from "../components/RetroTV";
import { Movie } from "../data/movies";
import { checkBackendHealth } from "@/lib/api";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

export function Home() {
  const [loading, setLoading] = useState(true);
  const [hoveredMovie, setHoveredMovie] = useState<Movie | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [cameraZOffset, setCameraZOffset] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mouseParallax, setMouseParallax] = useState({ x: 0, y: 0 });
  const [showBackendError, setShowBackendError] = useState(false);
  const scrollRef = useRef(0);
  const targetScrollRef = useRef(0);
  const [, navigate] = useLocation();

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      targetScrollRef.current = Math.max(
        0,
        Math.min(1, targetScrollRef.current + e.deltaY * 0.0005)
      );
    };

    const handleMouseMove = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      setMouseParallax({ x: nx, y: ny });
    };

    let animFrameId: number;
    const animate = () => {
      scrollRef.current += (targetScrollRef.current - scrollRef.current) * 0.04;
      const offset = scrollRef.current * 180;
      setCameraZOffset(offset);
      setScrollProgress(scrollRef.current);
      animFrameId = requestAnimationFrame(animate);
    };
    animFrameId = requestAnimationFrame(animate);

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animFrameId);
    };
  }, []);

  const handleHover = useCallback((movie: Movie | null, pos: { x: number; y: number } | null) => {
    setHoveredMovie(movie);
    setTooltipPos(pos);
  }, []);

  const handleSelect = useCallback((movie: Movie | null) => {
    setSelectedMovie(movie);
  }, []);

  const handleEnter = useCallback(async () => {
    const isHealthy = await checkBackendHealth();
    if (isHealthy) {
      navigate("/browse");
    } else {
      setShowBackendError(true);
    }
  }, [navigate]);

  return (
    <div
      className="fixed inset-0 overflow-hidden"
      style={{ background: "#050505" }}
      data-testid="home-page"
    >
      {loading && <LoadingScreen />}

      <div className="absolute inset-0">
        <Scene
          onHover={handleHover}
          onSelect={handleSelect}
          selectedMovie={selectedMovie}
          cameraZOffset={cameraZOffset}
          mouseParallax={mouseParallax}
        />
      </div>

      <HUD scrollProgress={scrollProgress} />

      {hoveredMovie && tooltipPos && !selectedMovie && (
        <Tooltip movie={hoveredMovie} position={tooltipPos} />
      )}

      {selectedMovie && (
        <DetailPanel movie={selectedMovie} onClose={() => setSelectedMovie(null)} />
      )}

      <RetroTV visible={scrollProgress >= 0.97} onEnter={handleEnter} />

      <AlertDialog open={showBackendError} onOpenChange={setShowBackendError}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Backend Not Available</AlertDialogTitle>
            <AlertDialogDescription>
              The backend server is currently unavailable. Please make sure the server is running and try again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowBackendError(false)}>
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
