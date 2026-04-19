import { useRef, useMemo, useCallback } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Movie } from "../data/movies";

interface ParticleFieldProps {
  movies: Movie[];
  onHover: (movie: Movie | null, position: { x: number; y: number } | null) => void;
  onSelect: (movie: Movie | null) => void;
  selectedMovie: Movie | null;
  cameraZOffset: number;
  mouseParallax: { x: number; y: number };
}

export function ParticleField({
  movies,
  onHover,
  onSelect,
  selectedMovie,
  cameraZOffset,
  mouseParallax,
}: ParticleFieldProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const glowMeshRef = useRef<THREE.InstancedMesh>(null);
  const { camera, gl, size } = useThree();
  const raycaster = useRef(new THREE.Raycaster());
  const hoveredId = useRef<number | null>(null);
  const selectedId = useRef<number | null>(null);
  const clock = useRef(0);
  const tempObject = useMemo(() => new THREE.Object3D(), []);
  const tempColor = useMemo(() => new THREE.Color(), []);

  const positions = useMemo(() => {
    return movies.map((m) => new THREE.Vector3(m.x, m.y, m.z));
  }, [movies]);

  const driftOffsets = useMemo(() => {
    return movies.map((_, i) => ({
      x: Math.sin(i * 0.7) * 0.3,
      y: Math.cos(i * 0.5) * 0.2,
      phase: Math.random() * Math.PI * 2,
      speed: 0.3 + Math.random() * 0.5,
    }));
  }, [movies]);

  const sizes = useMemo(() => movies.map((m) => m.size), [movies]);
  const brightnesses = useMemo(() => movies.map((m) => m.brightness), [movies]);

  const getScreenPosition = useCallback(
    (worldPos: THREE.Vector3) => {
      const vec = worldPos.clone().project(camera);
      return {
        x: ((vec.x + 1) / 2) * size.width,
        y: ((-vec.y + 1) / 2) * size.height,
      };
    },
    [camera, size]
  );

  useFrame((state) => {
    if (!meshRef.current || !glowMeshRef.current) return;
    clock.current += 0.01;

    const targetZ = -cameraZOffset;
    camera.position.x += (mouseParallax.x * 8 - camera.position.x) * 0.05;
    camera.position.y += (-mouseParallax.y * 5 - camera.position.y) * 0.05;
    camera.position.z += (targetZ - camera.position.z) * 0.02;
    camera.lookAt(camera.position.x * 0.1, camera.position.y * 0.1, camera.position.z - 50);

    for (let i = 0; i < movies.length; i++) {
      const movie = movies[i];
      const drift = driftOffsets[i];
      const t = clock.current * drift.speed + drift.phase;
      const isHovered = hoveredId.current === i;
      const isSelected = selectedId.current === i;

      const driftX = Math.sin(t) * drift.x;
      const driftY = Math.cos(t * 0.7) * drift.y;

      const baseSize = sizes[i];
      const scale = isSelected ? baseSize * 3 : isHovered ? baseSize * 2.2 : baseSize;

      tempObject.position.set(
        positions[i].x + driftX,
        positions[i].y + driftY,
        positions[i].z
      );
      tempObject.scale.setScalar(scale * 0.15);
      tempObject.updateMatrix();
      meshRef.current.setMatrixAt(i, tempObject.matrix);

      tempObject.scale.setScalar(scale * 0.6);
      tempObject.updateMatrix();
      glowMeshRef.current.setMatrixAt(i, tempObject.matrix);

      const br = brightnesses[i];
      if (isSelected) {
        tempColor.setRGB(1, 0.1, 0.1);
      } else if (isHovered) {
        tempColor.setRGB(1, 0.2, 0.2);
      } else {
        const r = 0.6 + br * 0.4;
        const g = br * 0.05;
        const b = br * 0.05;
        tempColor.setRGB(r, g, b);
      }
      meshRef.current.setColorAt(i, tempColor);

      if (isSelected) {
        tempColor.setRGB(0.5, 0.0, 0.0);
      } else if (isHovered) {
        tempColor.setRGB(0.4, 0.05, 0.05);
      } else {
        const r = br * 0.3;
        tempColor.setRGB(r, 0, 0);
      }
      glowMeshRef.current.setColorAt(i, tempColor);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
    meshRef.current.instanceColor!.needsUpdate = true;
    glowMeshRef.current.instanceMatrix.needsUpdate = true;
    glowMeshRef.current.instanceColor!.needsUpdate = true;
  });

  const handlePointerMove = useCallback(
    (e: any) => {
      e.stopPropagation();
      const ndcX = (e.clientX / size.width) * 2 - 1;
      const ndcY = -(e.clientY / size.height) * 2 + 1;
      raycaster.current.setFromCamera(new THREE.Vector2(ndcX, ndcY), camera);

      if (!meshRef.current) return;
      const hits = raycaster.current.intersectObject(meshRef.current);

      if (hits.length > 0) {
        const instanceId = hits[0].instanceId!;
        if (hoveredId.current !== instanceId) {
          hoveredId.current = instanceId;
          const worldPos = positions[instanceId].clone();
          const screenPos = getScreenPosition(worldPos);
          onHover(movies[instanceId], screenPos);
          gl.domElement.style.cursor = "pointer";
        }
      } else {
        if (hoveredId.current !== null) {
          hoveredId.current = null;
          onHover(null, null);
          gl.domElement.style.cursor = "default";
        }
      }
    },
    [movies, positions, camera, size, gl, onHover, getScreenPosition]
  );

  const handleClick = useCallback(
    (e: any) => {
      e.stopPropagation();
      if (hoveredId.current !== null) {
        selectedId.current = hoveredId.current;
        onSelect(movies[hoveredId.current]);
      }
    },
    [movies, onSelect]
  );

  const handleMissed = useCallback(() => {
    selectedId.current = null;
    onSelect(null);
  }, [onSelect]);

  const geometry = useMemo(() => new THREE.SphereGeometry(1, 6, 6), []);
  const glowGeometry = useMemo(() => new THREE.SphereGeometry(1, 6, 6), []);

  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(1, 0.1, 0.1),
      }),
    []
  );

  const glowMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(0.3, 0, 0),
        transparent: true,
        opacity: 0.15,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    []
  );

  return (
    <>
      <instancedMesh
        ref={glowMeshRef}
        args={[glowGeometry, glowMaterial, movies.length]}
        frustumCulled={false}
      />
      <instancedMesh
        ref={meshRef}
        args={[geometry, material, movies.length]}
        frustumCulled={false}
        onPointerMove={handlePointerMove}
        onClick={handleClick}
        onPointerMissed={handleMissed}
      />
    </>
  );
}
