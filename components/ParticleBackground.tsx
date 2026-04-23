"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { ParticleSystem } from "@/lib/particles";

const LIGHT_COLORS = ["#F63049", "#D02752", "#8A244B"];
const DARK_COLORS = ["#FF4D6A", "#FF6B8A", "#FF8FA8"];
const DISCO_COLORS = ["#FF00FF", "#00FFFF", "#FFFF00", "#FF6B00", "#00FF00", "#FF1493"];

interface ParticleBackgroundProps {
  isDark?: boolean;
  onDiscoReady?: (triggerDisco: () => void) => void;
}

export default function ParticleBackground({ isDark = false, onDiscoReady }: ParticleBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const systemRef = useRef<ParticleSystem | null>(null);
  const discoTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isDiscoActiveRef = useRef(false);
  const [isDiscoActive, setIsDiscoActive] = useState(false);

  const triggerDisco = useCallback(() => {
    const system = systemRef.current;
    if (!system || isDiscoActiveRef.current) return;

    isDiscoActiveRef.current = true;
    setIsDiscoActive(true);
    const originalColors = isDark ? DARK_COLORS : LIGHT_COLORS;

    system.setColors(DISCO_COLORS);
    system.spawnBurst(80);
    system.setDiscoMode(true);
    system.startLasers(DISCO_COLORS);

    discoTimeoutRef.current = setTimeout(() => {
      system.setColors(originalColors);
      system.removeParticles(80);
      system.setDiscoMode(false);
      system.stopLasers();
      isDiscoActiveRef.current = false;
      setIsDiscoActive(false);
    }, 3000);
  }, [isDark]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const initialColors = isDark ? DARK_COLORS : LIGHT_COLORS;
    const system = new ParticleSystem();
    systemRef.current = system;
    system.init(canvas, initialColors);
    system.start();

    const handleResize = () => system.resize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (discoTimeoutRef.current) clearTimeout(discoTimeoutRef.current);
      system.destroy();
    };
  }, []);

  useEffect(() => {
    const system = systemRef.current;
    if (system && !isDiscoActiveRef.current) {
      const colors = isDark ? DARK_COLORS : LIGHT_COLORS;
      system.setColors(colors);
    }
  }, [isDark]);

  useEffect(() => {
    if (onDiscoReady) onDiscoReady(triggerDisco);
  }, [onDiscoReady, triggerDisco]);

  useEffect(() => {
    const system = systemRef.current;
    if (!system) return;

    const handleWheel = (e: WheelEvent) => system.setScrollInfluence(e.deltaY);

    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => { touchStartY = e.touches[0].clientY; };
    const handleTouchMove = (e: TouchEvent) => {
      const deltaY = touchStartY - e.touches[0].clientY;
      system.setScrollInfluence(deltaY);
      touchStartY = e.touches[0].clientY;
    };

    window.addEventListener("wheel", handleWheel, { passive: true });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, []);

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/85 transition-opacity duration-300 ${
          isDiscoActive ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        style={{ zIndex: -2 }}
      />
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: -1 }}
      />
    </>
  );
}
