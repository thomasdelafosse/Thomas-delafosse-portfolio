import React, { useRef, useMemo, useEffect } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { InteractiveGridProps } from "@/types/types";

const InteractiveGrid: React.FC<InteractiveGridProps> = ({
  size,
  divisions,
  models,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const { scene, camera, gl } = useThree();
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const pointer = useMemo(() => new THREE.Vector2(), []);
  const FADE_DURATION = 0.8;

  useEffect(() => {
    const group = groupRef.current;
    const handlePointerMove = (event: PointerEvent) => {
      pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      if (groupRef.current) {
        const interactivePlanes = groupRef.current.children.filter(
          (obj) => obj.userData.isInteractivePlane
        );
        const interactableObjects: THREE.Object3D[] = [...interactivePlanes];
        scene.traverse((obj) => {
          if (
            !obj.userData.isInteractivePlane &&
            (obj as THREE.Mesh).isMesh &&
            obj.visible
          ) {
            interactableObjects.push(obj);
          }
        });
        const intersects = raycaster.intersectObjects(
          interactableObjects,
          true
        );
        interactivePlanes.forEach((plane) => {
          if (plane.userData.hoverState.isHovered) {
            plane.userData.hoverState.isHovered = false;
            plane.userData.hoverState.lastHoverTime = performance.now();
          }
        });
        if (intersects.length > 0) {
          const closestObject = intersects[0].object;
          if (closestObject.userData.isInteractivePlane) {
            const intersectedGridPlane = closestObject as THREE.Mesh;
            if (!intersectedGridPlane.userData.hoverState.isHovered) {
              intersectedGridPlane.userData.hoverState.isHovered = true;
              intersectedGridPlane.userData.hoverState.lastHoverTime = 0;
            }
          }
        }
      }
    };
    gl.domElement.addEventListener("pointermove", handlePointerMove);
    return () => {
      gl.domElement.removeEventListener("pointermove", handlePointerMove);
      if (group) {
        group.children.forEach((plane) => {
          if (plane.userData.isInteractivePlane) {
            const material = (plane as THREE.Mesh)
              .material as THREE.MeshBasicMaterial;
            material.opacity = 0.0;
            material.color.set(0x888888);
          }
        });
      }
    };
  }, [camera, gl, raycaster, pointer, FADE_DURATION, models, scene]);

  useFrame(() => {
    if (groupRef.current) {
      const interactivePlanes = groupRef.current.children.filter(
        (obj) => obj.userData.isInteractivePlane
      ) as THREE.Mesh[];
      const currentTime = performance.now();
      interactivePlanes.forEach((plane) => {
        const material = plane.material as THREE.MeshBasicMaterial;
        const hoverState = plane.userData.hoverState;
        if (hoverState.isHovered) {
          material.color.set(0x000000);
          material.opacity = 1.0;
        } else if (hoverState.lastHoverTime > 0) {
          const elapsed = (currentTime - hoverState.lastHoverTime) / 1000;
          if (elapsed < FADE_DURATION) {
            const fadeFactor = 1.0 - elapsed / FADE_DURATION;
            material.opacity = fadeFactor;
            material.color.set(0x000000);
          } else {
            material.opacity = 0.0;
            hoverState.lastHoverTime = 0;
          }
        }
      });
    }
  });

  const gridGeometry = useMemo(() => {
    const cells = [];
    const lines = [];
    const cellSize = size / divisions;
    const halfSize = size / 2;
    const lineColor = 0x444444;
    for (let i = 0; i < divisions; i++) {
      for (let j = 0; j < divisions; j++) {
        const x = i * cellSize - halfSize + cellSize / 2;
        const z = j * cellSize - halfSize + cellSize / 2;
        const geometry = new THREE.PlaneGeometry(cellSize, cellSize);
        geometry.rotateX(-Math.PI / 2);
        geometry.translate(x, 0.01, z);
        const material = new THREE.MeshBasicMaterial({
          color: 0x888888,
          transparent: true,
          opacity: 0.0,
          side: THREE.DoubleSide,
          depthWrite: false,
        });
        const plane = new THREE.Mesh(geometry, material);
        plane.userData = {
          isInteractivePlane: true,
          hoverState: {
            isHovered: false,
            lastHoverTime: 0,
          },
        };
        cells.push(plane);
      }
    }
    const lineMaterial = new THREE.LineBasicMaterial({ color: lineColor });
    for (let i = 0; i <= divisions; i++) {
      const z = i * cellSize - halfSize;
      const points = [
        new THREE.Vector3(-halfSize, 0, z),
        new THREE.Vector3(halfSize, 0, z),
      ];
      const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
      lines.push(new THREE.LineSegments(lineGeometry, lineMaterial));
    }
    for (let j = 0; j <= divisions; j++) {
      const x = j * cellSize - halfSize;
      const points = [
        new THREE.Vector3(x, 0, -halfSize),
        new THREE.Vector3(x, 0, halfSize),
      ];
      const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
      lines.push(new THREE.LineSegments(lineGeometry, lineMaterial));
    }
    return { cells, lines };
  }, [size, divisions]);

  return (
    <group ref={groupRef}>
      {gridGeometry.cells.map((cell, index) => (
        <primitive key={`cell-${index}`} object={cell} />
      ))}
      {gridGeometry.lines.map((line, index) => (
        <primitive key={`line-${index}`} object={line} />
      ))}
    </group>
  );
};

export default InteractiveGrid;
